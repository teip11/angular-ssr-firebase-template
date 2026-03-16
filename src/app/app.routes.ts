import { Routes } from '@angular/router';

/**
 * All routes use lazy-loaded standalone components.
 * This keeps the initial bundle small — each page chunk is only
 * downloaded when the user navigates to that route.
 */
export const routes: Routes = [
  // ── Main pages ────────────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'Glow Seoul | Authentic Korean Beauty Delivered'
  },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'shop',
    loadComponent: () =>
      import('./pages/shop/shop.component').then(m => m.ShopComponent),
    title: 'Shop K-Beauty | Glow Seoul'
  },
  {
    path: 'shop/:slug',
    loadComponent: () =>
      import('./pages/product/product.component').then(m => m.ProductComponent),
    // Title is set dynamically in ProductComponent.ngOnInit() via SeoService
    title: 'Product | Glow Seoul'
  },
  {
    path: 'bundle',
    loadComponent: () =>
      import('./pages/bundle/bundle.component').then(m => m.BundleComponent),
    title: 'Build Your Bundle | Glow Seoul'
  },
  {
    path: 'quiz',
    loadComponent: () =>
      import('./pages/quiz/quiz.component').then(m => m.QuizComponent),
    title: 'Skin Type Quiz | Find Your K-Beauty Routine | Glow Seoul'
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then(m => m.AboutComponent),
    title: 'About | Our Story | Glow Seoul'
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact | Glow Seoul'
  },

  // ── Blog ──────────────────────────────────────────────────────────────────
  {
    path: 'blog',
    loadComponent: () =>
      import('./pages/blog/blog.component').then(m => m.BlogComponent),
    title: 'K-Beauty Blog | Skincare Tips & Tutorials | Glow Seoul'
  },
  {
    path: 'blog/:slug',
    loadComponent: () =>
      import('./pages/blog/blog-post/blog-post.component').then(m => m.BlogPostComponent),
    // Title set dynamically in BlogPostComponent
    title: 'Blog | Glow Seoul'
  },

  // ── 404 ───────────────────────────────────────────────────────────────────
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: '404 — Page Not Found | Glow Seoul'
  }
];
