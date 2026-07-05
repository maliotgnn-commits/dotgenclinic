import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ROOT_BUILD = resolve(ROOT, 'dist/ilac-ar-ge.html');

export function buildPharmaRdPreviewPage() {
  const result = spawnSync(
    'npx',
    ['vite', 'build', '--config', 'scripts/pharma-rd-vite.config.mjs'],
    { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' },
  );

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }

  if (!existsSync(ROOT_BUILD)) {
    console.error('[build-pharma-rd-preview-page] Missing dist/ilac-ar-ge.html after build');
    process.exit(1);
  }

  const trOutDir = resolve(ROOT, 'dist/tr');
  mkdirSync(trOutDir, { recursive: true });
  copyFileSync(ROOT_BUILD, resolve(trOutDir, 'ilac-ar-ge.html'));

  console.log('[build-pharma-rd-preview-page] Built Turkish pharma R&D page');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildPharmaRdPreviewPage();
}
