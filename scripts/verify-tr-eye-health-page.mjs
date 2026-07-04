import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EYE_HEALTH_CATEGORIES,
  EYE_HEALTH_PAGE,
} from '../src/eye-health-data.js';
import { SITE_ORIGIN, escapeHtml } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const PAGE_PATH = resolve(DIST, 'tr', 'goz-hastaliklari.html');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

assert(existsSync(PAGE_PATH), 'Missing dist/tr/goz-hastaliklari.html');

if (existsSync(PAGE_PATH)) {
  const html = readFileSync(PAGE_PATH, 'utf8');

  assert(html.includes(`<title>${EYE_HEALTH_PAGE.title}</title>`), 'title missing');
  assert(html.includes(`content="${EYE_HEALTH_PAGE.description}"`), 'description missing');
  assert(html.includes(`href="${SITE_ORIGIN}/tr/goz-hastaliklari.html"`), 'canonical missing');
  assert(!html.includes('hreflang='), 'hreflang must not be present on TR-only page');
  assert(html.includes('property="og:title"'), 'og:title missing');
  assert(html.includes('name="twitter:card"'), 'twitter:card missing');
  assert(!html.includes('application/ld+json'), 'JSON-LD must not be added');
  assert(!html.includes('Tıbbi Birimlerimiz'), 'forbidden phrase found');
  assert(html.includes(escapeHtml(EYE_HEALTH_PAGE.hero.title)), 'hero title missing');
  assert(html.includes(EYE_HEALTH_PAGE.hero.image), 'hero image missing');
  assert(html.includes(EYE_HEALTH_PAGE.doctor.image), 'doctor image missing');
  assert(html.includes(escapeHtml(EYE_HEALTH_PAGE.doctor.name)), 'doctor name missing');
  assert(html.includes('Göz Hastalıkları'), 'page heading marker missing');

  const topicCount = EYE_HEALTH_CATEGORIES.reduce((total, category) => total + category.topics.length, 0);
  assert(topicCount === 20, `expected 20 topics, computed ${topicCount}`);

  for (const category of EYE_HEALTH_CATEGORIES) {
    assert(html.includes(`id="${category.id}"`), `missing category anchor ${category.id}`);
    for (const topic of category.topics) {
      assert(html.includes(escapeHtml(topic.title)), `missing topic title ${topic.title}`);
    }
  }
}

if (failures.length) {
  console.error('[verify-tr-eye-health-page] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-tr-eye-health-page] Verified dist/tr/goz-hastaliklari.html');
