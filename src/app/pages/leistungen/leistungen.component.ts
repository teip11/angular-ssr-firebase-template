import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-leistungen',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './leistungen.component.html',
  styleUrls: ['./leistungen.component.css']
})
export class LeistungenComponent implements AfterViewInit, OnDestroy {
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
    observe('.lst-hero-title');
    observe('.lst-hero-sub');

    // ── Overview cards: staggered ─────────────────────────────────────────────
    const overviewCards = Array.from(document.querySelectorAll('.lst-overview-card')) as HTMLElement[];
    if (overviewCards.length) {
      const cardObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = parseInt((e.target as HTMLElement).dataset['index'] || '0', 10);
            setTimeout(() => (e.target as HTMLElement).classList.add('is-visible'), idx * 120);
            cardObs.unobserve(e.target);
          }
        });
      }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
      this.observers.push(cardObs);
      overviewCards.forEach((el, i) => {
        el.dataset['index'] = String(i);
        cardObs.observe(el);
      });
    }

    // ── Detail sections: text + visual ───────────────────────────────────────
    observe('.lst-detail-text',   { rootMargin: '0px 0px -40px 0px' });
    observe('.lst-detail-visual', { rootMargin: '0px 0px -40px 0px' });

    // ── Check list items: staggered per section ───────────────────────────────
    // Group items by their parent <ul> so each section's items stagger from 0
    const checkLists = Array.from(document.querySelectorAll('.lst-detail-text ul')) as HTMLElement[];
    checkLists.forEach(ul => {
      const items = Array.from(ul.querySelectorAll('.lst-check-item')) as HTMLElement[];
      if (!items.length) return;
      const checkObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = parseInt((e.target as HTMLElement).dataset['index'] || '0', 10);
            setTimeout(() => (e.target as HTMLElement).classList.add('is-visible'), 150 + idx * 100);
            checkObs.unobserve(e.target);
          }
        });
      }, { threshold: 0, rootMargin: '0px 0px -20px 0px' });
      this.observers.push(checkObs);
      items.forEach((el, i) => {
        el.dataset['index'] = String(i);
        checkObs.observe(el);
      });
    });

    // ── Process header ────────────────────────────────────────────────────────
    observe('.lst-process-header', { rootMargin: '0px 0px -40px 0px' });

    // ── Process steps: staggered ──────────────────────────────────────────────
    const processSteps = Array.from(document.querySelectorAll('.lst-process-step')) as HTMLElement[];
    if (processSteps.length) {
      const stepObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = parseInt((e.target as HTMLElement).dataset['index'] || '0', 10);
            setTimeout(() => (e.target as HTMLElement).classList.add('is-visible'), idx * 120);
            stepObs.unobserve(e.target);
          }
        });
      }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
      this.observers.push(stepObs);
      processSteps.forEach((el, i) => {
        el.dataset['index'] = String(i);
        stepObs.observe(el);
      });
    }

    // ── CTA panel ─────────────────────────────────────────────────────────────
    observe('.lst-cta-panel', { rootMargin: '0px 0px -40px 0px' });
  }
}
