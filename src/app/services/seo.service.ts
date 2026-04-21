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
  articleMeta?: {
    publishedTime: string;
    modifiedTime?: string;
    section: string;
    tags?: string[];
    author?: string;
  };
}

const BASE_URL      = 'https://gehrkestudio.com';
const DEFAULT_IMAGE = `${BASE_URL}/OG_image.png`;
const DEFAULT_IMAGE_WIDTH  = 1024;
const DEFAULT_IMAGE_HEIGHT = 1024;
const DEFAULT_IMAGE_ALT    = 'Gehrke Studio — Premium Webdesign aus Hamburg';
const SITE_NAME = 'Gehrke Studio';

const PAGE_SEO: Record<string, SeoConfig> = {
  home: {
    title: 'Gehrke Studio | Premium Webdesign aus Hamburg',
    description: 'Professionelles Webdesign für anspruchsvolle Unternehmen. Wir erstellen individuelle Websites, die Kunden gewinnen. Kostenlose Demo anfordern.',
    keywords: 'professionelles Webdesign, Webdesign Hamburg, Website erstellen lassen, Webentwicklung, Webdesign Agentur',
    url: BASE_URL,
    type: 'website',
    imageAlt: 'Gehrke Studio — Premium Webdesign'
  },
  projekte: {
    title: 'Projekte | Gehrke Studio',
    description: 'Unsere ausgewählten Webdesign-Projekte zeigen, wie wir Unternehmen online erfolgreich machen. Vorher-Nachher-Vergleiche inklusive.',
    keywords: 'Webdesign Portfolio, Website Projekte, Referenzen, Webdesign Beispiele',
    url: `${BASE_URL}/projekte`,
    type: 'website',
    imageAlt: 'Webdesign Projekte — Gehrke Studio'
  },
  leistungen: {
    title: 'Leistungen | Gehrke Studio',
    description: 'Von Webdesign über SEO bis hin zur Conversion-Optimierung. Entdecken Sie unsere Leistungen für Ihren digitalen Erfolg.',
    keywords: 'Webdesign Leistungen, SEO, Conversion Optimierung, Webentwicklung, responsives Design',
    url: `${BASE_URL}/leistungen`,
    type: 'website',
    imageAlt: 'Unsere Leistungen — Gehrke Studio'
  },
  about: {
    title: 'Über uns | Gehrke Studio',
    description: 'Lernen Sie Gehrke Studio kennen – Ihr Partner für professionelles Webdesign aus Hamburg. Wir verbinden Ästhetik mit Performance.',
    keywords: 'über Gehrke Studio, Webdesign Hamburg, Webdesign Agentur, Team',
    url: `${BASE_URL}/ueber-uns`,
    type: 'website',
    imageAlt: 'Über uns — Gehrke Studio'
  },
  contact: {
    title: 'Kontakt | Gehrke Studio',
    description: 'Nehmen Sie Kontakt auf. Wir freuen uns auf Ihre Anfrage zu Webdesign, Zusammenarbeit oder Projekten.',
    keywords: 'Kontakt Gehrke Studio, Webdesign Anfrage, Beratung',
    url: `${BASE_URL}/kontakt`,
    type: 'website',
    imageAlt: 'Kontakt — Gehrke Studio'
  },
  demo: {
    title: 'Kostenlose Demo anfordern | Gehrke Studio',
    description: 'Fordern Sie eine kostenlose Website-Demo an. Wir erstellen einen individuellen Entwurf für Ihr Unternehmen – unverbindlich und kostenlos.',
    keywords: 'kostenlose Website Demo, Website Vorlage, Webdesign kostenlos testen',
    url: `${BASE_URL}/demo`,
    type: 'website',
    imageAlt: 'Kostenlose Demo — Gehrke Studio'
  },
  blog: {
    title: 'Blog & Insights | Gehrke Studio',
    description: 'Expertenwissen rund um Webdesign, SEO und digitale Strategien. Tipps und Tutorials für Ihren Online-Erfolg.',
    keywords: 'Webdesign Blog, SEO Tipps, Website Optimierung, digitale Strategien',
    url: `${BASE_URL}/blog`,
    type: 'blog',
    imageAlt: 'Blog — Gehrke Studio'
  },
  impressum: {
    title: 'Impressum | Gehrke Studio',
    description: 'Impressum von Gehrke Studio – Angaben gemäß § 5 TMG.',
    keywords: '',
    url: `${BASE_URL}/impressum`,
    type: 'website',
  },
  datenschutz: {
    title: 'Datenschutzerklärung | Gehrke Studio',
    description: 'Datenschutzerklärung von Gehrke Studio – Informationen zum Umgang mit Ihren personenbezogenen Daten.',
    keywords: '',
    url: `${BASE_URL}/datenschutz`,
    type: 'website',
  },
  'not-found': {
    title: '404 — Seite nicht gefunden | Gehrke Studio',
    description: 'Die Seite konnte leider nicht gefunden werden. Zurück zur Startseite oder unsere Projekte ansehen.',
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

    this.title.setTitle(config.title);

    this.meta.updateTag({ name: 'description', content: config.description });
    this.meta.updateTag({ name: 'keywords',    content: config.keywords });
    this.meta.updateTag({ name: 'author',      content: 'Gehrke Studio' });

    this.meta.updateTag({ property: 'og:site_name',     content: SITE_NAME });
    this.meta.updateTag({ property: 'og:title',         content: config.title });
    this.meta.updateTag({ property: 'og:description',   content: config.description });
    this.meta.updateTag({ property: 'og:image',         content: image });
    this.meta.updateTag({ property: 'og:image:alt',     content: imageAlt });
    this.meta.updateTag({ property: 'og:image:width',   content: String(imageWidth) });
    this.meta.updateTag({ property: 'og:image:height',  content: String(imageHeight) });
    this.meta.updateTag({ property: 'og:image:type',    content: 'image/png' });
    this.meta.updateTag({ property: 'og:url',           content: url });
    this.meta.updateTag({ property: 'og:type',          content: type });
    this.meta.updateTag({ property: 'og:locale',        content: 'de_DE' });

    this.meta.updateTag({ name: 'twitter:card',        content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title',       content: config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    this.meta.updateTag({ name: 'twitter:image',       content: image });
    this.meta.updateTag({ name: 'twitter:image:alt',   content: imageAlt });

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
