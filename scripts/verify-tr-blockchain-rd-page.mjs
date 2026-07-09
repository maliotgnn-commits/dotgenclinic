import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BLOCKCHAIN_RD_PAGE } from '../src/blockchain-rd-data.js';
import {
  ARGE_LANDING_PATH,
  ARGE_NAV_LABEL,
  renderArgeNavItem,
} from '../src/tr-arge-nav.js';
import { argePagesForLocale } from '../src/arge-routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const PAGE_PATH = resolve(DIST, 'tr/blockchain-ar-ge.html');
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
  BLOCKCHAIN_RD_PAGE.hero.tag,
  BLOCKCHAIN_RD_PAGE.hero.title,
  BLOCKCHAIN_RD_PAGE.hero.subtitle,
  BLOCKCHAIN_RD_PAGE.hero.lead,
  BLOCKCHAIN_RD_PAGE.sectionName,
  BLOCKCHAIN_RD_PAGE.intro.title,
  BLOCKCHAIN_RD_PAGE.focusAreas.title,
  BLOCKCHAIN_RD_PAGE.closing.quote,
];

assert(existsSync(PAGE_PATH), 'Missing dist/tr/blockchain-ar-ge.html after build');

const pageHtml = existsSync(PAGE_PATH) ? readFileSync(PAGE_PATH, 'utf8') : '';
const blockchainJs = readFileSync(resolve(ROOT, 'src/blockchain-rd-department.js'), 'utf8');
const blockchainData = readFileSync(resolve(ROOT, 'src/blockchain-rd-data.js'), 'utf8');

assert(pageHtml.includes('id="blockchain-rd-app"'), 'Blockchain R&D page shell missing blockchain-rd-app mount point');
assert(pageHtml.includes('blockchain-ar-ge'), 'Blockchain R&D page shell missing bundled asset reference');

for (const section of requiredSections) {
  assert(blockchainData.includes(section), `Missing required section/content in blockchain R&D source data: ${section}`);
}

assert(blockchainData.includes('/images/blockchain_rd/blockchain_rd_hero.png'), 'Missing blockchain R&D hero background image reference');
assert(existsSync(resolve(DIST, 'images/blockchain_rd/blockchain_rd_hero.png')), 'Missing built blockchain R&D hero image asset');
assert(blockchainJs.includes("getCurrentLocale('blockchain-rd')"), 'blockchain-rd-department.js must use blockchain-rd page type');
assert(blockchainJs.includes('loadBlockchainRdContent'), 'blockchain-rd-department.js must load locale content');
assert(blockchainJs.includes('detectBlockchainRdLocale'), 'blockchain-rd-department.js must detect blockchain R&D locale from path');
assert(blockchainJs.includes('appendArgeNavItem'), 'blockchain-rd-department.js must render Ar-Ge nav item');

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
  assert(trHomeHtml.includes('data-arge-page-link="blockchain-ar-ge"'), 'TR home Ar-Ge submenu missing Blockchain Ar-Ge page link');
  assert(trHomeHtml.includes('Blockchain Ar-Ge'), 'TR home Ar-Ge submenu missing Blockchain Ar-Ge label');
}

if (failures.length) {
  console.error('[verify-tr-blockchain-rd-page] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-tr-blockchain-rd-page] Verified Turkish blockchain R&D page');
