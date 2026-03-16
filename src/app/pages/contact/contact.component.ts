import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SeoService } from '../../services/seo.service';
import { AnalyticsService } from '../../services/analytics.service';
import { TrackingService } from '../../services/tracking.service';
import { DataLayerService } from '../../services/data-layer.service';

// ── reCAPTCHA v3 ─────────────────────────────────────────────────────────────
// The script is lazy-loaded in ngOnInit (contact page only).
// Loading it globally wastes ~350 KB on every page. This way it only loads
// when the user visits /contact.
//
// TODO: Replace with your real reCAPTCHA v3 SITE key (not the secret key).
// Create keys at: https://www.google.com/recaptcha/admin/create
// Choose "Score based (v3)" and add your domain.
const RECAPTCHA_SITE_KEY = 'YOUR_RECAPTCHA_SITE_KEY';

declare const grecaptcha: {
  execute(siteKey: string, options: { action: string }): Promise<string>;
  ready(callback: () => void): void;
};

// ── API endpoint ─────────────────────────────────────────────────────────────
// Relative path — routed via firebase.json rewrite to the contactForm function.
// This keeps the Cloud Function URL out of the client bundle.
const CONTACT_ENDPOINT = '/api/contact';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent implements OnInit, OnDestroy {

  state: 'idle' | 'submitting' | 'success' | 'error' = 'idle';
  errorMessage = '';

  // Tracks whether the user has started filling out the form (for abandon analytics)
  private formStarted = false;

  form = {
    name:    '',
    email:   '',
    subject: '',
    message: '',
    phone:   '',  // honeypot — hidden from real users, bots fill it
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private seo: SeoService,
    private analytics: AnalyticsService,
    private tracking: TrackingService,
    private dataLayer: DataLayerService
  ) {}

  ngOnInit(): void {
    this.seo.setPageSEO('contact');

    // Lazy-load reCAPTCHA v3 only on this page — avoids 350 KB on every other page.
    // The script is deferred so it never blocks page rendering.
    if (isPlatformBrowser(this.platformId) && RECAPTCHA_SITE_KEY !== 'YOUR_RECAPTCHA_SITE_KEY') {
      const existing = document.querySelector('script[src*="recaptcha/api"]');
      if (!existing) {
        const script    = document.createElement('script');
        script.src      = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
        script.async    = true;
        script.defer    = true;
        document.head.appendChild(script);
      }
    }
  }

  ngOnDestroy(): void {
    // Fire form abandon event if user started filling out the form but never submitted
    if (this.formStarted && this.state === 'idle') {
      this.analytics.trackFormAbandon('contact_form');
    }
  }

  onFirstInput(): void {
    if (!this.formStarted) {
      this.formStarted = true;
      this.analytics.trackFormStart('contact_form');
    }
  }

  /** Get reCAPTCHA v3 token — resolves to '' if reCAPTCHA not configured yet */
  private getRecaptchaToken(): Promise<string> {
    if (
      !isPlatformBrowser(this.platformId) ||
      RECAPTCHA_SITE_KEY === 'YOUR_RECAPTCHA_SITE_KEY' ||
      typeof grecaptcha === 'undefined'
    ) {
      return Promise.resolve('');
    }
    return new Promise(resolve => {
      grecaptcha.ready(() => {
        grecaptcha
          .execute(RECAPTCHA_SITE_KEY, { action: 'contact_form' })
          .then(token => resolve(token))
          .catch(() => resolve(''));
      });
    });
  }

  async onSubmit(ngForm: NgForm): Promise<void> {
    if (ngForm.invalid || this.state === 'submitting') return;

    // Honeypot check — bots fill the hidden phone field, real users never see it
    if (this.form.phone) {
      this.state = 'success'; // Silent acceptance — don't reveal rejection to bots
      return;
    }

    this.state = 'submitting';
    this.errorMessage = '';

    const utms          = this.tracking.getUtms();
    const recaptchaToken = await this.getRecaptchaToken();

    const payload = {
      // Form fields
      name:    this.form.name.trim(),
      email:   this.form.email.trim().toLowerCase(),
      subject: this.form.subject.trim(),
      message: this.form.message.trim(),

      // Spam protection
      phone:          this.form.phone,   // honeypot (always empty for real users)
      recaptchaToken,                    // reCAPTCHA v3 token

      // First-touch attribution — captured by TrackingService on first page load
      source:     utms.utm_source    || 'direct',
      medium:     utms.utm_medium    || 'none',
      campaign:   utms.utm_campaign  || '(none)',
      landing:    utms._landing_page || '/',
      referrer:   utms._referrer     || '',
      sessionId:  this.dataLayer.sessionId,
      capturedAt: utms._captured_at  || new Date().toISOString(),
      userTz:     utms._user_tz      || '',
    };

    this.http
      .post<{ submissionId?: string }>(CONTACT_ENDPOINT, payload)
      .subscribe({
        next: (res) => {
          this.state = 'success';

          // Fire generate_lead ONLY after confirmed HTTP 200 from backend.
          // Firing on click or submit (before confirmation) corrupts GA4 conversion data.
          this.analytics.trackGenerateLead({
            lead_type:     'contact_form',
            form_id:       'contact_form',
            submission_id: res?.submissionId || '',
            form_page:     isPlatformBrowser(this.platformId) ? window.location.pathname : '/contact',
            landing_page:  utms._landing_page || '/',
          });

          ngForm.resetForm();
        },
        error: (err) => {
          this.state = 'error';
          // Show specific messages for known error codes
          if (err.status === 429) {
            this.errorMessage = 'Too many requests — please wait an hour and try again.';
          } else if (err.status === 400) {
            this.errorMessage = err?.error?.message || 'Please check your details and try again.';
          } else {
            // TODO: Update the fallback email address for your brand
            this.errorMessage = 'Something went wrong. Please email us directly.';
          }
        },
      });
  }
}
