import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CookieConsentService, ConsentStatus } from '../../services/cookie-consent.service';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [RouterLink],
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

    // Delay also covers the SSR hydration race: without a deferred subscribe, Angular
    // hydration keeps the server-rendered `visible = false` state and the BehaviorSubject
    // replay fires before change detection can update the DOM. The longer delay additionally
    // lets the home hero load-animation finish (~1.9s) before the banner slides in.
    setTimeout(() => {
      this.sub = this.consent.status$.subscribe((status: ConsentStatus) => {
        this.visible = status === 'pending';
      });
    }, 2000);
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
