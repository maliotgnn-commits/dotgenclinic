import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FINANCE_LOCALES, FINANCE_ROUTES } from '../src/finance-routes.js';
import { getFinanceContentSync } from './finance-content-node.mjs';
import { escapeHtml } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ROOT_BUILD = resolve(ROOT, 'dist/finans-departmani.html');

function localizeFinanceShell(html, locale) {
  const content = getFinanceContentSync(locale);
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

  const baseHtml = readFileSync(ROOT_BUILD, 'utf8');

  for (const locale of FINANCE_LOCALES) {
    const route = FINANCE_ROUTES[locale];
    const outDir = resolve(ROOT, 'dist', locale);
    const outPath = resolve(outDir, route.file);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(outPath, localizeFinanceShell(baseHtml, locale), 'utf8');

    if (!existsSync(outPath)) {
      console.error(`[build-finance-preview-page] Missing dist/${locale}/${route.file} after copy`);
      process.exit(1);
    }
  }

  copyFileSync(ROOT_BUILD, resolve(ROOT, 'dist/tr/finans-departmani.html'));

  console.log(`[build-finance-preview-page] Built finance pages for ${FINANCE_LOCALES.length} locales`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildFinancePreviewPage();
}
