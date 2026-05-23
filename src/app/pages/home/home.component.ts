import {
  Component, AfterViewInit, OnInit, OnDestroy,
  ElementRef, ViewChild, ViewChildren, QueryList,
  Inject, PLATFORM_ID, NgZone, HostListener
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

interface FaqItem { cat: string; q: string; a: string; }
interface QuoteWord { t: string; accent?: boolean; period?: boolean; s: number; o: number; }

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  // ─── Process section state (v2 scroll-stack) ───────────────────────────
  activeStep = 0;

  @ViewChildren('psCard', { read: ElementRef }) psCards?: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('psRail',  { read: ElementRef }) psRail?: ElementRef<HTMLElement>;

  // ─── Showcase carousel — JS-driven slow horizontal scroll ─────────────
  @ViewChild('showTrack', { read: ElementRef }) showTrack?: ElementRef<HTMLElement>;
  showcasePaused = false;
  private showcaseRAF: number | null = null;

  // ─── Quote bridge state ────────────────────────────────────────────────
  quoteRevealed = false;
  quoteReading = false;
  quoteWords: QuoteWord[] = [
    { t: 'Eine',       s: 0, o: 0.12 },
    { t: 'Website',    s: 0, o: 0.12 },
    { t: 'verspricht', s: 0, o: 0.12 },
    { t: 'nichts.',    s: 0, o: 0.12 },
    { t: 'Sie',        s: 0, o: 0.12, accent: true },
    { t: 'zeigt',      s: 0, o: 0.12, accent: true, period: true },
  ];
  @ViewChild('quoteTrack', { read: ElementRef }) quoteTrack?: ElementRef<HTMLElement>;

  // ─── Honesty section state (sentence reveal + ghost-Q parallax) ────────
  @ViewChildren('honestSentence', { read: ElementRef }) honestSentences?: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('honestFinale', { read: ElementRef }) honestFinale?: ElementRef<HTMLElement>;
  @ViewChild('ghostQ',       { read: ElementRef }) ghostQ?: ElementRef<HTMLElement>;

  // ─── FAQ section state ─────────────────────────────────────────────────
  openFaq: number | null = 0;
  faqVisible: boolean[] = [false, false, false, false, false, false];
  faqHeights: number[] = [];
  faqRailPercent = 0;
  faqItems: FaqItem[] = [
    {
      cat: 'Preis & Umsetzung',
      q: 'Was kostet die Umsetzung, wenn mich das Konzept überzeugt?',
      a: 'Das hängt vom Umfang ab. Nach dem kostenlosen Konzept besprechen wir transparent, welche Funktionen Sie wirklich brauchen — und Sie bekommen einen <em>klaren Festpreis</em>, bevor wir mit der Umsetzung beginnen. <strong>Keine versteckten Kosten, keine Überraschungen.</strong>'
    },
    {
      cat: 'Eigentum & Rechte',
      q: 'Wem gehört das Design am Ende?',
      a: '<em>Ihnen.</em> Das fertige Konzept und die fertige Website gehören vollständig Ihnen — inklusive aller Designdateien und des Codes. <strong>Auch dann, wenn Sie sich nach dem kostenlosen Konzept gegen die Umsetzung entscheiden.</strong>'
    },
    {
      cat: 'Zeitrahmen',
      q: 'Wie lange dauert es, bis ich mein kostenloses Konzept sehe?',
      a: 'In der Regel innerhalb von <strong>5 bis 7 Werktagen</strong>, nachdem Sie uns die ersten Informationen zu Ihrem Unternehmen geschickt haben.'
    },
    {
      cat: 'Anpassungen',
      q: 'Wie viele Änderungswünsche sind enthalten?',
      a: 'Das kostenlose Konzept zeigt Ihnen eine erste Richtung. Während der Umsetzung gehören Anpassungen selbstverständlich zum Prozess — <em>wir arbeiten so lange am Detail, bis Sie wirklich zufrieden sind.</em>'
    },
    {
      cat: 'Hosting & Betrieb',
      q: 'Was kostet das Hosting und laufender Betrieb?',
      a: 'Hosting können Sie selbst übernehmen oder über uns laufen lassen — <em>beides möglich.</em> Bei der Umsetzung zeigen wir Ihnen beide Wege transparent, damit Sie wissen, was monatlich auf Sie zukommt.'
    },
    {
      cat: 'Kein Risiko',
      q: 'Was passiert, wenn mir das Konzept nicht gefällt?',
      a: '<em>Kein Problem, kein Druck.</em> Sie sind zu nichts verpflichtet — das Konzept gehört Ihnen, auch wenn wir nicht weiter zusammenarbeiten. <strong>So einfach ist das.</strong>'
    },
  ];
  @ViewChildren('faqAnswer', { read: ElementRef }) faqAnswerEls?: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('faqItem',   { read: ElementRef }) faqItemEls?: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('faqList',      { read: ElementRef }) faqList?: ElementRef<HTMLElement>;

  // ─── Final section state ───────────────────────────────────────────────
  finalVisible = false;
  @ViewChild('finalHeadline', { read: ElementRef }) finalHeadline?: ElementRef<HTMLElement>;
  @ViewChild('finalCtaRow',   { read: ElementRef }) finalCtaRow?: ElementRef<HTMLElement>;

  // ─── Leistungen (value) stanzas — per-element scroll-triggered reveals ─
  // Each animatable element gets its own observer so the choreography
  // sequences with the reader's scroll position, not in a single burst when
  // the section enters view.
  @ViewChild('vhHeadline', { read: ElementRef }) vhHeadline?: ElementRef<HTMLElement>;
  @ViewChild('vhSub',      { read: ElementRef }) vhSub?:      ElementRef<HTMLElement>;
  @ViewChildren('valueCardItem', { read: ElementRef }) valueCardItems?: QueryList<ElementRef<HTMLElement>>;

  private observers: IntersectionObserver[] = [];
  private scrollTicking = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private seo: SeoService
  ) {}

  ngOnInit(): void {
    this.seo.setPageSEO('home');
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Defer to ensure layout is settled
    setTimeout(() => {
      this.setupValueReveal();
      this.setupHonestyReveal();
      this.setupFaqReveal();
      this.setupFinalReveal();
      this.measureFaqHeights();
      this.startShowcaseAutoScroll();
      this.onScroll(); // initial calculation
    }, 100);
  }

  ngOnDestroy(): void {
    this.observers.forEach(o => o.disconnect());
    if (this.showcaseRAF !== null) cancelAnimationFrame(this.showcaseRAF);
  }

  // ─── Showcase: per-frame scrollLeft nudge for slow auto-scroll. The track
  // has 12 cards (6 unique + 6 duplicates), so when scrollLeft passes the
  // halfway mark we wrap back to keep the loop seamless. Hovering pauses
  // (showcasePaused = true) and native trackpad/touch scrolling still works
  // because we never block user interaction — we only add to scrollLeft.
  private startShowcaseAutoScroll(): void {
    const track = this.showTrack?.nativeElement;
    if (!track) return;
    const speed = 0.6; // pixels per frame; ~36 px/s at 60fps
    const tick = () => {
      if (!this.showcasePaused) {
        track.scrollLeft += speed;
      }
      const half = track.scrollWidth / 2;
      if (track.scrollLeft >= half) {
        track.scrollLeft -= half;
      }
      this.showcaseRAF = requestAnimationFrame(tick);
    };
    this.showcaseRAF = requestAnimationFrame(tick);
  }

  // ─── Scroll handling ───────────────────────────────────────────────────
  @HostListener('window:scroll', [])
  onScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.scrollTicking) return;
    this.scrollTicking = true;
    window.requestAnimationFrame(() => {
      this.scrollTicking = false;
      this.updateProcess();
      this.updateQuoteBridge();
      this.updateFaqRail();
      this.updateGhostQ();
    });
  }

  @HostListener('window:resize', [])
  onResize(): void {
    this.measureFaqHeights();
    this.onScroll();
  }

  // ─── Process: sticky-stack rail tracker + post-release rail-follow ──────
  // Two things in one pass:
  //   1. Set activeStep to the deepest card whose top has crossed the 45%
  //      viewport line, so the rail highlights the matching step.
  //   2. Once card 4 begins releasing (its rect.top drops below its sticky
  //      visual position at y=180), shift the rail up by 0.85× the card's
  //      displacement. Rail trails the cards slightly — asymmetric feel —
  //      and exits the viewport well before .ps-grid's natural sticky-end
  //      point, cutting the dead-scroll between the last card and the next
  //      section.
  private updateProcess(): void {
    const cards = this.psCards?.toArray();
    if (!cards || !cards.length) return;

    const trigger = window.innerHeight * 0.45;
    let active = 0;
    cards.forEach((ref, i) => {
      const rect = ref.nativeElement.getBoundingClientRect();
      if (rect.top <= trigger) active = i;
    });
    if (active !== this.activeStep) {
      this.ngZone.run(() => { this.activeStep = active; });
    }

    // Rail follow: waits until card 4 has scrolled up roughly half its own
    // height before tracking. The cards leave first, the rail follows once
    // they're visibly halfway out — asymmetric, not synchronous.
    const railEl = this.psRail?.nativeElement;
    if (!railEl) return;
    const lastTop = cards[cards.length - 1].nativeElement.getBoundingClientRect().top;
    const stickyTop = 160; // last card: top(120) + translateY(40)
    const delay = window.innerHeight * 0.38; // ~half the 76vh card
    const startPoint = stickyTop - delay;
    const shift = lastTop < startPoint ? (startPoint - lastTop) : 0;
    railEl.style.transform = shift > 0 ? `translateY(-${shift}px)` : '';
  }

  // ─── Quote bridge: scroll-driven word reveal ───────────────────────────
  private updateQuoteBridge(): void {
    const track = this.quoteTrack?.nativeElement;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height - vh;
    if (total <= 0) return;
    const p = Math.max(0, Math.min(1, -rect.top / total));

    const startReveal = 0.10;
    const endReveal = 0.75;
    const reading = Math.max(0, Math.min(1, (p - startReveal) / (endReveal - startReveal)));

    const n = this.quoteWords.length;
    const wordWindow = 1 / n;
    const overlap = 0.45 * wordWindow;
    let changed = false;
    this.quoteWords.forEach((w, i) => {
      const start = i * (wordWindow - overlap / n);
      const end = start + wordWindow + overlap;
      const local = Math.max(0, Math.min(1, (reading - start) / (end - start)));
      const eased = 1 - Math.pow(1 - local, 3);
      const newS = +eased.toFixed(3);
      const newO = +(0.12 + eased * 0.88).toFixed(3);
      if (Math.abs(newS - w.s) > 0.01 || Math.abs(newO - w.o) > 0.01) {
        w.s = newS;
        w.o = newO;
        changed = true;
      }
    });
    const newReading = reading > 0.02 && reading < 0.98;
    const newRevealed = p > 0.78;
    if (changed || newReading !== this.quoteReading || newRevealed !== this.quoteRevealed) {
      this.ngZone.run(() => {
        this.quoteReading = newReading;
        this.quoteRevealed = newRevealed;
      });
    }
  }

  // ─── Leistungen: per-element observers ─────────────────────────────────
  // Each element animates as IT enters view (not when the section does), so
  // the eye is guided down the page beat by beat. Thresholds are tuned per
  // element: the headline + sub need ~40% visible so the slide-in catches
  // the eye as the user looks at them; the arrow uses a smaller threshold
  // because it sits at the section seam and is shorter; the cards are
  // horizontally aligned so they trigger ~simultaneously, with the L→R
  // stagger provided by CSS nth-child animation-delays.
  private setupValueReveal(): void {
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

    observe(this.vhHeadline?.nativeElement, 0.55);
    observe(this.vhSub?.nativeElement,      0.65);
    this.valueCardItems?.forEach(ref => observe(ref.nativeElement, 0.35));
  }

  // ─── Honesty: IntersectionObserver-driven sentence reveal ──────────────
  private setupHonestyReveal(): void {
    const targets: Element[] = [];
    this.honestSentences?.forEach(ref => targets.push(ref.nativeElement));
    if (this.honestFinale) targets.push(this.honestFinale.nativeElement);
    if (!targets.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.4, rootMargin: '0px 0px -10% 0px' });
    targets.forEach(el => io.observe(el));
    this.observers.push(io);
  }

  private updateGhostQ(): void {
    const ghost = this.ghostQ?.nativeElement;
    if (!ghost) return;
    const section = ghost.closest('.honest') as HTMLElement | null;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    const center = (rect.top + rect.bottom) / 2;
    const p = (center - vh / 2) / vh;
    const offset = Math.max(-120, Math.min(120, p * -180));
    ghost.style.setProperty('--gy', `${offset.toFixed(1)}px`);
  }

  // ─── FAQ: accordion + reveal-on-scroll + rail fill ─────────────────────
  private setupFaqReveal(): void {
    const items = this.faqItemEls;
    if (!items) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = Number((e.target as HTMLElement).dataset['i']);
          this.ngZone.run(() => { if (!isNaN(idx)) this.faqVisible[idx] = true; });
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    items.forEach((ref, idx) => {
      ref.nativeElement.dataset['i'] = String(idx);
      io.observe(ref.nativeElement);
    });
    this.observers.push(io);
  }

  toggleFaq(i: number): void {
    this.openFaq = this.openFaq === i ? null : i;
    this.measureFaqHeights();
  }

  private measureFaqHeights(): void {
    if (!this.faqAnswerEls) return;
    this.faqHeights = this.faqAnswerEls.toArray().map(r => r.nativeElement.scrollHeight);
  }

  private updateFaqRail(): void {
    const list = this.faqList?.nativeElement;
    if (!list) return;
    const rect = list.getBoundingClientRect();
    const vh = window.innerHeight;
    let p: number;
    if (rect.height <= vh) {
      p = Math.max(0, Math.min(1, (vh - rect.top) / rect.height));
    } else {
      const total = rect.height - vh * 0.6;
      const scrolled = -rect.top + vh * 0.2;
      p = Math.max(0, Math.min(1, scrolled / total));
    }
    const newPct = p * 100;
    if (Math.abs(newPct - this.faqRailPercent) > 0.5) {
      this.ngZone.run(() => { this.faqRailPercent = newPct; });
    }
  }

  // ─── Final: IntersectionObserver reveal ────────────────────────────────
  private setupFinalReveal(): void {
    const targets = [this.finalHeadline?.nativeElement, this.finalCtaRow?.nativeElement].filter(Boolean) as Element[];
    if (!targets.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          this.ngZone.run(() => { this.finalVisible = true; });
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.35 });
    targets.forEach(t => io.observe(t));
    this.observers.push(io);
  }
}
