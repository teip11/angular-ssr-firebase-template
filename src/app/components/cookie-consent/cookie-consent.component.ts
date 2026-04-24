import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CookieConsentService, ConsentStatus } from '../../services/cookie-consent.service';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cookie-consent.component.html',
  styleUrl: './cookie-consent.component.css'
})
export class CookieConsentComponent implements OnInit, OnDestroy {

  visible = false;
  private sub?: Subscription;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private consent: CookieConsentService
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Defer past SSR hydration to ensure the banner renders correctly on first visit.
    // Without this, Angular hydration keeps the server-rendered `visible = false` state
    // and the BehaviorSubject replay fires before change detection can update the DOM.
    setTimeout(() => {
      this.sub = this.consent.status$.subscribe((status: ConsentStatus) => {
        this.visible = status === 'pending';
      });
    }, 0);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  accept(): void {
    this.consent.accept();
  }

  decline(): void {
    this.consent.decline();
  }
}
