import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface UtmData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  _referrer?: string;
  _landing_page?: string;
  _captured_at?: string;
  _user_tz?: string;
}

@Injectable({ providedIn: 'root' })
export class TrackingService {

  // TODO: Change this key if you want a different sessionStorage namespace
  private readonly STORAGE_KEY = '_gs_utms';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Call once on app init (AppComponent.ngOnInit).
   * Captures UTM params and referrer on first page load — first-touch only.
   * Never overwrites an existing captured session.
   */
  captureUtms(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const params = new URLSearchParams(window.location.search);
    const existing = this.getUtms();

    // First-touch only — do not overwrite once captured
    if (existing.utm_source) return;

    const utms: UtmData = {};
    const keys: (keyof UtmData)[] = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'
    ];

    keys.forEach(k => {
      const val = params.get(k);
      if (val) (utms as any)[k] = val;
    });

    utms._referrer     = document.referrer || 'direct';
    utms._landing_page = window.location.pathname;
    utms._captured_at  = new Date().toISOString();
    utms._user_tz      = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Only persist if at least one UTM param is present
    if (Object.keys(utms).some(k => !k.startsWith('_'))) {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(utms));
    } else {
      // Still capture referrer and landing page even without UTMs (for direct/referral)
      utms.utm_source  = this.detectSource(utms._referrer);
      utms.utm_medium  = this.detectMedium(utms._referrer);
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(utms));
    }
  }

  /** Returns current UTM data from sessionStorage */
  getUtms(): UtmData {
    if (!isPlatformBrowser(this.platformId)) return {};
    try {
      return JSON.parse(sessionStorage.getItem(this.STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  /** Infers utm_source from referrer when no UTM params present */
  private detectSource(referrer: string): string {
    if (!referrer || referrer === 'direct') return 'direct';
    if (/google\./i.test(referrer)) return 'google';
    if (/bing\./i.test(referrer)) return 'bing';
    if (/yahoo\./i.test(referrer)) return 'yahoo';
    if (/linkedin\./i.test(referrer)) return 'linkedin';
    if (/facebook\.|instagram\./i.test(referrer)) return 'social';
    if (/tiktok\./i.test(referrer)) return 'tiktok';
    if (/pinterest\./i.test(referrer)) return 'pinterest';
    return 'referral';
  }

  /** Infers utm_medium from referrer when no UTM params present */
  private detectMedium(referrer: string): string {
    if (!referrer || referrer === 'direct') return 'none';
    if (/google\.|bing\.|yahoo\./i.test(referrer)) return 'organic';
    if (/linkedin\.|facebook\.|instagram\.|tiktok\.|pinterest\./i.test(referrer)) return 'social';
    return 'referral';
  }
}
