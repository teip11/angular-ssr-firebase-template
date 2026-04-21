/**
 * Post-build script: Injects the Angular engine manifest import at the top
 * of server.mjs so that AngularNodeAppEngine has access to the manifest
 * when it is instantiated at module load time.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverMjsPath = resolve(__dirname, 'dist/gehrke-studio/server/server.mjs');

let content = readFileSync(serverMjsPath, 'utf-8');

const manifestImport = `import './angular-app-engine-manifest.mjs';\n`;

if (!content.includes('angular-app-engine-manifest')) {
  content = manifestImport + content;
  writeFileSync(serverMjsPath, content, 'utf-8');
  console.log('✅ postbuild: Injected angular-app-engine-manifest import into server.mjs');
} else {
  console.log('ℹ️  postbuild: angular-app-engine-manifest import already present in server.mjs');
}
