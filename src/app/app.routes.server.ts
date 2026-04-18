import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Server-side rendering modes for each route.
 *
 * RenderMode.Prerender  — statically rendered at build time (fastest, best for SEO)
 * RenderMode.Server     — rendered on the server per-request (for dynamic content)
 * RenderMode.Client     — skips SSR entirely (SPA mode for that route)
 *
 * Dynamic routes with params (:slug) must use Server mode because the
 * build can't enumerate all possible slug values at compile time.
 */
export const serverRoutes: ServerRoute[] = [
  // All static routes — prerendered at build time
  { path: '**',         renderMode: RenderMode.Prerender },
];
