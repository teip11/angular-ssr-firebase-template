import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      // Enables anchor (#fragment) scrolling on all routes
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'top' }),
    ),
    // SSR hydration with event replay — captures events fired before hydration
    // and replays them after Angular bootstraps in the browser
    provideClientHydration(withEventReplay()),
    // Use fetch() instead of XMLHttpRequest — required for SSR compatibility
    provideHttpClient(withFetch()),
    // TODO: Add Lottie support once a compatible ngx-lottie version is available for Angular 19
    // Install: npm install ngx-lottie lottie-web
    // Then uncomment:
    // provideLottieOptions({ player: () => import('lottie-web') }),
  ]
};
