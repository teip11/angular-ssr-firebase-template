import {
  Component, AfterViewInit, OnInit, OnDestroy,
  Inject, PLATFORM_ID,
  ViewChild, ElementRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { CookieConsentService } from '../../services/cookie-consent.service';

@Component({
  selector: 'app-datenschutz',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './datenschutz.component.html',
  styleUrls: ['./datenschutz.component.css'],
})
export class DatenschutzComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('dtsHeader', { read: ElementRef }) dtsHeader?: ElementRef<HTMLElement>;
  @ViewChild('dtsProse',  { read: ElementRef }) dtsProse?:  ElementRef<HTMLElement>;

  private observers: IntersectionObserver[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private seo: SeoService,
    private cookieConsent: CookieConsentService,
  ) {}

  ngOnInit(): void {
    this.seo.setPageSEO('datenschutz');
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => this.setupReveal(), 50);
  }

  ngOnDestroy(): void {
    this.observers.forEach(o => o.disconnect());
    this.observers = [];
  }

  resetConsent(): void {
    this.cookieConsent.reset();
  }

  private setupReveal(): void {
    const observe = (el: Element | undefined | null, threshold: number) => {
      if (!el) return;
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('has-entered');
            io.unobserve(e.target);
          }
        });
      }, { threshold });
      io.observe(el);
      this.observers.push(io);
    };
    observe(this.dtsHeader?.nativeElement, 0.1);
    observe(this.dtsProse?.nativeElement,  0.05);
  }
}
