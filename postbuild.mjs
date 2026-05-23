/**
 * Post-build script: patches the Angular SSR build so both the engine
 * manifest and the app manifest are populated when the chunk loads.
 *
 * Why this exists: with the `@angular-devkit/build-angular:application`
 * builder + `@angular/ssr`, the generated `server.mjs` never imports the
 * manifests and never calls the internal setters. At request time
 * `AngularNodeAppEngine` then throws "Angular app engine manifest is not set"
 * / "Angular app manifest is not set". The Angular runtime hint is to switch
 * to `@angular/build:application`, but migrating that builder is a separate
 * piece of work.
 *
 * Strategy: locate the SSR chunk and inline each manifest's default-exported
 * object into the chunk's `var` declaration so the values are set at module
 * load time. The check functions then read the populated vars and pass.
 *
 * The minified variable names change every Angular minor (Angular 20: sc/fi;
 * Angular 21: wf/go). We auto-discover them via regex on the canonical
 * surrounding patterns, so this script keeps working through future updates
 * as long as Angular's emitted structure stays roughly the same.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverDir = resolve(__dirname, 'dist/gehrke-studio/server');

function readManifestObjectLiteral(file) {
  const src = readFileSync(resolve(serverDir, file), 'utf-8');
  const match = src.match(/export default\s+(\{[\s\S]*\});?\s*$/);
  if (!match) throw new Error(`Could not extract default-export object literal from ${file}`);
  return match[1];
}

const chunkFiles = readdirSync(serverDir).filter(f => f.startsWith('chunk-') && f.endsWith('.mjs'));

let targetChunk = null;
for (const file of chunkFiles) {
  const content = readFileSync(resolve(serverDir, file), 'utf-8');
  if (content.includes('Angular app engine manifest is not set')) {
    targetChunk = file;
    break;
  }
}

if (!targetChunk) {
  console.error('postbuild: could not find SSR chunk with engine manifest setter');
  process.exit(1);
}

console.log(`postbuild: target chunk -> ${targetChunk}`);

const chunkPath = resolve(serverDir, targetChunk);
let chunkContent = readFileSync(chunkPath, 'utf-8');

if (chunkContent.includes('__postbuild_patched__')) {
  console.log('postbuild: chunk already patched, skipping');
  process.exit(0);
}

// Angular 21 added an SSRF host-header check. `allowedHosts` ships empty
// from the builder, so without this every request CSR-falls-back. Hosts
// listed here are matched against the `host` header (with or without port).
const ALLOWED_HOSTS = [
  'gehrkestudio.com',
  'www.gehrkestudio.com',
  'localhost',
];

const appManifestLiteral = readManifestObjectLiteral('angular-app-manifest.mjs');
let engineManifestLiteral = readManifestObjectLiteral('angular-app-engine-manifest.mjs');
const hostsLiteral = JSON.stringify(ALLOWED_HOSTS);
if (!/allowedHosts:\s*\[\s*\]/.test(engineManifestLiteral)) {
  console.error('postbuild: expected empty `allowedHosts: []` in engine manifest — did the builder change?');
  process.exit(1);
}
engineManifestLiteral = engineManifestLiteral.replace(/allowedHosts:\s*\[\s*\]/, `allowedHosts: ${hostsLiteral}`);
console.log(`postbuild: allowedHosts -> ${hostsLiteral}`);

// Engine manifest: `var <X>;function <Y>(){if(!<X>)throw new Error("Angular app engine manifest is not set`
const engineDeclRe = /var (\w+);(function \w+\(\)\{if\(!\1\)throw new Error\("Angular app engine manifest is not set)/;
const engineMatch = chunkContent.match(engineDeclRe);
if (!engineMatch) {
  console.error('postbuild: could not locate engine-manifest declaration pattern');
  process.exit(1);
}
const engineVar = engineMatch[1];
chunkContent = chunkContent.replace(
  engineDeclRe,
  `var ${engineVar} = ${engineManifestLiteral};$2`,
);
console.log(`postbuild: inlined engine manifest into "var ${engineVar}"`);

// App manifest: `,<X>;function <Y>(t){<X>=t}function <Z>(){if(!<X>)throw new Error("Angular app manifest is not set`
const appDeclRe = /,(\w+);(function \w+\(t\)\{\1=t\}function \w+\(\)\{if\(!\1\)throw new Error\("Angular app manifest is not set)/;
const appMatch = chunkContent.match(appDeclRe);
if (!appMatch) {
  console.error('postbuild: could not locate app-manifest declaration pattern');
  process.exit(1);
}
const appVar = appMatch[1];
chunkContent = chunkContent.replace(
  appDeclRe,
  `,${appVar} = ${appManifestLiteral};$2`,
);
console.log(`postbuild: inlined app manifest into ",${appVar}"`);

chunkContent = `/* __postbuild_patched__ */\n` + chunkContent;
writeFileSync(chunkPath, chunkContent, 'utf-8');
console.log('postbuild: done');
