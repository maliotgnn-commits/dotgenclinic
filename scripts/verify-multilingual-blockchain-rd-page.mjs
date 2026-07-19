import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getBlockchainRdContentSync } from './blockchain-rd-content-node.mjs';
import {
  BLOCKCHAIN_RD_LOCALES,
  BLOCKCHAIN_RD_ROUTES,
  blockchainRdPathForLocale,
} from '../src/blockchain-rd-routes.js';
import { argeMenuLabelForLocale } from '../src/pharma-rd-routes.js';
import { BLOCKCHAIN_RD_PAGE } from '../src/blockchain-rd-data.js';
import { LOCALES } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

for (const locale of BLOCKCHAIN_RD_LOCALES) {
  const route = BLOCKCHAIN_RD_ROUTES[locale];
  const pagePath = resolve(DIST, locale, route.file);
  const content = getBlockchainRdContentSync(locale);

  assert(existsSync(pagePath), `[${locale}] Missing dist/${locale}/${route.file}`);
  if (!existsSync(pagePath)) continue;

  const html = readFileSync(pagePath, 'utf8');
  const { page } = content;

  assert(html.includes(`lang="${locale}"`), `[${locale}] lang attribute missing`);
  const expectedBootstrap = locale === 'tr' ? 'src="/tr-locale-bootstrap.js"' : 'src="/locale-bootstrap.js"';
  assert(html.includes(expectedBootstrap), `[${locale}] locale bootstrap missing`);

  assert(
    html.includes(`<title>${page.title.replace(/&/g, '&amp;')}</title>`) || html.includes(`<title>${page.title}</title>`),
    `[${locale}] title missing`,
  );
  assert(
    html.includes(page.description) || html.includes(page.description.replace(/&/g, '&amp;')),
    `[${locale}] description missing`,
  );
  assert(html.includes('id="blockchain-rd-app"'), `[${locale}] blockchain-rd-app mount missing`);
}

const trPage = readFileSync(resolve(DIST, 'tr', 'blockchain-ar-ge.html'), 'utf8');
const trContent = getBlockchainRdContentSync('tr');
assert(trPage.includes('id="blockchain-rd-app"'), '[tr] blockchain-rd-app mount missing');
assert(trContent.page.hero.title === BLOCKCHAIN_RD_PAGE.hero.title, '[tr] hero title must remain in Turkish source data');
assert(trContent.page.hero.tag === BLOCKCHAIN_RD_PAGE.hero.tag, '[tr] Turkish hero tag must remain unchanged');

for (const locale of LOCALES) {
  const content = getBlockchainRdContentSync(locale);
  assert(
    content.page.canonicalPath === blockchainRdPathForLocale(locale),
    `[${locale}] canonicalPath mismatch`,
  );
}

for (const locale of LOCALES) {
  const homePath = resolve(DIST, locale, 'index.html');
  if (!existsSync(homePath)) {
    failures.push(`[dist/${locale}/index.html] missing locale home output`);
    continue;
  }
  const homeHtml = readFileSync(homePath, 'utf8');
  const navLabel = argeMenuLabelForLocale(locale);
  const blockchainPath = blockchainRdPathForLocale(locale);

  assert(homeHtml.includes('data-arge-nav'), `[dist/${locale}/index.html] Ar-Ge nav marker missing`);
  assert(homeHtml.includes(navLabel), `[dist/${locale}/index.html] Ar-Ge nav label missing (${navLabel})`);
  assert(homeHtml.includes(`href="${blockchainPath}"`), `[dist/${locale}/index.html] Blockchain Ar-Ge nav href missing (${blockchainPath})`);
}

const blockchainJs = readFileSync(resolve(ROOT, 'src/blockchain-rd-department.js'), 'utf8');

assert(blockchainJs.includes('loadBlockchainRdContent'), 'blockchain-rd-department.js must load locale content');
assert(blockchainJs.includes("getCurrentLocale('blockchain-rd')"), 'blockchain-rd-department.js must use blockchain-rd page type');
assert(blockchainJs.includes('detectBlockchainRdLocale'), 'blockchain-rd-department.js must detect blockchain R&D locale from path');
assert(blockchainJs.includes('appendArgeNavItem'), 'blockchain-rd-department.js must render Ar-Ge nav item');

if (failures.length) {
  console.error('[verify-multilingual-blockchain-rd-page] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-multilingual-blockchain-rd-page] Verified 8 locale blockchain R&D pages');
