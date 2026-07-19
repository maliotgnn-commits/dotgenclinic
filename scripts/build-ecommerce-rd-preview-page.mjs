import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ECOMMERCE_RD_LOCALES, ECOMMERCE_RD_ROUTES } from '../src/ecommerce-rd-routes.js';
import { getEcommerceRdContentSync } from './ecommerce-rd-content-node.mjs';
import { escapeHtml } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ROOT_BUILD = resolve(ROOT, 'dist/e-ticaret-ar-ge.html');

function localizeEcommerceRdShell(html, locale) {
  const content = getEcommerceRdContentSync(locale);
  let result = html;

  result = result.replace(/<html lang="[^"]*">/, `<html lang="${locale}">`);
  result = result.replace('src="/tr-locale-bootstrap.js"', 'src="/locale-bootstrap.js"');
  result = result.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(content.page.title)}</title>`);
  result = result.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${escapeHtml(content.page.description)}" />`,
  );

  return result;
}

export function buildEcommerceRdPreviewPage() {
  const result = spawnSync(
    'npx',
    ['vite', 'build', '--config', 'scripts/ecommerce-rd-vite.config.mjs'],
    { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' },
  );

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }

  if (!existsSync(ROOT_BUILD)) {
    console.error('[build-ecommerce-rd-preview-page] Missing dist/e-ticaret-ar-ge.html after build');
    process.exit(1);
  }

  const baseHtml = readFileSync(ROOT_BUILD, 'utf8');

  for (const locale of ECOMMERCE_RD_LOCALES) {
    const route = ECOMMERCE_RD_ROUTES[locale];
    const outDir = resolve(ROOT, 'dist', locale);
    const outPath = resolve(outDir, route.file);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(outPath, localizeEcommerceRdShell(baseHtml, locale), 'utf8');

    if (!existsSync(outPath)) {
      console.error(`[build-ecommerce-rd-preview-page] Missing dist/${locale}/${route.file} after copy`);
      process.exit(1);
    }
  }

  copyFileSync(ROOT_BUILD, resolve(ROOT, 'dist/tr/e-ticaret-ar-ge.html'));

  console.log(`[build-ecommerce-rd-preview-page] Built e-commerce R&D pages for ${ECOMMERCE_RD_LOCALES.length} locales`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildEcommerceRdPreviewPage();
}
