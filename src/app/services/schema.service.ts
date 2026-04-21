import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

const BASE_URL = 'https://gehrkestudio.com';

@Injectable({ providedIn: 'root' })
export class SchemaService {
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

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

  removeSchema(id: string = 'schema-org'): void {
    if (!this.isBrowser) return;
    const el = this.document.getElementById(id);
    if (el) el.remove();
  }

  removeAllSchemas(): void {
    if (!this.isBrowser) return;
    this.document.querySelectorAll('script[type="application/ld+json"]')
      .forEach(el => el.remove());
  }

  /** Organization schema for homepage */
  getStoreSchema(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      'name': 'Gehrke Studio',
      'description': 'Premium Webdesign für anspruchsvolle Unternehmen. Individuelle Websites aus Hamburg, die Kunden gewinnen.',
      'url': BASE_URL,
      'logo': `${BASE_URL}/assets/images/logo.png`,
      'image': `${BASE_URL}/OG_image.png`,
      'email': 'piet@gehrkestudio.com',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Wandsbeker Schützenhof 24',
        'addressLocality': 'Hamburg',
        'postalCode': '22047',
        'addressCountry': 'DE'
      },
      'areaServed': {
        '@type': 'Country',
        'name': 'Germany'
      }
    };
  }

  /** WebSite schema */
  getWebSiteSchema(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      'name': 'Gehrke Studio',
      'url': BASE_URL,
      'publisher': { '@id': `${BASE_URL}/#organization` }
    };
  }

  /** Full homepage schema bundle */
  getHomepageSchema(): any[] {
    return [
      this.getStoreSchema(),
      this.getWebSiteSchema()
    ];
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

  /** Article / BlogPosting schema for blog posts */
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
      'image': params.image || `${BASE_URL}/OG_image.png`,
      'datePublished': params.datePublished,
      'dateModified': params.dateModified || params.datePublished,
      'author': {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        'name': params.authorName || 'Gehrke Studio'
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
