import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const VERCEL_PATH = resolve(ROOT, 'vercel.json');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const config = JSON.parse(readFileSync(VERCEL_PATH, 'utf8'));
const headers = config.headers || [];

const seoHeaderRule = headers.find((entry) => entry.source === '/_seo/:path*');
assert(seoHeaderRule, 'Missing /_seo/:path* header rule in vercel.json');

const robotsHeader = seoHeaderRule.headers?.find((header) => header.key === 'X-Robots-Tag');
assert(robotsHeader, 'Missing X-Robots-Tag header for /_seo/:path*');
assert(
  robotsHeader.value === 'noindex, nofollow',
  `Expected X-Robots-Tag "noindex, nofollow", found "${robotsHeader.value}"`,
);

const globalHeaderRule = headers.find((entry) => entry.source === '/(.*)');
assert(globalHeaderRule, 'Missing global /(.*) header rule in vercel.json');
assert(
  !globalHeaderRule.headers?.some((header) => header.key === 'X-Robots-Tag'),
  'Global /(.*) headers must not set X-Robots-Tag (would leak noindex to public URLs)',
);

const publicServiceRules = headers.filter((entry) =>
  entry.source.includes('service.html') || entry.source.includes('/:locale'),
);
for (const rule of publicServiceRules) {
  assert(
    !rule.headers?.some((header) => header.key === 'X-Robots-Tag'),
    `Public route header rule must not set X-Robots-Tag: ${rule.source}`,
  );
}

const seoIndex = headers.findIndex((entry) => entry.source === '/_seo/:path*');
const globalIndex = headers.findIndex((entry) => entry.source === '/(.*)');
assert(seoIndex !== -1 && globalIndex !== -1, 'Required header rules missing');
assert(seoIndex < globalIndex, '/_seo/:path* header rule should appear before global /(.*) rule');

if (failures.length) {
  console.error('[verify-vercel-headers] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-vercel-headers] Verified internal /_seo/ noindex header config');
