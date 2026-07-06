import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPharmaRdContentSync } from './pharma-rd-content-node.mjs';
import {
  PHARMA_RD_LOCALES,
  PHARMA_RD_ROUTES,
  argeMenuLabelForLocale,
  pharmaRdPathForLocale,
} from '../src/pharma-rd-routes.js';
import { PHARMA_RD_PAGE } from '../src/pharma-rd-data.js';
import { LOCALES } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

for (const locale of PHARMA_RD_LOCALES) {
  const route = PHARMA_RD_ROUTES[locale];
  const pagePath = resolve(DIST, locale, route.file);
  const content = getPharmaRdContentSync(locale);

  assert(existsSync(pagePath), `Missing dist/${locale}/${route.file}`);
  if (!existsSync(pagePath)) continue;

  const html = readFileSync(pagePath, 'utf8');
  const { page } = content;

  assert(html.includes(`lang="${locale}"`), `[${locale}] lang attribute missing`);
  if (locale === 'ar') {
    assert(html.includes("dir = 'rtl'"), '[ar] dir=rtl bootstrap missing');
  } else {
    assert(html.includes("dir = 'ltr'"), `[${locale}] dir=ltr bootstrap missing`);
  }

  assert(
    html.includes(`<title>${page.title.replace(/&/g, '&amp;')}</title>`) || html.includes(`<title>${page.title}</title>`),
    `[${locale}] title missing`,
  );
  assert(html.includes(page.description) || html.includes(page.description.replace(/&/g, '&amp;')), `[${locale}] description missing`);
  assert(html.includes('id="pharma-rd-app"'), `[${locale}] pharma-rd-app mount missing`);
}

const trPage = readFileSync(resolve(DIST, 'tr', 'ilac-ar-ge.html'), 'utf8');
const trContent = getPharmaRdContentSync('tr');
assert(trPage.includes('id="pharma-rd-app"'), '[tr] pharma-rd-app mount missing');
assert(trContent.page.hero.title === PHARMA_RD_PAGE.hero.title, '[tr] hero title must remain in Turkish source data');
assert(trContent.page.hero.tag === PHARMA_RD_PAGE.hero.tag, '[tr] Turkish hero tag must remain unchanged');

for (const locale of LOCALES) {
  const homePath = resolve(DIST, locale, 'index.html');
  if (!existsSync(homePath)) {
    failures.push(`[dist/${locale}/index.html] missing locale home output`);
    continue;
  }
  const homeHtml = readFileSync(homePath, 'utf8');
  const navLabel = argeMenuLabelForLocale(locale);
  const argePath = pharmaRdPathForLocale(locale);

  assert(homeHtml.includes('data-arge-nav'), `[dist/${locale}/index.html] Ar-Ge nav marker missing`);
  assert(homeHtml.includes(navLabel), `[dist/${locale}/index.html] Ar-Ge nav label missing (${navLabel})`);
  assert(homeHtml.includes(`href="${argePath}"`), `[dist/${locale}/index.html] Ar-Ge nav href missing (${argePath})`);
}

const pharmaJs = readFileSync(resolve(ROOT, 'src/pharma-rd-department.js'), 'utf8');

assert(pharmaJs.includes('loadPharmaRdContent'), 'pharma-rd-department.js must load locale content');
assert(pharmaJs.includes("getCurrentLocale('pharma-rd')"), 'pharma-rd-department.js must use pharma-rd page type');
assert(pharmaJs.includes('detectPharmaRdLocale'), 'pharma-rd-department.js must detect pharma R&D locale from path');
assert(pharmaJs.includes('appendArgeNavItem'), 'pharma-rd-department.js must render Ar-Ge nav item');
assert(!pharmaJs.includes('pr-hero-partner-logo'), 'Hero panel must not render a duplicate partner logo');

if (failures.length) {
  console.error('[verify-multilingual-pharma-rd-page] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-multilingual-pharma-rd-page] Verified 8 locale pharma R&D pages');
