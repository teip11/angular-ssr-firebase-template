/**
 * Post-build script: Patches the Angular SSR build so that both the
 * app manifest and engine manifest are set before AngularNodeAppEngine
 * is instantiated.
 *
 * The Angular build generates:
 *   - angular-app-manifest.mjs (exports app manifest data)
 *   - angular-app-engine-manifest.mjs (exports engine manifest data)
 * But server.mjs never imports them or calls the internal setters.
 *
 * This script:
 * 1. Finds the SSR chunk that contains the setter functions
 * 2. Patches it to import and apply both manifests
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverDir = resolve(__dirname, 'dist/gehrke-studio/server');

// Step 1: Find the chunk file containing the engine manifest error
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
  console.error('❌ postbuild: Could not find SSR chunk with engine manifest setter');
  process.exit(1);
}

console.log(`✅ postbuild: Found SSR chunk: ${targetChunk}`);

// Step 2: Patch the chunk to set the engine manifest variable (sc)
let chunkContent = readFileSync(resolve(serverDir, targetChunk), 'utf-8');

// The chunk has: var sc;function nh(){if(!sc)throw new Error("Angular app engine manifest is not set...
// We need to replace "var sc;" with code that imports and sets the engine manifest
if (chunkContent.includes('var sc;') && !chunkContent.includes('__postbuild_patched__')) {
  chunkContent = chunkContent.replace(
    'var sc;',
    'var sc;/* __postbuild_patched__ */'
  );

  // Add an import of the engine manifest at the top and set sc via a side-effect
  // We need to find the function name for ep (setAngularAppManifest) - it's export "c"
  // And we need to set sc directly since there's no exported setter for it

  // Strategy: We'll add a top-level await import and patch sc through a side-effect function
  // Actually simpler: just prepend code that imports manifests and patches the module-scoped var
  // But we can't access sc from outside... 

  // Better strategy: Replace "var sc;" with "var sc = (await import('./angular-app-engine-manifest.mjs')).default;"
  // But top-level await might not work in all contexts.

  // Simplest: inline the manifest data right into the var declaration
  const engineManifest = readFileSync(resolve(serverDir, 'angular-app-engine-manifest.mjs'), 'utf-8');
  // Extract the default export object
  const match = engineManifest.match(/export default\s+(\{[\s\S]*\});?\s*$/);
  
  if (match) {
    const manifestObj = match[1];
    chunkContent = chunkContent.replace(
      'var sc;/* __postbuild_patched__ */',
      `var sc = ${manifestObj};`
    );
    writeFileSync(resolve(serverDir, targetChunk), chunkContent, 'utf-8');
    console.log('✅ postbuild: Patched engine manifest (sc) into chunk');
  } else {
    console.error('❌ postbuild: Could not extract engine manifest data');
    process.exit(1);
  }
} else if (chunkContent.includes('__postbuild_patched__')) {
  console.log('ℹ️  postbuild: Chunk already patched');
} else {
  console.error('❌ postbuild: Could not find "var sc;" in chunk');
  process.exit(1);
}

// Step 3: Also patch the app manifest (fi variable)
// The chunk has: function ep(t){fi=t} and var fi; somewhere
// We need to also set fi
if (chunkContent.includes(';function ep(') && !chunkContent.includes('__fi_patched__')) {
  const appManifest = readFileSync(resolve(serverDir, 'angular-app-manifest.mjs'), 'utf-8');
  // The app manifest has dynamic imports, so we can't inline it easily
  // Instead, we'll patch server.mjs to call ep (setAngularAppManifest) via the chunk's export "c"
  
  // Read server.mjs and add the manifest setup call
  const serverPath = resolve(serverDir, 'server.mjs');
  let serverContent = readFileSync(serverPath, 'utf-8');
  
  if (!serverContent.includes('__app_manifest_patched__')) {
    // Find the import from the chunk
    const importMatch = serverContent.match(new RegExp(`import\\{([^}]*)\\}from"\\.\\/${targetChunk.replace('.', '\\.')}`));
    if (importMatch) {
      const currentImports = importMatch[1];
      // Add import of 'c' (which is ep = setAngularAppManifest) if not already imported
      if (!currentImports.includes('c as')) {
        const newImports = currentImports + ',c as __setAppManifest__';
        serverContent = serverContent.replace(importMatch[0], importMatch[0].replace(currentImports, newImports));
      }
    }
    
    // Add import of app manifest and call the setter at the top
    const appManifestImport = `import __appManifest__ from"./angular-app-manifest.mjs";/* __app_manifest_patched__ */\n`;
    
    // Find where to insert the setter call - right after imports, before any code
    if (!serverContent.startsWith('import __appManifest__')) {
      serverContent = appManifestImport + serverContent;
    }
    
    // Find where AngularNodeAppEngine is instantiated and add the setter call before it
    // The pattern is: new Bt( or new $i( or similar - look for "new" followed by the imported name
    // Actually, simpler: just call the setter right after the imports by finding the first non-import line
    // Or: add it via the chunk import
    
    // Let's use a different approach: just call __setAppManifest__ right in the import
    // We need to add a line after imports: __setAppManifest__(__appManifest__);
    
    // Find the first line that's not an import
    const lines = serverContent.split('\n');
    let insertIdx = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') || lines[i].startsWith('/*') || lines[i].trim() === '') {
        insertIdx = i + 1;
      } else {
        break;
      }
    }
    lines.splice(insertIdx, 0, '__setAppManifest__(__appManifest__);');
    serverContent = lines.join('\n');
    
    writeFileSync(serverPath, serverContent, 'utf-8');
    console.log('✅ postbuild: Patched app manifest setter into server.mjs');
  }
}

console.log('✅ postbuild: All patches applied successfully');
