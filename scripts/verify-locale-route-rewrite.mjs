import { resolveLocaleRewrite, rewriteLocaleRequestUrl, FINANCE_PREVIEW_FILE, FINANCE_FILES, LEGAL_PREVIEW_FILE, LEGAL_FILES, PHARMA_RD_PREVIEW_FILE, PHARMA_RD_FILES, MEDIKAL_RD_PREVIEW_FILE, MEDIKAL_RD_FILES, YAZILIM_RD_PREVIEW_FILE, YAZILIM_RD_FILES, BLOCKCHAIN_RD_PREVIEW_FILE, BLOCKCHAIN_RD_FILES, ECOMMERCE_RD_PREVIEW_FILE, ECOMMERCE_RD_FILES } from './locale-route-rewrite.mjs';

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
expect('/tr/ilac-ar-ge.html', '', '/ilac-ar-ge.html');
expect('/tr/medikal-ar-ge.html', '', '/medikal-ar-ge.html');
expect('/tr/yazilim-ar-ge.html', '', '/yazilim-ar-ge.html');
expect('/tr/blockchain-ar-ge.html', '', '/blockchain-ar-ge.html');
expect('/tr/e-ticaret-ar-ge.html', '', '/e-ticaret-ar-ge.html');
expect('/en/legal-department.html', '', '/hukuk-departmani.html');
expect('/de/rechtsabteilung.html', '', '/hukuk-departmani.html');
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
  rewriteLocaleRequestUrl('/tr/ilac-ar-ge.html') === '/ilac-ar-ge.html',
  'rewriteLocaleRequestUrl must map pharma R&D preview route',
);
assert(
  rewriteLocaleRequestUrl('/tr/medikal-ar-ge.html') === '/medikal-ar-ge.html',
  'rewriteLocaleRequestUrl must map medical R&D preview route',
);
assert(
  PHARMA_RD_PREVIEW_FILE === 'ilac-ar-ge.html',
  'Pharma R&D preview route file constant mismatch',
);
assert(
  LEGAL_PREVIEW_FILE === 'hukuk-departmani.html',
  'Legal preview route file constant mismatch',
);
assert(
  LEGAL_FILES.size === 8,
  'Legal locale route file set must include 8 locale filenames',
);
assert(
  rewriteLocaleRequestUrl('/en/legal-department.html') === '/hukuk-departmani.html',
  'rewriteLocaleRequestUrl must map localized legal routes',
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
assert(
  PHARMA_RD_FILES.size === 8,
  'Pharma R&D locale route file set must include 8 locale filenames',
);
expect('/en/pharmaceutical-r-d.html', '', '/ilac-ar-ge.html');
expect('/de/pharmazeutische-forschung.html', '', '/ilac-ar-ge.html');
assert(
  rewriteLocaleRequestUrl('/en/pharmaceutical-r-d.html') === '/ilac-ar-ge.html',
  'rewriteLocaleRequestUrl must map localized pharma R&D routes',
);
assert(
  MEDIKAL_RD_PREVIEW_FILE === 'medikal-ar-ge.html',
  'Medical R&D preview route file constant mismatch',
);
assert(
  MEDIKAL_RD_FILES.size === 8,
  'Medical R&D locale route file set must include 8 locale filenames',
);
expect('/en/medical-r-d.html', '', '/medikal-ar-ge.html');
expect('/de/medizinische-forschung.html', '', '/medikal-ar-ge.html');
assert(
  rewriteLocaleRequestUrl('/en/medical-r-d.html') === '/medikal-ar-ge.html',
  'rewriteLocaleRequestUrl must map localized medical R&D routes',
);
assert(
  YAZILIM_RD_PREVIEW_FILE === 'yazilim-ar-ge.html',
  'Software R&D preview route file constant mismatch',
);
assert(
  YAZILIM_RD_FILES.size === 8,
  'Software R&D locale route file set must include 8 locale filenames',
);
expect('/en/software-r-d.html', '', '/yazilim-ar-ge.html');
expect('/de/software-forschung.html', '', '/yazilim-ar-ge.html');
assert(
  rewriteLocaleRequestUrl('/en/software-r-d.html') === '/yazilim-ar-ge.html',
  'rewriteLocaleRequestUrl must map localized software R&D routes',
);
assert(
  BLOCKCHAIN_RD_PREVIEW_FILE === 'blockchain-ar-ge.html',
  'Blockchain R&D preview route file constant mismatch',
);
assert(
  BLOCKCHAIN_RD_FILES.size === 8,
  'Blockchain R&D locale route file set must include 8 locale filenames',
);
expect('/en/blockchain-r-d.html', '', '/blockchain-ar-ge.html');
expect('/de/blockchain-forschung.html', '', '/blockchain-ar-ge.html');
assert(
  rewriteLocaleRequestUrl('/en/blockchain-r-d.html') === '/blockchain-ar-ge.html',
  'rewriteLocaleRequestUrl must map localized blockchain R&D routes',
);
assert(
  ECOMMERCE_RD_PREVIEW_FILE === 'e-ticaret-ar-ge.html',
  'E-commerce R&D preview route file constant mismatch',
);
assert(
  ECOMMERCE_RD_FILES.size === 8,
  'E-commerce R&D locale route file set must include 8 locale filenames',
);
expect('/en/e-commerce-r-d.html', '', '/e-ticaret-ar-ge.html');
expect('/de/e-commerce-forschung.html', '', '/e-ticaret-ar-ge.html');
assert(
  rewriteLocaleRequestUrl('/en/e-commerce-r-d.html') === '/e-ticaret-ar-ge.html',
  'rewriteLocaleRequestUrl must map localized e-commerce R&D routes',
);

if (failures.length) {
  console.error('[verify-locale-route-rewrite] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-locale-route-rewrite] Verified locale route rewrite mappings');
