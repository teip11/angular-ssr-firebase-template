# Angular SSR Firebase Template

A production-ready Angular 19 SSR template with Firebase App Hosting, a secure Cloud Functions contact form backend, GA4 analytics, and full SEO infrastructure. Fork this to start any new project with all the hard stuff already done.

---

## What's Included

| Feature | Location | Notes |
|---|---|---|
| Angular 19 SSR | `src/server.ts` | Express + `@angular/ssr`, security headers, Gzip |
| Firebase App Hosting | `apphosting.yaml` | SSR deployment config |
| Secure contact form backend | `functions/src/index.ts` | 9-layer security (see below) |
| Google Analytics 4 | `src/app/services/` | Via GTM dataLayer — zero gtag() calls |
| First-touch UTM attribution | `TrackingService` | Captures source/medium/campaign per session |
| Scroll depth tracking | `AppComponent` | Fires at 25%, 50%, 75%, 90% |
| Core Web Vitals tracking | `AppComponent` | LCP, CLS, INP → dataLayer → GA4 |
| SEO service | `SeoService` | Title, meta, OG, Twitter card, canonical per page |
| JSON-LD structured data | `SchemaService` | SSR-safe, per-page schema injection |
| Firestore security rules | `firestore.rules` | Deny-all client access — Admin SDK only |
| Interaction-deferred GTM | `src/index.html` | Fires on first scroll/click — removes ~314ms TBT |
| Interaction-deferred HubSpot | `src/index.html` | Same pattern — removes ~440ms TBT |
| Inter Fallback font-face | `src/index.html` | Eliminates CLS during font swap |
| reCAPTCHA v3 | `ContactComponent` | Lazy-loaded on /contact only — saves ~350 KB |
| Honeypot spam filter | Form + Function | Silent rejection |
| Disposable email blocklist | `functions/src/index.ts` | 20+ known throwaway domains |
| IP rate limiting | `functions/src/index.ts` | 5 submissions/IP/hour via Firestore |
| Full audit logging | `functions/src/index.ts` | Every attempt (accepted + rejected) in Firestore |
| HTML email notifications | `functions/src/index.ts` | Lead alert to owner + confirmation to submitter |
| HubSpot CRM push | `functions/src/index.ts` | Optional — skipped if token not set |

---

## Contact Form Security Stack

The Cloud Function processes every submission through 6 sequential gates:

```
1. Honeypot       → bots fill a hidden field, silent 200 response
2. Input validation → required fields, email regex
3. Disposable email → blocks mailinator.com, yopmail.com, etc.
4. Rate limiting   → 5 submissions / IP / hour (Firestore rolling window)
5. reCAPTCHA v3   → score ≥ 0.5 required (skipped if secret not set yet)
6. Sanitise + save → truncated, stored in Firestore contactSubmissions
   ↓
   Side effects (fire-and-forget — submission already saved)
7. Lead notification email  → owner gets dark-theme HTML email
8. Confirmation email       → submitter gets receipt confirmation
9. HubSpot CRM push         → creates/updates contact (if HUBSPOT_TOKEN set)
```

If emails or HubSpot fail, **the lead is not lost** — it was already saved to Firestore before the side effects run.

---

## Setup Checklist

### 1. Clone & Install

```bash
git clone <your-fork-url>
cd your-project
npm install
cd functions && npm install && cd ..
```

### 2. Replace All `YOUR_DOMAIN.com` Placeholders

Search the project for `YOUR_DOMAIN` and replace with your real domain:

```bash
grep -r "YOUR_DOMAIN" src/ functions/ --include="*.ts" --include="*.html"
```

Files to update:
- `src/index.html` — title, OG tags, canonical, og:image URL
- `src/app/services/seo.service.ts` — `BASE_URL` constant
- `src/app/services/schema.service.ts` — `BASE_URL` constant
- `functions/.env.example` → `functions/.env` — ALLOWED_ORIGIN, OWNER_EMAIL

### 3. Set Your Brand Name

Replace `Glow Seoul` / `Your Site` with your brand name:
- `src/index.html` — `<title>`, OG tags, site_name
- `src/app/services/seo.service.ts` — `SITE_NAME` constant, `PAGE_SEO` configs
- `src/app/services/schema.service.ts` — schema generators
- `apphosting.yaml` — `SITE_NAME` env variable

### 4. Set Up Firebase

```bash
# Install Firebase CLI if you don't have it
npm install -g firebase-tools

# Login and select your project
firebase login
firebase use --add   # select or create your Firebase project

# Initialise Firestore (creates the database)
firebase firestore:databases:create --location=us-central1
```

### 5. Configure Environment Variables (Non-Secret)

Edit `apphosting.yaml` — add your non-secret env vars:

```yaml
env:
  - variable: NODE_ENV
    value: production
  - variable: SITE_NAME
    value: Your Brand Name
  - variable: OWNER_EMAIL
    value: hello@yourdomain.com
  - variable: CONTACT_FROM_EMAIL
    value: hello@yourdomain.com
  - variable: ALLOWED_ORIGIN
    value: https://yourdomain.com
```

### 6. Set Firebase Secrets (Sensitive Values)

These are **never** stored in code or config files:

```bash
# reCAPTCHA v3 server-side secret key
firebase functions:secrets:set RECAPTCHA_SECRET

# Gmail App Password (for email notifications)
firebase functions:secrets:set GMAIL_APP_PASSWORD

# HubSpot Private App Token (optional — skip if not using CRM)
firebase functions:secrets:set HUBSPOT_TOKEN
```

### 7. Get a Gmail App Password

Required for email notifications via Gmail SMTP:

1. Enable 2-Step Verification on your Google account
2. Go to → https://myaccount.google.com/apppasswords
3. Create an App Password: Mail → Other (custom name) → "Firebase Contact Form"
4. Copy the 16-character password
5. Set it: `firebase functions:secrets:set GMAIL_APP_PASSWORD`

> **Alternative:** Swap nodemailer for SendGrid. Replace `createTransporter` / `sendMail` calls in `functions/src/index.ts` with `axios.post` to `https://api.sendgrid.com/v3/mail/send` and set `SENDGRID_API_KEY` as your secret instead.

### 8. Set Up reCAPTCHA v3

1. Go to → https://www.google.com/recaptcha/admin/create
2. Choose **Score based (v3)**
3. Add your domain (and `localhost` for dev)
4. Copy the **Site Key** (public) → paste into `src/app/pages/contact/contact.component.ts`:
   ```ts
   const RECAPTCHA_SITE_KEY = 'YOUR_ACTUAL_SITE_KEY';
   ```
5. Copy the **Secret Key** (private) → set as Firebase Secret:
   ```bash
   firebase functions:secrets:set RECAPTCHA_SECRET
   ```

### 9. Set Up Google Tag Manager

1. Create a GTM container at → https://tagmanager.google.com
2. Copy your container ID (format: `GTM-XXXXXXX`)
3. In `src/index.html`, uncomment the GTM script block and replace `GTM-XXXXXXX`
4. In GTM, create:
   - **GA4 Configuration tag** — triggers on All Pages, fires your GA4 measurement ID
   - **GA4 Event tags** — trigger on Custom Events matching the event names in `AnalyticsService`

### 10. Add Your Favicons

1. Design your favicon (at minimum a 512×512 PNG)
2. Go to → https://realfavicongenerator.net — upload and generate all sizes
3. Replace all files in `public/`:
   - `favicon.ico`
   - `favicon.svg`
   - `favicon-96x96.png`
   - `apple-touch-icon.png`
   - `site.webmanifest`
4. Add your OG image: `public/og-default.jpg` (1200×627px minimum)

### 11. Update Page SEO Configs

Edit `src/app/services/seo.service.ts` → `PAGE_SEO` object. Update title, description, keywords, and URL for every page. Each page component calls `this.seo.setPageSEO('pageKey')` in `ngOnInit()`.

### 12. Update Schema / Structured Data

Edit `src/app/services/schema.service.ts`. Update:
- Social media profile URLs (`INSTAGRAM_URL`, etc.)
- Business name, email, description in `getStoreSchema()`
- Any page-specific schema generators

### 13. Local Development

```bash
# Terminal 1 — Angular dev server
npm start

# Terminal 2 — Firebase emulators (functions + firestore)
cd functions && npm run build
firebase emulators:start --only functions,firestore

# Terminal 3 — copy and fill in local env vars
cp functions/.env.example functions/.env
# edit functions/.env with your local test values
```

The contact form will hit `http://localhost:5001/your-project/us-central1/contactForm` via the emulator. Update `ALLOWED_ORIGIN` in `.env` to `http://localhost:4200` for local testing.

### 14. Deploy

```bash
# Deploy everything
firebase deploy

# Or deploy separately
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

---

## Project Structure

```
├── src/
│   ├── index.html              # Inter Fallback, deferred GTM/HubSpot, favicons
│   ├── server.ts               # Express SSR + security headers (CSP, HSTS, etc.)
│   ├── app/
│   │   ├── app.config.ts       # SSR hydration, HTTP client, router config
│   │   ├── app.routes.ts       # Lazy-loaded routes
│   │   ├── components/         # Navbar, Footer, Sticky CTA
│   │   ├── pages/              # Page components (lazy-loaded)
│   │   └── services/
│   │       ├── analytics.service.ts   # GA4 events (generate_lead, cta_click, etc.)
│   │       ├── data-layer.service.ts  # dataLayer.push() bus + session ID
│   │       ├── tracking.service.ts    # UTM capture + referrer detection
│   │       ├── seo.service.ts         # Title, meta, OG, canonical per page
│   │       └── schema.service.ts      # JSON-LD structured data generators
├── functions/
│   ├── src/index.ts            # contactForm Cloud Function (9-layer security)
│   ├── package.json            # nodemailer, axios, firebase-admin
│   └── .env.example            # Copy to .env for local dev
├── public/                     # Static assets (favicons, OG image, sitemap)
├── firebase.json               # Hosting rewrites, cache headers
├── apphosting.yaml             # App Hosting config (CPU, memory, env vars)
├── firestore.rules             # Deny-all client access (Admin SDK only)
└── firestore.indexes.json      # Firestore composite indexes (empty by default)
```

---

## Security Headers (server.ts)

The Express SSR server sets these on every response:

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `Content-Security-Policy` | See `src/server.ts` — tighten after finalising 3rd-party scripts |

---

## Analytics Event Reference

All events flow: `AnalyticsService` → `DataLayerService.push()` → `dataLayer` → GTM → GA4.

| Event | Method | When to fire |
|---|---|---|
| `generate_lead` | `trackGenerateLead()` | After HTTP 200 from contact form only |
| `form_start` | `trackFormStart()` | On first form field focus |
| `form_abandon` | `trackFormAbandon()` | `ngOnDestroy()` if form started but not submitted |
| `cta_click` | `trackCtaClick()` | Any CTA button click |
| `view_item` | `trackProductView()` | Product detail page view |
| `add_to_cart` | `trackAddToCart()` | Add to cart action |
| `begin_checkout` | `trackBeginCheckout()` | Checkout start |
| `purchase` | `trackPurchase()` | Order confirmed |
| `quiz_complete` | `trackQuizComplete()` | Quiz result shown |
| `email_click` | `trackEmailClick()` | Email link click |
| `scroll_milestone` | Auto (AppComponent) | 25%, 50%, 75%, 90% scroll depth |
| `web_vital` | Auto (AppComponent) | LCP, CLS, INP with good/needs-improvement/poor |
| `page_view` | Auto (AnalyticsService) | Every route change |

---

## Firestore Collections

| Collection | Written by | Purpose |
|---|---|---|
| `contactSubmissions` | `contactForm` function | All accepted form submissions |
| `submission_logs` | `contactForm` function | Every attempt — accepted AND rejected |
| `_ratelimit` | `contactForm` function | IP rate limit counters (rolling 1-hour window) |

---

## Frequently Forked Changes

These are the most common things to customise per project:

- **Contact form fields** — edit `contact.component.ts` form model + `functions/src/index.ts` `ContactPayload` interface
- **Email template colours/copy** — edit `sendLeadNotification()` + `sendConfirmationEmail()` in `functions/src/index.ts`
- **Rate limit** — change `checkRateLimit(ip, '_ratelimit', 5)` — the `5` is max requests per hour
- **reCAPTCHA score threshold** — change `score < 0.5` in the function (lower for mobile-heavy audiences)
- **Currency** — update `AnalyticsService` e-commerce events (default `'KRW'` placeholders)
- **Social schema URLs** — update `SchemaService` constants
- **CSP policy** — update `src/server.ts` once you've finalised all 3rd-party scripts

---

## Secrets Reference

| Secret Name | How to Set | Used For |
|---|---|---|
| `RECAPTCHA_SECRET` | `firebase functions:secrets:set RECAPTCHA_SECRET` | reCAPTCHA v3 server-side verification |
| `GMAIL_APP_PASSWORD` | `firebase functions:secrets:set GMAIL_APP_PASSWORD` | Gmail SMTP auth for email notifications |
| `HUBSPOT_TOKEN` | `firebase functions:secrets:set HUBSPOT_TOKEN` | HubSpot Private App token (optional) |

Secrets are injected at Cloud Function runtime. They never touch environment files or source code.
