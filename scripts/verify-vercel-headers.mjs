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

const seoHeaderRule = headers.find((entry) => entry.source === '/_seo/:path*' || entry.source.includes('/_seo/'));
assert(!seoHeaderRule, 'Internal /_seo/ header rule must not exist (Vercel applies it to rewritten public service URLs)');

for (const rule of headers) {
  const robotsHeader = rule.headers?.find((header) => header.key === 'X-Robots-Tag');
  if (!robotsHeader) continue;

  assert(
    false,
    `X-Robots-Tag must not be configured in vercel.json (source: ${rule.source}, value: ${robotsHeader.value})`,
  );
}

const globalHeaderRule = headers.find((entry) => entry.source === '/(.*)');
assert(globalHeaderRule, 'Missing global /(.*) header rule in vercel.json');

const requiredGlobalHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'X-Frame-Options': 'DENY',
};

for (const [key, value] of Object.entries(requiredGlobalHeaders)) {
  const header = globalHeaderRule.headers?.find((entry) => entry.key === key);
  assert(header, `Missing global header: ${key}`);
  assert(header.value === value, `Global header ${key} mismatch: expected "${value}", found "${header?.value}"`);
}

if (failures.length) {
  console.error('[verify-vercel-headers] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-vercel-headers] Verified no X-Robots-Tag rules and preserved security headers');
