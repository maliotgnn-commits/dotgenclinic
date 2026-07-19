import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { YAZILIM_RD_PAGE } from '../src/yazilim-rd-data.js';
import {
  ARGE_LANDING_PATH,
  ARGE_NAV_LABEL,
  renderArgeNavItem,
} from '../src/tr-arge-nav.js';
import { argePagesForLocale } from '../src/arge-routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const PAGE_PATH = resolve(DIST, 'tr/yazilim-ar-ge.html');
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
  YAZILIM_RD_PAGE.hero.tag,
  YAZILIM_RD_PAGE.hero.title,
  YAZILIM_RD_PAGE.hero.subtitle,
  YAZILIM_RD_PAGE.hero.lead,
  YAZILIM_RD_PAGE.sectionName,
  YAZILIM_RD_PAGE.intro.title,
  YAZILIM_RD_PAGE.focusAreas.title,
  YAZILIM_RD_PAGE.closing.quote,
];

assert(existsSync(PAGE_PATH), 'Missing dist/tr/yazilim-ar-ge.html after build');

const pageHtml = existsSync(PAGE_PATH) ? readFileSync(PAGE_PATH, 'utf8') : '';
const yazilimJs = readFileSync(resolve(ROOT, 'src/yazilim-rd-department.js'), 'utf8');
const yazilimData = readFileSync(resolve(ROOT, 'src/yazilim-rd-data.js'), 'utf8');

assert(pageHtml.includes('id="yazilim-rd-app"'), 'Software R&D page shell missing yazilim-rd-app mount point');
assert(pageHtml.includes('yazilim-ar-ge'), 'Software R&D page shell missing bundled asset reference');

for (const section of requiredSections) {
  assert(yazilimData.includes(section), `Missing required section/content in software R&D source data: ${section}`);
}

assert(yazilimData.includes('/images/yazilim_rd/yazilim_rd_hero.webp'), 'Missing software R&D hero background image reference');
assert(existsSync(resolve(DIST, 'images/yazilim_rd/yazilim_rd_hero.webp')), 'Missing built software R&D hero image asset');
assert(yazilimJs.includes("getCurrentLocale('yazilim-rd')"), 'yazilim-rd-department.js must use yazilim-rd page type');
assert(yazilimJs.includes('loadYazilimRdContent'), 'yazilim-rd-department.js must load locale content');
assert(yazilimJs.includes('detectYazilimRdLocale'), 'yazilim-rd-department.js must detect software R&D locale from path');
assert(yazilimJs.includes('appendArgeNavItem'), 'yazilim-rd-department.js must render Ar-Ge nav item');

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
  assert(trHomeHtml.includes('data-arge-page-link="yazilim-ar-ge"'), 'TR home Ar-Ge submenu missing Yazılım Ar-Ge page link');
  assert(trHomeHtml.includes('Yazılım Ar-Ge'), 'TR home Ar-Ge submenu missing Yazılım Ar-Ge label');
}

if (failures.length) {
  console.error('[verify-tr-yazilim-rd-page] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-tr-yazilim-rd-page] Verified Turkish software R&D page');
