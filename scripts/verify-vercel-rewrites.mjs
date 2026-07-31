import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUBPAGES } from '../src/subpages-data.js';
import { LOCALES } from './seo-shared.mjs';
import { buildDepartmentSeoRewrites } from './department-seo-config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const VERCEL_PATH = resolve(ROOT, 'vercel.json');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function buildExpectedServiceRewrites() {
  const rewrites = [];
  for (const locale of LOCALES) {
    for (const page of SUBPAGES) {
      rewrites.push({
        source: `/${locale}/service.html`,
        has: [{ type: 'query', key: 'slug', value: page.slug }],
        destination: `/_seo/${locale}/service/${page.slug}.html`,
      });
    }
  }
  return rewrites;
}

const config = JSON.parse(readFileSync(VERCEL_PATH, 'utf8'));
const rewrites = config.rewrites || [];
const expectedLocationRewrites = [
  { source: '/tr/denizli.html', destination: '/denizli.html' },
  { source: '/tr/izmir.html', destination: '/izmir.html' },
  { source: '/tr/leverkusen.html', destination: '/leverkusen.html' },
  { source: '/denizli', destination: '/denizli.html' },
  { source: '/izmir', destination: '/izmir.html' },
  { source: '/leverkusen', destination: '/leverkusen.html' },
];
const seoRewrites = rewrites.filter((rewrite) => rewrite.destination?.startsWith('/_seo/'));
const expectedService = buildExpectedServiceRewrites();
const expectedDepartment = buildDepartmentSeoRewrites();
const expected = [...expectedService, ...expectedDepartment];

assert(seoRewrites.length === expected.length, `Expected ${expected.length} SEO rewrites, found ${seoRewrites.length}`);
assert(
  JSON.stringify(rewrites.slice(0, expectedLocationRewrites.length))
    === JSON.stringify(expectedLocationRewrites),
  'Location rewrites must be the first six rewrites',
);

const sourceKeys = new Set();
for (const rewrite of seoRewrites) {
  const slug = rewrite.has?.find((entry) => entry.key === 'slug')?.value;
  const locale = rewrite.source.match(/^\/([^/]+)\//)?.[1];
  const key = slug
    ? `${locale}:${slug}->${rewrite.destination}`
    : `${rewrite.source}->${rewrite.destination}`;
  assert(!sourceKeys.has(key), `Duplicate rewrite: ${key}`);
  sourceKeys.add(key);
}

const expectedKeys = new Set(
  expected.map((rewrite) => {
    const slug = rewrite.has?.[0]?.value;
    if (slug) {
      const locale = rewrite.source.split('/')[1];
      return `${locale}:${slug}->${rewrite.destination}`;
    }
    return `${rewrite.source}->${rewrite.destination}`;
  }),
);

for (const key of expectedKeys) {
  assert(sourceKeys.has(key), `Missing rewrite: ${key}`);
}

assert(
  rewrites.some((rewrite) => rewrite.source === '/:locale(tr|en|ar|es|fr|it|ru|de)/service.html'),
  'General locale service SPA fallback rewrite missing',
);

const invalidSlug = 'invalid-slug-xyz-test';
assert(
  !seoRewrites.some((rewrite) => rewrite.has?.some((entry) => entry.value === invalidSlug)),
  'Unexpected exact rewrite for invalid slug',
);

if (failures.length) {
  console.error('[verify-vercel-rewrites] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log(
  `[verify-vercel-rewrites] Verified ${expectedService.length} service and ${expectedDepartment.length} department SEO rewrites`,
);
