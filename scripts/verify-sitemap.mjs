import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUBPAGES } from '../src/subpages-data.js';
import { LOCALES, SITE_ORIGIN } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SITEMAP_PATH = resolve(ROOT, 'public/sitemap.xml');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const xml = readFileSync(SITEMAP_PATH, 'utf8');
assert(xml.startsWith('<?xml'), 'Sitemap must start with XML declaration');
assert(xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), 'Missing urlset root');
assert(xml.trimEnd().endsWith('</urlset>'), 'Sitemap must end with </urlset>');

const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const uniqueLocs = new Set(locs);

assert(locs.length === uniqueLocs.size, `Duplicate sitemap URLs found (${locs.length} total, ${uniqueLocs.size} unique)`);

const homeUrls = LOCALES.map((locale) => `${SITE_ORIGIN}/${locale}/`);
const privacyUrls = LOCALES.map((locale) => `${SITE_ORIGIN}/${locale}/privacy.html`);
const serviceUrls = [];
for (const locale of LOCALES) {
  for (const page of SUBPAGES) {
    serviceUrls.push(`${SITE_ORIGIN}/${locale}/service.html?slug=${page.slug}`);
  }
}

const eyeHealthUrls = [
  `${SITE_ORIGIN}/tr/goz-hastaliklari.html`,
  `${SITE_ORIGIN}/en/eye-health.html`,
  `${SITE_ORIGIN}/ar/صحة-العين.html`,
  `${SITE_ORIGIN}/es/salud-ocular.html`,
  `${SITE_ORIGIN}/fr/sante-oculaire.html`,
  `${SITE_ORIGIN}/it/salute-oculare.html`,
  `${SITE_ORIGIN}/ru/здоровье-глаз.html`,
  `${SITE_ORIGIN}/de/augengesundheit.html`,
];
const expectedUrls = new Set([...homeUrls, ...privacyUrls, ...eyeHealthUrls, ...serviceUrls]);
const actualUrls = new Set(locs);

assert(locs.length === 376, `Expected 376 sitemap URLs, found ${locs.length}`);
assert(expectedUrls.size === 376, `Expected URL set size is 376, computed ${expectedUrls.size}`);

for (const url of homeUrls) {
  assert(actualUrls.has(url), `Missing home URL: ${url}`);
}

for (const url of privacyUrls) {
  assert(actualUrls.has(url), `Missing privacy URL: ${url}`);
}

for (const url of eyeHealthUrls) {
  assert(actualUrls.has(url), `Missing eye health URL: ${url}`);
}

for (const url of serviceUrls) {
  assert(actualUrls.has(url), `Missing service URL: ${url}`);
}

for (const url of locs) {
  assert(expectedUrls.has(url), `Unexpected sitemap URL: ${url}`);
  assert(!url.includes('/_seo/'), `Internal /_seo/ URL must not appear in sitemap: ${url}`);
  assert(url.startsWith(`${SITE_ORIGIN}/`), `Sitemap URL must use canonical host: ${url}`);
}

const privacyCount = locs.filter((url) => url.endsWith('/privacy.html')).length;
const serviceCount = locs.filter((url) => url.includes('/service.html?slug=')).length;
const homeCount = locs.filter((url) => /\/(tr|en|ar|es|fr|it|ru|de)\/$/.test(url)).length;

const eyeHealthCount = locs.filter((url) =>
  eyeHealthUrls.some((eyeUrl) => url === eyeUrl),
).length;

assert(homeCount === 8, `Expected 8 home URLs, found ${homeCount}`);
assert(privacyCount === 8, `Expected 8 privacy URLs, found ${privacyCount}`);
assert(eyeHealthCount === 8, `Expected 8 eye health URLs, found ${eyeHealthCount}`);
assert(serviceCount === 352, `Expected 352 service URLs, found ${serviceCount}`);

if (failures.length) {
  console.error('[verify-sitemap] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-sitemap] Verified 376 public sitemap URLs (8 home, 8 privacy, 8 eye health, 352 service)');
