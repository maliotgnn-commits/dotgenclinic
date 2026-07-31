import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEPARTMENT_ROUTE_GROUPS,
  getAllSitemapUrls,
  getDepartmentUrls,
  getEyeHealthUrls,
  getHomeUrls,
  getLocationUrls,
  getPrivacyUrls,
  getServiceUrls,
} from './sitemap-urls.mjs';
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

const homeUrls = getHomeUrls();
const privacyUrls = getPrivacyUrls();
const locationUrls = getLocationUrls();
const eyeHealthUrls = getEyeHealthUrls();
const departmentUrls = getDepartmentUrls();
const serviceUrls = getServiceUrls();
const expectedUrls = new Set(getAllSitemapUrls());
const actualUrls = new Set(locs);
const totalExpected = expectedUrls.size;
const serviceCountExpected = serviceUrls.length;
const departmentCountExpected = departmentUrls.length;
const localeCount = LOCALES.length;

assert(locs.length === totalExpected, `Expected ${totalExpected} sitemap URLs, found ${locs.length}`);
assert(expectedUrls.size === totalExpected, `Expected URL set size is ${totalExpected}, computed ${expectedUrls.size}`);

const lastmods = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
assert(lastmods.length === locs.length, `Expected ${locs.length} lastmod entries, found ${lastmods.length}`);
lastmods.forEach((value) => {
  assert(/^\d{4}-\d{2}-\d{2}$/.test(value), `Invalid lastmod format: ${value}`);
});

for (const url of homeUrls) {
  assert(actualUrls.has(url), `Missing home URL: ${url}`);
}

for (const url of privacyUrls) {
  assert(actualUrls.has(url), `Missing privacy URL: ${url}`);
}

for (const url of locationUrls) {
  assert(actualUrls.has(url), `Missing location URL: ${url}`);
}

for (const url of eyeHealthUrls) {
  assert(actualUrls.has(url), `Missing eye health URL: ${url}`);
}

for (const url of departmentUrls) {
  assert(actualUrls.has(url), `Missing department URL: ${url}`);
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
const locationCount = locs.filter((url) => locationUrls.includes(url)).length;
const serviceCount = locs.filter((url) => url.includes('/service.html?slug=')).length;
const homeCount = locs.filter((url) => /\/(tr|en|ar|es|fr|it|ru|de)\/$/.test(url)).length;
const eyeHealthCount = locs.filter((url) => eyeHealthUrls.includes(url)).length;
const departmentCount = locs.filter((url) => departmentUrls.includes(url)).length;

assert(homeCount === localeCount, `Expected ${localeCount} home URLs, found ${homeCount}`);
assert(privacyCount === localeCount, `Expected ${localeCount} privacy URLs, found ${privacyCount}`);
assert(locationCount === locationUrls.length, `Expected ${locationUrls.length} location URLs, found ${locationCount}`);
assert(eyeHealthCount === localeCount, `Expected ${localeCount} eye health URLs, found ${eyeHealthCount}`);
assert(
  departmentCount === departmentCountExpected,
  `Expected ${departmentCountExpected} department URLs, found ${departmentCount}`,
);
assert(serviceCount === serviceCountExpected, `Expected ${serviceCountExpected} service URLs, found ${serviceCount}`);

for (const { key, routes } of DEPARTMENT_ROUTE_GROUPS) {
  const groupUrls = Object.values(routes).map((route) => `${SITE_ORIGIN}${route.path}`);
  const groupCount = locs.filter((url) => groupUrls.includes(url)).length;
  assert(
    groupCount === localeCount,
    `Expected ${localeCount} ${key} URLs, found ${groupCount}`,
  );
}

if (failures.length) {
  console.error('[verify-sitemap] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log(
  `[verify-sitemap] Verified ${totalExpected} public sitemap URLs (${localeCount} home, ${localeCount} privacy, ${locationUrls.length} location, ${localeCount} eye health, ${departmentCountExpected} department, ${serviceCountExpected} service)`,
);
