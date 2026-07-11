import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ECOMMERCE_RD_PAGE } from '../src/ecommerce-rd-data.js';
import {
  ARGE_LANDING_PATH,
  ARGE_NAV_LABEL,
  renderArgeNavItem,
} from '../src/tr-arge-nav.js';
import { argePagesForLocale } from '../src/arge-routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const PAGE_PATH = resolve(DIST, 'tr/e-ticaret-ar-ge.html');
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
  ECOMMERCE_RD_PAGE.hero.tag,
  ECOMMERCE_RD_PAGE.hero.title,
  ECOMMERCE_RD_PAGE.hero.subtitle,
  ECOMMERCE_RD_PAGE.hero.lead,
  ECOMMERCE_RD_PAGE.sectionName,
  ECOMMERCE_RD_PAGE.intro.title,
  ECOMMERCE_RD_PAGE.sections[0].title,
  ECOMMERCE_RD_PAGE.sections[1].title,
  ECOMMERCE_RD_PAGE.focusAreas.title,
  ECOMMERCE_RD_PAGE.closing.quote,
];

assert(existsSync(PAGE_PATH), 'Missing dist/tr/e-ticaret-ar-ge.html after build');

const pageHtml = existsSync(PAGE_PATH) ? readFileSync(PAGE_PATH, 'utf8') : '';
const ecommerceJs = readFileSync(resolve(ROOT, 'src/ecommerce-rd-department.js'), 'utf8');
const ecommerceData = readFileSync(resolve(ROOT, 'src/ecommerce-rd-data.js'), 'utf8');

assert(pageHtml.includes('id="ecommerce-rd-app"'), 'E-commerce R&D page shell missing ecommerce-rd-app mount point');
assert(pageHtml.includes('e-ticaret-ar-ge'), 'E-commerce R&D page shell missing bundled asset reference');

for (const section of requiredSections) {
  assert(ecommerceData.includes(section), `Missing required section/content in e-commerce R&D source data: ${section}`);
}

assert(ecommerceData.includes('/images/ecommerce_rd/ecommerce_rd_hero.webp'), 'Missing e-commerce R&D hero background image reference');
assert(existsSync(resolve(DIST, 'images/ecommerce_rd/ecommerce_rd_hero.webp')), 'Missing built e-commerce R&D hero image asset');
assert(ecommerceJs.includes("getCurrentLocale('ecommerce-rd')"), 'ecommerce-rd-department.js must use ecommerce-rd page type');
assert(ecommerceJs.includes('loadEcommerceRdContent'), 'ecommerce-rd-department.js must load locale content');
assert(ecommerceJs.includes('detectEcommerceRdLocale'), 'ecommerce-rd-department.js must detect e-commerce R&D locale from path');
assert(ecommerceJs.includes('appendArgeNavItem'), 'ecommerce-rd-department.js must render Ar-Ge nav item');

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
  assert(trHomeHtml.includes('data-arge-page-link="e-ticaret-ar-ge"'), 'TR home Ar-Ge submenu missing E-Ticaret Ar-Ge page link');
  assert(trHomeHtml.includes('E-Ticaret Ar-Ge'), 'TR home Ar-Ge submenu missing E-Ticaret Ar-Ge label');
}

if (failures.length) {
  console.error('[verify-tr-ecommerce-rd-page] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-tr-ecommerce-rd-page] Verified Turkish e-commerce R&D page');
