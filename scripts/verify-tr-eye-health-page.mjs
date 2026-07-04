import { readFileSync, existsSync, readdirSync } from 'node:fs';
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
const CATEGORY_EYES_PUBLIC = resolve(ROOT, 'public', 'images', 'goz-hastaliklari', 'category-eyes');
const CATEGORY_EYES_DIST = resolve(DIST, 'images', 'goz-hastaliklari', 'category-eyes');

const CATEGORY_EYE_FILES = [
  'category-eye-general-health.png',
  'category-eye-laser.png',
  'category-eye-cataract.png',
  'category-eye-retina.png',
  'category-eye-eyelid-orbita.png',
  'category-eye-other-treatments.png',
];

const CATEGORY_EYE_PATHS = CATEGORY_EYE_FILES.map(
  (file) => `/images/goz-hastaliklari/category-eyes/${file}`,
);

const ICON_TO_EYE = {
  exam: '/images/goz-hastaliklari/category-eyes/category-eye-general-health.png',
  laser: '/images/goz-hastaliklari/category-eyes/category-eye-laser.png',
  lens: '/images/goz-hastaliklari/category-eyes/category-eye-cataract.png',
  retina: '/images/goz-hastaliklari/category-eyes/category-eye-retina.png',
  eyelid: '/images/goz-hastaliklari/category-eyes/category-eye-eyelid-orbita.png',
  care: '/images/goz-hastaliklari/category-eyes/category-eye-other-treatments.png',
};

const LEGACY_CATEGORY_SVG_MARKERS = [
  'class="eh-category-icon"',
  'viewBox="0 0 64 64"',
];

const OTHER_LOCALES = ['en', 'ar', 'es', 'fr', 'it', 'ru', 'de'];
function extractCategoryCard(html, categoryId) {
  const marker = `<article class="eh-category-card" id="${categoryId}">`;
  const start = html.indexOf(marker);
  if (start === -1) return null;

  let depth = 0;
  let index = start;
  while (index < html.length) {
    if (html.startsWith('<article', index)) {
      depth += 1;
      index += 8;
      continue;
    }
    if (html.startsWith('</article>', index)) {
      depth -= 1;
      index += 10;
      if (depth === 0) {
        return html.slice(start, index);
      }
      continue;
    }
    index += 1;
  }

  return null;
}

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

assert(existsSync(PAGE_PATH), 'Missing dist/tr/goz-hastaliklari.html');

for (const file of CATEGORY_EYE_FILES) {
  assert(
    existsSync(resolve(CATEGORY_EYES_PUBLIC, file)),
    `Missing public category eye image ${file}`,
  );
}

if (existsSync(CATEGORY_EYES_DIST)) {
  for (const file of CATEGORY_EYE_FILES) {
    assert(
      existsSync(resolve(CATEGORY_EYES_DIST, file)),
      `Missing dist category eye image ${file}`,
    );
  }
} else {
  failures.push('Missing dist/images/goz-hastaliklari/category-eyes/');
}

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

  for (const eyePath of CATEGORY_EYE_PATHS) {
    assert(html.includes(eyePath), `missing category eye image reference ${eyePath}`);
  }

  const eyeImageCount = (html.match(/class="eh-category-eye"/g) || []).length;
  assert(eyeImageCount === 6, `expected 6 category eye images, found ${eyeImageCount}`);

  for (const category of EYE_HEALTH_CATEGORIES) {
    const expectedEye = ICON_TO_EYE[category.icon];
    const cardHtml = extractCategoryCard(html, category.id);
    assert(cardHtml, `missing category card markup for ${category.id}`);
    if (cardHtml) {
      assert(
        cardHtml.includes(expectedEye),
        `category ${category.id} must use ${expectedEye}`,
      );
      assert(
        (cardHtml.match(new RegExp(expectedEye.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length === 1,
        `category ${category.id} must reference its eye image exactly once`,
      );
    }
  }

  for (const marker of LEGACY_CATEGORY_SVG_MARKERS) {
    assert(!html.includes(marker), `legacy category SVG marker still present: ${marker}`);
  }

  const decorativeEyeTags = [...html.matchAll(/<img class="eh-category-eye"[^>]*>/g)];
  assert(decorativeEyeTags.length === 6, `expected 6 decorative eye img tags, found ${decorativeEyeTags.length}`);
  for (const match of decorativeEyeTags) {
    const tag = match[0];
    assert(tag.includes('alt=""'), 'category eye image must use alt=""');
    assert(tag.includes('aria-hidden="true"'), 'category eye image must use aria-hidden="true"');
    assert(tag.includes('loading="lazy"'), 'category eye image must use loading="lazy"');
    assert(tag.includes('decoding="async"'), 'category eye image must use decoding="async"');
    assert(tag.includes('width="96"'), 'category eye image must declare width="96"');
    assert(tag.includes('height="60"'), 'category eye image must declare height="60"');
  }
}

for (const locale of OTHER_LOCALES) {
  const localeDist = resolve(DIST, locale);
  if (!existsSync(localeDist)) continue;
  const htmlFiles = readdirSync(localeDist).filter((name) => name.endsWith('.html'));
  for (const file of htmlFiles) {
    const content = readFileSync(resolve(localeDist, file), 'utf8');
    for (const eyePath of CATEGORY_EYE_PATHS) {
      assert(
        !content.includes(eyePath),
        `${locale}/${file} must not reference TR category eye image ${eyePath}`,
      );
    }
    assert(!content.includes('class="eh-category-eye"'), `${locale}/${file} must not include TR category eye markup`);
  }
}

const arIndex = resolve(DIST, 'ar', 'index.html');
if (existsSync(arIndex)) {
  const arHtml = readFileSync(arIndex, 'utf8');
  assert(arHtml.includes('lang="ar"'), 'AR index must keep lang="ar"');
  assert(arHtml.includes('dir="rtl"'), 'AR index must keep dir="rtl"');
}

if (failures.length) {
  console.error('[verify-tr-eye-health-page] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-tr-eye-health-page] Verified dist/tr/goz-hastaliklari.html');
