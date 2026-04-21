import { Routes } from '@angular/router';

export const routes: Routes = [
  // ── Main pages ────────────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'Home | Gehrke Studio'
  },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'projekte',
    loadComponent: () =>
      import('./pages/projekte/projekte.component').then(m => m.ProjekteComponent),
    title: 'Projekte | Gehrke Studio'
  },
  {
    path: 'leistungen',
    loadComponent: () =>
      import('./pages/leistungen/leistungen.component').then(m => m.LeistungenComponent),
    title: 'Leistungen | Gehrke Studio'
  },
  {
    path: 'ueber-uns',
    loadComponent: () =>
      import('./pages/about/about.component').then(m => m.AboutComponent),
    title: 'Über uns | Gehrke Studio'
  },
  {
    path: 'kontakt',
    loadComponent: () =>
      import('./pages/contact/contact.component').then(m => m.ContactComponent),
    title: 'Kontakt | Gehrke Studio'
  },
  {
    path: 'demo',
    loadComponent: () =>
      import('./pages/demo/demo.component').then(m => m.DemoComponent),
    title: 'Demo anfordern | Gehrke Studio'
  },
  {
    path: 'blog',
    loadComponent: () =>
      import('./pages/blog/blog.component').then(m => m.BlogComponent),
    title: 'Insights & Blog | Gehrke Studio'
  },

  // ── Legal pages ─────────────────────────────────────────────────────────────
  {
    path: 'impressum',
    loadComponent: () =>
      import('./pages/impressum/impressum.component').then(m => m.ImpressumComponent),
    title: 'Impressum | Gehrke Studio'
  },
  {
    path: 'datenschutz',
    loadComponent: () =>
      import('./pages/datenschutz/datenschutz.component').then(m => m.DatenschutzComponent),
    title: 'Datenschutzerklärung | Gehrke Studio'
  },

  // ── 404 ───────────────────────────────────────────────────────────────────
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: '404 — Seite nicht gefunden | Gehrke Studio'
  }
];
