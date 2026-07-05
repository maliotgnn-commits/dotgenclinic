import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ROOT_BUILD = resolve(ROOT, 'dist/finans-departmani.html');
const LOCALE_BUILD = resolve(ROOT, 'dist/tr/finans-departmani.html');

export function buildFinancePreviewPage() {
  const result = spawnSync(
    'npx',
    ['vite', 'build', '--config', 'scripts/finance-vite.config.mjs'],
    { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' },
  );

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }

  if (!existsSync(ROOT_BUILD)) {
    console.error('[build-finance-preview-page] Missing dist/finans-departmani.html after build');
    process.exit(1);
  }

  mkdirSync(resolve(ROOT, 'dist/tr'), { recursive: true });
  copyFileSync(ROOT_BUILD, LOCALE_BUILD);

  if (!existsSync(LOCALE_BUILD)) {
    console.error('[build-finance-preview-page] Missing dist/tr/finans-departmani.html after copy');
    process.exit(1);
  }

  console.log('[build-finance-preview-page] Built dist/tr/finans-departmani.html');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildFinancePreviewPage();
}
