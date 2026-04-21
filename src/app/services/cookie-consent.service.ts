import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export type ConsentStatus = 'pending' | 'accepted' | 'declined';

const STORAGE_KEY = 'gs_cookie_consent';
const GTM_ID      = 'GTM-PDJGHSSK';

@Injectable({ providedIn: 'root' })
export class CookieConsentService {

  private readonly isBrowser: boolean;

  /** Emits the current consent status — components subscribe to react */
  readonly status$ = new BehaviorSubject<ConsentStatus>('pending');

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.init();
  }

  // ─── Initialise from localStorage ────────────────────────────────────────

  private init(): void {
    if (!this.isBrowser) return;

    const stored = localStorage.getItem(STORAGE_KEY) as ConsentStatus | null;
    if (stored === 'accepted' || stored === 'declined') {
      this.status$.next(stored);
      if (stored === 'accepted') {
        this.loadGTM();
      }
    }
    // If nothing stored → status stays 'pending' → banner shows
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  get status(): ConsentStatus {
    return this.status$.getValue();
  }

  accept(): void {
    if (!this.isBrowser) return;
    localStorage.setItem(STORAGE_KEY, 'accepted');
    this.status$.next('accepted');
    this.loadGTM();
  }

  decline(): void {
    if (!this.isBrowser) return;
    localStorage.setItem(STORAGE_KEY, 'declined');
    this.status$.next('declined');
  }

  /** Allow user to reset consent (e.g. from Datenschutz page) */
  reset(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(STORAGE_KEY);
    this.status$.next('pending');
  }

  // ─── GTM Loader ───────────────────────────────────────────────────────────

  private loadGTM(): void {
    if (!this.isBrowser) return;

    // Prevent double-loading
    if (document.getElementById('gtm-script')) return;

    // Initialise dataLayer
    (window as any)['dataLayer'] = (window as any)['dataLayer'] || [];
    (window as any)['dataLayer'].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

    // Inject GTM script
    const script = document.createElement('script');
    script.id    = 'gtm-script';
    script.async = true;
    script.src   = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    document.head.appendChild(script);

    // Inject GTM noscript iframe into body
    if (!document.getElementById('gtm-noscript')) {
      const ns = document.createElement('noscript');
      ns.id    = 'gtm-noscript';
      const iframe = document.createElement('iframe');
      iframe.src    = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
      iframe.height = '0';
      iframe.width  = '0';
      iframe.style.cssText = 'display:none;visibility:hidden';
      ns.appendChild(iframe);
      document.body.insertBefore(ns, document.body.firstChild);
    }
  }
}
