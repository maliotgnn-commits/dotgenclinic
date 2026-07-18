import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  FINANCE_DEPARTMENT_PATH,
  FINANCE_NAV_LABEL,
  renderFinanceCorporateNavLink,
} from '../src/tr-finance-nav.js';
import { FINANCE_PAGE } from '../src/finance-data.js';
import { LOCALES, DEFAULT_LOCALE } from './seo-shared.mjs';
import { financeNavLabelForLocale, financePathForLocale } from '../src/finance-routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const PAGE_PATH = resolve(DIST, 'tr', 'finans-departmani.html');
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
  FINANCE_PAGE.hero.tag,
  FINANCE_PAGE.hero.title,
  FINANCE_PAGE.profiles.title,
  'Ahmet ÖTGEN',
  'Zehra ÖTGEN',
  FINANCE_PAGE.tourism.title,
  FINANCE_PAGE.tourism.highlight.title,
  FINANCE_PAGE.support.title,
  FINANCE_PAGE.process.title,
  FINANCE_PAGE.security.title,
  FINANCE_PAGE.contact.title,
  FINANCE_PAGE.closing.title,
];

const forbiddenPhrases = [
  'İade alınır',
  'Kesin iade',
  'Garantili sonuç',
  'Her işlemde geçerli',
  'Otomatik iade',
];

assert(existsSync(PAGE_PATH), 'Missing dist/tr/finans-departmani.html after build');

const pageHtml = existsSync(PAGE_PATH) ? readFileSync(PAGE_PATH, 'utf8') : '';
const financeJs = readFileSync(resolve(ROOT, 'src/finance-department.js'), 'utf8');
const financeData = readFileSync(resolve(ROOT, 'src/finance-data.js'), 'utf8');

assert(pageHtml.includes('id="finance-app"'), 'Finance page shell missing finance-app mount point');
assert(pageHtml.includes('finans-departmani'), 'Finance page shell missing bundled asset reference');
assert(!/<form[^>]*\baction=/.test(pageHtml), 'Finance form shell must not define an action endpoint');

for (const section of requiredSections) {
  assert(financeData.includes(section), `Missing required section/content in finance source data: ${section}`);
}

for (const phrase of forbiddenPhrases) {
  assert(!financeData.includes(phrase), `Forbidden phrase found in finance source data: ${phrase}`);
}

assert(financeJs.includes('id="finance_contact"'), 'Missing finance_contact section id in finance page source');
assert(financeData.includes('/images/finance_department/ahmet_otgen_finance.jpg'), 'Missing Ahmet profile image reference');
assert(financeData.includes('/images/finance_department/zehra_otgen_finance.jpg'), 'Missing Zehra profile image reference');
assert(existsSync(resolve(DIST, 'images/finance_department/ahmet_otgen_finance.jpg')), 'Missing built Ahmet image asset');
assert(existsSync(resolve(DIST, 'images/finance_department/zehra_otgen_finance.jpg')), 'Missing built Zehra image asset');
assert(existsSync(resolve(DIST, 'images/finance_department/finance_hero_zehra.webp')), 'Missing built finance hero image asset');
const financeCss = readFileSync(resolve(ROOT, 'src/finance-department.css'), 'utf8');
assert(financeCss.includes('/images/finance_department/finance_hero_zehra.webp'), 'Missing finance hero background image reference');
assert(financeCss.includes('background-position: center right'), 'Missing desktop finance hero background positioning');
assert(financeJs.includes('aria-describedby="finance-form-status"'), 'Finance form must describe submit status region');
assert(financeJs.includes('id="finance-contact-form"'), 'Finance form must use active contact form id');
assert(financeJs.includes('action="${FORM_ENDPOINT}"'), 'Finance form must expose the real submit endpoint as action');
assert(financeJs.includes('method="POST"'), 'Finance form must submit with POST');
assert(financeJs.includes("const FORM_ENDPOINT = 'https://formsubmit.co/ajax/drotgenclinic@gmail.com'"), 'Finance form endpoint must target FormSubmit ajax endpoint');
assert(financeJs.includes('await fetch(FORM_ENDPOINT'), 'Finance form must actively submit to FormSubmit');
assert(financeJs.includes("form_id: 'finance-contact-form'"), 'Finance submit analytics must identify the active finance form');
assert(!financeJs.includes('page.contact.previewMessage'), 'Finance form must not use preview-disabled message binding');

const financeLink = renderFinanceCorporateNavLink('tr');
assert(financeLink.includes(FINANCE_DEPARTMENT_PATH), 'Finance nav link must target /tr/finans-departmani.html');

const trHomeHtml = readDistHtml('tr/index.html');
assert(trHomeHtml, 'Missing dist/tr/index.html for finance nav verification');
if (trHomeHtml) {
  const repsIndex = trHomeHtml.indexOf('Temsilciler');
  const financeIndex = trHomeHtml.indexOf(FINANCE_NAV_LABEL);
  assert(repsIndex !== -1, 'TR home nav missing Temsilciler');
  assert(financeIndex !== -1, 'TR home nav missing Finans Departmanı');
  assert(financeIndex > repsIndex, 'Finans Departmanı must appear after Temsilciler in TR home nav');
  assert(trHomeHtml.includes(`href="${FINANCE_DEPARTMENT_PATH}"`), 'TR home finance nav href incorrect');
}

for (const locale of LOCALES.filter((code) => code !== DEFAULT_LOCALE)) {
  const homeHtml = readDistHtml(`${locale}/index.html`);
  if (!homeHtml) {
    failures.push(`Missing dist/${locale}/index.html for finance nav verification`);
    continue;
  }
  const navLabel = financeNavLabelForLocale(locale);
  const financePath = financePathForLocale(locale);
  assert(homeHtml.includes(navLabel), `[${locale}] finance nav label must appear in localized home`);
  assert(homeHtml.includes(`href="${financePath}"`), `[${locale}] finance nav href must target localized finance page`);
  assert(homeHtml.includes('data-finance-nav') || homeHtml.includes('data-tr-finance-nav'), `[${locale}] finance nav marker missing`);
}

assert(financeJs.includes('fd-profile-grid'), 'Profile cards layout marker missing in finance page source');
assert(financeData.includes('Yeminli Mali Müşavir Ahmet ÖTGEN'), 'Missing Ahmet image alt text in source data');
assert(financeData.includes('Mali Müşavir Zehra ÖTGEN'), 'Missing Zehra image alt text in source data');

import { assertBuildFileDiffGuard } from './build-diff-guard.mjs';

assertBuildFileDiffGuard(failures, ROOT);

if (failures.length) {
  console.error('[verify-tr-finance-preview-page] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-tr-finance-preview-page] Verified Turkish finance department preview page');
