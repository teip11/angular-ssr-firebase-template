import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

// TODO: Replace with your production domain
const BASE_URL = 'https://YOUR_DOMAIN_HERE.com';

// TODO: Add your social media profile URLs
const INSTAGRAM_URL = 'https://instagram.com/YOUR_HANDLE'; // TODO
const TIKTOK_URL    = 'https://tiktok.com/@YOUR_HANDLE';   // TODO
const PINTEREST_URL = 'https://pinterest.com/YOUR_HANDLE'; // TODO

@Injectable({ providedIn: 'root' })
export class SchemaService {
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Inject a JSON-LD script tag with a unique ID.
   * Works on both server (SSR) and browser — safe to render server-side.
   * On the browser, any SSR-injected tag with the same ID is removed first.
   */
  addSchema(schema: any, id: string = 'schema-org'): void {
    if (this.isBrowser) {
      const existing = this.document.getElementById(id);
      if (existing) existing.remove();
    }
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id   = id;
    script.text = JSON.stringify(schema, null, 0);
    this.document.head.appendChild(script);
  }

  /** Remove a schema by ID — browser only */
  removeSchema(id: string = 'schema-org'): void {
    if (!this.isBrowser) return;
    const el = this.document.getElementById(id);
    if (el) el.remove();
  }

  /** Remove all JSON-LD scripts — browser only */
  removeAllSchemas(): void {
    if (!this.isBrowser) return;
    this.document.querySelectorAll('script[type="application/ld+json"]')
      .forEach(el => el.remove());
  }

  // ─── Schema Generators ────────────────────────────────────────────────────

  /** Store + Organization schema for homepage */
  getStoreSchema(): any {
    return {
      '@context': 'https://schema.org',
      '@type': ['Organization', 'Store'],
      '@id': `${BASE_URL}/#organization`,
      // TODO: Update name, description, email, address
      'name': 'Glow Seoul',
      'description': 'Authentic Korean beauty products curated and shipped worldwide. Skincare, makeup, and K-beauty essentials for every skin type.',
      'url': BASE_URL,
      'logo': `${BASE_URL}/assets/images/logo.png`,        // TODO: add logo
      'image': `${BASE_URL}/og-default.jpg`,               // TODO: add OG image
      'email': 'hello@YOUR_DOMAIN_HERE.com',               // TODO: update email
      'areaServed': {
        '@type': 'Country',
        'name': 'United States'
        // TODO: add more countries if shipping worldwide
      },
      'priceRange': '$$',
      'currenciesAccepted': 'USD, KRW',                    // TODO: update currencies
      'paymentAccepted': 'Credit Card, PayPal',
      'hasOfferCatalog': {
        '@type': 'OfferCatalog',
        'name': 'K-Beauty Products',
        'itemListElement': [
          { '@type': 'OfferCatalog', 'name': 'Skincare' },
          { '@type': 'OfferCatalog', 'name': 'Makeup' },
          { '@type': 'OfferCatalog', 'name': 'Serums & Ampoules' },
          { '@type': 'OfferCatalog', 'name': 'Sheet Masks' },
        ]
      },
      'sameAs': [INSTAGRAM_URL, TIKTOK_URL, PINTEREST_URL]
    };
  }

  /** WebSite schema with SearchAction */
  getWebSiteSchema(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      'name': 'Glow Seoul',
      'url': BASE_URL,
      'publisher': { '@id': `${BASE_URL}/#organization` },
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${BASE_URL}/shop?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
  }

  /** Full homepage schema bundle */
  getHomepageSchema(): any[] {
    return [
      this.getStoreSchema(),
      this.getWebSiteSchema()
    ];
  }

  /**
   * Product schema for individual product pages.
   * Enables Google Shopping rich results.
   */
  getProductSchema(params: {
    name: string;
    description: string;
    image: string | string[];
    sku?: string;
    brand?: string;
    price: number;
    currency?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    url?: string;
    reviewCount?: number;
    ratingValue?: number;
  }): any {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': params.name,
      'description': params.description,
      'image': Array.isArray(params.image) ? params.image : [params.image],
      'brand': {
        '@type': 'Brand',
        'name': params.brand || 'Glow Seoul'
      },
      'offers': {
        '@type': 'Offer',
        'url': params.url || BASE_URL,
        'priceCurrency': params.currency || 'USD',
        'price': String(params.price),
        'availability': `https://schema.org/${params.availability || 'InStock'}`,
        'seller': { '@id': `${BASE_URL}/#organization` }
      }
    };

    if (params.sku) schema.sku = params.sku;

    if (params.reviewCount && params.ratingValue) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        'ratingValue': params.ratingValue,
        'reviewCount': params.reviewCount
      };
    }

    return schema;
  }

  /** FAQ schema — pass in array of Q&A pairs */
  getFAQSchema(faqs: Array<{ question: string; answer: string }>): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqs.map(faq => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer
        }
      }))
    };
  }

  /**
   * Article / BlogPosting schema for blog posts.
   */
  getArticleSchema(params: {
    headline: string;
    description: string;
    image?: string;
    datePublished: string;
    dateModified?: string;
    authorName?: string;
    url: string;
    keywords?: string[];
  }): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': params.headline,
      'description': params.description,
      'image': params.image || DEFAULT_OG,
      'datePublished': params.datePublished,
      'dateModified': params.dateModified || params.datePublished,
      'author': {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        'name': params.authorName || 'Glow Seoul'
      },
      'publisher': { '@id': `${BASE_URL}/#organization` },
      'url': params.url,
      'keywords': params.keywords?.join(', ') || '',
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': params.url
      }
    };
  }

  /** Breadcrumb schema for inner pages */
  getBreadcrumbSchema(crumbs: Array<{ name: string; url: string }>): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': crumbs.map((crumb, i) => ({
        '@type': 'ListItem',
        'position': i + 1,
        'name': crumb.name,
        'item': crumb.url.startsWith('http') ? crumb.url : `${BASE_URL}${crumb.url}`
      }))
    };
  }
}

// Used internally in getArticleSchema
const DEFAULT_OG = `${BASE_URL}/og-default.jpg`;
