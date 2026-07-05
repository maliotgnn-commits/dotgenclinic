import { resolveLocaleRewrite, rewriteLocaleRequestUrl, FINANCE_PREVIEW_FILE, FINANCE_FILES, LEGAL_PREVIEW_FILE } from './locale-route-rewrite.mjs';

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
expect('/tr/finans-departmani.html', '', '/finans-departmani.html');
expect('/tr/hukuk-departmani.html', '', '/hukuk-departmani.html');
expect('/en/finance-department.html', '', '/finans-departmani.html');
expect('/de/finanzabteilung.html', '', '/finans-departmani.html');
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
assert(
  rewriteLocaleRequestUrl('/tr/finans-departmani.html') === '/finans-departmani.html',
  'rewriteLocaleRequestUrl must map finance preview route',
);
assert(
  rewriteLocaleRequestUrl('/tr/hukuk-departmani.html') === '/hukuk-departmani.html',
  'rewriteLocaleRequestUrl must map legal preview route',
);
assert(
  LEGAL_PREVIEW_FILE === 'hukuk-departmani.html',
  'Legal preview route file constant mismatch',
);
assert(
  FINANCE_FILES.size === 8,
  'Finance locale route file set must include 8 locale filenames',
);
assert(
  FINANCE_PREVIEW_FILE === 'finans-departmani.html',
  'Finance preview route file constant mismatch',
);
assert(
  rewriteLocaleRequestUrl('/en/finance-department.html') === '/finans-departmani.html',
  'rewriteLocaleRequestUrl must map localized finance routes',
);

if (failures.length) {
  console.error('[verify-locale-route-rewrite] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-locale-route-rewrite] Verified locale route rewrite mappings');
