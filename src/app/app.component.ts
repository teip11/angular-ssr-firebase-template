import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { CookieConsentComponent } from './components/cookie-consent/cookie-consent.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CookieConsentComponent],
  template: `
    <!-- Global fixed animated gradient background -->
    <div class="global-bg" aria-hidden="true">
      <div class="global-bg__base"></div>
      <div class="global-bg__grain"></div>
    </div>

    <app-navbar></app-navbar>
    <main class="relative z-10">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>

    <!-- Cookie Consent Banner — rendered above everything else -->
    <app-cookie-consent></app-cookie-consent>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'gehrke-studio';
}
