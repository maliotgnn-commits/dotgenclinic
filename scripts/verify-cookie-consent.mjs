import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const failures = [];

const PUBLIC_HTML_SHELLS = [
  'index.html',
  'service.html',
  'privacy.html',
  'goz-hastaliklari.html',
  'finans-departmani.html',
  'hukuk-departmani.html',
  'ilac-ar-ge.html',
  'medikal-ar-ge.html',
  'yazilim-ar-ge.html',
  'blockchain-ar-ge.html',
  'e-ticaret-ar-ge.html',
];

const PUBLIC_ENTRY_FILES = [
  'src/main.js',
  'src/service.js',
  'src/privacy.js',
  'src/eye-health.js',
  'src/finance-department.js',
  'src/legal-department.js',
  'src/pharma-rd-department.js',
  'src/medikal-rd-department.js',
  'src/yazilim-rd-department.js',
  'src/blockchain-rd-department.js',
  'src/ecommerce-rd-department.js',
];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

for (const relativePath of PUBLIC_HTML_SHELLS) {
  const html = readFileSync(resolve(ROOT, relativePath), 'utf8');
  assert(!html.includes('googletagmanager.com/gtm.js'), `${relativePath} must not load GTM inline`);
  assert(!html.includes('googletagmanager.com/ns.html'), `${relativePath} must not include GTM noscript iframe`);
}

for (const relativePath of PUBLIC_ENTRY_FILES) {
  const source = readFileSync(resolve(ROOT, relativePath), 'utf8');
  assert(source.includes("import './cookie-consent.js'"), `${relativePath} must import cookie-consent module`);
}

const analyticsSource = readFileSync(resolve(ROOT, 'src/analytics.js'), 'utf8');
assert(analyticsSource.includes('__dotgenGtmLoaded'), 'analytics.js must push events only after GTM bootstrap');

const cookieConsentSource = readFileSync(resolve(ROOT, 'src/cookie-consent.js'), 'utf8');
assert(cookieConsentSource.includes('cookie-consent__trigger'), 'cookie-consent.js must render top-right consent trigger');
assert(cookieConsentSource.includes('AUTO_DISMISS_MS'), 'cookie-consent.js must auto-dismiss consent widget');
assert(cookieConsentSource.includes('initializeConsentMode'), 'cookie-consent.js must initialize Google Consent Mode defaults');
assert(cookieConsentSource.includes('loadGoogleTagManager'), 'cookie-consent.js must load GTM for all visitors');
assert(cookieConsentSource.includes('dotgen_cookie_consent_v1'), 'cookie-consent.js must persist consent choice');

const cookieConsentCss = readFileSync(resolve(ROOT, 'src/cookie-consent.css'), 'utf8');
assert(cookieConsentCss.includes('bottom: 182px'), 'cookie-consent.css must stack cookie icon above Instagram float');
assert(cookieConsentCss.includes('width: 60px'), 'cookie-consent trigger must match Instagram float size on desktop');

const distIndex = resolve(ROOT, 'dist/index.html');
if (existsSync(distIndex)) {
  const distHtml = readFileSync(distIndex, 'utf8');
  assert(!distHtml.includes('googletagmanager.com/gtm.js'), 'dist/index.html must not load GTM inline');
}

const adminHtml = readFileSync(resolve(ROOT, 'admin/analytics.html'), 'utf8');
assert(!adminHtml.includes('googletagmanager.com'), 'admin analytics page must not include GTM');

if (failures.length) {
  console.error('[verify-cookie-consent] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-cookie-consent] Verified cookie consent integration across public pages');
