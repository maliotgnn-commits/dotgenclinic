import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEPARTMENT_SEO_PAGES, departmentUrlForLocale } from './department-seo-config.mjs';
import { escapeHtml } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function extractTagContent(html, pattern) {
  const match = html.match(pattern);
  return match?.[1] ?? null;
}

let verifiedCount = 0;
const expectedCount = DEPARTMENT_SEO_PAGES.reduce((total, department) => total + department.locales.length, 0);

for (const department of DEPARTMENT_SEO_PAGES) {
  for (const locale of department.locales) {
    const route = department.routes[locale];
    const label = `${department.key}/${locale}/${route.file}`;
    const filePath = resolve(DIST, '_seo', locale, route.file);
    const content = department.getContent(locale);
    const { page } = content;
    const expectedCanonical = departmentUrlForLocale(department.routes, locale);

    if (!existsSync(filePath)) {
      failures.push(`[${label}] Missing file dist/_seo/${locale}/${route.file}`);
      continue;
    }

    const html = readFileSync(filePath, 'utf8');
    const title = extractTagContent(html, /<title>([^<]*)<\/title>/);
    const description = extractTagContent(html, /<meta name="description" content="([^"]*)" \/>/);
    const canonical = extractTagContent(html, /<link data-i18n-seo="true" rel="canonical" href="([^"]*)" \/>/);
    const htmlLang = extractTagContent(html, /<html lang="([^"]*)"/);
    const htmlDir = extractTagContent(html, /<html lang="[^"]*" dir="([^"]*)"/);
    const mountPattern = new RegExp(`<main id="${department.appMountId}">\\s*<h1>([^<]*)</h1>`);
    const h1 = extractTagContent(html, mountPattern);
    const hreflangCount = (html.match(/<link data-i18n-seo="true" rel="alternate" hreflang="/g) || []).length;
    const hasXDefault = html.includes('hreflang="x-default"');
    const hasJsonLd = html.includes('application/ld+json');

    assert(title === escapeHtml(page.title), `[${label}] Unexpected title: ${title}`);
    assert(description === escapeHtml(page.description), `[${label}] Unexpected description`);
    assert(canonical === expectedCanonical, `[${label}] Unexpected canonical: ${canonical}`);
    assert(htmlLang === locale, `[${label}] Unexpected html lang: ${htmlLang}`);
    assert(htmlDir === (locale === 'ar' ? 'rtl' : 'ltr'), `[${label}] Unexpected html dir: ${htmlDir}`);
    assert(Boolean(h1), `[${label}] Missing static fallback h1`);
    assert(hreflangCount === 9, `[${label}] Expected 9 hreflang links, found ${hreflangCount}`);
    assert(hasXDefault, `[${label}] Missing hreflang x-default`);
    assert(
      (html.match(/<link data-i18n-seo="true"/g) || []).length === 10,
      `[${label}] Expected 10 data-i18n-seo links`,
    );
    assert(hasJsonLd, `[${label}] Missing JSON-LD block`);
    assert(!html.includes('/_seo/'), `[${label}] Internal /_seo/ URL must not appear in HTML`);

    verifiedCount += 1;
  }
}

for (const department of DEPARTMENT_SEO_PAGES) {
  for (const locale of department.locales) {
    const localeDir = resolve(DIST, '_seo', locale);
    if (!existsSync(localeDir)) continue;
    const departmentFiles = department.locales.map((code) => department.routes[code].file);
    const generated = readdirSync(localeDir).filter((name) => departmentFiles.includes(name));
    assert(
      generated.length <= departmentFiles.length,
      `[${locale}] Unexpected extra department SEO files in dist/_seo/${locale}`,
    );
  }
}

assert(verifiedCount === expectedCount, `Expected ${expectedCount} department SEO pages, verified ${verifiedCount}`);

if (failures.length) {
  console.error('[verify-department-static-seo] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log(`[verify-department-static-seo] Verified ${verifiedCount}/${expectedCount} static department pages`);
