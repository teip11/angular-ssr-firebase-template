import {
  Component, AfterViewInit, OnInit, OnDestroy,
  Inject, PLATFORM_ID,
  ViewChild, ViewChildren, ElementRef, QueryList,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

interface ProjectCard {
  category: string;
  name: string;
  desc: string;
  // Real project — opens the showcase sub-page
  url?: string;
  image?: string;
  domain?: string;
  // Placeholder marker. True when this is an "in arbeit" slot.
  placeholder?: boolean;
}

@Component({
  selector: 'app-projekte',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './projekte.component.html',
  styleUrls: ['./projekte.component.css'],
})
export class ProjekteComponent implements OnInit, AfterViewInit, OnDestroy {
  // ── Marquee data ───────────────────────────────────────────────────────
  // Single row of 12 cards. Real cards (Trattoria, Schreinerei, Praxis)
  // are placed at positions 1, 5, 9 so they're evenly spread across the
  // loop — a passive viewer sees a real example every ~third of a cycle.
  projects: ProjectCard[] = [
    {
      category: 'Restaurant & Gastronomie',
      name: 'Trattoria Marconi',
      desc: 'Atmosphärisch, reservierungs‑fokussiert — für Restaurants und Bistros, die wiederkehrende Stammgäste statt Laufkundschaft suchen.',
      url: '/showcase/trattoria-marconi/',
      image: '/showcase/trattoria-marconi.png',
      domain: 'trattoria-marconi.de',
    },
    {
      category: 'Beratung & Coaching',
      name: 'Weiteres Projekt',
      desc: 'Aktuell in der Konzeptphase. Ein neues Beispiel aus dem Beratungs‑Umfeld folgt in Kürze.',
      placeholder: true,
    },
    {
      category: 'Handel & Manufaktur',
      name: 'Weiteres Projekt',
      desc: 'Eine produkt‑fokussierte Website mit dem Anspruch, im Hintergrund ohne CMS‑Aufwand für sich zu arbeiten. Folgt in Kürze.',
      placeholder: true,
    },
    {
      category: 'Hotellerie & Beherbergung',
      name: 'Weiteres Projekt',
      desc: 'Buchungs‑fokussiert, atmosphärisch — ein neues Beispiel aus dem Beherbergungs‑Umfeld folgt in Kürze.',
      placeholder: true,
    },
    {
      category: 'Handwerk & Innenausbau',
      name: 'Schreinerei Hollmann',
      desc: 'Werkschau‑fokussiert, vertrauensbildend — für Schreinereien und Innenausbauer, die hochwertige Projektanfragen statt Preisvergleicher gewinnen wollen.',
      url: '/showcase/schreinerei-hollmann/',
      image: '/showcase/schreinerei-hollmann.png',
      domain: 'schreinerei-hollmann.de',
    },
    {
      category: 'Bildung & Akademie',
      name: 'Weiteres Projekt',
      desc: 'Eine kursorientierte Plattform mit Klarheit über Inhalte, Termine und Wege zur Anmeldung. Folgt in Kürze.',
      placeholder: true,
    },
    {
      category: 'Sport & Fitness',
      name: 'Weiteres Projekt',
      desc: 'Mitglieder‑fokussiert mit klaren Wegen zur Probestunde — ein neues Beispiel aus dem Sport‑Bereich folgt in Kürze.',
      placeholder: true,
    },
    {
      category: 'Kunst & Kultur',
      name: 'Weiteres Projekt',
      desc: 'Werk‑fokussiert, atmosphärisch — eine Plattform für Galerien und Kulturschaffende, die ihr Werk zur Geltung bringt.',
      placeholder: true,
    },
    {
      category: 'Gesundheit & Therapie',
      name: 'Praxis Lindner',
      desc: 'Team‑fokussiert, vertrauensbildend — für Physio‑ und Osteopathie‑Praxen, die Wunschtermine im Voraus statt nur kurzfristige Akut‑Anrufe gewinnen wollen.',
      url: '/showcase/praxis-lindner/',
      image: '/showcase/praxis-lindner.png',
      domain: 'praxis-lindner.de',
    },
    {
      category: 'Finanzen & Versicherung',
      name: 'Weiteres Projekt',
      desc: 'Vertrauens‑fokussiert mit klaren Wegen zur Erstberatung — ein neues Beispiel aus dem Finanz‑Umfeld folgt in Kürze.',
      placeholder: true,
    },
    {
      category: 'Tourismus & Reise',
      name: 'Weiteres Projekt',
      desc: 'Reise‑fokussiert mit kuratierten Erlebnissen — ein neues Beispiel aus dem Tourismus‑Bereich folgt in Kürze.',
      placeholder: true,
    },
    {
      category: 'Mode & Lifestyle',
      name: 'Weiteres Projekt',
      desc: 'Marken‑fokussiert mit Atmosphäre und Klarheit — ein neues Beispiel aus dem Lifestyle‑Bereich folgt in Kürze.',
      placeholder: true,
    },
  ];

  // Doubled list used by the template — required for the seamless marquee
  // loop. The track translates by -50% over one cycle; duplicating the
  // card set means the second half looks identical to the first, so the
  // reset is invisible.
  get projectsLoop(): ProjectCard[] { return [...this.projects, ...this.projects]; }

  // ── Per-element template refs (motion) ────────────────────────────────
  @ViewChild('prjHeroTitle',     { read: ElementRef }) prjHeroTitle?:     ElementRef<HTMLElement>;
  @ViewChild('prjHeroSub',       { read: ElementRef }) prjHeroSub?:       ElementRef<HTMLElement>;
  @ViewChild('prjGridHead',      { read: ElementRef }) prjGridHead?:      ElementRef<HTMLElement>;
  @ViewChildren('prjMarquee',    { read: ElementRef }) prjMarquees?:      QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('prjCaseText',   { read: ElementRef }) prjCaseTexts?:     QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('prjCaseVisual', { read: ElementRef }) prjCaseVisuals?:   QueryList<ElementRef<HTMLElement>>;
  @ViewChild('prjFinalCard',     { read: ElementRef }) prjFinalCard?:     ElementRef<HTMLElement>;

  private observers: IntersectionObserver[] = [];

  // ── Marquee auto-scroll state ──────────────────────────────────────────
  private readonly AUTO_SCROLL_PX_PER_SEC = 35;
  private readonly IDLE_RESUME_DELAY_MS = 1500;
  private autoScrollHandle = 0;
  private userInteractTimeout: ReturnType<typeof setTimeout> | null = null;
  private isUserInteracting = false;
  private lastFrameTime = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.seo.setPageSEO('projekte');
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => {
      this.setupReveal();
      this.startMarqueeAutoScroll();
    }, 50);
  }

  ngOnDestroy(): void {
    this.observers.forEach(o => o.disconnect());
    this.observers = [];
    if (this.autoScrollHandle) cancelAnimationFrame(this.autoScrollHandle);
    if (this.userInteractTimeout) clearTimeout(this.userInteractTimeout);
  }

  // ── Per-element observers ──────────────────────────────────────────────
  // Marquee containers are observed as a unit (not per-card) because cards
  // pass in and out of view constantly — observing individual cards would
  // mean only the cards visible on first enter ever animate in.
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

    observe(this.prjHeroTitle?.nativeElement, 0.1);
    observe(this.prjHeroSub?.nativeElement,   0.1);
    observe(this.prjGridHead?.nativeElement, 0.55);
    this.prjMarquees?.forEach(ref     => observe(ref.nativeElement, 0.15));
    this.prjCaseTexts?.forEach(ref    => observe(ref.nativeElement, 0.35));
    this.prjCaseVisuals?.forEach(ref  => observe(ref.nativeElement, 0.35));
    observe(this.prjFinalCard?.nativeElement, 0.3);
  }

  // ── Marquee auto-scroll ────────────────────────────────────────────────
  // Native horizontal scroll on .prj-marquee gives the user wheel/swipe
  // control. On top of that, a requestAnimationFrame loop increments
  // scrollLeft so the row drifts on its own when idle. Any user input
  // (wheel, touch, pointer) pauses the auto-scroll for IDLE_RESUME_DELAY_MS;
  // keyboard focus inside the row also pauses (a11y).
  //
  // Seamless loop: the track contains two copies of the card list. When
  // scrollLeft would cross 0 (leftward edge) we add halfWidth to it;
  // when it would cross 2 × halfWidth (rightward edge) we subtract.
  // The duplicate set looks identical so the jump is invisible.
  private startMarqueeAutoScroll(): void {
    const marqueeRef = this.prjMarquees?.first;
    const el = marqueeRef?.nativeElement;
    if (!el) return;

    // Respect prefers-reduced-motion. User can still scroll manually
    // via the native overflow; we just don't auto-advance.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Seed scrollLeft to the middle of the duplicated track so the user
    // has room to scroll either direction before hitting a wrap point.
    // Layout may not be ready immediately — retry until scrollWidth is
    // populated.
    const seedInitial = () => {
      const half = el.scrollWidth / 2;
      if (half > 0) {
        el.scrollLeft = half;
      } else {
        requestAnimationFrame(seedInitial);
      }
    };
    seedInitial();

    // Pause auto-scroll when the user is actively interacting. We reset
    // the timer on every input event so a continuous gesture (e.g. a long
    // swipe) keeps the pause alive.
    //
    // Only horizontal gestures count. Vertical wheel/touch is the user
    // scrolling the page — the marquee receives those events too (events
    // fire on the element under the pointer), and we'd otherwise pause
    // the auto-scroll every time someone scrolls past the section.
    const markInteract = () => {
      this.isUserInteracting = true;
      if (this.userInteractTimeout) clearTimeout(this.userInteractTimeout);
      this.userInteractTimeout = setTimeout(() => {
        this.isUserInteracting = false;
      }, this.IDLE_RESUME_DELAY_MS);
    };

    el.addEventListener('wheel', (e: WheelEvent) => {
      // shiftKey covers Firefox's shift+wheel → horizontal scroll convention
      // (Chrome rewrites deltaX/deltaY directly, so the magnitude check
      // catches that case).
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
        markInteract();
      }
    }, { passive: true });

    // Touch: pause only when the gesture is horizontal-dominant. Track
    // the starting touch point in touchstart, then check the deltas in
    // touchmove.
    let touchStartX = 0;
    let touchStartY = 0;
    el.addEventListener('touchstart', (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    el.addEventListener('touchmove', (e: TouchEvent) => {
      const dx = Math.abs(e.touches[0].clientX - touchStartX);
      const dy = Math.abs(e.touches[0].clientY - touchStartY);
      if (dx > dy) markInteract();
    }, { passive: true });

    this.lastFrameTime = performance.now();
    const tick = (now: number) => {
      const dt = now - this.lastFrameTime;
      this.lastFrameTime = now;

      // Skip the increment when the user is dragging, or when a card has
      // keyboard focus (so a tabbed-into card doesn't slide away).
      const keyboardFocused = !!el.querySelector(':focus-visible');
      if (!this.isUserInteracting && !keyboardFocused) {
        const half = el.scrollWidth / 2;
        // Decrement → cards visually move left-to-right (matches German LTR
        // reading flow: new cards appear on the left, slide rightward).
        let next = el.scrollLeft - (this.AUTO_SCROLL_PX_PER_SEC * dt) / 1000;
        if (next < 0) next += half;
        else if (next >= half * 2) next -= half;
        el.scrollLeft = next;
      }

      this.autoScrollHandle = requestAnimationFrame(tick);
    };
    this.autoScrollHandle = requestAnimationFrame(tick);
  }
}
