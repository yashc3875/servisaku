// Copies the website's production build (../dist) into ./www, which Capacitor
// bundles into the native app. Run `npm run build:web` to build + copy in one go.
import { cp, rm, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const SRC = join(root, '..', 'dist'); // website build output (repo root)
const DST = join(root, 'www');

if (!existsSync(SRC)) {
  console.error('✗ Website build not found at ../dist.\n  Build it first:  npm --prefix ../ run build   (or: npm run build:web)');
  process.exit(1);
}

await rm(DST, { recursive: true, force: true });
await mkdir(DST, { recursive: true });
await cp(SRC, DST, { recursive: true });
console.log('✓ Copied website build (../dist) → www/  — now run: npm run sync');
