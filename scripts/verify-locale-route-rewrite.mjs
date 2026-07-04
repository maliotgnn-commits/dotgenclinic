import { resolveLocaleRewrite, rewriteLocaleRequestUrl } from './locale-route-rewrite.mjs';

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function expect(pathname, search, expected) {
  const actual = resolveLocaleRewrite(pathname, search);
  assert(actual === expected, `Expected ${pathname}${search} -> ${expected}, got ${actual}`);
}

expect('/en/', '', '/index.html');
expect('/en', '', '/index.html');
expect('/en/service.html', '?slug=botox', '/service.html?slug=botox');
expect('/de/privacy.html', '', '/privacy.html');
expect('/ar/service.html', '?slug=botox', '/service.html?slug=botox');
expect('/ru/privacy.html', '', '/privacy.html');
expect('/tr/goz-hastaliklari.html', '', '/goz-hastaliklari.html');
expect('/en/eye-health.html', '', '/goz-hastaliklari.html');
expect('/ar/صحة-العين.html', '', '/goz-hastaliklari.html');
expect('/ru/здоровье-глаз.html', '', '/goz-hastaliklari.html');

const encodedArEye = `/ar/${encodeURIComponent('صحة-العين.html')}`;
expect(encodedArEye, '', '/goz-hastaliklari.html');

assert(
  rewriteLocaleRequestUrl('/en/service.html?slug=botox') === '/service.html?slug=botox',
  'rewriteLocaleRequestUrl must preserve query string for service routes',
);
assert(
  rewriteLocaleRequestUrl('/de/privacy.html') === '/privacy.html',
  'rewriteLocaleRequestUrl must map privacy routes',
);
assert(
  rewriteLocaleRequestUrl('/en/service.html?slug=botox') !== '/index.html?slug=botox',
  'service routes must not fall back to index.html',
);
assert(
  rewriteLocaleRequestUrl('/de/privacy.html') !== '/index.html',
  'privacy routes must not fall back to index.html',
);

if (failures.length) {
  console.error('[verify-locale-route-rewrite] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-locale-route-rewrite] Verified locale route rewrite mappings');
