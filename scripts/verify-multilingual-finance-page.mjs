import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getFinanceContentSync } from './finance-content-node.mjs';
import {
  FINANCE_LOCALES,
  FINANCE_ROUTES,
  financeNavLabelForLocale,
  financePathForLocale,
} from '../src/finance-routes.js';
import { FINANCE_PAGE } from '../src/finance-data.js';
import { LOCALES } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

for (const locale of FINANCE_LOCALES) {
  const route = FINANCE_ROUTES[locale];
  const pagePath = resolve(DIST, locale, route.file);
  const content = getFinanceContentSync(locale);

  assert(existsSync(pagePath), `Missing dist/${locale}/${route.file}`);
  if (!existsSync(pagePath)) continue;

  const html = readFileSync(pagePath, 'utf8');
  const { page } = content;

  assert(html.includes(`lang="${locale}"`), `[${locale}] lang attribute missing`);
  if (locale === 'ar') {
    assert(html.includes("dir = 'rtl'"), '[ar] dir=rtl bootstrap missing');
  } else {
    assert(html.includes("dir = 'ltr'"), `[${locale}] dir=ltr bootstrap missing`);
  }

  assert(html.includes(`<title>${page.title.replace(/&/g, '&amp;')}</title>`) || html.includes(`<title>${page.title}</title>`), `[${locale}] title missing`);
  assert(html.includes(page.description), `[${locale}] description missing`);
  assert(html.includes('id="finance-app"'), `[${locale}] finance-app mount missing`);
  assert(!/<form[^>]*\baction=/.test(html), `[${locale}] finance form shell must not define action`);
}

const trPage = readFileSync(resolve(DIST, 'tr', 'finans-departmani.html'), 'utf8');
const trContent = getFinanceContentSync('tr');
assert(trPage.includes('id="finance-app"'), '[tr] finance-app mount missing');
assert(trContent.page.hero.title === FINANCE_PAGE.hero.title, '[tr] hero title must remain in Turkish source data');
assert(trContent.page.hero.tag === 'FİNANS DEPARTMANI', '[tr] Turkish hero tag must remain unchanged');

for (const locale of LOCALES) {
  const homePath = resolve(DIST, locale, 'index.html');
  if (!existsSync(homePath)) {
    failures.push(`[dist/${locale}/index.html] missing locale home output`);
    continue;
  }
  const homeHtml = readFileSync(homePath, 'utf8');
  const navLabel = financeNavLabelForLocale(locale);
  const financePath = financePathForLocale(locale);

  assert(homeHtml.includes('data-finance-nav') || homeHtml.includes('data-tr-finance-nav'), `[dist/${locale}/index.html] finance nav marker missing`);
  assert(homeHtml.includes(navLabel), `[dist/${locale}/index.html] finance nav label missing (${navLabel})`);
  assert(homeHtml.includes(`href="${financePath}"`), `[dist/${locale}/index.html] finance nav href missing (${financePath})`);
}

const financeJs = readFileSync(resolve(ROOT, 'src/finance-department.js'), 'utf8');
assert(financeJs.includes('loadFinanceContent'), 'finance-department.js must load locale content');
assert(financeJs.includes("getCurrentLocale('finance')"), 'finance-department.js must use finance page type');
assert(financeJs.includes("renderLanguageSwitcher(locale, 'finance'"), 'finance page must use finance language switcher page type');
assert(!/fetch\s*\(|XMLHttpRequest|mailto:|formspree|web3forms/i.test(financeJs), 'Finance page must not include outbound form submission hooks');

const forbiddenPhrases = [
  'İade alınır',
  'Kesin iade',
  'Garantili sonuç',
  'Her işlemde geçerli',
  'Otomatik iade',
];

for (const phrase of forbiddenPhrases) {
  assert(!readFileSync(resolve(ROOT, 'src/finance-data.js'), 'utf8').includes(phrase), `Forbidden phrase found in finance source data: ${phrase}`);
}

if (failures.length) {
  console.error('[verify-multilingual-finance-page] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-multilingual-finance-page] Verified 8 locale finance department pages');
