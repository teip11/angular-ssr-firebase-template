import {
  Component, AfterViewInit, OnInit, OnDestroy,
  Inject, PLATFORM_ID,
  ViewChild, ViewChildren, ElementRef, QueryList,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-leistungen',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './leistungen.component.html',
  styleUrls: ['./leistungen.component.css'],
})
export class LeistungenComponent implements OnInit, AfterViewInit, OnDestroy {
  // ── Per-element template refs ──────────────────────────────────────────
  @ViewChild('lstHeroTitle',     { read: ElementRef }) lstHeroTitle?:     ElementRef<HTMLElement>;
  @ViewChild('lstHeroSub',       { read: ElementRef }) lstHeroSub?:       ElementRef<HTMLElement>;
  @ViewChild('lstHeroNav',       { read: ElementRef }) lstHeroNav?:       ElementRef<HTMLElement>;
  @ViewChildren('lstPillarText',   { read: ElementRef }) lstPillarTexts?:   QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('lstPillarVisual', { read: ElementRef }) lstPillarVisuals?: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('lstProcessHeader', { read: ElementRef }) lstProcessHeader?: ElementRef<HTMLElement>;
  @ViewChildren('lstProcessStep',  { read: ElementRef }) lstProcessSteps?:  QueryList<ElementRef<HTMLElement>>;
  @ViewChild('lstFinalCard',     { read: ElementRef }) lstFinalCard?:     ElementRef<HTMLElement>;

  private observers: IntersectionObserver[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.seo.setPageSEO('leistungen');
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => this.setupReveal(), 50);
  }

  ngOnDestroy(): void {
    this.observers.forEach(o => o.disconnect());
    this.observers = [];
  }

  // ── Per-element observers ──────────────────────────────────────────────
  // Each animatable element gets its own observer so the choreography
  // sequences with the reader's scroll position, not in a burst when the
  // section enters view. Thresholds follow DESIGN_SYSTEM §9.3.
  private setupReveal(): void {
    const observe = (el: Element | undefined | null, threshold: number, rootMargin = '0px') => {
      if (!el) return;
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('has-entered');
            io.unobserve(e.target);
          }
        });
      }, { threshold, rootMargin });
      io.observe(el);
      this.observers.push(io);
    };

    // Hero — title + sub are in viewport on load; observer still used to
    // trigger the staged animation rather than firing on raw page load.
    observe(this.lstHeroTitle?.nativeElement, 0.1);
    observe(this.lstHeroSub?.nativeElement,   0.1);
    observe(this.lstHeroNav?.nativeElement,   0.1);

    // Pillars — text + visual per pillar, each observed independently.
    this.lstPillarTexts?.forEach(ref   => observe(ref.nativeElement, 0.35));
    this.lstPillarVisuals?.forEach(ref => observe(ref.nativeElement, 0.35));

    // Process — header observed at higher threshold (catch the eye), steps
    // at lower (let stagger feel tight as the row enters).
    observe(this.lstProcessHeader?.nativeElement, 0.55);
    this.lstProcessSteps?.forEach(ref => observe(ref.nativeElement, 0.4));

    // Final card — single unit at lower threshold since it's the page closer.
    observe(this.lstFinalCard?.nativeElement, 0.3);
  }
}
