import {
  Component, AfterViewInit, OnInit, OnDestroy,
  Inject, PLATFORM_ID,
  ViewChild, ElementRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css'],
})
export class NotFoundComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('nfCard', { read: ElementRef }) nfCard?: ElementRef<HTMLElement>;

  private observer?: IntersectionObserver;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.seo.setPageSEO('not-found');
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => this.setupReveal(), 50);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private setupReveal(): void {
    const el = this.nfCard?.nativeElement;
    if (!el) return;
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('has-entered');
          this.observer?.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    this.observer.observe(el);
  }
}
