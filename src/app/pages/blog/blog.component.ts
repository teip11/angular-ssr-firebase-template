import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-blog',
  standalone: true,
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements AfterViewInit, OnDestroy {
  private observers: IntersectionObserver[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnDestroy() {
    this.observers.forEach(o => o.disconnect());
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => this.initAnimations(), 150);
  }

  private initAnimations() {
    const observe = (selector: string, options: IntersectionObserverInit = {}) => {
      const els = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
      if (!els.length) return;
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('is-visible');
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0, ...options });
      this.observers.push(obs);
      els.forEach(el => obs.observe(el));
    };

    // ── Hero: already in viewport on load ────────────────────────────────────
    observe('.blg-hero-title');
    observe('.blg-hero-sub');
    observe('.blg-filters');

    // ── Featured article ──────────────────────────────────────────────────────
    observe('.blg-featured', { rootMargin: '0px 0px -40px 0px' });

    // ── Article grid: staggered ───────────────────────────────────────────────
    const articles = Array.from(document.querySelectorAll('.blg-article')) as HTMLElement[];
    if (articles.length) {
      const artObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = parseInt((e.target as HTMLElement).dataset['idx'] || '0', 10);
            setTimeout(() => (e.target as HTMLElement).classList.add('is-visible'), idx * 120);
            artObs.unobserve(e.target);
          }
        });
      }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
      this.observers.push(artObs);
      articles.forEach((el, i) => {
        el.dataset['idx'] = String(i);
        artObs.observe(el);
      });
    }

    // ── CTA / Newsletter panel ────────────────────────────────────────────────
    observe('.blg-cta-panel', { rootMargin: '0px 0px -40px 0px' });
  }
}
