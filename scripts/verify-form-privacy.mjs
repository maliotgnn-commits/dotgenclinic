import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALES } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const INDEX_HTML = resolve(ROOT, 'index.html');
const DIST_INDEX = resolve(ROOT, 'dist', 'index.html');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const sourceHtml = existsSync(DIST_INDEX)
  ? readFileSync(DIST_INDEX, 'utf8')
  : readFileSync(INDEX_HTML, 'utf8');

assert(sourceHtml.includes('id="form-privacy-consent"'), 'Missing privacy consent checkbox');
assert(sourceHtml.includes('type="checkbox"'), 'Checkbox input missing');
assert(sourceHtml.includes('required'), 'Checkbox required attribute missing');
assert(sourceHtml.includes('data-privacy-link'), 'Privacy link in checkbox missing');
assert(sourceHtml.includes('data-privacy-footer-link'), 'Footer privacy link missing');
assert(sourceHtml.includes('id="form-phone"'), 'Missing phone input');
assert(/id="form-phone"[^>]*inputmode="tel"/.test(sourceHtml), 'Phone input must use inputmode="tel"');

const mainJs = readFileSync(resolve(ROOT, 'src/main.js'), 'utf8');
assert(mainJs.includes('let isSubmitting = false'), 'Appointment form must guard against duplicate submissions');

LOCALES.forEach((locale) => {
  const privacy = JSON.parse(readFileSync(resolve(ROOT, `src/i18n/privacy/${locale}.json`), 'utf8'));
  assert(
    privacy.consentLabelHtml.includes(`/${locale}/privacy.html`),
    `[${locale}] consent privacy href mismatch in content source`,
  );
});

if (failures.length) {
  console.error('[verify-form-privacy] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-form-privacy] Form privacy checkbox validation passed');
