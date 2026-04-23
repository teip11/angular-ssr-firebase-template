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

  // Process section state
  activeCard = 1;
  exitCard = 0;
  enterCard = 0;

  @ViewChild('processScroll', { read: ElementRef }) processScroll!: ElementRef<HTMLElement>;
  @ViewChild('progressFill', { read: ElementRef }) progressFill!: ElementRef<HTMLElement>;
  @ViewChildren('valueCard', { read: ElementRef }) valueCardEls!: QueryList<ElementRef<HTMLElement>>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {}

  // Track last known mouse position (viewport-relative clientX/Y)
  private _lastMouseClientX = -9999;
  private _lastMouseClientY = -9999;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (window.scrollY > 10 && !this.hasScrolled) {
      this.hasScrolled = true;
    }
    this.updateProcessSection();
    this.updateShowcaseParallax();
    // Recalculate glow using last viewport-relative mouse position.
    // getBoundingClientRect() is also viewport-relative so no scroll offset needed.
    this._updateValueCardGlow(this._lastMouseClientX, this._lastMouseClientY);
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        // ── Helper: single-element observer ──────────────────────────────────
        const observe = (el: Element | null, options: IntersectionObserverInit = {}) => {
          if (!el) return;
          const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
              if (e.isIntersecting) {
                e.target.classList.add('is-visible');
                obs.unobserve(e.target);
              }
            });
          }, { threshold: 0, ...options });
          obs.observe(el);
        };

        // ── Value statement: each element individually ────────────────────────
        document.querySelectorAll('.value-line1, .value-highlight, .value-supporting, .value-scroll-cue').forEach(el => {
          observe(el, { threshold: 0, rootMargin: '0px 0px -60px 0px' });
        });

        // ── Hover hint ────────────────────────────────────────────────────────
        observe(document.querySelector('.hover-hint-animate'), { threshold: 0, rootMargin: '0px 0px -60px 0px' });

        // ── Value cards: staggered ────────────────────────────────────────────
        const valueCards = Array.from(document.querySelectorAll('.value-card')) as HTMLElement[];
        if (valueCards.length) {
          const vcObs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
              if (e.isIntersecting) {
                const idx = parseInt((e.target as HTMLElement).dataset['vcIdx'] || '0', 10);
                setTimeout(() => (e.target as HTMLElement).classList.add('is-visible'), idx * 130);
                vcObs.unobserve(e.target);
              }
            });
          }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
          valueCards.forEach((el, i) => {
            el.dataset['vcIdx'] = String(i);
            vcObs.observe(el);
          });
        }

        // ── Process section ───────────────────────────────────────────────────
        observe(document.querySelector('.process-intro'), { threshold: 0, rootMargin: '0px 0px -60px 0px' });
        observe(document.querySelector('.process-right-animate'), { threshold: 0, rootMargin: '0px 0px -60px 0px' });

        // ── Showcase: header label + headline + CTA ───────────────────────────
        const showcaseSection = document.querySelector('.showcase-section');
        if (showcaseSection) {
          const showcaseSectionObs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
              if (e.isIntersecting) {
                showcaseSectionObs.disconnect();
                const header = document.querySelector('.showcase-header');
                const headline = document.querySelector('.showcase-headline');
                const cta = document.querySelector('.showcase-cta');
                if (header) header.classList.add('is-visible');
                if (headline) setTimeout(() => headline.classList.add('is-visible'), 100);
                if (cta) setTimeout(() => cta.classList.add('is-visible'), 200);
              }
            });
          }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
          showcaseSectionObs.observe(showcaseSection);
        }

        // ── Showcase cards: staggered ─────────────────────────────────────────
        const showcaseCards = Array.from(document.querySelectorAll('.showcase-card-animate'));
        if (showcaseCards.length) {
          const grid = showcaseCards[0]?.closest('.grid');
          if (grid) {
            const showcaseObs = new IntersectionObserver((entries) => {
              entries.forEach(e => {
                if (e.isIntersecting) {
                  showcaseObs.disconnect();
                  showcaseCards.forEach((card, i) => {
                    setTimeout(() => card.classList.add('is-visible'), i * 200);
                  });
                }
              });
            }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
            showcaseObs.observe(grid);
          }
        }

        // ── Testimonials: header + headline + cards staggered ─────────────────
        const testimonialsSection = document.querySelector('.testimonials-section');
        if (testimonialsSection) {
          const testimonialsObs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
              if (e.isIntersecting) {
                testimonialsObs.disconnect();
                const header = document.querySelector('.testimonials-header');
                const headline = document.querySelector('.testimonials-headline');
                const cards = Array.from(document.querySelectorAll('.testimonial-card'));
                if (header) header.classList.add('is-visible');
                if (headline) setTimeout(() => headline.classList.add('is-visible'), 80);
                cards.forEach((card, i) => {
                  setTimeout(() => card.classList.add('is-visible'), 120 + i * 130);
                });
              }
            });
          }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
          testimonialsObs.observe(testimonialsSection);
        }

        // ── Offer section: headline + buttons ────────────────────────────────
        const offerSection = document.querySelector('.offer-section');
        if (offerSection) {
          const offerObs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
              if (e.isIntersecting) {
                offerObs.disconnect();
                const headline = document.querySelector('.offer-headline');
                const buttons = document.querySelector('.offer-buttons');
                if (headline) headline.classList.add('is-visible');
                if (buttons) setTimeout(() => buttons.classList.add('is-visible'), 200);
              }
            });
          }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
          offerObs.observe(offerSection);
        }

        this.updateProcessSection();
      }, 150);
    }
  }

  private _lastCard = 1;
  private _transitioning = false;

  private updateProcessSection(): void {
    if (!isPlatformBrowser(this.platformId) || !this.processScroll) return;

    const el = this.processScroll.nativeElement;
    const rect = el.getBoundingClientRect();
    const totalHeight = el.offsetHeight - window.innerHeight;

    const scrolled = Math.max(0, Math.min(1, -rect.top / totalHeight));

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
    if (!this._progressFillEl) {
      this._progressFillEl =
        (this.progressFill?.nativeElement as HTMLElement | null) ??
        document.querySelector<HTMLElement>('.process-progress-fill');
    }
    if (!this._progressFillEl) return;
    const pct = Math.min(100, Math.max(0, scrolled * 100));
    this._progressFillEl.style.height = `${pct}%`;
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
    if (rect.bottom < 0 || rect.top > viewH) return;
    const progress = (viewH - rect.top) / (viewH + rect.height);
    const offset = (progress - 0.5) * 60;
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

  onSectionMouseMove(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Store viewport-relative mouse position (clientX/Y)
    this._lastMouseClientX = event.clientX;
    this._lastMouseClientY = event.clientY;
    this._updateValueCardGlow(this._lastMouseClientX, this._lastMouseClientY);
  }

  private _updateValueCardGlow(mouseX: number, mouseY: number): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.valueCardEls) return;
    if (mouseX === -9999) return; // no mouse position yet

    this.valueCardEls.forEach(cardRef => {
      const card = cardRef.nativeElement;
      const glow = card.querySelector('.value-card-glow') as HTMLElement | null;
      if (!glow) return;

      // getBoundingClientRect is viewport-relative — same coordinate space as clientX/Y
      const rect = card.getBoundingClientRect();

      const clampedX = Math.max(rect.left, Math.min(mouseX, rect.right));
      const clampedY = Math.max(rect.top,  Math.min(mouseY, rect.bottom));
      const distToBorder = Math.sqrt(
        Math.pow(mouseX - clampedX, 2) +
        Math.pow(mouseY - clampedY, 2)
      );

      const triggerDist = 220;
      const fadeDist = 40;
      let proximity: number;
      if (distToBorder <= triggerDist - fadeDist) {
        proximity = 1;
      } else {
        proximity = Math.max(0, 1 - (distToBorder - (triggerDist - fadeDist)) / fadeDist);
      }

      const relX = ((clampedX - rect.left) / rect.width)  * 100;
      const relY = ((clampedY - rect.top)  / rect.height) * 100;

      glow.style.setProperty('--glow-x', `${relX}%`);
      glow.style.setProperty('--glow-y', `${relY}%`);
      glow.style.opacity = `${proximity}`;
    });
  }
}
