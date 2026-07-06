import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PHARMA_RD_PAGE } from '../src/pharma-rd-data.js';
import {
  ARGE_LANDING_PATH,
  ARGE_NAV_LABEL,
  renderArgeNavItem,
} from '../src/tr-arge-nav.js';
import { argePagesForLocale } from '../src/arge-routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const PAGE_PATH = resolve(DIST, 'tr/ilac-ar-ge.html');
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
  PHARMA_RD_PAGE.hero.tag,
  PHARMA_RD_PAGE.hero.title,
  PHARMA_RD_PAGE.hero.subtitle,
  PHARMA_RD_PAGE.hero.lead,
  PHARMA_RD_PAGE.sectionName,
  PHARMA_RD_PAGE.vision.title,
  PHARMA_RD_PAGE.focusAreas.title,
  PHARMA_RD_PAGE.clinical.title,
  PHARMA_RD_PAGE.standards.title,
  PHARMA_RD_PAGE.cooperation.title,
  PHARMA_RD_PAGE.closing.quote,
];

assert(existsSync(PAGE_PATH), 'Missing dist/tr/ilac-ar-ge.html after build');

const pageHtml = existsSync(PAGE_PATH) ? readFileSync(PAGE_PATH, 'utf8') : '';
const pharmaJs = readFileSync(resolve(ROOT, 'src/pharma-rd-department.js'), 'utf8');
const pharmaData = readFileSync(resolve(ROOT, 'src/pharma-rd-data.js'), 'utf8');
const pharmaCss = readFileSync(resolve(ROOT, 'src/pharma-rd-department.css'), 'utf8');

assert(pageHtml.includes('id="pharma-rd-app"'), 'Pharma R&D page shell missing pharma-rd-app mount point');
assert(pageHtml.includes('ilac-ar-ge'), 'Pharma R&D page shell missing bundled asset reference');

for (const section of requiredSections) {
  assert(pharmaData.includes(section), `Missing required section/content in pharma R&D source data: ${section}`);
}

assert(pharmaCss.includes('/images/pharma_rd/pharma_rd_hero.png'), 'Missing pharma R&D hero background image reference');
assert(existsSync(resolve(DIST, 'images/pharma_rd/pharma_rd_hero.png')), 'Missing built pharma R&D hero image asset');
assert(!pharmaJs.includes('pr-hero-partner-logo'), 'Hero panel must not render a duplicate partner logo');
assert(pharmaJs.includes("getCurrentLocale('pharma-rd')"), 'pharma-rd-department.js must use pharma-rd page type');
assert(pharmaJs.includes('loadPharmaRdContent'), 'pharma-rd-department.js must load locale content');
assert(pharmaJs.includes('detectPharmaRdLocale'), 'pharma-rd-department.js must detect pharma R&D locale from path');
assert(pharmaJs.includes('appendArgeNavItem'), 'pharma-rd-department.js must render Ar-Ge nav item');

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
  const eyeIndex = trHomeHtml.indexOf('Göz Hastalıkları');
  const argeIndex = trHomeHtml.indexOf(ARGE_NAV_LABEL);
  assert(eyeIndex !== -1, 'TR home nav missing Göz Hastalıkları');
  assert(argeIndex !== -1, 'TR home nav missing Ar-Ge');
  assert(argeIndex > eyeIndex, 'Ar-Ge must appear after Göz Hastalıkları in TR home nav');
  assert(trHomeHtml.includes(`href="${ARGE_LANDING_PATH}"`), 'TR home Ar-Ge nav href incorrect');
  assert(trHomeHtml.includes('data-arge-nav'), 'TR home Ar-Ge nav marker missing');
  assert(trHomeHtml.includes('data-arge-page-link="ilac-ar-ge"'), 'TR home Ar-Ge submenu missing İlaç Ar-Ge page link');
  assert(trHomeHtml.includes('İlaç Ar-Ge'), 'TR home Ar-Ge submenu missing İlaç Ar-Ge label');
  assert(trHomeHtml.includes('data-arge-page-link="medikal-ar-ge"'), 'TR home Ar-Ge submenu missing Medikal Ar-Ge page link');
  assert(trHomeHtml.includes('Medikal Ar-Ge'), 'TR home Ar-Ge submenu missing Medikal Ar-Ge label');
}

if (failures.length) {
  console.error('[verify-tr-pharma-rd-page] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-tr-pharma-rd-page] Verified Turkish pharma R&D page');
