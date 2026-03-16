import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TrackingService } from './tracking.service';

/**
 * DataLayerService — the single event bus for all analytics.
 *
 * All events go through dataLayer.push() so GTM is the routing layer.
 * This means adding Meta Pixel, Google Ads, TikTok Pixel, or any other
 * tag later requires zero Angular changes — just a new GTM tag.
 *
 * The GA4 Config tag in GTM handles page views.
 * All event tags in GTM trigger on Custom Events matching the event names below.
 */
@Injectable({ providedIn: 'root' })
export class DataLayerService {

  /** Single session ID generated once per browser session — ties GA4 to CRM */
  readonly sessionId: string = this.generateSessionId();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private tracking: TrackingService
  ) {}

  /**
   * Push any event to the dataLayer.
   * Automatically appends:
   *   - first_touch_source / medium / campaign (from sessionStorage)
   *   - session_id
   *   - page_path
   *   - event_timestamp
   */
  push(event: string, params: Record<string, unknown> = {}): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const utms = this.tracking.getUtms();

    // Ensure dataLayer exists
    (window as any)['dataLayer'] = (window as any)['dataLayer'] || [];

    (window as any)['dataLayer'].push({
      event,
      ...params,
      // First-touch attribution — always appended to every event
      first_touch_source:   utms.utm_source   || 'direct',
      first_touch_medium:   utms.utm_medium   || 'none',
      first_touch_campaign: utms.utm_campaign || '(none)',
      first_touch_term:     utms.utm_term     || '',
      first_touch_content:  utms.utm_content  || '',
      // Session context
      session_id:      this.sessionId,
      page_path:       window.location.pathname,
      event_timestamp: new Date().toISOString(),
    });
  }

  private generateSessionId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for environments without crypto.randomUUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
}
