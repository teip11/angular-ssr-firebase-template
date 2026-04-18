import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

export interface SeoConfig {
  title: string;
  description: string;
  keywords: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  url?: string;
  type?: string;
  /** Article-specific OG tags — set when type = 'article' */
  articleMeta?: {
    publishedTime: string;   // ISO 8601 e.g. "2026-03-08"
    modifiedTime?: string;
    section: string;         // e.g. "Skincare", "Premium Webdesign", "Tutorial"
    tags?: string[];
    author?: string;
  };
  /** Product-specific OG tags — set when type = 'product' */
  productMeta?: {
    price: string;
    currency: string;
    availability: 'instock' | 'oos' | 'pending';
  };
}

// TODO: Replace with your production domain
const BASE_URL      = 'https://YOUR_DOMAIN_HERE.com';
const DEFAULT_IMAGE = `${BASE_URL}/og-default.jpg`;

// TODO: Update these dimensions if you use a different OG image
const DEFAULT_IMAGE_WIDTH  = 1200;
const DEFAULT_IMAGE_HEIGHT = 627;
const DEFAULT_IMAGE_ALT    = 'Gehrke Studio — Authentic Korean Beauty Delivered';

// TODO: Update site name to your brand
const SITE_NAME = 'Gehrke Studio';

// ─── Page-level SEO configs — update all TODO values ────────────────────────
const PAGE_SEO: Record<string, SeoConfig> = {
  home: {
    // TODO: Write compelling title and description for your homepage
    title: 'Gehrke Studio | Authentic Korean Beauty Delivered',
    description: 'Discover authentic Korean skincare, makeup, and beauty essentials. Curated K-beauty products for every skin type, shipped worldwide.',
    keywords: 'professionelles Webdesign, K-beauty, Korean skincare, K-beauty store, Korean cosmetics, glass skin, glow skincare',
    url: BASE_URL,
    type: 'website',
    imageAlt: 'Gehrke Studio — Authentic Korean Beauty'
  },
  shop: {
    title: 'Shop Premium Webdesign | Gehrke Studio',
    description: 'Browse our curated collection of authentic Korean skincare, serums, toners, and makeup. Free shipping on orders over $XX.',
    keywords: 'shop professionelles Webdesign, K-beauty products, Korean skincare online, buy K-beauty',
    url: `${BASE_URL}/shop`,
    type: 'website',
    imageAlt: 'Shop Premium Webdesign Products — Gehrke Studio'
  },
  quiz: {
    title: 'Skin Type Quiz | Find Your Premium Webdesign Routine | Gehrke Studio',
    description: 'Take our 2-minute skin type quiz and get a personalized Korean skincare routine recommendation. Oily, dry, combination, or sensitive — we\'ve got you covered.',
    keywords: 'skin type quiz, K-beauty quiz, skincare routine quiz, personalized skincare, professionelles Webdesign quiz',
    url: `${BASE_URL}/quiz`,
    type: 'website',
    imageAlt: 'Skin Type Quiz — Gehrke Studio'
  },
  about: {
    // TODO: Personalize for your brand story
    title: 'About | Our Story | Gehrke Studio',
    description: 'We\'re obsessed with professionelles Webdesign. Gehrke Studio sources authentic K-beauty products directly from Korea so you can achieve that coveted glass skin glow.',
    keywords: 'about Gehrke Studio, professionelles Webdesign brand, K-beauty story, authentic Korean cosmetics',
    url: `${BASE_URL}/about`,
    type: 'website',
    imageAlt: 'About Gehrke Studio — Our Premium Webdesign Story'
  },
  contact: {
    title: 'Contact | Gehrke Studio',
    description: 'Have a question? We\'d love to hear from you. Reach out about orders, products, collaborations, or wholesale inquiries.',
    keywords: 'contact Gehrke Studio, customer service, K-beauty help, wholesale professionelles Webdesign',
    url: `${BASE_URL}/contact`,
    type: 'website',
    imageAlt: 'Contact Gehrke Studio'
  },
  blog: {
    title: 'Premium Webdesign Blog | Skincare Tips & Tutorials | Gehrke Studio',
    description: 'Expert K-beauty guides, skincare tutorials, ingredient deep-dives, and routines for every skin type. Learn the secrets of Korean glass skin.',
    keywords: 'K-beauty blog, Korean skincare tips, glass skin routine, K-beauty tutorials, skincare ingredients',
    url: `${BASE_URL}/blog`,
    type: 'blog',
    imageAlt: 'Premium Webdesign Blog — Gehrke Studio'
  },
  'not-found': {
    title: '404 — Page Not Found | Gehrke Studio',
    description: 'The page you were looking for doesn\'t exist. Browse our K-beauty products or return to the homepage.',
    keywords: '',
    url: BASE_URL,
    type: 'website',
  }
};

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private meta: Meta,
    private title: Title,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.setupRobotsTag();
  }

  private setupRobotsTag(): void {
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
  }

  setPageSEO(pageType: string, custom?: Partial<SeoConfig>): void {
    try {
      const base = PAGE_SEO[pageType];
      if (!base) {
        console.warn(`[SeoService] No SEO config found for page: ${pageType}`);
        return;
      }
      const config: SeoConfig = { ...base, ...custom };
      this.updateMetaTags(config);
    } catch (err) {
      console.error('[SeoService] Error setting page SEO:', err);
    }
  }

  updateMetaTags(config: SeoConfig): void {
    const url         = config.url         || BASE_URL;
    const image       = config.image       || DEFAULT_IMAGE;
    const imageAlt    = config.imageAlt    || DEFAULT_IMAGE_ALT;
    const imageWidth  = config.imageWidth  || DEFAULT_IMAGE_WIDTH;
    const imageHeight = config.imageHeight || DEFAULT_IMAGE_HEIGHT;
    const type        = config.type        || 'website';

    // ── Title ────────────────────────────────────────────────────────────────
    this.title.setTitle(config.title);

    // ── Standard meta ────────────────────────────────────────────────────────
    this.meta.updateTag({ name: 'description', content: config.description });
    this.meta.updateTag({ name: 'keywords',    content: config.keywords });
    // TODO: Update author name
    this.meta.updateTag({ name: 'author',      content: 'Gehrke Studio' });

    // ── Open Graph ───────────────────────────────────────────────────────────
    this.meta.updateTag({ property: 'og:site_name',     content: SITE_NAME });
    this.meta.updateTag({ property: 'og:title',         content: config.title });
    this.meta.updateTag({ property: 'og:description',   content: config.description });
    this.meta.updateTag({ property: 'og:image',         content: image });
    this.meta.updateTag({ property: 'og:image:alt',     content: imageAlt });
    this.meta.updateTag({ property: 'og:image:width',   content: String(imageWidth) });
    this.meta.updateTag({ property: 'og:image:height',  content: String(imageHeight) });
    this.meta.updateTag({ property: 'og:image:type',    content: 'image/jpeg' });
    this.meta.updateTag({ property: 'og:url',           content: url });
    this.meta.updateTag({ property: 'og:type',          content: type });
    this.meta.updateTag({ property: 'og:locale',        content: 'en_US' });

    // ── Twitter / X Card ─────────────────────────────────────────────────────
    this.meta.updateTag({ name: 'twitter:card',        content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title',       content: config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    this.meta.updateTag({ name: 'twitter:image',       content: image });
    this.meta.updateTag({ name: 'twitter:image:alt',   content: imageAlt });

    // ── Article-specific OG tags (og:type = "article") ───────────────────────
    if (config.articleMeta) {
      this.meta.updateTag({ property: 'article:published_time', content: config.articleMeta.publishedTime });
      if (config.articleMeta.modifiedTime) {
        this.meta.updateTag({ property: 'article:modified_time', content: config.articleMeta.modifiedTime });
      }
      this.meta.updateTag({ property: 'article:section', content: config.articleMeta.section });
      this.meta.updateTag({ property: 'article:author',  content: config.articleMeta.author || 'Gehrke Studio' });
      if (config.articleMeta.tags?.length) {
        config.articleMeta.tags.forEach(tag =>
          this.meta.addTag({ property: 'article:tag', content: tag })
        );
      }
    } else {
      this.meta.removeTag('property="article:published_time"');
      this.meta.removeTag('property="article:modified_time"');
      this.meta.removeTag('property="article:section"');
      this.meta.removeTag('property="article:author"');
    }

    // ── Product-specific OG tags (og:type = "product") ───────────────────────
    if (config.productMeta) {
      this.meta.updateTag({ property: 'product:price:amount',   content: config.productMeta.price });
      this.meta.updateTag({ property: 'product:price:currency', content: config.productMeta.currency });
      this.meta.updateTag({ property: 'product:availability',   content: config.productMeta.availability });
    } else {
      this.meta.removeTag('property="product:price:amount"');
      this.meta.removeTag('property="product:price:currency"');
      this.meta.removeTag('property="product:availability"');
    }

    // ── Canonical ────────────────────────────────────────────────────────────
    this.updateCanonical(url);
  }

  updateCanonical(url: string): void {
    const existing = this.document.querySelector('link[rel="canonical"]');
    if (existing) existing.remove();
    const link = this.document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    this.document.head.appendChild(link);
  }

  /**
   * Inject arbitrary JSON-LD into the document head.
   * Works on both server (SSR) and browser — JSON-LD <script> tags are safe
   * to SSR and are how crawlers discover structured data.
   */
  addStructuredData(data: any, id: string = 'schema-main'): void {
    if (isPlatformBrowser(this.platformId)) {
      const existing = this.document.getElementById(id);
      if (existing) existing.remove();
    }
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id   = id;
    script.text = JSON.stringify(data);
    this.document.head.appendChild(script);
  }
}
