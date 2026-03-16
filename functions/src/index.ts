/**
 * [TEMPLATE] Firebase Cloud Functions
 * ─────────────────────────────────────────────────────────────────────────────
 * contactForm handles:
 *   1. Honeypot validation            — silent bot rejection
 *   2. Disposable email blocklist     — blocks throwaway addresses
 *   3. reCAPTCHA v3 score check       — filters automated submissions
 *   4. IP rate limiting via Firestore — max 5/IP/hour
 *   5. Input sanitisation + Firestore — saves every accepted submission
 *   6. Full audit logging             — logs ALL attempts (accepted + rejected)
 *   7. Lead notification email        — sends you an HTML email for each lead
 *   8. Confirmation email to submitter — builds trust, reduces support tickets
 *   9. HubSpot CRM push (optional)    — creates/updates contact record
 *
 * ── SETUP CHECKLIST ─────────────────────────────────────────────────────────
 *
 * 1. Set Firebase Secrets (production — never commit real values):
 *      firebase functions:secrets:set RECAPTCHA_SECRET
 *      firebase functions:secrets:set GMAIL_APP_PASSWORD
 *      firebase functions:secrets:set HUBSPOT_TOKEN       ← optional
 *
 * 2. Set environment variables (non-secret — in apphosting.yaml or .env):
 *      OWNER_EMAIL        — email that receives lead notifications
 *      CONTACT_FROM_EMAIL — sender address (must be the Gmail account you auth with)
 *      ALLOWED_ORIGIN     — your production domain e.g. https://yourdomain.com
 *      SITE_NAME          — your brand name (used in email templates)
 *
 * 3. For local development, copy .env.example → .env and fill in values.
 *    The .env file is git-ignored — never commit it.
 *
 * ── EMAIL SETUP (Gmail SMTP via App Password) ────────────────────────────────
 *   1. Enable 2-Step Verification on the Gmail account you want to send from.
 *   2. Go to https://myaccount.google.com/apppasswords
 *   3. Create an App Password for "Mail" > "Other (custom name)"
 *   4. Use that 16-character password as GMAIL_APP_PASSWORD
 *
 *   To use SendGrid instead: replace createTransporter/sendMail calls
 *   with an axios.post to https://api.sendgrid.com/v3/mail/send
 *   and use SENDGRID_API_KEY as your secret.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import * as nodemailer from 'nodemailer';

admin.initializeApp();
const db = admin.firestore();

// ── Types ──────────────────────────────────────────────────────────────────────

interface ContactPayload {
  name:            string;
  email:           string;
  subject:         string;
  message:         string;
  phone?:          string;   // honeypot — must always be empty
  recaptchaToken?: string;
  // Attribution (populated by Angular TrackingService / DataLayerService)
  source?:         string;
  medium?:         string;
  campaign?:       string;
  landing?:        string;
  referrer?:       string;
  sessionId?:      string;
  capturedAt?:     string;
  userTz?:         string;
}

/** Subset of fields used by email helpers — avoids type conflicts */
interface EmailPayload {
  name:       string;
  email:      string;
  subject:    string;
  message:    string;
  source?:    string;
  medium?:    string;
  campaign?:  string;
  landing?:   string;
  sessionId?: string;
  userTz?:    string;
}

type SubmitStatus =
  | 'accepted'
  | 'honeypot'
  | 'invalid_input'
  | 'blocked_email'
  | 'rate_limited'
  | 'recaptcha_fail';

// ── Disposable email domain blocklist ─────────────────────────────────────────
// Add more domains as spammers create new ones.

const BLOCKED_DOMAINS = new Set([
  'mailinator.com',    'guerrillamail.com',      'tempmail.com',
  'throwam.com',       'sharklasers.com',         'guerrillamailblock.com',
  'grr.la',            'guerrillamail.info',       'dispostable.com',
  'yopmail.com',       'spam4.me',                'trashmail.com',
  'fakeinbox.com',     'maildrop.cc',             '33mail.com',
  'spamgourmet.com',   'getairmail.com',          'tempr.email',
  'throwabletempmail.com', 'trashmail.at',        'mailnull.com',
]);

function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? BLOCKED_DOMAINS.has(domain) : false;
}

// ── Rate limiting (Firestore, per IP, rolling window) ─────────────────────────

async function checkRateLimit(
  ip:           string,
  collection:   string,
  maxRequests:  number,
  windowMs =    60 * 60 * 1000  // default: 1 hour
): Promise<boolean> {
  const ref  = db.collection(collection).doc(ip.replace(/[:.]/g, '_'));
  const snap = await ref.get();
  const now  = Date.now();

  if (!snap.exists) {
    await ref.set({ count: 1, windowStart: now });
    return true; // first request — always allowed
  }

  const { windowStart, count } = snap.data()!;

  if (now - (windowStart as number) > windowMs) {
    // Window has expired — reset
    await ref.set({ count: 1, windowStart: now });
    return true;
  }

  if ((count as number) >= maxRequests) return false; // blocked

  await ref.update({ count: admin.firestore.FieldValue.increment(1) });
  return true;
}

// ── reCAPTCHA v3 ──────────────────────────────────────────────────────────────

async function verifyRecaptcha(token: string, secret: string): Promise<number> {
  try {
    const res = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      { params: { secret, response: token }, timeout: 5000 }
    );
    return res.data.score ?? 0;
  } catch {
    return 0;
  }
}

// ── Audit logger ──────────────────────────────────────────────────────────────
// Logs every submission attempt — accepted AND rejected — to submission_logs.
// Gives you a full Firestore audit trail to investigate spam or suspicious IPs.

async function logAttempt(
  req:    functions.https.Request,
  body:   Partial<ContactPayload>,
  status: SubmitStatus,
  reason  = ''
): Promise<void> {
  try {
    const ip        = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
    const userAgent = String(req.headers['user-agent'] || 'unknown');

    await db.collection('submission_logs').add({
      ip,
      userAgent,
      email:   body.email   || '',
      name:    body.name    || '',
      subject: body.subject || '',
      message: (body.message || '').slice(0, 500), // truncate — never store unlimited user input
      source:  body.source  || 'direct',
      status,
      reason,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    // Never let logging failures block the main request
    functions.logger.warn('Failed to write submission_log', { err });
  }
}

// ── Email helpers (Gmail SMTP via nodemailer) ─────────────────────────────────
//
// To swap for SendGrid, remove nodemailer and replace the sendMail calls
// with axios.post to https://api.sendgrid.com/v3/mail/send.

function createTransporter(appPassword: string, fromEmail: string): nodemailer.Transporter {
  return nodemailer.createTransport({
    host:   'smtp.gmail.com',
    port:   465,
    secure: true,
    auth:   { user: fromEmail, pass: appPassword },
  });
}

/** Lead notification to the site owner — dark-themed HTML email */
async function sendLeadNotification(
  payload:    EmailPayload,
  pass:       string,
  ownerEmail: string,
  fromEmail:  string,
  siteName:   string
): Promise<void> {
  const transporter = createTransporter(pass, fromEmail);
  const source = (payload.source && payload.source !== 'direct')
    ? `${payload.source}${payload.campaign ? ` / ${payload.campaign}` : ''}`
    : 'Direct / None';

  // Escape HTML entities in user-supplied content
  const safe = (s: string) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a1120;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">
    <div style="background:linear-gradient(135deg,#1e3a8a,#065f46);border-radius:12px 12px 0 0;padding:28px 32px">
      <p style="margin:0 0 4px;color:#6ee7b7;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase">🔔 New Contact</p>
      <h1 style="margin:0;color:#f1f5f9;font-size:22px;font-weight:700">${safe(payload.name)}</h1>
      <p style="margin:4px 0 0;color:#94a3b8;font-size:14px">${safe(payload.subject)}</p>
    </div>
    <div style="background:#0d1526;padding:28px 32px;border:1px solid rgba(37,99,235,.15);border-top:none">
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
        <tr>
          <td style="padding:10px 12px;background:#0a1120;border-radius:8px 0 0 0;border:1px solid rgba(37,99,235,.1)">
            <p style="margin:0 0 2px;font-size:11px;color:#475569;text-transform:uppercase;letter-spacing:.07em;font-weight:600">Email</p>
            <a href="mailto:${safe(payload.email)}" style="color:#3b82f6;font-size:14px;font-weight:600;text-decoration:none">${safe(payload.email)}</a>
          </td>
          <td style="padding:10px 12px;background:#0a1120;border-radius:0 8px 0 0;border:1px solid rgba(37,99,235,.1);border-left:none">
            <p style="margin:0 0 2px;font-size:11px;color:#475569;text-transform:uppercase;letter-spacing:.07em;font-weight:600">Source</p>
            <p style="margin:0;color:#f1f5f9;font-size:14px">${safe(source)}</p>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 10px;font-size:12px;color:#475569;text-transform:uppercase;letter-spacing:.07em;font-weight:600">Message</p>
      <div style="background:#1e293b;border-radius:8px;padding:16px;color:#94a3b8;font-size:14px;line-height:1.6;margin-bottom:24px">
        ${safe(payload.message).replace(/\n/g, '<br>')}
      </div>
      <div style="padding:14px 16px;background:#0a1120;border-radius:8px;border:1px solid rgba(37,99,235,.08)">
        <p style="margin:0 0 8px;font-size:11px;color:#475569;text-transform:uppercase;letter-spacing:.07em;font-weight:600">Attribution</p>
        <p style="margin:0;font-size:13px;color:#64748b;line-height:1.7">
          Landing: <span style="color:#94a3b8">${safe(payload.landing || '—')}</span><br>
          UTM: <span style="color:#94a3b8">${safe(payload.source || 'direct')} / ${safe(payload.medium || 'none')}${payload.campaign ? ` / ${safe(payload.campaign)}` : ''}</span><br>
          Timezone: <span style="color:#94a3b8">${safe(payload.userTz || '—')}</span>
        </p>
      </div>
    </div>
    <div style="padding:16px 32px;text-align:center;border:1px solid rgba(37,99,235,.1);border-top:none;border-radius:0 0 12px 12px;background:#080e1a">
      <p style="margin:0;font-size:12px;color:#334155">${safe(siteName)}</p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from:    `"${siteName}" <${fromEmail}>`,
    to:      ownerEmail,
    subject: `🔔 New Contact: ${payload.name} — ${payload.subject}`,
    html,
  });
}

/** Confirmation email to the person who submitted the form */
async function sendConfirmationEmail(
  payload:  EmailPayload,
  pass:     string,
  fromEmail: string,
  siteName:  string
): Promise<void> {
  const transporter = createTransporter(pass, fromEmail);
  const firstName   = payload.name.trim().split(' ')[0];

  const safe = (s: string) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const previewMessage = payload.message.slice(0, 300);
  const isTruncated    = payload.message.length > 300;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">
      <div style="background:linear-gradient(135deg,#1e3a8a,#065f46);padding:28px 32px">
        <p style="margin:0 0 6px;color:#6ee7b7;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">${safe(siteName)}</p>
        <h1 style="margin:0;color:#f1f5f9;font-size:22px;font-weight:700;line-height:1.3">Got your message, ${safe(firstName)}.</h1>
      </div>
      <div style="padding:28px 32px">
        <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.7">
          We received your message and will reply within 24 hours on business days.
          <!-- TODO: Customise this paragraph to match your brand voice -->
        </p>
        <div style="background:#f8fafc;border-radius:8px;padding:16px 20px;margin-bottom:24px;border:1px solid #e5e7eb">
          <p style="margin:0 0 8px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;font-weight:600">Your Message</p>
          <p style="margin:0 0 6px;font-size:13px;color:#374151"><strong>Subject:</strong>&nbsp;${safe(payload.subject)}</p>
          <p style="margin:0;font-size:13px;color:#374151;line-height:1.6">${safe(previewMessage).replace(/\n/g, '<br>')}${isTruncated ? '&hellip;' : ''}</p>
        </div>
        <!-- TODO: Add links relevant to your site (e.g. "Browse our shop") -->
        <p style="margin:0 0 4px;color:#374151;font-size:15px">Thanks,</p>
        <p style="margin:0;color:#111827;font-size:15px;font-weight:600">${safe(siteName)}</p>
      </div>
    </div>
    <p style="margin:16px 0 0;text-align:center;font-size:12px;color:#9ca3af">
      If you didn't submit this form, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from:    `"${siteName}" <${fromEmail}>`,
    to:      payload.email,
    subject: `We got your message — we'll be in touch soon`,
    // TODO: Personalise the subject line for your brand
    html,
  });
}

// ── HubSpot CRM push (optional) ───────────────────────────────────────────────

async function pushToHubspot(payload: EmailPayload, token: string): Promise<void> {
  // TODO: Replace YOUR_PORTAL_ID and YOUR_FORM_GUID.
  // Find these in HubSpot → Marketing → Forms → Share/Embed (look for the URL)
  const PORTAL_ID = 'YOUR_PORTAL_ID';
  const FORM_GUID = 'YOUR_FORM_GUID';

  if (PORTAL_ID === 'YOUR_PORTAL_ID') {
    functions.logger.warn('HubSpot PORTAL_ID not configured — CRM push skipped');
    return;
  }

  const nameParts = payload.name.trim().split(' ');
  const firstName = nameParts[0];
  const lastName  = nameParts.slice(1).join(' ');

  await axios.post(
    `https://api.hsforms.com/submissions/v3/integration/secure/submit/${PORTAL_ID}/${FORM_GUID}`,
    {
      fields: [
        { name: 'firstname', value: firstName },
        { name: 'lastname',  value: lastName  },
        { name: 'email',     value: payload.email   },
        { name: 'message',   value: payload.message },
      ],
      context: {
        pageUri:  payload.landing || '/',
        pageName: 'Contact Form',
      },
    },
    {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      timeout: 8000,
    }
  );
}

// ── contactForm Cloud Function ─────────────────────────────────────────────────

export const contactForm = functions
  .runWith({
    memory:         '256MB',
    timeoutSeconds: 30,
    // Secrets are injected at runtime via Firebase Secret Manager.
    // Set with: firebase functions:secrets:set <SECRET_NAME>
    // They are NEVER stored in code or environment files.
    secrets: ['RECAPTCHA_SECRET', 'GMAIL_APP_PASSWORD', 'HUBSPOT_TOKEN'],
  })
  .https.onRequest(async (req, res) => {

    // ── CORS whitelist ────────────────────────────────────────────────────────
    // Non-secret env vars are set in apphosting.yaml or .env (see .env.example)
    // TODO: Set ALLOWED_ORIGIN to your production domain in apphosting.yaml
    const ALLOWED_ORIGINS = [
      process.env['ALLOWED_ORIGIN'] || '',
      'http://localhost:4200',
    ].filter(Boolean);

    const origin = String(req.headers.origin || '');
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // CORS preflight
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (req.method !== 'POST')    { res.status(405).json({ error: 'Method not allowed' }); return; }

    // Read config — non-secret from env vars, secrets injected by Firebase at runtime
    const OWNER_EMAIL   = process.env['OWNER_EMAIL']        || process.env['CONTACT_TO_EMAIL']   || '';
    const FROM_EMAIL    = process.env['CONTACT_FROM_EMAIL'] || OWNER_EMAIL;
    const SITE_NAME     = process.env['SITE_NAME']          || 'Your Site'; // TODO: set in apphosting.yaml
    const GMAIL_PASS    = process.env['GMAIL_APP_PASSWORD'] || '';
    const RECAPTCHA_SEC = process.env['RECAPTCHA_SECRET']   || '';
    const HUBSPOT_TOKEN = process.env['HUBSPOT_TOKEN']      || '';

    const ip   = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
    const body = (req.body || {}) as ContactPayload;

    // ── Step 1: Honeypot ──────────────────────────────────────────────────────
    // The `phone` field is hidden in the UI — bots fill it, humans don't.
    // Silent 200 so bots don't know they were rejected.
    if (body.phone) {
      await logAttempt(req, body, 'honeypot', 'Honeypot field filled');
      res.status(200).json({ submissionId: 'hp_filtered' });
      return;
    }

    // ── Step 2: Input validation ──────────────────────────────────────────────
    if (!body.name || !body.email || !body.subject || !body.message) {
      await logAttempt(req, body, 'invalid_input', 'Missing required fields');
      res.status(400).json({ error: 'Missing required fields.' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      await logAttempt(req, body, 'invalid_input', `Invalid email format: ${body.email}`);
      res.status(400).json({ error: 'Invalid email address.' });
      return;
    }

    if (isDisposableEmail(body.email)) {
      await logAttempt(req, body, 'blocked_email', `Disposable domain: ${body.email}`);
      res.status(400).json({ error: 'Please use a valid email address.' });
      return;
    }

    // ── Step 3: Rate limit — 5 submissions per IP per hour ────────────────────
    const allowed = await checkRateLimit(ip, '_ratelimit', 5);
    if (!allowed) {
      await logAttempt(req, body, 'rate_limited', `IP ${ip} exceeded limit`);
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    // ── Step 4: reCAPTCHA v3 ─────────────────────────────────────────────────
    // Score threshold of 0.5 is Google's recommended starting point.
    // Lower it to 0.3 if you have a high volume of mobile users (mobile scores slightly lower).
    // NOTE: If RECAPTCHA_SECRET is not yet configured, this check is skipped.
    //       This allows local testing before keys are set. Configure before going live.
    if (RECAPTCHA_SEC && body.recaptchaToken) {
      const score = await verifyRecaptcha(body.recaptchaToken, RECAPTCHA_SEC);
      if (score < 0.5) {
        await logAttempt(req, body, 'recaptcha_fail', `Score: ${score}`);
        functions.logger.warn('reCAPTCHA score too low', { score, ip });
        res.status(400).json({ error: 'reCAPTCHA verification failed. Please try again.' });
        return;
      }
    }

    // ── Step 5: Sanitise and save to Firestore ────────────────────────────────
    const submission: EmailPayload & Record<string, any> = {
      name:       String(body.name).trim().slice(0, 200),
      email:      String(body.email).trim().toLowerCase().slice(0, 254),
      subject:    String(body.subject).trim().slice(0, 200),
      message:    String(body.message).trim().slice(0, 5000),
      source:     body.source    || 'direct',
      medium:     body.medium    || 'none',
      campaign:   body.campaign  || '(none)',
      landing:    body.landing   || '/',
      referrer:   body.referrer  || '',
      sessionId:  body.sessionId || '',
      capturedAt: body.capturedAt || new Date().toISOString(),
      userTz:     body.userTz    || '',
      ip,
      createdAt:  admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('contactSubmissions').add(submission);

    // Full audit trail — mark as accepted
    await logAttempt(req, body, 'accepted');

    // ── Step 6: Side effects — fire-and-forget ────────────────────────────────
    // The submission is already saved to Firestore before this block.
    // If emails or HubSpot fail, the lead is NOT lost — it's in Firestore.
    // Promise.allSettled() ensures one failure doesn't cancel the rest.
    const effects: Promise<any>[] = [];

    if (GMAIL_PASS && OWNER_EMAIL) {
      effects.push(
        sendLeadNotification(submission, GMAIL_PASS, OWNER_EMAIL, FROM_EMAIL, SITE_NAME)
      );
      effects.push(
        sendConfirmationEmail(submission, GMAIL_PASS, FROM_EMAIL, SITE_NAME)
      );
    } else {
      functions.logger.warn(
        'GMAIL_APP_PASSWORD or OWNER_EMAIL not configured — email notifications skipped. ' +
        'Set them in apphosting.yaml (OWNER_EMAIL, CONTACT_FROM_EMAIL) and ' +
        'firebase functions:secrets:set GMAIL_APP_PASSWORD'
      );
    }

    if (HUBSPOT_TOKEN) {
      effects.push(pushToHubspot(submission, HUBSPOT_TOKEN));
    }

    const results = await Promise.allSettled(effects);
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        functions.logger.warn(`Side effect ${i} failed`, {
          reason: (r as PromiseRejectedResult).reason?.message || String((r as PromiseRejectedResult).reason),
        });
      }
    });

    res.status(200).json({ submissionId: docRef.id });
  });
