import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  FINANCE_DEPARTMENT_PATH,
  FINANCE_NAV_LABEL,
  renderFinanceCorporateNavLink,
} from '../src/tr-finance-nav.js';
import {
  LEGAL_DEPARTMENT_PATH,
  LEGAL_NAV_LABEL,
  renderLegalCorporateNavLink,
} from '../src/tr-legal-nav.js';
import { LEGAL_PAGE } from '../src/legal-data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const PAGE_PATH = resolve(DIST, 'tr', 'hukuk-departmani.html');
const FINANCE_PAGE_PATH = resolve(DIST, 'tr', 'finans-departmani.html');
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
  LEGAL_PAGE.hero.tag,
  LEGAL_PAGE.hero.title,
  LEGAL_PAGE.profile.title,
  LEGAL_PAGE.profile.person.name,
  LEGAL_PAGE.support.title,
  LEGAL_PAGE.process.title,
  LEGAL_PAGE.security.title,
  LEGAL_PAGE.contact.title,
  LEGAL_PAGE.closing.title,
];

const forbiddenPhrases = [
  'Dava kazanılır',
  'Hukuki sonuç garantisi',
  'Kesin çözüm',
  'Tüm talepler kabul edilir',
  'Otomatik işlem yapılır',
  'Her dosya sonuçlandırılır',
  'Her işlem için hukuki danışmanlık sağlanır',
];

assert(existsSync(PAGE_PATH), 'Missing dist/tr/hukuk-departmani.html after build');

const pageHtml = existsSync(PAGE_PATH) ? readFileSync(PAGE_PATH, 'utf8') : '';
const legalJs = readFileSync(resolve(ROOT, 'src/legal-department.js'), 'utf8');
const legalData = readFileSync(resolve(ROOT, 'src/legal-data.js'), 'utf8');
const publicHeaderJs = readFileSync(resolve(ROOT, 'src/public-header.js'), 'utf8');

assert(pageHtml.includes('id="legal-app"'), 'Legal page shell missing legal-app mount point');
assert(pageHtml.includes('hukuk-departmani'), 'Legal page shell missing bundled asset reference');
assert(!/<form[^>]*\baction=/.test(pageHtml), 'Legal form shell must not define an action endpoint');

for (const section of requiredSections) {
  assert(legalData.includes(section), `Missing required section/content in legal source data: ${section}`);
}

for (const phrase of forbiddenPhrases) {
  assert(!legalData.includes(phrase), `Forbidden phrase found in legal source data: ${phrase}`);
}

assert(legalJs.includes('id="legal_contact"'), 'Missing legal_contact section id in legal page source');
assert(legalData.includes('/images/legal_department/asli_karakula.jpg'), 'Missing Asli profile image reference');
assert(existsSync(resolve(DIST, 'images/legal_department/asli_karakula.jpg')), 'Missing built Asli profile image asset');
const legalCss = readFileSync(resolve(ROOT, 'src/legal-department.css'), 'utf8');
assert(legalCss.includes('/images/legal_department/legal_hero_asli.png'), 'Missing legal hero background image reference');
assert(legalCss.includes('background-position: center right'), 'Missing desktop legal hero background positioning');
assert(existsSync(resolve(DIST, 'images/legal_department/legal_hero_asli.png')), 'Missing built legal hero image asset');
assert(legalJs.includes('aria-live="polite"'), 'Missing aria-live preview status region');
assert(legalJs.includes('page.contact.previewMessage'), 'Missing preview form message binding');
assert(legalData.includes('Preview testi kapsamında form gönderimi aktif değildir.'), 'Missing preview form message text');
assert(!/fetch\s*\(|XMLHttpRequest|mailto:|formspree|web3forms/i.test(legalJs), 'Legal page must not include outbound form submission hooks');

const legalLink = renderLegalCorporateNavLink('tr');
assert(legalLink.includes(LEGAL_DEPARTMENT_PATH), 'Legal nav link must target /tr/hukuk-departmani.html');

const trHomeHtml = readDistHtml('tr/index.html');
assert(trHomeHtml, 'Missing dist/tr/index.html for legal nav verification');
if (trHomeHtml) {
  const repsIndex = trHomeHtml.indexOf('Temsilciler');
  const financeIndex = trHomeHtml.indexOf(FINANCE_NAV_LABEL);
  const legalIndex = trHomeHtml.indexOf(LEGAL_NAV_LABEL);
  assert(repsIndex !== -1, 'TR home nav missing Temsilciler');
  assert(financeIndex !== -1, 'TR home nav missing Finans Departmanı');
  assert(legalIndex !== -1, 'TR home nav missing Hukuk Departmanı');
  assert(financeIndex > repsIndex, 'Finans Departmanı must appear after Temsilciler in TR home nav');
  assert(legalIndex > financeIndex, 'Hukuk Departmanı must appear after Finans Departmanı in TR home nav');
  assert(trHomeHtml.includes(`href="${LEGAL_DEPARTMENT_PATH}"`), 'TR home legal nav href incorrect');
  assert(trHomeHtml.includes(`href="${FINANCE_DEPARTMENT_PATH}"`), 'TR home finance nav href must remain correct');
}

assert(legalJs.includes('ld-profile-featured'), 'Profile card layout marker missing in legal page source');
assert(legalData.includes('Av. Aslı Karakula'), 'Missing Asli profile name in legal source data');
assert(legalData.includes('imageAlt: \'Av. Aslı Karakula\''), 'Missing Asli image alt text in legal source data');

assert(
  publicHeaderJs.includes("navMenu.querySelectorAll('.mega-dropdown a, .eh-mobile-topics a')"),
  'Mobile drawer must close on mega-dropdown link navigation',
);
assert(publicHeaderJs.includes('setMobileNavOpen(false)'), 'Mobile drawer close handler missing in public-header');

assert(existsSync(FINANCE_PAGE_PATH), 'Finance preview page must still exist after legal build');
const financePageHtml = readFileSync(FINANCE_PAGE_PATH, 'utf8');
assert(financePageHtml.includes('id="finance-app"'), 'Finance preview page shell must remain intact');
assert(financePageHtml.includes(FINANCE_NAV_LABEL) || readDistHtml('tr/index.html')?.includes(FINANCE_NAV_LABEL), 'Finance nav label must remain available');

const financeLink = renderFinanceCorporateNavLink('tr');
assert(financeLink.includes(FINANCE_DEPARTMENT_PATH), 'Finance nav link must still target /tr/finans-departmani.html');

const forbiddenDiffPaths = [
  'public/robots.txt',
  'vercel.json',
  'vite.config.js',
  'package.json',
  'package-lock.json',
];

const diffNames = spawnSync('git', ['diff', '--name-only', 'origin/main'], {
  cwd: ROOT,
  encoding: 'utf8',
  shell: process.platform === 'win32',
});
const changedFiles = diffNames.status === 0 ? diffNames.stdout.split(/\r?\n/).filter(Boolean) : [];

for (const relativePath of forbiddenDiffPaths) {
  if (changedFiles.includes(relativePath.replace(/\\/g, '/'))) {
    failures.push(`Forbidden file changed from origin/main: ${relativePath}`);
  }
}

const sitemapPath = resolve(DIST, 'sitemap.xml');
if (existsSync(sitemapPath)) {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  assert(!sitemap.includes('hukuk-departmani'), 'Legal preview page must not be added to sitemap');
}

if (failures.length) {
  console.error('[verify-tr-legal-preview-page] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-tr-legal-preview-page] Verified Turkish legal department preview page');
