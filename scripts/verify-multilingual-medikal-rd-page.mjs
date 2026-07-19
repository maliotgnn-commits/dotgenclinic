import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getMedikalRdContentSync } from './medikal-rd-content-node.mjs';
import {
  MEDIKAL_RD_LOCALES,
  MEDIKAL_RD_ROUTES,
  medikalRdPathForLocale,
} from '../src/medikal-rd-routes.js';
import { argeMenuLabelForLocale } from '../src/pharma-rd-routes.js';
import { MEDIKAL_RD_PAGE } from '../src/medikal-rd-data.js';
import { LOCALES } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

for (const locale of MEDIKAL_RD_LOCALES) {
  const route = MEDIKAL_RD_ROUTES[locale];
  const pagePath = resolve(DIST, locale, route.file);
  const content = getMedikalRdContentSync(locale);

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
  assert(html.includes('id="medikal-rd-app"'), `[${locale}] medikal-rd-app mount missing`);
}

const trPage = readFileSync(resolve(DIST, 'tr', 'medikal-ar-ge.html'), 'utf8');
const trContent = getMedikalRdContentSync('tr');
assert(trPage.includes('id="medikal-rd-app"'), '[tr] medikal-rd-app mount missing');
assert(trContent.page.hero.title === MEDIKAL_RD_PAGE.hero.title, '[tr] hero title must remain in Turkish source data');
assert(trContent.page.hero.tag === MEDIKAL_RD_PAGE.hero.tag, '[tr] Turkish hero tag must remain unchanged');

for (const locale of LOCALES) {
  const content = getMedikalRdContentSync(locale);
  assert(
    content.page.canonicalPath === medikalRdPathForLocale(locale),
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
  const medikalPath = medikalRdPathForLocale(locale);

  assert(homeHtml.includes('data-arge-nav'), `[dist/${locale}/index.html] Ar-Ge nav marker missing`);
  assert(homeHtml.includes(navLabel), `[dist/${locale}/index.html] Ar-Ge nav label missing (${navLabel})`);
  assert(homeHtml.includes(`href="${medikalPath}"`), `[dist/${locale}/index.html] Medikal Ar-Ge nav href missing (${medikalPath})`);
}

const medikalJs = readFileSync(resolve(ROOT, 'src/medikal-rd-department.js'), 'utf8');

assert(medikalJs.includes('loadMedikalRdContent'), 'medikal-rd-department.js must load locale content');
assert(medikalJs.includes("getCurrentLocale('medikal-rd')"), 'medikal-rd-department.js must use medikal-rd page type');
assert(medikalJs.includes('detectMedikalRdLocale'), 'medikal-rd-department.js must detect medical R&D locale from path');
assert(medikalJs.includes('appendArgeNavItem'), 'medikal-rd-department.js must render Ar-Ge nav item');

if (failures.length) {
  console.error('[verify-multilingual-medikal-rd-page] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-multilingual-medikal-rd-page] Verified 8 locale medical R&D pages');
