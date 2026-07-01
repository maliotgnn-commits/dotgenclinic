import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const LOCALES = ['tr', 'en', 'ar', 'de'];
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

for (const locale of LOCALES) {
  const filePath = resolve(DIST, locale, 'index.html');
  assert(existsSync(filePath), `[${locale}] Missing dist/${locale}/index.html`);
  if (!existsSync(filePath)) continue;
  const html = readFileSync(filePath, 'utf8');
  assert(html.includes('rel="canonical"'), `[${locale}] canonical missing`);
  assert(html.includes('hreflang='), `[${locale}] hreflang missing`);
  assert(html.includes('property="og:title"'), `[${locale}] og:title missing`);
  assert(html.includes('application/ld+json'), `[${locale}] JSON-LD missing`);
  if (locale === 'ar') {
    assert(html.includes('lang="ar"'), `[${locale}] lang=ar missing`);
  }
}

if (failures.length) {
  console.error('[verify-home-static-seo] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-home-static-seo] Home static SEO regression passed');
