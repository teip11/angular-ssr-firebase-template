import {
  Component, AfterViewInit, OnInit, OnDestroy,
  Inject, PLATFORM_ID,
  ViewChild, ViewChildren, ElementRef, QueryList,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css'],
})
export class BlogComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('blgHeroTitle',       { read: ElementRef }) blgHeroTitle?:       ElementRef<HTMLElement>;
  @ViewChild('blgHeroSub',         { read: ElementRef }) blgHeroSub?:         ElementRef<HTMLElement>;
  @ViewChild('blgFeaturedCard',    { read: ElementRef }) blgFeaturedCard?:    ElementRef<HTMLElement>;
  @ViewChild('blgFeaturedText',    { read: ElementRef }) blgFeaturedText?:    ElementRef<HTMLElement>;
  @ViewChild('blgArticlesHeader',  { read: ElementRef }) blgArticlesHeader?:  ElementRef<HTMLElement>;
  @ViewChildren('blgArticle',      { read: ElementRef }) blgArticles?:        QueryList<ElementRef<HTMLElement>>;
  @ViewChild('blgFinalCard',       { read: ElementRef }) blgFinalCard?:       ElementRef<HTMLElement>;

  private observers: IntersectionObserver[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.seo.setPageSEO('blog');
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

    observe(this.blgHeroTitle?.nativeElement,      0.1);
    observe(this.blgHeroSub?.nativeElement,        0.1);
    observe(this.blgFeaturedCard?.nativeElement,   0.3);
    observe(this.blgFeaturedText?.nativeElement,   0.3);
    observe(this.blgArticlesHeader?.nativeElement, 0.55);
    this.blgArticles?.forEach(ref => observe(ref.nativeElement, 0.3));
    observe(this.blgFinalCard?.nativeElement,      0.3);
  }
}
