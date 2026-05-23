import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const angularApp = new AngularNodeAppEngine();

const app = express();

// Firebase App Hosting → Cloud Run rewrites the incoming `Host` header to the
// internal run.app hostname (e.g. `t-…---gehrke-studio-…-ez.a.run.app`), which
// trips Angular 21's SSRF host-header allowlist. The original public hostname
// arrives in `X-Forwarded-Host` — promote it to `Host` so the SSR engine sees
// `gehrkestudio.com` and `allowedHosts` matches.
app.set('trust proxy', true);
app.use((req, _res, next) => {
  const fwdHost = req.headers['x-forwarded-host'];
  if (fwdHost) {
    req.headers.host = Array.isArray(fwdHost) ? fwdHost[0] : fwdHost;
  }
  next();
});

// ── Static assets — 1-year immutable cache ───────────────────
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// ── Showcase templates — standalone static HTML pages ─────────
// These live in public/showcase/<slug>/index.html and are NOT Angular routes.
// Needs index: 'index.html' so /showcase/<slug>/ resolves the directory's index.
app.use(
  '/showcase',
  express.static(resolve(browserDistFolder, 'showcase'), {
    maxAge: '1y',
    index: 'index.html',
  }),
);

// ── All other routes → Angular SSR ────────────────────────────
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

// ── Start listening when run directly ─────────────────────────
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// ── Firebase App Hosting needs a default export ───────────────
export const reqHandler = createNodeRequestHandler(app);
export default reqHandler;
