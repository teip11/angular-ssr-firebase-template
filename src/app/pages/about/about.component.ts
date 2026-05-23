import {
  Component, AfterViewInit, OnInit, OnDestroy,
  Inject, PLATFORM_ID,
  ViewChild, ViewChildren, ElementRef, QueryList,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('abtHeroTitle',    { read: ElementRef }) abtHeroTitle?:   ElementRef<HTMLElement>;
  @ViewChild('abtHeroSub',      { read: ElementRef }) abtHeroSub?:     ElementRef<HTMLElement>;
  @ViewChild('abtBioText',      { read: ElementRef }) abtBioText?:     ElementRef<HTMLElement>;
  @ViewChild('abtBioVisual',    { read: ElementRef }) abtBioVisual?:   ElementRef<HTMLElement>;
  @ViewChild('abtValuesHeader', { read: ElementRef }) abtValuesHeader?: ElementRef<HTMLElement>;
  @ViewChildren('abtValueCard', { read: ElementRef }) abtValueCards?:   QueryList<ElementRef<HTMLElement>>;
  @ViewChild('abtFinalCard',    { read: ElementRef }) abtFinalCard?:   ElementRef<HTMLElement>;

  private observers: IntersectionObserver[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.seo.setPageSEO('about');
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => this.setupReveal(), 50);
  }

  ngOnDestroy(): void {
    this.observers.forEach(o => o.disconnect());
    this.observers = [];
  }

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

    // Hero — already in viewport on load; observer kicks off staged animation.
    observe(this.abtHeroTitle?.nativeElement, 0.1);
    observe(this.abtHeroSub?.nativeElement,   0.1);

    // Bio — text + visual observed independently, slide in from opposite sides.
    observe(this.abtBioText?.nativeElement,   0.35);
    observe(this.abtBioVisual?.nativeElement, 0.35);

    // Values — header catches the eye, cards stagger as the row enters.
    observe(this.abtValuesHeader?.nativeElement, 0.55);
    this.abtValueCards?.forEach(ref => observe(ref.nativeElement, 0.4));

    // Final card — single unit, page closer.
    observe(this.abtFinalCard?.nativeElement, 0.3);
  }
}
