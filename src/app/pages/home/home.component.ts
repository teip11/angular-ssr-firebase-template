import { Component, HostListener, AfterViewInit, ElementRef, ViewChild, ViewChildren, QueryList, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {
  hasScrolled = false;

  // Process section state (legacy, kept for safety)
  activeCard = 1;
  exitCard = 0;
  enterCard = 0;

  // Concept D: floating cards that land one by one
  landedCards = 0;
  private _allLanded = false;

  @ViewChild('processScroll', { read: ElementRef }) processScroll!: ElementRef<HTMLElement>;
  @ViewChild('progressFill', { read: ElementRef }) progressFill!: ElementRef<HTMLElement>;
  @ViewChildren('valueCard', { read: ElementRef }) valueCardEls!: QueryList<ElementRef<HTMLElement>>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (window.scrollY > 10 && !this.hasScrolled) {
      this.hasScrolled = true;
    }
    this.updateProcessSection();
    this.updateShowcaseParallax();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const obs = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.classList.add('is-visible');
              obs.unobserve(e.target);
            }
          });
        }, { threshold: 0.2 });

        // Value statement section — staggered reveal
        const valueEls = document.querySelectorAll('.value-line1, .value-highlight, .value-line2, .value-supporting, .value-scroll-cue');
        const valueCards = Array.from(document.querySelectorAll('.value-card'));
        const valueObs = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              valueObs.disconnect();
              valueEls.forEach(el => el.classList.add('is-visible'));
              // Stagger cards left → right after headline
              valueCards.forEach((card, i) => {
                setTimeout(() => card.classList.add('is-visible'), 300 + i * 120);
              });
            }
          });
        }, { threshold: 0.15 });
        const valueSection = document.querySelector('.value-statement-section');
        if (valueSection) valueObs.observe(valueSection);

        // Left column intro
        const introEl = document.querySelector('.process-intro');
        if (introEl) obs.observe(introEl);

        // Right column slide-in from right
        const rightEl = document.querySelector('.process-right-animate');
        if (rightEl) obs.observe(rightEl);

        // Showcase cards — fire one by one with JS timeout stagger
        const cards = Array.from(document.querySelectorAll('.showcase-card-animate'));
        const showcaseObs = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              showcaseObs.disconnect();
              cards.forEach((card, i) => {
                setTimeout(() => card.classList.add('is-visible'), i * 250);
              });
            }
          });
        }, { threshold: 0.2 });
        // Observe the grid container (parent of cards)
        const grid = cards[0]?.closest('.grid');
        if (grid) showcaseObs.observe(grid);

        // Services section: header + cards staggered
        const servicesHeader = document.querySelector('.services-header');
        const servicesCards = Array.from(document.querySelectorAll('.services-card'));
        const servicesObs = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              servicesObs.disconnect();
              if (servicesHeader) {
                servicesHeader.classList.add('is-visible');
              }
              servicesCards.forEach((card, i) => {
                setTimeout(() => card.classList.add('is-visible'), 100 + i * 100);
              });
            }
          });
        }, { threshold: 0.15 });
        const servicesSection = document.querySelector('.services-section');
        if (servicesSection) servicesObs.observe(servicesSection);

        // Testimonials section: header + cards staggered
        const testimonialsHeader = document.querySelector('.testimonials-header');
        const testimonialCards = Array.from(document.querySelectorAll('.testimonial-card'));
        const testimonialsObs = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              testimonialsObs.disconnect();
              if (testimonialsHeader) {
                testimonialsHeader.classList.add('is-visible');
              }
              testimonialCards.forEach((card, i) => {
                setTimeout(() => card.classList.add('is-visible'), 100 + i * 120);
              });
            }
          });
        }, { threshold: 0.15 });
        const testimonialsSection = document.querySelector('.testimonials-section');
        if (testimonialsSection) testimonialsObs.observe(testimonialsSection);

        this.updateProcessSection();
      }, 100);
    }
  }

  private _lastCard = 1;
  private _transitioning = false;

  private updateProcessSection(): void {
    if (!isPlatformBrowser(this.platformId) || !this.processScroll) return;

    const el = this.processScroll.nativeElement;
    const rect = el.getBoundingClientRect();
    // scrollable distance = total section height minus one viewport height
    const totalHeight = el.offsetHeight - window.innerHeight;

    // scrolled: 0 at section entry, 1 at section exit
    const scrolled = Math.max(0, Math.min(1, -rect.top / totalHeight));

    // 4 cards spread across the full scroll range (0→1).
    // Each card occupies 25%. Bar fills to 100% when card 4 becomes active.
    const barProgress = Math.min(1, scrolled / 0.75);
    this.updateProgressBar(barProgress);

    let target: number;
    if (scrolled < 0.25) target = 1;
    else if (scrolled < 0.50) target = 2;
    else if (scrolled < 0.75) target = 3;
    else target = 4;

    if (target !== this._lastCard && !this._transitioning) {
      this._transitioning = true;
      const prev = this._lastCard;
      this._lastCard = target;

      this.ngZone.run(() => {
        this.exitCard = prev;
        this.enterCard = target;
        this.activeCard = target;

        setTimeout(() => {
          this.exitCard = 0;
          this.enterCard = 0;
          this._transitioning = false;
        }, 500);
      });
    }
  }

  private _progressFillEl: HTMLElement | null = null;

  private updateProgressBar(scrolled: number): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Cache the element reference after first lookup
    if (!this._progressFillEl) {
      this._progressFillEl =
        (this.progressFill?.nativeElement as HTMLElement | null) ??
        document.querySelector<HTMLElement>('.process-progress-fill');
    }
    if (!this._progressFillEl) return;
    // Map scroll progress (0→1) to fill height (0%→100%)
    const pct = Math.min(100, Math.max(0, scrolled * 100));
    this._progressFillEl.style.height = `${pct}%`;
    // On card 4 (scrolled >= 0.75 → barProgress = 1), switch to full-blue gradient
    if (scrolled >= 1) {
      this._progressFillEl.classList.add('fill-complete');
    } else {
      this._progressFillEl.classList.remove('fill-complete');
    }
  }

  private updateShowcaseParallax(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = document.querySelector('.showcase-bg-parallax') as HTMLElement;
    if (!el) return;
    const section = el.closest('section') as HTMLElement;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const viewH = window.innerHeight;
    // Only apply when section is in view
    if (rect.bottom < 0 || rect.top > viewH) return;
    const progress = (viewH - rect.top) / (viewH + rect.height);
    const offset = (progress - 0.5) * 60; // ±30px range
    el.style.transform = `translateY(${offset}px)`;
  }

  // Line 1: animate word by word
  readonly line1Words = 'Ihre Website sollte Ihnen'.split(' ');

  // Line 2: animate letter by letter
  readonly line2Letters = 'Kunden bringen'.split('');

  // Timing constants
  readonly wordDelay   = 60;
  readonly line1Base   = 100;
  readonly line2Base   = 500;
  readonly letterDelay = 25;

  wordAnimDelay(i: number): string {
    return `${this.line1Base + i * this.wordDelay}ms`;
  }

  letterAnimDelay(i: number): string {
    return `${this.line2Base + i * this.letterDelay}ms`;
  }

  letterGradientPos(i: number): string {
    const percent = i * (100 / (this.line2Letters.length - 1));
    return `${percent}% 0`;
  }

  // ─── Proximity-based border glow for value cards ──────────────────────
  // This listens on the entire value section so glow reacts to proximity,
  // not just direct hover.

  onSectionMouseMove(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.valueCardEls) return;

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    this.valueCardEls.forEach(cardRef => {
      const card = cardRef.nativeElement;
      const glow = card.querySelector('.value-card-glow') as HTMLElement | null;
      if (!glow) return;

      const rect = card.getBoundingClientRect();

      // ── Proximity to the nearest border edge ──────────────────────────
      // Clamp cursor to card bounds, then measure distance to that clamped point.
      // This means the glow reacts to how close the cursor is to the border,
      // not the card center — so it lights up the nearest edge.
      const clampedX = Math.max(rect.left, Math.min(mouseX, rect.right));
      const clampedY = Math.max(rect.top, Math.min(mouseY, rect.bottom));
      const distToBorder = Math.sqrt(
        Math.pow(mouseX - clampedX, 2) +
        Math.pow(mouseY - clampedY, 2)
      );

      // Binary-ish: full glow within 220px of the border, fades only in the last 40px
      const triggerDist = 220;
      const fadeDist = 40;
      let proximity: number;
      if (distToBorder <= triggerDist - fadeDist) {
        proximity = 1; // full strength
      } else {
        proximity = Math.max(0, 1 - (distToBorder - (triggerDist - fadeDist)) / fadeDist);
      }

      // Position the gradient at the cursor position relative to the card.
      // When cursor is outside, clamp to card edge so glow hugs the nearest border.
      const relX = ((clampedX - rect.left) / rect.width) * 100;
      const relY = ((clampedY - rect.top) / rect.height) * 100;

      glow.style.setProperty('--glow-x', `${relX}%`);
      glow.style.setProperty('--glow-y', `${relY}%`);
      glow.style.opacity = `${proximity}`;
    });
  }
}
