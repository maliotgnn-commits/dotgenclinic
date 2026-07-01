import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUBPAGES } from '../src/subpages-data.js';
import { CLINIC, OG_IMAGE_PATH, LOCALES } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const PUBLIC_OG = resolve(ROOT, 'public', OG_IMAGE_PATH.replace(/^\//, ''));
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function checkOgTwitter(relativePath) {
  const html = readFileSync(resolve(DIST, relativePath), 'utf8');
  assert(html.includes('property="og:title"'), `[${relativePath}] og:title missing`);
  assert(html.includes('property="og:description"'), `[${relativePath}] og:description missing`);
  assert(html.includes('property="og:url"'), `[${relativePath}] og:url missing`);
  assert(html.includes(`property="og:image" content="${CLINIC.ogImageUrl}"`), `[${relativePath}] og:image mismatch`);
  assert(html.includes('name="twitter:card" content="summary_large_image"'), `[${relativePath}] twitter:card missing`);
  assert(html.includes('name="twitter:image"'), `[${relativePath}] twitter:image missing`);
}

['tr/index.html', 'en/index.html', 'ar/index.html', 'de/index.html'].forEach(checkOgTwitter);
['tr/privacy.html', 'en/privacy.html'].forEach(checkOgTwitter);

const sampleSlug = 'botox';
['tr', 'en', 'ar', 'de'].forEach((locale) => {
  checkOgTwitter(`_seo/${locale}/service/${sampleSlug}.html`);
});

assert(existsSync(PUBLIC_OG), `Missing public OG image: ${PUBLIC_OG}`);
assert(CLINIC.ogImageUrl.endsWith(OG_IMAGE_PATH), `OG image URL must point to ${OG_IMAGE_PATH}`);

if (existsSync(PUBLIC_OG)) {
  const png = readFileSync(PUBLIC_OG);
  assert(png.length > 1000 && png.length < 2_000_000, `OG image size unexpected: ${png.length} bytes`);
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  assert(width === 1200 && height === 630, `OG image dimensions ${width}x${height}, expected 1200x630`);
}

if (failures.length) {
  console.error('[verify-og-metadata] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-og-metadata] OG/Twitter validation passed');
