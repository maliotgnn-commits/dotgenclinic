import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PHARMA_RD_LOCALES, PHARMA_RD_ROUTES } from '../src/pharma-rd-routes.js';
import { getPharmaRdContentSync } from './pharma-rd-content-node.mjs';
import { escapeHtml } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ROOT_BUILD = resolve(ROOT, 'dist/ilac-ar-ge.html');

function localizePharmaRdShell(html, locale) {
  const content = getPharmaRdContentSync(locale);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  let result = html;

  result = result.replace(/<html lang="[^"]*">/, `<html lang="${locale}">`);
  result = result.replace(
    /document\.documentElement\.lang = '[^']*';/,
    `document.documentElement.lang = '${locale}';`,
  );
  result = result.replace(
    /document\.documentElement\.dir = '[^']*';/,
    `document.documentElement.dir = '${dir}';`,
  );
  result = result.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(content.page.title)}</title>`);
  result = result.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${escapeHtml(content.page.description)}" />`,
  );

  return result;
}

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

  const baseHtml = readFileSync(ROOT_BUILD, 'utf8');

  for (const locale of PHARMA_RD_LOCALES) {
    const route = PHARMA_RD_ROUTES[locale];
    const outDir = resolve(ROOT, 'dist', locale);
    const outPath = resolve(outDir, route.file);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(outPath, localizePharmaRdShell(baseHtml, locale), 'utf8');

    if (!existsSync(outPath)) {
      console.error(`[build-pharma-rd-preview-page] Missing dist/${locale}/${route.file} after copy`);
      process.exit(1);
    }
  }

  copyFileSync(ROOT_BUILD, resolve(ROOT, 'dist/tr/ilac-ar-ge.html'));

  console.log(`[build-pharma-rd-preview-page] Built pharma R&D pages for ${PHARMA_RD_LOCALES.length} locales`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildPharmaRdPreviewPage();
}
