import {
  Component, AfterViewInit, OnInit, OnDestroy,
  Inject, PLATFORM_ID,
  ViewChild, ElementRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-agb',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './agb.component.html',
  styleUrls: ['./agb.component.css'],
})
export class AgbComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('agbHeader', { read: ElementRef }) agbHeader?: ElementRef<HTMLElement>;
  @ViewChild('agbProse',  { read: ElementRef }) agbProse?:  ElementRef<HTMLElement>;

  private observers: IntersectionObserver[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.seo.setPageSEO('agb');
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
    observe(this.agbHeader?.nativeElement, 0.1);
    observe(this.agbProse?.nativeElement,  0.05);
  }
}
