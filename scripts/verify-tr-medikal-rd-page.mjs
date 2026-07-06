import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MEDIKAL_RD_PAGE } from '../src/medikal-rd-data.js';
import {
  ARGE_LANDING_PATH,
  ARGE_NAV_LABEL,
  renderArgeNavItem,
} from '../src/tr-arge-nav.js';
import { argePagesForLocale } from '../src/arge-routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const PAGE_PATH = resolve(DIST, 'tr/medikal-ar-ge.html');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function readDistHtml(relativePath) {
  const fullPath = resolve(DIST, relativePath);
  if (!existsSync(fullPath)) return null;
  return readFileSync(fullPath, 'utf8');
}

const requiredSections = [
  MEDIKAL_RD_PAGE.hero.tag,
  MEDIKAL_RD_PAGE.hero.title,
  MEDIKAL_RD_PAGE.hero.subtitle,
  MEDIKAL_RD_PAGE.hero.lead,
  MEDIKAL_RD_PAGE.sectionName,
  MEDIKAL_RD_PAGE.intro.title,
  MEDIKAL_RD_PAGE.focusAreas.title,
  MEDIKAL_RD_PAGE.closing.quote,
];

assert(existsSync(PAGE_PATH), 'Missing dist/tr/medikal-ar-ge.html after build');

const pageHtml = existsSync(PAGE_PATH) ? readFileSync(PAGE_PATH, 'utf8') : '';
const medikalJs = readFileSync(resolve(ROOT, 'src/medikal-rd-department.js'), 'utf8');
const medikalData = readFileSync(resolve(ROOT, 'src/medikal-rd-data.js'), 'utf8');
const medikalCss = readFileSync(resolve(ROOT, 'src/medikal-rd-department.css'), 'utf8');

assert(pageHtml.includes('id="medikal-rd-app"'), 'Medical R&D page shell missing medikal-rd-app mount point');
assert(pageHtml.includes('medikal-ar-ge'), 'Medical R&D page shell missing bundled asset reference');

for (const section of requiredSections) {
  assert(medikalData.includes(section), `Missing required section/content in medical R&D source data: ${section}`);
}

assert(medikalCss.includes('/images/medikal_rd/medikal_rd_hero.png'), 'Missing medical R&D hero background image reference');
assert(existsSync(resolve(DIST, 'images/medikal_rd/medikal_rd_hero.png')), 'Missing built medical R&D hero image asset');
assert(medikalJs.includes("getCurrentLocale('medikal-rd')"), 'medikal-rd-department.js must use medikal-rd page type');
assert(medikalJs.includes('loadMedikalRdContent'), 'medikal-rd-department.js must load locale content');
assert(medikalJs.includes('detectMedikalRdLocale'), 'medikal-rd-department.js must detect medical R&D locale from path');
assert(medikalJs.includes('appendArgeNavItem'), 'medikal-rd-department.js must render Ar-Ge nav item');

const navItem = renderArgeNavItem('tr');
assert(navItem.includes(ARGE_LANDING_PATH), 'Ar-Ge nav must target /tr/ilac-ar-ge.html landing path');
assert(navItem.includes('data-arge-nav'), 'Ar-Ge nav marker missing');
assert(navItem.includes(ARGE_NAV_LABEL), 'Ar-Ge nav label missing');

for (const page of argePagesForLocale('tr')) {
  assert(navItem.includes(`href="${page.path}"`), `Ar-Ge nav missing link for ${page.navLabel}`);
  assert(navItem.includes(page.navLabel), `Ar-Ge nav missing label for ${page.navLabel}`);
}

const trHomeHtml = readDistHtml('tr/index.html');
assert(trHomeHtml, 'Missing dist/tr/index.html for Ar-Ge nav verification');
if (trHomeHtml) {
  assert(trHomeHtml.includes('data-arge-page-link="medikal-ar-ge"'), 'TR home Ar-Ge submenu missing Medikal Ar-Ge page link');
  assert(trHomeHtml.includes('Medikal Ar-Ge'), 'TR home Ar-Ge submenu missing Medikal Ar-Ge label');
}

if (failures.length) {
  console.error('[verify-tr-medikal-rd-page] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-tr-medikal-rd-page] Verified Turkish medical R&D page');
