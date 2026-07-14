import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALES } from './seo-shared.mjs';
import { buildWhatsAppUrl } from '../src/whatsapp-links.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

// AVIF asset + picture fallback checks
const indexHtml = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
const avifRefs = [...new Set([...indexHtml.matchAll(/\/images\/[^"'`\s]+\.avif/g)].map((m) => m[0]))];
for (const ref of avifRefs) {
  assert(existsSync(join(ROOT, 'public', ref)), `Missing AVIF asset: ${ref}`);
}

const pictureBlocks = [...indexHtml.matchAll(/<picture>[\s\S]*?<\/picture>/g)];
for (const [i, block] of pictureBlocks.entries()) {
  assert(block[0].includes('type="image/webp"'), `Picture #${i + 1} missing WebP source fallback`);
  assert(block[0].includes('<img '), `Picture #${i + 1} missing img fallback`);
}

// Schema sample (botox has FAQs)
const botoxPath = resolve(ROOT, 'dist/_seo/tr/service/botox.html');
if (existsSync(botoxPath)) {
  const botoxHtml = readFileSync(botoxPath, 'utf8');
  const match = botoxHtml.match(/<script data-i18n-seo="true" type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert(match, 'botox.html missing JSON-LD');
  if (match) {
    const data = JSON.parse(match[1]);
    const graph = data['@graph'] || [data];
    const faq = graph.find((n) => n['@type'] === 'FAQPage');
    const service = graph.find((n) => n['@type'] === 'Service');
    assert(faq, 'botox FAQPage missing');
    assert(service?.areaServed?.length >= 1, 'botox Service areaServed missing');
    if (faq) {
      assert(Array.isArray(faq.mainEntity) && faq.mainEntity.length > 0, 'botox FAQPage empty');
      faq.mainEntity.forEach((q, idx) => {
        assert(q['@type'] === 'Question', `FAQ item ${idx} not Question`);
        assert(q.acceptedAnswer?.['@type'] === 'Answer', `FAQ item ${idx} missing Answer`);
      });
    }
  }
} else {
  failures.push('dist/_seo/tr/service/botox.html not found — run build first');
}

// WhatsApp locale coverage
const categories = ['hair', 'dental', 'plastic', 'medical', 'longevity', 'corporate', 'default'];
for (const locale of LOCALES) {
  for (const category of categories) {
    const url = buildWhatsAppUrl({ locale, category, pageTitle: 'Test' });
    assert(url.includes('wa.me/905411595636'), `WhatsApp URL invalid for ${locale}/${category}`);
    assert(url.includes('text='), `WhatsApp text param missing for ${locale}/${category}`);
    const decoded = decodeURIComponent(url);
    assert(decoded.length > 30, `WhatsApp message too short for ${locale}/${category}`);
  }
}

// analytics.js service_slug check
const analyticsSrc = readFileSync(resolve(ROOT, 'src/analytics.js'), 'utf8');
assert(analyticsSrc.includes('service_slug'), 'analytics.js missing service_slug in whatsapp_click');

// CSP domain coverage (static analysis)
const vercel = JSON.parse(readFileSync(resolve(ROOT, 'vercel.json'), 'utf8'));
const csp = vercel.headers?.find((h) => h.source === '/(.*)')?.headers?.find((h) => h.key === 'Content-Security-Policy')?.value || '';
const connectSrcMatch = csp.match(/connect-src ([^;]+)/)?.[1] || '';
const connectRequired = [
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://analytics.google.com',
  'https://formsubmit.co',
];
for (const domain of connectRequired) {
  assert(connectSrcMatch.includes(domain), `CSP connect-src missing ${domain}`);
}
assert(csp.includes("script-src 'self' 'unsafe-inline' https://www.googletagmanager.com"), 'CSP script-src missing GTM');
assert(csp.includes('https://fonts.googleapis.com'), 'CSP style-src missing Google Fonts');
assert(csp.includes('https://fonts.gstatic.com'), 'CSP font-src missing gstatic');
assert(csp.includes('frame-src https://www.googletagmanager.com'), 'CSP frame-src missing GTM');
assert(csp.includes('form-action \'self\' https://formsubmit.co'), 'CSP form-action missing FormSubmit');

if (failures.length) {
  console.error('[verify-production-branch] FAILED:');
  failures.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}

console.log('[verify-production-branch] All checks passed');
console.log(`  AVIF refs: ${avifRefs.length}, picture blocks: ${pictureBlocks.length}`);
console.log(`  WhatsApp: ${LOCALES.length} locales x ${categories.length} categories`);
console.log('  Schema: botox FAQPage + Service OK');
console.log('  CSP: GTM/GA4/FormSubmit/Fonts domains present');
