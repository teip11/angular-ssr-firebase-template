import {
  Component, AfterViewInit, OnInit, OnDestroy,
  Inject, PLATFORM_ID,
  ViewChild, ElementRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-impressum',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './impressum.component.html',
  styleUrls: ['./impressum.component.css'],
})
export class ImpressumComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('impHeader', { read: ElementRef }) impHeader?: ElementRef<HTMLElement>;
  @ViewChild('impProse',  { read: ElementRef }) impProse?:  ElementRef<HTMLElement>;

  private observers: IntersectionObserver[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.seo.setPageSEO('impressum');
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
    observe(this.impHeader?.nativeElement, 0.1);
    observe(this.impProse?.nativeElement,  0.05);
  }
}
