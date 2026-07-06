import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MEDIKAL_RD_LOCALES, MEDIKAL_RD_ROUTES } from '../src/medikal-rd-routes.js';
import { getMedikalRdContentSync } from './medikal-rd-content-node.mjs';
import { escapeHtml } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ROOT_BUILD = resolve(ROOT, 'dist/medikal-ar-ge.html');

function localizeMedikalRdShell(html, locale) {
  const content = getMedikalRdContentSync(locale);
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

export function buildMedikalRdPreviewPage() {
  const result = spawnSync(
    'npx',
    ['vite', 'build', '--config', 'scripts/medikal-rd-vite.config.mjs'],
    { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' },
  );

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }

  if (!existsSync(ROOT_BUILD)) {
    console.error('[build-medikal-rd-preview-page] Missing dist/medikal-ar-ge.html after build');
    process.exit(1);
  }

  const baseHtml = readFileSync(ROOT_BUILD, 'utf8');

  for (const locale of MEDIKAL_RD_LOCALES) {
    const route = MEDIKAL_RD_ROUTES[locale];
    const outDir = resolve(ROOT, 'dist', locale);
    const outPath = resolve(outDir, route.file);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(outPath, localizeMedikalRdShell(baseHtml, locale), 'utf8');

    if (!existsSync(outPath)) {
      console.error(`[build-medikal-rd-preview-page] Missing dist/${locale}/${route.file} after copy`);
      process.exit(1);
    }
  }

  copyFileSync(ROOT_BUILD, resolve(ROOT, 'dist/tr/medikal-ar-ge.html'));

  console.log(`[build-medikal-rd-preview-page] Built medical R&D pages for ${MEDIKAL_RD_LOCALES.length} locales`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildMedikalRdPreviewPage();
}
