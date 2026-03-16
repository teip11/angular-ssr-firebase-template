import 'zone.js/node';
import { AngularNodeAppEngine, createNodeRequestHandler, isMainModule, writeResponseToNodeResponse } from '@angular/ssr/node';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import compression from 'compression';

export function app(): express.Express {
  const server              = express();
  const serverDistFolder    = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder   = resolve(serverDistFolder, '../browser');
  const angularAppEngine    = new AngularNodeAppEngine();

  // ── Gzip / Brotli compression ───────────────────────────────
  server.use(compression());

  // ── Security headers ────────────────────────────────────────
  server.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options',    'nosniff');
    res.setHeader('X-Frame-Options',           'DENY');
    res.setHeader('X-XSS-Protection',          '1; mode=block');
    res.setHeader('Referrer-Policy',           'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy',        'camera=(), microphone=(), geolocation=()');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    // TODO: Tighten CSP once you have finalised all third-party scripts
    res.setHeader('Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com https://js.hsforms.net https://www.google.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: blob: https: http:; " +
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://cloudfunctions.net; " +
      "frame-src https://www.google.com; " +
      "base-uri 'self';"
    );
    next();
  });

  // ── Static assets — 1-year immutable cache ───────────────────
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y',
    immutable: true,
    setHeaders: (res, filePath: string) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));

  // ── All other routes → Angular Universal SSR ────────────────
  server.use('**', createNodeRequestHandler(async (req, res, next) => {
    try {
      const response = await angularAppEngine.handle(req);
      if (response) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        await writeResponseToNodeResponse(response, res);
      } else {
        next();
      }
    } catch (err) {
      next(err);
    }
  }));

  return server;
}

const server = app();

if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export default createNodeRequestHandler(async (req, res, next) => {
  const angularAppEngine = new AngularNodeAppEngine();
  try {
    const response = await angularAppEngine.handle(req);
    if (response) {
      await writeResponseToNodeResponse(response, res);
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
});
