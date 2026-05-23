import { Injectable, Inject, PLATFORM_ID, DOCUMENT } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * reCAPTCHA v3 — lazy script loading + token capture.
 *
 * Architecture:
 *   1. Frontend (here): load script lazily on first form interaction,
 *      grab a per-action token, attach it to the EmailJS template payload
 *      under the field name `g-recaptcha-response`.
 *   2. EmailJS server: verifies the token against the SECRET key you
 *      configure in the template's CAPTCHA settings, rejects low scores.
 *
 * SETUP CHECKLIST:
 *   1. Register a v3 ("Score based") key at
 *      https://www.google.com/recaptcha/admin/create
 *      Add domains: gehrkestudio.com, localhost.
 *   2. Paste the SITE key (public) into RECAPTCHA_SITE_KEY below.
 *   3. Paste the SECRET key into the EmailJS template's CAPTCHA settings
 *      (EmailJS dashboard → Email Templates → [template] → Settings →
 *       Captcha → enable reCAPTCHA v3, paste secret key).
 *   4. Until step 2 is done, this service runs in "placeholder mode":
 *      execute() returns an empty string, the script never loads, the
 *      EmailJS call still goes through (and is accepted only if the
 *      template doesn't yet require captcha).
 */
const RECAPTCHA_SITE_KEY: string = '6LeTIPUsAAAAAAv5Zr1b70uIonwyBKxEKxQ0yDln';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

@Injectable({ providedIn: 'root' })
export class RecaptchaService {
  readonly siteKey = RECAPTCHA_SITE_KEY;
  readonly isConfigured = RECAPTCHA_SITE_KEY !== 'YOUR_RECAPTCHA_SITE_KEY';

  private loadPromise: Promise<void> | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  /** Pre-warm the script. Call from form-page ngOnInit so the script is
   *  ready by the time the user clicks submit. Safe to call repeatedly. */
  preload(): void {
    if (!this.isConfigured) return;
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadScript().catch(() => { /* swallowed — execute() will retry */ });
  }

  /** Get a v3 token for a given action label (e.g. 'contact', 'demo').
   *  In placeholder mode (no site key configured), returns '' so the form
   *  still submits — useful for local dev before keys are registered. */
  async execute(action: string): Promise<string> {
    if (!isPlatformBrowser(this.platformId)) return '';
    if (!this.isConfigured) {
      console.warn(
        '[RecaptchaService] RECAPTCHA_SITE_KEY is a placeholder. ' +
        'Register keys at https://www.google.com/recaptcha/admin/create and update recaptcha.service.ts.'
      );
      return '';
    }
    await this.loadScript();
    if (!window.grecaptcha) throw new Error('grecaptcha unavailable after load');
    await new Promise<void>(resolve => window.grecaptcha!.ready(resolve));
    return window.grecaptcha.execute(this.siteKey, { action });
  }

  private loadScript(): Promise<void> {
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise<void>((resolve, reject) => {
      if (window.grecaptcha) { resolve(); return; }
      const script = this.document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${this.siteKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        this.loadPromise = null; // allow retry
        reject(new Error('Failed to load reCAPTCHA script'));
      };
      this.document.head.appendChild(script);
    });
    return this.loadPromise;
  }
}
