import { Component, OnInit, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface OyProduct {
  rank: number;
  brand: string;
  name: string;
  shortName: string;
  price: number;
  salePrice: number | null;
  rating: number;
  image: string;
  tag?: string;
  outOfStock?: boolean;
  category: string;
  highlight?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  private gsapCtx: any;

  constructor(
    private meta: Meta,
    @Inject(PLATFORM_ID) private platformId: Object,
    private el: ElementRef
  ) {}

  products: OyProduct[] = [
    {
      rank: 1, brand: "d'Alba", shortName: "White Truffle Spray Serum",
      name: "White Truffle First Spray Serum 100mL Double Pack",
      price: 70.00, salePrice: 41.20, rating: 4.8,
      image: 'https://cdn-image.oliveyoung.com/display/1124/3e428fad-d1b1-41f0-b7f1-e00555d8cf8c.jpg?RS=315x420&SF=webp&QT=80',
      tag: '#1 Best Seller', category: 'Serum', highlight: 'Korea\'s most-repurchased serum'
    },
    {
      rank: 2, brand: "S.NATURE", shortName: "Aqua Squalane Cream 1+1",
      name: "Aqua Squalane Moisturizing Cream 60mL 1+1 Limited Set",
      price: 50.00, salePrice: 27.32, rating: 4.8,
      image: 'https://cdn-image.oliveyoung.com/display/1650/6b15bb5b-196b-4f62-8816-a51bfe856442.jpg?RS=315x420&SF=webp&QT=80',
      category: 'Moisturizer', highlight: 'Buy one get one free'
    },
    {
      rank: 3, brand: "Torriden", shortName: "Dive-In HA Serum Refill Set",
      name: "Dive In Low Molecular Hyaluronic Acid Serum 50ml Refill Set",
      price: 42.00, salePrice: 31.50, rating: 4.9,
      image: 'https://cdn-image.oliveyoung.com/display/1291/5ed4a9c1-d3b8-4cff-8be0-1c42c175158e.jpg?RS=315x420&SF=webp&QT=80',
      tag: 'Top Rated', category: 'Serum', highlight: 'Rated 4.9 by 10,000+ Koreans'
    },
    {
      rank: 4, brand: "Anua", shortName: "PDRN HA Capsule Serum",
      name: "PDRN Hyaluronic Acid Capsule 100 Serum 30ml Double Pack",
      price: 67.00, salePrice: 34.84, rating: 4.9,
      image: 'https://cdn-image.oliveyoung.com/display/1361/ccb287b1-36cb-4e23-a3fb-b1a42b6db27e.jpg?RS=315x420&SF=webp&QT=80',
      category: 'Serum', highlight: 'PDRN technology from Korea'
    },
    {
      rank: 5, brand: "beplain", shortName: "Mung Bean Cleansing Foam",
      name: "Mung Bean pH-Balanced Cleansing Foam 160ml Double Pack",
      price: 31.00, salePrice: 29.68, rating: 4.8,
      image: 'https://cdn-image.oliveyoung.com/display/1927/fcabb81a-7d60-4b8e-8c6d-4d167942e2a0.jpg?RS=315x420&SF=webp&QT=80',
      category: 'Cleanser', highlight: 'Gentle enough for sensitive skin'
    },
    {
      rank: 6, brand: "medicube", shortName: "PDRN Pink Peptide Ampoule",
      name: "PDRN Pink Peptide Ampoule 30ml Refill Set",
      price: 54.00, salePrice: 28.87, rating: 4.8,
      image: 'https://cdn-image.oliveyoung.com/display/1124/b45371a5-5b3c-4604-af42-f83ecc9852d9.jpg?RS=315x420&SF=webp&QT=80',
      category: 'Ampoule', highlight: 'Anti-aging PDRN formula'
    },
    {
      rank: 7, brand: "WELLAGE", shortName: "Real HA Blue Ampoule",
      name: "Real Hyaluronic Blue 100 Ampoule 75ml Double Pack",
      price: 58.00, salePrice: 34.68, rating: 4.9,
      image: 'https://cdn-image.oliveyoung.com/display/1653/f7f0174b-b0a1-4a01-9ef6-bc851187bfe1.jpg?RS=315x420&SF=webp&QT=80',
      outOfStock: true, category: 'Ampoule', highlight: '100% pure hyaluronic acid'
    },
    {
      rank: 8, brand: "ma:nyo", shortName: "Pure Cleansing Oil Double",
      name: "Pure Cleansing Oil 200ml x 2ea (+25ml Gift)",
      price: 43.00, salePrice: 30.10, rating: 4.9,
      image: 'https://cdn-image.oliveyoung.com/display/1587/93d560ea-8311-43da-bd44-9d6b1082d91d.jpg?RS=315x420&SF=webp&QT=80',
      category: 'Cleanser', highlight: 'Melts off sunscreen & makeup'
    },
    {
      rank: 9, brand: "ongredients", shortName: "Skin Barrier Calming Lotion",
      name: "Skin Barrier Calming Lotion EX 220ml Set (+80ml)",
      price: 47.00, salePrice: null, rating: 4.7,
      image: 'https://cdn-image.oliveyoung.com/display/1164/c84db808-8a07-4a2e-896e-86552013a02a.jpg?RS=315x420&SF=webp&QT=80',
      category: 'Lotion', highlight: 'Restores damaged skin barrier'
    },
    {
      rank: 10, brand: "BIOHEAL BOH", shortName: "Probioderm 3D Lifting Cream",
      name: "Probioderm 3D Lifting Cream 50ml Refill Set",
      price: 82.00, salePrice: null, rating: 5.0,
      image: 'https://cdn-image.oliveyoung.com/display/1263/9f574a14-a156-403e-923c-c1a65398eed7.jpg?RS=315x420&SF=webp&QT=80',
      tag: '⭐ Perfect Score', category: 'Cream', highlight: 'Rated 5.0 — zero bad reviews'
    },
    {
      rank: 11, brand: "MEDIHEAL", shortName: "Madecassoside Blemish Serum",
      name: "Madecassoside Blemish Repair Serum 40ml x2",
      price: 49.00, salePrice: 30.40, rating: 4.8,
      image: 'https://cdn-image.oliveyoung.com/display/1938/07929254-2989-4529-a767-2111e0ab7564.jpg?RS=315x420&SF=webp&QT=80',
      category: 'Serum', highlight: 'Heals blemishes overnight'
    },
    {
      rank: 12, brand: "Torriden", shortName: "Dive-in Soothing Cream",
      name: "Dive-in Soothing Cream 100ml Double Pack",
      price: 49.00, salePrice: 36.75, rating: 4.8,
      image: 'https://cdn-image.oliveyoung.com/display/1141/9697bcba-7257-4226-85d3-c8cc1fc0f20b.jpg?RS=315x420&SF=webp&QT=80',
      category: 'Cream', highlight: 'The glass-skin finishing cream'
    },
  ];

  get featuredProduct(): OyProduct {
    return this.products[0];
  }

  ngOnInit(): void {
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    if (isPlatformBrowser(this.platformId)) {
      gsap.registerPlugin(ScrollTrigger);
      window.scrollTo(0, 0);
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.initAnimations();
  }

  private initAnimations(): void {
    this.gsapCtx = gsap.context(() => {

      // ── Hero ──────────────────────────────────────────────
      const herTl = gsap.timeline({ delay: 0.1 });
      herTl
        .from('.gs-live-badge', { opacity: 0, y: -24, duration: 0.5, ease: 'power2.out' })
        .from('.gs-hero-title .line', { opacity: 0, y: 48, duration: 0.75, stagger: 0.18, ease: 'power3.out' }, '-=0.1')
        .from('.gs-hero-sub', { opacity: 0, y: 20, duration: 0.55 }, '-=0.2')
        .from('.gs-hero-ctas', { opacity: 0, y: 16, duration: 0.45 }, '-=0.1')
        .from('.gs-hero-img-wrap', { opacity: 0, x: 60, duration: 0.8, ease: 'power2.out' }, 0.3)
        .from('.gs-hero-rank-badge', { opacity: 0, scale: 0, duration: 0.5, ease: 'back.out(2)' }, 0.9)
        .from('.gs-hero-stats span', { opacity: 0, y: 10, stagger: 0.12, duration: 0.4 }, 0.9);

      // ── Marquee fade in ───────────────────────────────────
      gsap.from('.gs-marquee-wrap', { opacity: 0, duration: 0.6, delay: 1.3 });

      // ── Section header ────────────────────────────────────
      ScrollTrigger.create({
        trigger: '.gs-rankings-section',
        start: 'top 80%',
        onEnter: () => {
          gsap.from('.gs-section-eyebrow, .gs-section-h2, .gs-section-sub', {
            opacity: 0, y: 30, duration: 0.6, stagger: 0.12, ease: 'power2.out'
          });
        },
        once: true
      });

      // ── Product cards stagger ─────────────────────────────
      ScrollTrigger.batch('.gs-prod-card', {
        onEnter: (els) => {
          gsap.from(els, {
            opacity: 0,
            y: 55,
            scale: 0.96,
            duration: 0.65,
            stagger: 0.08,
            ease: 'power2.out',
          });
        },
        start: 'top 88%',
        once: true,
      });

      // ── Trust row ─────────────────────────────────────────
      ScrollTrigger.batch('.gs-trust-item', {
        onEnter: (els) => {
          gsap.from(els, {
            opacity: 0, y: 30, duration: 0.5, stagger: 0.1, ease: 'power2.out'
          });
        },
        start: 'top 88%',
        once: true,
      });

      // ── CTA section ───────────────────────────────────────
      ScrollTrigger.create({
        trigger: '.gs-cta-section',
        start: 'top 85%',
        onEnter: () => {
          gsap.from('.gs-cta-inner', { opacity: 0, y: 40, duration: 0.7, ease: 'power2.out' });
        },
        once: true,
      });

    }, this.el);
  }

  ngOnDestroy(): void {
    if (this.gsapCtx) this.gsapCtx.revert();
    if (isPlatformBrowser(this.platformId)) {
      ScrollTrigger.getAll().forEach(t => t.kill());
    }
  }

  getSalePct(price: number, sale: number): number {
    return Math.round((1 - sale / price) * 100);
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
}
