import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getEcommerceRdContentSync } from './ecommerce-rd-content-node.mjs';
import {
  ECOMMERCE_RD_LOCALES,
  ECOMMERCE_RD_ROUTES,
  ecommerceRdPathForLocale,
} from '../src/ecommerce-rd-routes.js';
import { argeMenuLabelForLocale } from '../src/pharma-rd-routes.js';
import { ECOMMERCE_RD_PAGE } from '../src/ecommerce-rd-data.js';
import { LOCALES } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

for (const locale of ECOMMERCE_RD_LOCALES) {
  const route = ECOMMERCE_RD_ROUTES[locale];
  const pagePath = resolve(DIST, locale, route.file);
  const content = getEcommerceRdContentSync(locale);

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
  assert(html.includes('id="ecommerce-rd-app"'), `[${locale}] ecommerce-rd-app mount missing`);
}

const trPage = readFileSync(resolve(DIST, 'tr', 'e-ticaret-ar-ge.html'), 'utf8');
const trContent = getEcommerceRdContentSync('tr');
assert(trPage.includes('id="ecommerce-rd-app"'), '[tr] ecommerce-rd-app mount missing');
assert(trContent.page.hero.title === ECOMMERCE_RD_PAGE.hero.title, '[tr] hero title must remain in Turkish source data');
assert(trContent.page.hero.tag === ECOMMERCE_RD_PAGE.hero.tag, '[tr] Turkish hero tag must remain unchanged');

for (const locale of LOCALES) {
  const content = getEcommerceRdContentSync(locale);
  assert(
    content.page.canonicalPath === ecommerceRdPathForLocale(locale),
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
  const ecommercePath = ecommerceRdPathForLocale(locale);

  assert(homeHtml.includes('data-arge-nav'), `[dist/${locale}/index.html] Ar-Ge nav marker missing`);
  assert(homeHtml.includes(navLabel), `[dist/${locale}/index.html] Ar-Ge nav label missing (${navLabel})`);
  assert(homeHtml.includes(`href="${ecommercePath}"`), `[dist/${locale}/index.html] E-Ticaret Ar-Ge nav href missing (${ecommercePath})`);
}

const ecommerceJs = readFileSync(resolve(ROOT, 'src/ecommerce-rd-department.js'), 'utf8');

assert(ecommerceJs.includes('loadEcommerceRdContent'), 'ecommerce-rd-department.js must load locale content');
assert(ecommerceJs.includes("getCurrentLocale('ecommerce-rd')"), 'ecommerce-rd-department.js must use ecommerce-rd page type');
assert(ecommerceJs.includes('detectEcommerceRdLocale'), 'ecommerce-rd-department.js must detect e-commerce R&D locale from path');
assert(ecommerceJs.includes('appendArgeNavItem'), 'ecommerce-rd-department.js must render Ar-Ge nav item');

if (failures.length) {
  console.error('[verify-multilingual-ecommerce-rd-page] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-multilingual-ecommerce-rd-page] Verified 8 locale e-commerce R&D pages');
