import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements AfterViewInit, OnDestroy {
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
    observe('.abt-hero-title');
    observe('.abt-hero-sub');

    // ── Philosophy section header ─────────────────────────────────────────────
    observe('.abt-section-header', { rootMargin: '0px 0px -40px 0px' });

    // ── Philosophy cards: staggered ───────────────────────────────────────────
    const philCards = Array.from(document.querySelectorAll('.abt-philosophy-card')) as HTMLElement[];
    if (philCards.length) {
      const philObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = parseInt((e.target as HTMLElement).dataset['idx'] || '0', 10);
            setTimeout(() => (e.target as HTMLElement).classList.add('is-visible'), idx * 130);
            philObs.unobserve(e.target);
          }
        });
      }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
      this.observers.push(philObs);
      philCards.forEach((el, i) => {
        el.dataset['idx'] = String(i);
        philObs.observe(el);
      });
    }

    // ── Approach header: slide from left ──────────────────────────────────────
    observe('.abt-approach-header', { rootMargin: '0px 0px -40px 0px' });

    // ── Process steps: staggered ──────────────────────────────────────────────
    const steps = Array.from(document.querySelectorAll('.abt-process-step')) as HTMLElement[];
    if (steps.length) {
      const stepObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = parseInt((e.target as HTMLElement).dataset['idx'] || '0', 10);
            setTimeout(() => (e.target as HTMLElement).classList.add('is-visible'), idx * 120);
            stepObs.unobserve(e.target);
          }
        });
      }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
      this.observers.push(stepObs);
      steps.forEach((el, i) => {
        el.dataset['idx'] = String(i);
        stepObs.observe(el);
      });
    }

    // ── Bio panel ─────────────────────────────────────────────────────────────
    observe('.abt-bio-panel', { rootMargin: '0px 0px -40px 0px' });

    // ── CTA panel ─────────────────────────────────────────────────────────────
    observe('.abt-cta-panel', { rootMargin: '0px 0px -40px 0px' });
  }
}
