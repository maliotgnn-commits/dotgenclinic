import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getLegalContentSync } from './legal-content-node.mjs';
import {
  LEGAL_LOCALES,
  LEGAL_ROUTES,
  legalNavLabelForLocale,
  legalPathForLocale,
} from '../src/legal-routes.js';
import { LEGAL_PAGE } from '../src/legal-data.js';
import { LOCALES } from './seo-shared.mjs';
import {
  FINANCE_NAV_LABEL,
  renderFinanceCorporateNavLink,
} from '../src/tr-finance-nav.js';
import {
  LEGAL_NAV_LABEL,
  renderLegalCorporateNavLink,
} from '../src/tr-legal-nav.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

for (const locale of LEGAL_LOCALES) {
  const route = LEGAL_ROUTES[locale];
  const pagePath = resolve(DIST, locale, route.file);
  const content = getLegalContentSync(locale);

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
  assert(html.includes('id="legal-app"'), `[${locale}] legal-app mount missing`);
  assert(!/<form[^>]*\baction=/.test(html), `[${locale}] legal form shell must not define action`);
}

const trPage = readFileSync(resolve(DIST, 'tr', 'hukuk-departmani.html'), 'utf8');
const trContent = getLegalContentSync('tr');
assert(trPage.includes('id="legal-app"'), '[tr] legal-app mount missing');
assert(trContent.page.hero.title === LEGAL_PAGE.hero.title, '[tr] hero title must remain in Turkish source data');
assert(trContent.page.hero.tag === 'HUKUK DEPARTMANI', '[tr] Turkish hero tag must remain unchanged');

for (const locale of LOCALES) {
  const homePath = resolve(DIST, locale, 'index.html');
  if (!existsSync(homePath)) {
    failures.push(`[dist/${locale}/index.html] missing locale home output`);
    continue;
  }
  const homeHtml = readFileSync(homePath, 'utf8');
  const navLabel = legalNavLabelForLocale(locale);
  const legalPath = legalPathForLocale(locale);

  assert(homeHtml.includes('data-legal-nav') || homeHtml.includes('data-tr-legal-nav'), `[dist/${locale}/index.html] legal nav marker missing`);
  assert(homeHtml.includes(navLabel), `[dist/${locale}/index.html] legal nav label missing (${navLabel})`);
  assert(homeHtml.includes(`href="${legalPath}"`), `[dist/${locale}/index.html] legal nav href missing (${legalPath})`);

  if (locale === 'tr') {
    const repsIndex = homeHtml.indexOf('Temsilciler');
    const financeIndex = homeHtml.indexOf(FINANCE_NAV_LABEL);
    const legalIndex = homeHtml.indexOf(LEGAL_NAV_LABEL);
    assert(repsIndex !== -1, '[tr] home nav missing Temsilciler');
    assert(financeIndex !== -1, '[tr] home nav missing Finans Departmanı');
    assert(legalIndex !== -1, '[tr] home nav missing Hukuk Departmanı');
    assert(financeIndex > repsIndex, '[tr] Finans Departmanı must appear after Temsilciler');
    assert(legalIndex > financeIndex, '[tr] Hukuk Departmanı must appear after Finans Departmanı');
  }
}

const legalJs = readFileSync(resolve(ROOT, 'src/legal-department.js'), 'utf8');
const publicHeaderJs = readFileSync(resolve(ROOT, 'src/public-header.js'), 'utf8');

assert(legalJs.includes('loadLegalContent'), 'legal-department.js must load locale content');
assert(legalJs.includes("getCurrentLocale('legal')"), 'legal-department.js must use legal page type');
assert(legalJs.includes("renderLanguageSwitcher(locale, 'legal'"), 'legal page must use legal language switcher page type');
assert(legalJs.includes('id="legal-contact-form"'), 'Legal page must render the active contact form');
assert(legalJs.includes('action="${FORM_ENDPOINT}"'), 'Legal page form must expose the real submit endpoint');
assert(legalJs.includes("const FORM_ENDPOINT = 'https://formsubmit.co/ajax/drotgenclinic@gmail.com'"), 'Legal page must target FormSubmit ajax endpoint');
assert(legalJs.includes('await fetch(FORM_ENDPOINT'), 'Legal page must include active FormSubmit submission hook');
assert(legalJs.includes("form_id: 'legal-contact-form'"), 'Legal analytics must identify the active contact form');
assert(!legalJs.includes('page.contact.previewMessage'), 'Legal page must not use preview-disabled message binding');
assert(
  publicHeaderJs.includes("navMenu.querySelectorAll('.mega-dropdown a, .eh-mobile-topics a')"),
  'Mobile drawer must close on mega-dropdown link navigation',
);
assert(publicHeaderJs.includes('setMobileNavOpen(false)'), 'Mobile drawer close handler missing in public-header');

const forbiddenPhrases = [
  'Dava kazanılır',
  'Hukuki sonuç garantisi',
  'Kesin çözüm',
  'Tüm talepler kabul edilir',
  'Otomatik işlem yapılır',
  'Her dosya sonuçlandırılır',
  'Her işlem için hukuki danışmanlık sağlanır',
];

for (const phrase of forbiddenPhrases) {
  assert(!readFileSync(resolve(ROOT, 'src/legal-data.js'), 'utf8').includes(phrase), `Forbidden phrase found in legal source data: ${phrase}`);
}

const financeLink = renderFinanceCorporateNavLink('tr');
assert(financeLink.includes('finans-departmani'), 'Finance nav link must remain available');
const legalLink = renderLegalCorporateNavLink('tr');
assert(legalLink.includes('hukuk-departmani'), 'Legal nav link must target Turkish legal page');

if (failures.length) {
  console.error('[verify-multilingual-legal-page] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-multilingual-legal-page] Verified 8 locale legal department pages');
