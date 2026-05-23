import {
  Component, AfterViewInit, OnInit, OnDestroy,
  Inject, PLATFORM_ID,
  ViewChild, ViewChildren, ElementRef, QueryList,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-projekte',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './projekte.component.html',
  styleUrls: ['./projekte.component.css'],
})
export class ProjekteComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('prjHeroTitle',  { read: ElementRef }) prjHeroTitle?:  ElementRef<HTMLElement>;
  @ViewChild('prjHeroSub',    { read: ElementRef }) prjHeroSub?:    ElementRef<HTMLElement>;
  @ViewChild('prjHeroMeta',   { read: ElementRef }) prjHeroMeta?:   ElementRef<HTMLElement>;
  @ViewChildren('prjChapter', { read: ElementRef }) prjChapters?:   QueryList<ElementRef<HTMLElement>>;
  @ViewChild('prjPipeline',   { read: ElementRef }) prjPipeline?:   ElementRef<HTMLElement>;
  @ViewChild('prjFinalCard',  { read: ElementRef }) prjFinalCard?:  ElementRef<HTMLElement>;

  private observers: IntersectionObserver[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.seo.setPageSEO('projekte');
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

    observe(this.prjHeroTitle?.nativeElement, 0.1);
    observe(this.prjHeroSub?.nativeElement,   0.1);
    observe(this.prjHeroMeta?.nativeElement,  0.1);
    this.prjChapters?.forEach(ref => observe(ref.nativeElement, 0.2));
    observe(this.prjPipeline?.nativeElement,  0.3);
    observe(this.prjFinalCard?.nativeElement, 0.3);
  }
}
