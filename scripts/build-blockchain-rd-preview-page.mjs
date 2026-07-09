import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BLOCKCHAIN_RD_LOCALES, BLOCKCHAIN_RD_ROUTES } from '../src/blockchain-rd-routes.js';
import { getBlockchainRdContentSync } from './blockchain-rd-content-node.mjs';
import { escapeHtml } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ROOT_BUILD = resolve(ROOT, 'dist/blockchain-ar-ge.html');

function localizeBlockchainRdShell(html, locale) {
  const content = getBlockchainRdContentSync(locale);
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

export function buildBlockchainRdPreviewPage() {
  const result = spawnSync(
    'npx',
    ['vite', 'build', '--config', 'scripts/blockchain-rd-vite.config.mjs'],
    { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' },
  );

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }

  if (!existsSync(ROOT_BUILD)) {
    console.error('[build-blockchain-rd-preview-page] Missing dist/blockchain-ar-ge.html after build');
    process.exit(1);
  }

  const baseHtml = readFileSync(ROOT_BUILD, 'utf8');

  for (const locale of BLOCKCHAIN_RD_LOCALES) {
    const route = BLOCKCHAIN_RD_ROUTES[locale];
    const outDir = resolve(ROOT, 'dist', locale);
    const outPath = resolve(outDir, route.file);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(outPath, localizeBlockchainRdShell(baseHtml, locale), 'utf8');

    if (!existsSync(outPath)) {
      console.error(`[build-blockchain-rd-preview-page] Missing dist/${locale}/${route.file} after copy`);
      process.exit(1);
    }
  }

  copyFileSync(ROOT_BUILD, resolve(ROOT, 'dist/tr/blockchain-ar-ge.html'));

  console.log(`[build-blockchain-rd-preview-page] Built blockchain R&D pages for ${BLOCKCHAIN_RD_LOCALES.length} locales`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildBlockchainRdPreviewPage();
}
