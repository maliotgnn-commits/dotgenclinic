import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALES, CLINIC } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

for (const locale of LOCALES) {
  const filePath = resolve(DIST, locale, 'privacy.html');
  const label = locale;
  const content = JSON.parse(readFileSync(resolve(ROOT, `src/i18n/privacy/${locale}.json`), 'utf8'));

  assert(existsSync(filePath), `[${label}] Missing dist/${locale}/privacy.html`);

  if (!existsSync(filePath)) continue;

  const html = readFileSync(filePath, 'utf8');
  assert(html.includes(`<title>${content.meta.title}</title>`) || html.includes(content.meta.title), `[${label}] title missing`);
  assert(html.includes(`content="${content.meta.description}"`), `[${label}] description missing`);
  assert(html.includes(`href="https://www.drotgenclinic.com/${locale}/privacy.html"`), `[${label}] canonical missing`);
  assert((html.match(/hreflang="/g) || []).length >= 9, `[${label}] hreflang missing`);
  assert(html.includes('property="og:title"'), `[${label}] og:title missing`);
  assert(html.includes('name="twitter:card"'), `[${label}] twitter:card missing`);
  assert(html.includes('application/ld+json'), `[${label}] JSON-LD missing`);
  assert(!html.includes('KEP'), `[${label}] KEP placeholder found`);
  assert(!html.includes('{{'), `[${label}] unresolved placeholder found`);
  assert(html.includes('kvkk@drotgenclinic.com'), `[${label}] KVKK email missing`);
  assert(html.includes('Anadolu Plaza No:23, Karşıyaka, İzmir, 35560, Türkiye'), `[${label}] KVKK address missing`);
  assert(html.includes(content.webFormSection.title), `[${label}] web form section missing`);
  assert(html.includes(content.locationsSection.title), `[${label}] locations section missing`);
  assert(html.includes(CLINIC.locations[0].address), `[${label}] Izmir address missing`);

  if (locale === 'ar') {
    assert(html.includes('lang="ar"'), `[${label}] lang=ar missing`);
    assert(html.includes('dir="rtl"'), `[${label}] dir=rtl missing`);
  }
}

if (failures.length) {
  console.error('[verify-privacy-static-seo] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log(`[verify-privacy-static-seo] Verified ${LOCALES.length} privacy pages`);
