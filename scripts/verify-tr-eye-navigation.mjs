import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EYE_HEALTH_ROUTES,
  eyeHealthHeaderNavLabelForLocale,
  eyeHealthPathForLocale,
} from '../src/eye-health-routes.js';
import {
  extractEyeHealthNavBlock,
  renderEyeHealthNavItem,
} from '../src/tr-eye-health-nav.js';
import { LOCALES, DEFAULT_LOCALE, SITE_ORIGIN } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const failures = [];
const NON_TR_LOCALES = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function collectEyeHealthHrefs(navHtml) {
  return [...navHtml.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
}

function collectIds(html) {
  return [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
}

function assertEyeHealthNav(navHtml, label, expectedPath) {
  assert(navHtml.length > 0, `[${label}] missing eye health nav block`);

  const hrefs = collectEyeHealthHrefs(navHtml);
  assert(hrefs.length > 0, `[${label}] no eye health nav hrefs found`);

  for (const href of hrefs) {
    assert(href === expectedPath, `[${label}] unexpected href "${href}", expected "${expectedPath}"`);
    assert(!href.includes('#'), `[${label}] fragment found in href "${href}"`);
  }
}

function assertMobileClosedDefaults(navHtml, label) {
  assert(navHtml.includes('aria-expanded="false"'), `[${label}] top-level toggle must start closed`);
  assert(!/\bclass="[^"]*\bopen\b[^"]*"/.test(navHtml), `[${label}] nav block must not include open class`);
  assert(navHtml.includes('eh-mobile-topics" id="eh-mobile-group-panel-0" hidden'), `[${label}] mobile topics must start hidden`);
  assert(navHtml.includes('eh-mobile-group-toggle"'), `[${label}] mobile category toggles missing`);
  assert(navHtml.includes('aria-controls="eh-mobile-group-panel-0"'), `[${label}] mobile aria-controls missing`);

  const ids = collectIds(navHtml);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  assert(duplicates.length === 0, `[${label}] duplicate ids in nav block: ${duplicates.join(', ')}`);
}

const indexSource = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
const navSource = readFileSync(resolve(ROOT, 'src/tr-eye-health-nav.js'), 'utf8');
const eyeHealthJs = readFileSync(resolve(ROOT, 'src/eye-health.js'), 'utf8');
const serviceJs = readFileSync(resolve(ROOT, 'src/service.js'), 'utf8');
const privacyJs = readFileSync(resolve(ROOT, 'src/privacy.js'), 'utf8');
const mainJs = readFileSync(resolve(ROOT, 'src/main.js'), 'utf8');
const renderedTrNav = renderEyeHealthNavItem({ locale: 'tr' });

assertEyeHealthNav(extractEyeHealthNavBlock(indexSource), 'index.html source', eyeHealthPathForLocale('tr'));
assertMobileClosedDefaults(renderedTrNav, 'renderEyeHealthNavItem() TR output');
assertEyeHealthNav(renderedTrNav, 'renderEyeHealthNavItem() TR output', eyeHealthPathForLocale('tr'));
assert(!navSource.includes('goz-hastaliklari.html#'), '[tr-eye-health-nav.js] fragment href found in source');
assert(!indexSource.includes('goz-hastaliklari.html#'), '[index.html] fragment href found in source');
assert(eyeHealthJs.includes('normalizeEyeHealthLandingHash'), '[eye-health.js] hash normalization missing');
assert(serviceJs.includes('renderEyeHealthNavItem'), '[service.js] eye health nav render missing');
assert(privacyJs.includes('renderEyeHealthNavItem'), '[privacy.js] eye health nav render missing');
assert(mainJs.includes('initSiteHeader'), '[main.js] shared header init missing');
assert(mainJs.includes('initSmoothScroll'), '[main.js] existing anchor scroll behavior must remain');

const trHomeDist = resolve(DIST, 'tr', 'index.html');
assert(existsSync(trHomeDist), 'Missing dist/tr/index.html for navigation verification');
if (existsSync(trHomeDist)) {
  const trHomeHtml = readFileSync(trHomeDist, 'utf8');
  assertEyeHealthNav(extractEyeHealthNavBlock(trHomeHtml), 'dist/tr/index.html', eyeHealthPathForLocale('tr'));
}

const trEyeDist = resolve(DIST, 'tr', 'goz-hastaliklari.html');
assert(existsSync(trEyeDist), 'Missing dist/tr/goz-hastaliklari.html for navigation verification');

for (const slug of ['botox', 'breast-augmentation']) {
  const seoPath = resolve(DIST, '_seo', 'tr', 'service', `${slug}.html`);
  if (!existsSync(seoPath)) {
    failures.push(`[dist/_seo/tr/service/${slug}.html] missing service SEO output`);
    continue;
  }
  assert(serviceJs.includes('renderEyeHealthNavItem'), `[service.js] must render eye health nav for ${slug}`);
}

for (const locale of NON_TR_LOCALES) {
  const homePath = resolve(DIST, locale, 'index.html');
  if (!existsSync(homePath)) {
    failures.push(`[dist/${locale}/index.html] missing locale home output`);
    continue;
  }
  const homeHtml = readFileSync(homePath, 'utf8');
  const expectedPath = eyeHealthPathForLocale(locale);
  const headerNavLabel = eyeHealthHeaderNavLabelForLocale(locale);
  assert(homeHtml.includes(headerNavLabel), `[dist/${locale}/index.html] header nav label missing (${headerNavLabel})`);
  if (locale === 'ru') {
    assert(homeHtml.includes(EYE_HEALTH_ROUTES.ru.navLabel), '[dist/ru/index.html] full eye health aria label missing');
  }
  assertEyeHealthNav(extractEyeHealthNavBlock(homeHtml), `dist/${locale}/index.html`, expectedPath);
}

const arHome = resolve(DIST, 'ar', 'index.html');
if (existsSync(arHome)) {
  const arHtml = readFileSync(arHome, 'utf8');
  assert(arHtml.includes('lang="ar"'), '[dist/ar/index.html] lang=ar missing');
  assert(arHtml.includes('dir="rtl"'), '[dist/ar/index.html] dir=rtl missing');
}

if (failures.length) {
  console.error('[verify-tr-eye-navigation] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-tr-eye-navigation] Verified eye health navigation across locales');
