import { Component, OnInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';

/**
 * StickyCtaComponent — appears after 500px scroll.
 * Dismissed via sessionStorage (won't reappear in the same session).
 * TODO: Update CTA text, link, and message to match your brand.
 */
@Component({
  selector: 'app-sticky-cta',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sticky-cta.component.html',
  styleUrl: './sticky-cta.component.css'
})
export class StickyCtaComponent implements OnInit {
  visible   = false;
  dismissed = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private analytics: AnalyticsService
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.dismissed = sessionStorage.getItem('sticky_cta_dismissed') === 'true';
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!isPlatformBrowser(this.platformId) || this.dismissed) return;
    this.visible = window.scrollY > 500;
  }

  dismiss(): void {
    this.visible   = false;
    this.dismissed = true;
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('sticky_cta_dismissed', 'true');
    }
  }

  onCtaClick(): void {
    this.analytics.trackCtaClick({
      cta_text:     'Demo anfordern',
      cta_location: 'sticky_bar',
      destination:  '/demo'
    });
  }
}
