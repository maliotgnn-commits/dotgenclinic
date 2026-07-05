import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  FINANCE_DEPARTMENT_PATH,
  FINANCE_NAV_LABEL,
  renderFinanceCorporateNavLink,
} from '../src/tr-finance-nav.js';
import { LOCALES, DEFAULT_LOCALE } from './seo-shared.mjs';

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
  'FİNANS DEPARTMANI',
  'Finansal Süreçlerde Şeffaf ve Güvenilir Koordinasyon',
  'Mali Süreçlerimizde Uzman Koordinasyon',
  'Ahmet ÖTGEN',
  'Zehra ÖTGEN',
  'Sağlık Turizmi Kapsamındaki Mali Süreçler',
  'KDV İstisna ve İade Süreçleri',
  'Hangi Konularda Destek Alabilirsiniz?',
  'Talebiniz Nasıl Değerlendirilir?',
  'Güvenli Bilgi Paylaşımı',
  'Finans Departmanımızla İletişime Geçin',
  'Finansal Süreçleriniz Hakkında Bilgi Alın',
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

assert(pageHtml.includes('id="finance-app"'), 'Finance page shell missing finance-app mount point');
assert(pageHtml.includes('finans-departmani'), 'Finance page shell missing bundled asset reference');
assert(!/<form[^>]*\baction=/.test(pageHtml), 'Finance form shell must not define an action endpoint');

for (const section of requiredSections) {
  assert(financeJs.includes(section), `Missing required section/content in finance page source: ${section}`);
}

for (const phrase of forbiddenPhrases) {
  assert(!financeJs.includes(phrase), `Forbidden phrase found in finance page source: ${phrase}`);
}

assert(financeJs.includes('id="finance_contact"'), 'Missing finance_contact section id in finance page source');
assert(financeJs.includes('/images/finance_department/ahmet_otgen_finance.jpg'), 'Missing Ahmet profile image reference');
assert(financeJs.includes('/images/finance_department/zehra_otgen_finance.jpg'), 'Missing Zehra profile image reference');
assert(existsSync(resolve(DIST, 'images/finance_department/ahmet_otgen_finance.jpg')), 'Missing built Ahmet image asset');
assert(existsSync(resolve(DIST, 'images/finance_department/zehra_otgen_finance.jpg')), 'Missing built Zehra image asset');
assert(financeJs.includes('aria-live="polite"'), 'Missing aria-live preview status region');
assert(financeJs.includes('Preview testi kapsamında form gönderimi aktif değildir.'), 'Missing preview form message text');
assert(!/fetch\s*\(|XMLHttpRequest|mailto:|formspree|web3forms/i.test(financeJs), 'Finance page must not include outbound form submission hooks');

const financeLink = renderFinanceCorporateNavLink();
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
    failures.push(`Missing dist/${locale}/index.html for finance nav isolation check`);
    continue;
  }
  assert(!homeHtml.includes(FINANCE_NAV_LABEL), `[${locale}] finance nav must not appear in non-TR home`);
  assert(!homeHtml.includes('data-tr-finance-nav'), `[${locale}] finance nav marker must not appear in non-TR home`);
}

assert(financeJs.includes('fd-profile-grid'), 'Profile cards layout marker missing in finance page source');
assert(financeJs.includes('alt="Yeminli Mali Müşavir Ahmet ÖTGEN"'), 'Missing Ahmet image alt text');
assert(financeJs.includes('alt="Mali Müşavir Zehra ÖTGEN"'), 'Missing Zehra image alt text');

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

if (failures.length) {
  console.error('[verify-tr-finance-preview-page] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-tr-finance-preview-page] Verified Turkish finance department preview page');
