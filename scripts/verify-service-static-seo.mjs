import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUBPAGES } from '../src/subpages-data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const SITE_ORIGIN = 'https://www.drotgenclinic.com';
const LOCALES = ['tr', 'en', 'ar', 'es', 'fr', 'it', 'ru', 'de'];
const DEFAULT_LOCALE = 'tr';
const GENERIC_SERVICE_TITLE = 'Dr Otgen Clinic | Hizmet Detayı';
const GENERIC_SERVICE_DESCRIPTION =
  'Dr Otgen Clinic hizmet sayfası. Tedavi detayları, süreç, uygunluk kriterleri ve sık sorulan sorular.';

function loadPagesForLocale(locale) {
  if (locale === DEFAULT_LOCALE) return SUBPAGES;
  const contentPath = resolve(ROOT, `src/i18n/content/${locale}.json`);
  return JSON.parse(readFileSync(contentPath, 'utf8')).pages;
}

function serviceUrlForLocale(slug, locale) {
  return `${SITE_ORIGIN}/${locale}/service.html?slug=${encodeURIComponent(slug)}`;
}

function extractTagContent(html, pattern) {
  const match = html.match(pattern);
  return match?.[1] ?? null;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const trSlugs = SUBPAGES.map((page) => page.slug);
const expectedCount = trSlugs.length * LOCALES.length;
const failures = [];
let verifiedCount = 0;

for (const locale of LOCALES) {
  const pagesBySlug = Object.fromEntries(
    loadPagesForLocale(locale).map((page) => [page.slug, page]),
  );
  const localeDir = resolve(DIST, '_seo', locale, 'service');

  if (!existsSync(localeDir)) {
    failures.push(`Missing directory: dist/_seo/${locale}/service`);
    continue;
  }

  const generatedFiles = readdirSync(localeDir).filter((name) => name.endsWith('.html'));
  assert(
    generatedFiles.length === trSlugs.length,
    `[${locale}] Expected ${trSlugs.length} HTML files, found ${generatedFiles.length}`,
  );

  for (const slug of trSlugs) {
    const filePath = resolve(localeDir, `${slug}.html`);
    const page = pagesBySlug[slug];
    const expectedTitle = `${page.title} | Dr Otgen Clinic`;
    const expectedDescription = `${page.title}: ${page.summary}`;
    const label = `${locale}/${slug}`;

    if (!existsSync(filePath)) {
      failures.push(`[${label}] Missing file dist/_seo/${locale}/service/${slug}.html`);
      continue;
    }

    const html = readFileSync(filePath, 'utf8');
    const title = extractTagContent(html, /<title>([^<]*)<\/title>/);
    const description = extractTagContent(html, /<meta name="description" content="([^"]*)" \/>/);
    const canonical = extractTagContent(html, /<link data-i18n-seo="true" rel="canonical" href="([^"]*)" \/>/);
    const htmlLang = extractTagContent(html, /<html lang="([^"]*)"/);
    const htmlDir = extractTagContent(html, /<html lang="[^"]*" dir="([^"]*)"/);
    const h1 = extractTagContent(html, /<main id="service-app">\s*<h1>([^<]*)<\/h1>/);
    const summary = extractTagContent(html, /<main id="service-app">\s*<h1>[^<]*<\/h1>\s*<p>([^<]*)<\/p>/);

    const hreflangCount = (html.match(/<link data-i18n-seo="true" rel="alternate" hreflang="/g) || []).length;
    const hasXDefault = html.includes('hreflang="x-default"');
    const seoLinkCount = (html.match(/data-i18n-seo="true"/g) || []).length;

    if (title !== expectedTitle) failures.push(`[${label}] title mismatch`);
    if (description !== expectedDescription) failures.push(`[${label}] description mismatch`);
    if (canonical !== serviceUrlForLocale(slug, locale)) failures.push(`[${label}] canonical mismatch`);
    if (htmlLang !== locale) failures.push(`[${label}] html lang mismatch (${htmlLang})`);
    if (htmlDir !== (locale === 'ar' ? 'rtl' : 'ltr')) failures.push(`[${label}] html dir mismatch (${htmlDir})`);
    if (h1 !== page.title) failures.push(`[${label}] h1 mismatch`);
    if (summary !== page.summary) failures.push(`[${label}] summary mismatch`);
    if (hreflangCount !== 9) failures.push(`[${label}] expected 9 hreflang links, found ${hreflangCount}`);
    if (!hasXDefault) failures.push(`[${label}] missing x-default hreflang`);
    if (seoLinkCount !== 10) failures.push(`[${label}] expected 10 data-i18n-seo links, found ${seoLinkCount}`);
    if (title === GENERIC_SERVICE_TITLE) failures.push(`[${label}] still using generic title`);
    if (description === GENERIC_SERVICE_DESCRIPTION) failures.push(`[${label}] still using generic description`);

    if (locale !== DEFAULT_LOCALE) {
      const trPage = SUBPAGES.find((entry) => entry.slug === slug);
      if (title.includes(trPage.title) && page.title !== trPage.title) {
        failures.push(`[${label}] title appears to use TR text`);
      }
      if (summary === trPage.summary && page.summary !== trPage.summary) {
        failures.push(`[${label}] summary appears to use TR text`);
      }
    }

    verifiedCount += 1;
  }
}

if (verifiedCount !== expectedCount) {
  failures.push(`Expected ${expectedCount} verified files, got ${verifiedCount}`);
}

if (failures.length) {
  console.error('[verify-service-static-seo] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log(`[verify-service-static-seo] Verified ${verifiedCount}/${expectedCount} static service pages`);
console.log(`[verify-service-static-seo] Locales: ${LOCALES.length}, slugs per locale: ${trSlugs.length}`);
