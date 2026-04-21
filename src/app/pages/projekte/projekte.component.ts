import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-projekte',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './projekte.component.html',
  styleUrls: ['./projekte.component.css']
})
export class ProjekteComponent implements AfterViewInit, OnDestroy {
  private observers: IntersectionObserver[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnDestroy() {
    this.observers.forEach(o => o.disconnect());
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Wrap in setTimeout to ensure the DOM is fully rendered and
    // the browser has laid out the page before we start observing.
    setTimeout(() => this.initAnimations(), 150);
  }

  private initAnimations() {
    // Helper: create an observer, track it, and observe matching elements
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

    // ── Hero: already in viewport, trigger right away ─────────────────────────
    observe('.proj-hero-title');
    observe('.proj-hero-sub');

    // ── Project grid cards — staggered by index ───────────────────────────────
    const gridItems = Array.from(document.querySelectorAll('.proj-grid-item')) as HTMLElement[];
    if (gridItems.length) {
      const gridObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = parseInt((e.target as HTMLElement).dataset['index'] || '0', 10);
            setTimeout(() => (e.target as HTMLElement).classList.add('is-visible'), idx * 130);
            gridObs.unobserve(e.target);
          }
        });
      }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
      this.observers.push(gridObs);
      gridItems.forEach((el, i) => {
        el.dataset['index'] = String(i);
        gridObs.observe(el);
      });
    }

    // ── Case study sections ───────────────────────────────────────────────────
    observe('.proj-case-visual',  { rootMargin: '0px 0px -40px 0px' });
    observe('.proj-case-details', { rootMargin: '0px 0px -40px 0px' });

    // ── Stat / list items — staggered ────────────────────────────────────────
    const statItems = Array.from(document.querySelectorAll('.proj-stat-item')) as HTMLElement[];
    if (statItems.length) {
      const statObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = parseInt((e.target as HTMLElement).dataset['index'] || '0', 10);
            setTimeout(() => (e.target as HTMLElement).classList.add('is-visible'), 150 + idx * 110);
            statObs.unobserve(e.target);
          }
        });
      }, { threshold: 0, rootMargin: '0px 0px -20px 0px' });
      this.observers.push(statObs);
      statItems.forEach((el, i) => {
        el.dataset['index'] = String(i);
        statObs.observe(el);
      });
    }

    // ── CTA panel ─────────────────────────────────────────────────────────────
    observe('.proj-cta-panel', { rootMargin: '0px 0px -40px 0px' });
  }
}
