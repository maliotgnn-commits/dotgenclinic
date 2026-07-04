import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EYE_HEALTH_LANDING_PATH,
  extractEyeHealthNavBlock,
  renderEyeHealthNavItem,
} from '../src/tr-eye-health-nav.js';
import { LOCALES, DEFAULT_LOCALE } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const failures = [];
const NON_TR_LOCALES = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function collectEyeHealthHrefs(navHtml) {
  return [...navHtml.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
}

function assertEyeHealthNav(navHtml, label) {
  assert(navHtml.length > 0, `[${label}] missing Göz Hastalıkları nav block`);

  const hrefs = collectEyeHealthHrefs(navHtml);
  assert(hrefs.length > 0, `[${label}] no eye health nav hrefs found`);

  for (const href of hrefs) {
    assert(href === EYE_HEALTH_LANDING_PATH, `[${label}] unexpected href "${href}"`);
    assert(!href.includes('#'), `[${label}] fragment found in href "${href}"`);
  }
}

function assertNoEyeHealthNav(html, label) {
  assert(!html.includes('data-eye-health-nav'), `[${label}] TR-only eye health nav must be absent`);
  assert(!html.includes('eye-health-mega-menu'), `[${label}] TR-only eye health mega menu must be absent`);
}

const indexSource = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
const navSource = readFileSync(resolve(ROOT, 'src/tr-eye-health-nav.js'), 'utf8');
const eyeHealthJs = readFileSync(resolve(ROOT, 'src/eye-health.js'), 'utf8');
const mainJs = readFileSync(resolve(ROOT, 'src/main.js'), 'utf8');
const serviceJs = readFileSync(resolve(ROOT, 'src/service.js'), 'utf8');

assertEyeHealthNav(extractEyeHealthNavBlock(indexSource), 'index.html source');
assertEyeHealthNav(renderEyeHealthNavItem(), 'renderEyeHealthNavItem() output');
assert(!navSource.includes('goz-hastaliklari.html#'), '[tr-eye-health-nav.js] fragment href found in source');
assert(!indexSource.includes('goz-hastaliklari.html#'), '[index.html] fragment href found in source');

assert(eyeHealthJs.includes('normalizeEyeHealthLandingHash'), '[eye-health.js] hash normalization missing');
assert(eyeHealthJs.includes('initEyeHealthNavLinks'), '[eye-health.js] scoped nav link handler missing');
assert(mainJs.includes('initSmoothScroll'), '[main.js] existing anchor scroll behavior must remain');
assert(!serviceJs.includes('goz-hastaliklari.html#'), '[service.js] fragment eye health href must not exist');

const trHomeDist = resolve(DIST, 'tr', 'index.html');
assert(existsSync(trHomeDist), 'Missing dist/tr/index.html for navigation verification');
if (existsSync(trHomeDist)) {
  const trHomeHtml = readFileSync(trHomeDist, 'utf8');
  assertEyeHealthNav(extractEyeHealthNavBlock(trHomeHtml), 'dist/tr/index.html');
}

for (const locale of NON_TR_LOCALES) {
  const homePath = resolve(DIST, locale, 'index.html');
  if (!existsSync(homePath)) {
    failures.push(`[dist/${locale}/index.html] missing locale home output`);
    continue;
  }
  assertNoEyeHealthNav(readFileSync(homePath, 'utf8'), `dist/${locale}/index.html`);
}

if (failures.length) {
  console.error('[verify-tr-eye-navigation] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-tr-eye-navigation] Verified fragment-free Göz Hastalıkları navigation rules');
