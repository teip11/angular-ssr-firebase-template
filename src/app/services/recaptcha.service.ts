import { Injectable, Inject, PLATFORM_ID, DOCUMENT } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * reCAPTCHA v2 invisible — lazy script loading + token capture.
 *
 * Architecture:
 *   1. Frontend (here): load script lazily, render an invisible widget on
 *      first use, call execute() to trigger verification, capture the token
 *      via the widget callback, attach it to the EmailJS template payload
 *      under the field name `g-recaptcha-response`.
 *   2. EmailJS server: verifies the token against the SECRET key configured
 *      in the template's reCAPTCHA settings (toggle: "Enable reCAPTCHA V2
 *      verification").
 *
 * Why v2 invisible and not v3: EmailJS only supports v2 server-side
 * verification in its dashboard. v3 tokens validated against a v2 secret
 * return `browser-error` and the send fails. v2 invisible preserves the
 * v3-style invisible UX (no checkbox) and trades per-action scoring for
 * a pass/fail token, which is enough for a low-traffic contact form.
 *
 * SETUP CHECKLIST:
 *   1. Register a v2 "Invisible reCAPTCHA badge" key at
 *      https://www.google.com/recaptcha/admin/create
 *      Add domains: gehrkestudio.com, localhost.
 *   2. Paste the SITE key (public) into RECAPTCHA_SITE_KEY below.
 *   3. Paste the SECRET key into the EmailJS template's reCAPTCHA settings.
 *   4. Until step 2 is done, this service runs in "placeholder mode":
 *      execute() returns an empty string and the EmailJS call still goes
 *      through (accepted only if the template doesn't yet require captcha).
 */
const RECAPTCHA_SITE_KEY: string = '6LcpTfgsAAAAAGHzyKTW2YAEgUb_8nRBScZ80eRt';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      render: (el: HTMLElement | string, opts: {
        sitekey: string;
        size: 'invisible';
        callback: (token: string) => void;
        'error-callback'?: () => void;
        'expired-callback'?: () => void;
      }) => number;
      execute: (widgetId: number) => void;
      reset: (widgetId: number) => void;
    };
  }
}

@Injectable({ providedIn: 'root' })
export class RecaptchaService {
  readonly siteKey = RECAPTCHA_SITE_KEY;
  readonly isConfigured =
    RECAPTCHA_SITE_KEY !== 'YOUR_V2_INVISIBLE_SITE_KEY' &&
    RECAPTCHA_SITE_KEY !== 'YOUR_RECAPTCHA_SITE_KEY';

  private loadPromise: Promise<void> | null = null;
  private widgetId: number | null = null;
  private container: HTMLElement | null = null;
  private resolveCurrent: ((token: string) => void) | null = null;

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

  /** Trigger a v2-invisible verification and resolve with the token.
   *  The `action` arg is kept for API compatibility with the prior v3
   *  implementation but is unused — v2 invisible does not score per action. */
  async execute(_action: string): Promise<string> {
    if (!isPlatformBrowser(this.platformId)) return '';
    if (!this.isConfigured) {
      console.warn(
        '[RecaptchaService] RECAPTCHA_SITE_KEY is a placeholder. ' +
        'Register a v2-invisible key at https://www.google.com/recaptcha/admin/create and update recaptcha.service.ts.'
      );
      return '';
    }
    await this.loadScript();
    if (!window.grecaptcha) throw new Error('grecaptcha unavailable after load');

    await new Promise<void>(resolve => window.grecaptcha!.ready(resolve));

    if (this.widgetId === null) {
      this.container = this.document.createElement('div');
      this.container.style.position = 'fixed';
      this.container.style.bottom = '0';
      this.container.style.right = '0';
      this.container.style.visibility = 'hidden';
      this.document.body.appendChild(this.container);
      this.widgetId = window.grecaptcha.render(this.container, {
        sitekey: this.siteKey,
        size: 'invisible',
        callback: (token) => this.resolveCurrent?.(token),
        'error-callback': () => this.resolveCurrent?.(''),
        'expired-callback': () => this.resolveCurrent?.(''),
      });
    } else {
      window.grecaptcha.reset(this.widgetId);
    }

    return new Promise<string>(resolve => {
      this.resolveCurrent = resolve;
      window.grecaptcha!.execute(this.widgetId!);
    });
  }

  private loadScript(): Promise<void> {
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise<void>((resolve, reject) => {
      if (window.grecaptcha) { resolve(); return; }
      const script = this.document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
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
