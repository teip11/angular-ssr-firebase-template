import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DataLayerService } from './data-layer.service';

/**
 * AnalyticsService — high-level event methods for components.
 *
 * All events route through DataLayerService.push() → dataLayer → GTM → GA4.
 * No direct gtag() calls. Adding any new tag (Meta Pixel, TikTok, Google Ads)
 * now only requires a new GTM tag — zero Angular changes needed.
 *
 * E-commerce events follow GA4 recommended event schema.
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    grecaptcha: any;
  }
}

// ─── Event Parameter Interfaces ───────────────────────────────────────────────

export interface GenerateLeadParams {
  lead_type: string;
  form_id?: string;
  submission_id?: string;
  form_page?: string;
  landing_page?: string;
  currency?: string;
  value?: number;
}

export interface CtaClickParams {
  cta_text: string;
  cta_location: string;
  destination?: string;
}

export interface ProductViewParams {
  item_id: string;
  item_name: string;
  item_category?: string;
  price?: number;
  currency?: string;
}

export interface AddToCartParams extends ProductViewParams {
  quantity?: number;
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private dataLayer: DataLayerService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initRouteTracking();
  }

  // ─── Auto-track route changes ─────────────────────────────────────────────

  private initRouteTracking(): void {
    if (!this.isBrowser) return;
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Route GA4 page views through dataLayer — GTM GA4 Config tag handles this
      this.dataLayer.push('page_view', {
        page_title:    typeof document !== 'undefined' ? document.title : '',
        page_location: typeof window !== 'undefined'
          ? `${window.location.origin}${event.urlAfterRedirects}`
          : '',
        page_path: event.urlAfterRedirects,
      });
    });
  }

  // ─── PRIMARY CONVERSION ───────────────────────────────────────────────────

  /**
   * generate_lead — PRIMARY conversion event.
   * MUST be called ONLY after confirmed HTTP 200 from the backend.
   * Firing on click or form submit (before confirmation) corrupts GA4 data.
   */
  trackGenerateLead(params: GenerateLeadParams): void {
    this.dataLayer.push('generate_lead', {
      currency:      params.currency     || 'EUR',
      value:         params.value        || 0,
      lead_type:     params.lead_type,
      form_id:       params.form_id      || 'contact_form',
      submission_id: params.submission_id || '',
      form_page:     params.form_page    || (this.isBrowser ? window.location.pathname : ''),
      landing_page:  params.landing_page || '',
    });
  }

  // ─── E-COMMERCE EVENTS ───────────────────────────────────────────────────

  /** User views a product detail page */
  trackProductView(params: ProductViewParams): void {
    this.dataLayer.push('view_item', {
      currency: params.currency || 'KRW', // TODO: set your store currency
      value:    params.price    || 0,
      items: [{
        item_id:       params.item_id,
        item_name:     params.item_name,
        item_category: params.item_category || 'K-Beauty',
        price:         params.price         || 0,
        quantity:      1,
      }],
    });
  }

  /** User adds a product to cart */
  trackAddToCart(params: AddToCartParams): void {
    this.dataLayer.push('add_to_cart', {
      currency: params.currency || 'KRW',
      value:    (params.price || 0) * (params.quantity || 1),
      items: [{
        item_id:       params.item_id,
        item_name:     params.item_name,
        item_category: params.item_category || 'K-Beauty',
        price:         params.price         || 0,
        quantity:      params.quantity      || 1,
      }],
    });
  }

  /** User begins checkout flow */
  trackBeginCheckout(items: AddToCartParams[], totalValue: number): void {
    this.dataLayer.push('begin_checkout', {
      currency: 'KRW', // TODO: set your store currency
      value:    totalValue,
      items:    items.map(p => ({
        item_id:       p.item_id,
        item_name:     p.item_name,
        item_category: p.item_category || 'K-Beauty',
        price:         p.price         || 0,
        quantity:      p.quantity      || 1,
      })),
    });
  }

  /** User completes a purchase */
  trackPurchase(transactionId: string, items: AddToCartParams[], totalValue: number): void {
    this.dataLayer.push('purchase', {
      transaction_id: transactionId,
      currency:       'KRW', // TODO: set your store currency
      value:          totalValue,
      items:          items.map(p => ({
        item_id:       p.item_id,
        item_name:     p.item_name,
        item_category: p.item_category || 'K-Beauty',
        price:         p.price         || 0,
        quantity:      p.quantity      || 1,
      })),
    });
  }

  // ─── MICRO CONVERSIONS ────────────────────────────────────────────────────

  /** User focuses the first form field — measures engagement vs page visitors */
  trackFormStart(formId = 'contact_form'): void {
    this.dataLayer.push('form_start', { form_id: formId });
  }

  /** User navigates away after starting the form — measures abandon rate */
  trackFormAbandon(formId = 'contact_form', lastField?: string): void {
    this.dataLayer.push('form_abandon', {
      form_id:    formId,
      last_field: lastField || '',
    });
  }

  /** Any CTA button click — intent signal */
  trackCtaClick(params: CtaClickParams): void {
    this.dataLayer.push('cta_click', {
      cta_text:     params.cta_text,
      cta_location: params.cta_location,
      destination:  params.destination || '',
    });
  }

  /** User completes skin quiz */
  trackQuizComplete(skinType: string, stepCount: number): void {
    this.dataLayer.push('quiz_complete', { skin_type: skinType, step_count: stepCount });
  }

  /** User views a product list / category */
  trackProductListView(listName: string, items: ProductViewParams[]): void {
    this.dataLayer.push('view_item_list', {
      item_list_name: listName,
      items: items.map((p, i) => ({
        index:         i,
        item_id:       p.item_id,
        item_name:     p.item_name,
        item_category: p.item_category || 'K-Beauty',
        price:         p.price || 0,
      })),
    });
  }

  /** Email link click */
  trackEmailClick(location: string): void {
    this.dataLayer.push('email_click', { click_location: location });
  }

  /** Generic passthrough for anything not covered above */
  trackEvent(eventName: string, params: Record<string, any> = {}): void {
    this.dataLayer.push(eventName, params);
  }
}
