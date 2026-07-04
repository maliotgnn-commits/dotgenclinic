import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getEyeHealthContentSync } from './eye-health-content-node.mjs';
import {
  EYE_HEALTH_LOCALES,
  EYE_HEALTH_ROUTES,
  eyeHealthCanonicalUrl,
} from '../src/eye-health-routes.js';
import { SITE_ORIGIN, escapeHtml, LOCALES } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');

const CATEGORY_EYE_PATHS = [
  '/images/goz-hastaliklari/category-eyes/category-eye-general-health.png',
  '/images/goz-hastaliklari/category-eyes/category-eye-laser.png',
  '/images/goz-hastaliklari/category-eyes/category-eye-cataract.png',
  '/images/goz-hastaliklari/category-eyes/category-eye-retina.png',
  '/images/goz-hastaliklari/category-eyes/category-eye-eyelid-orbita.png',
  '/images/goz-hastaliklari/category-eyes/category-eye-other-treatments.png',
];

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function countMatches(html, pattern) {
  return (html.match(pattern) || []).length;
}

function extractHreflangUrls(html) {
  return [...html.matchAll(/<link[^>]+rel="alternate"[^>]+hreflang="([^"]+)"[^>]+href="([^"]+)"/g)]
    .map((match) => ({ hreflang: match[1], href: match[2] }));
}

for (const locale of EYE_HEALTH_LOCALES) {
  const route = EYE_HEALTH_ROUTES[locale];
  const pagePath = resolve(DIST, locale, route.file);
  const content = getEyeHealthContentSync(locale);
  const canonical = eyeHealthCanonicalUrl(SITE_ORIGIN, locale);

  assert(existsSync(pagePath), `Missing dist/${locale}/${route.file}`);
  if (!existsSync(pagePath)) continue;

  const html = readFileSync(pagePath, 'utf8');
  const { page, categories, nav } = content;

  assert(html.includes(`lang="${locale}"`), `[${locale}] lang attribute missing`);
  if (locale === 'ar') {
    assert(html.includes('dir="rtl"'), '[ar] dir=rtl missing');
  } else {
    assert(!html.includes('dir="rtl"'), `[${locale}] unexpected dir=rtl`);
  }

  assert(html.includes(`<title>${escapeHtml(page.title)}</title>`), `[${locale}] title missing`);
  assert(html.includes(`content="${escapeHtml(page.description)}"`), `[${locale}] description missing`);
  assert(html.includes(`href="${canonical}"`), `[${locale}] canonical missing`);
  assert(html.includes(nav.menuLabel), `[${locale}] nav label missing`);
  assert(!html.match(/href="[^"]+#/), `[${locale}] fragment href found`);

  const hreflang = extractHreflangUrls(html).filter((entry) => entry.hreflang !== 'x-default');
  assert(hreflang.length === 8, `[${locale}] expected 8 hreflang links, found ${hreflang.length}`);
  for (const code of LOCALES) {
    const expected = eyeHealthCanonicalUrl(SITE_ORIGIN, code);
    assert(
      hreflang.some((entry) => entry.hreflang === code && entry.href === expected),
      `[${locale}] missing hreflang for ${code}`,
    );
  }

  assert(html.includes(page.hero.image), `[${locale}] hero image missing`);
  assert(html.includes(page.doctor.image), `[${locale}] doctor image missing`);

  const topicCount = categories.reduce((total, category) => total + category.topics.length, 0);
  assert(topicCount === 20, `[${locale}] expected 20 topics, found ${topicCount}`);
  assert(categories.length === 6, `[${locale}] expected 6 categories, found ${categories.length}`);

  const eyeImageCount = countMatches(html, /class="eh-category-eye"/g);
  assert(eyeImageCount === 6, `[${locale}] expected 6 category eye images, found ${eyeImageCount}`);

  for (const eyePath of CATEGORY_EYE_PATHS) {
    assert(html.includes(eyePath), `[${locale}] missing category eye image ${eyePath}`);
  }

  assert(countMatches(html, /"@type":"MedicalWebPage"/g) === 1, `[${locale}] expected 1 MedicalWebPage`);
  assert(countMatches(html, /"@type":"BreadcrumbList"/g) === 1, `[${locale}] expected 1 BreadcrumbList`);
  assert(!html.includes('"@type":"MedicalClinic"'), `[${locale}] MedicalClinic duplicate found`);
}

const trPage = readFileSync(resolve(DIST, 'tr', 'goz-hastaliklari.html'), 'utf8');
const trContent = getEyeHealthContentSync('tr');
assert(trPage.includes(escapeHtml(trContent.page.hero.title)), '[tr] hero title must remain unchanged');
assert(trPage.includes('Göz Hastalıkları'), '[tr] Turkish heading must remain unchanged');

for (const locale of LOCALES.filter((code) => code !== 'tr')) {
  const homePath = resolve(DIST, locale, 'index.html');
  if (!existsSync(homePath)) {
    failures.push(`[dist/${locale}/index.html] missing locale home output`);
    continue;
  }
  const homeHtml = readFileSync(homePath, 'utf8');
  const navLabel = EYE_HEALTH_ROUTES[locale].navLabel;
  assert(homeHtml.includes('data-eye-health-nav'), `[dist/${locale}/index.html] eye health nav missing`);
  assert(homeHtml.includes(navLabel), `[dist/${locale}/index.html] nav label missing`);
}

const BIDI_CONTROL = /[\u202A-\u202E\u2066-\u2069\u200E\u200F]/;
const LATIN = /[A-Za-z]/;
const CYRILLIC = /[\u0400-\u04FF]/;
const ALLOWED_LATIN_SNIPPETS = [
  'Uzm. Dr. Sina Evsen',
  'Dr Otgen Clinic',
];

function stripAllowedLatin(value) {
  let result = value;
  for (const snippet of ALLOWED_LATIN_SNIPPETS) {
    result = result.split(snippet).join('');
  }
  return result;
}

function walkStrings(node, visitor, key = '') {
  if (typeof node === 'string') {
    visitor(node, key);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item) => walkStrings(item, visitor, key));
    return;
  }
  if (node && typeof node === 'object') {
    Object.entries(node).forEach(([childKey, value]) => walkStrings(value, visitor, childKey));
  }
}

function validateLocaleCopy(locale) {
  const filePath = resolve(ROOT, `src/i18n/eye-health/${locale}.json`);
  const raw = readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);

  walkStrings(data, (value, key) => {
    assert(!BIDI_CONTROL.test(value), `[${locale}] bidi control character in ${key}: ${JSON.stringify(value)}`);

    if (key === 'id' || key === 'icon') return;
    if (value.startsWith('/images/')) return;

    if (locale === 'ar') {
      assert(!value.includes('Astigmatism'), `[ar] forbidden mixed astigmatism label in ${key}`);
      const stripped = stripAllowedLatin(value);
      assert(!LATIN.test(stripped), `[ar] unexpected Latin letters in ${key}: ${JSON.stringify(value)}`);
    }

    if (locale === 'ru') {
      const stripped = stripAllowedLatin(value);
      const words = stripped.split(/[^\p{L}\p{N}-]+/u).filter(Boolean);
      for (const word of words) {
        if (CYRILLIC.test(word) && LATIN.test(word)) {
          failures.push(`[ru] mixed Latin-Cyrillic word "${word}" in ${key}`);
        }
      }
      assert(!/\b(intra|uve)[\u0400-\u04FF]/i.test(stripped), `[ru] Latin-Cyrillic medical term residue in ${key}`);
      assert(!/[\u0400-\u04FF](tra|ok)[\u0400-\u04FF]/i.test(stripped), `[ru] Latin-Cyrillic medical term residue in ${key}`);
    }
  });
}

validateLocaleCopy('ar');
validateLocaleCopy('ru');

if (failures.length) {
  console.error('[verify-multilingual-eye-health-page] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-multilingual-eye-health-page] Verified 8 locale eye health pages');
