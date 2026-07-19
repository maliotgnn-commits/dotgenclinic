import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getYazilimRdContentSync } from './yazilim-rd-content-node.mjs';
import {
  YAZILIM_RD_LOCALES,
  YAZILIM_RD_ROUTES,
  yazilimRdPathForLocale,
} from '../src/yazilim-rd-routes.js';
import { argeMenuLabelForLocale } from '../src/pharma-rd-routes.js';
import { YAZILIM_RD_PAGE } from '../src/yazilim-rd-data.js';
import { LOCALES } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

for (const locale of YAZILIM_RD_LOCALES) {
  const route = YAZILIM_RD_ROUTES[locale];
  const pagePath = resolve(DIST, locale, route.file);
  const content = getYazilimRdContentSync(locale);

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
  assert(html.includes('id="yazilim-rd-app"'), `[${locale}] yazilim-rd-app mount missing`);
}

const trPage = readFileSync(resolve(DIST, 'tr', 'yazilim-ar-ge.html'), 'utf8');
const trContent = getYazilimRdContentSync('tr');
assert(trPage.includes('id="yazilim-rd-app"'), '[tr] yazilim-rd-app mount missing');
assert(trContent.page.hero.title === YAZILIM_RD_PAGE.hero.title, '[tr] hero title must remain in Turkish source data');
assert(trContent.page.hero.tag === YAZILIM_RD_PAGE.hero.tag, '[tr] Turkish hero tag must remain unchanged');

for (const locale of LOCALES) {
  const content = getYazilimRdContentSync(locale);
  assert(
    content.page.canonicalPath === yazilimRdPathForLocale(locale),
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
  const yazilimPath = yazilimRdPathForLocale(locale);

  assert(homeHtml.includes('data-arge-nav'), `[dist/${locale}/index.html] Ar-Ge nav marker missing`);
  assert(homeHtml.includes(navLabel), `[dist/${locale}/index.html] Ar-Ge nav label missing (${navLabel})`);
  assert(homeHtml.includes(`href="${yazilimPath}"`), `[dist/${locale}/index.html] Yazılım Ar-Ge nav href missing (${yazilimPath})`);
}

const yazilimJs = readFileSync(resolve(ROOT, 'src/yazilim-rd-department.js'), 'utf8');

assert(yazilimJs.includes('loadYazilimRdContent'), 'yazilim-rd-department.js must load locale content');
assert(yazilimJs.includes("getCurrentLocale('yazilim-rd')"), 'yazilim-rd-department.js must use yazilim-rd page type');
assert(yazilimJs.includes('detectYazilimRdLocale'), 'yazilim-rd-department.js must detect software R&D locale from path');
assert(yazilimJs.includes('appendArgeNavItem'), 'yazilim-rd-department.js must render Ar-Ge nav item');

if (failures.length) {
  console.error('[verify-multilingual-yazilim-rd-page] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-multilingual-yazilim-rd-page] Verified 8 locale software R&D pages');
