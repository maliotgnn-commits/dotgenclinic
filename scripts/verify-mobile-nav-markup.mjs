import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EYE_HEALTH_ROUTES, EYE_HEALTH_LOCALES } from '../src/eye-health-routes.js';
import { CATEGORY_ORDER } from '../src/subpages-data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const failures = [];
const EXPECTED_DROPDOWN_CATEGORIES = CATEGORY_ORDER.length + 2;

function fail(message) {
  failures.push(message);
}

function read(path) {
  return readFileSync(path, 'utf8');
}

function extractTopLevelNavItems(html) {
  const menuMatch = html.match(/<ul class="nav-menu" id="nav-menu">([\s\S]*?)<\/ul>/);
  if (!menuMatch) return [];

  const menuBody = menuMatch[1];
  return menuBody.match(/<li class="has-dropdown\b[^>]*>[\s\S]*?<\/li>/gi) || [];
}

function topLevelLabel(itemHtml) {
  const buttonLabel = itemHtml.match(/<span class="mobile-nav-label">([^<]*)<\/span>/)?.[1]?.trim();
  if (buttonLabel) return buttonLabel;

  const primaryLabel = itemHtml.match(/class="eh-nav-primary-link"[^>]*>([^<]+)/i)?.[1]?.trim();
  if (primaryLabel) return primaryLabel;

  const anchorMatch = itemHtml.match(/<li class="has-dropdown\b[^>]*>\s*<a[^>]*>([^<]+)/i);
  return anchorMatch?.[1]?.trim() || '';
}

function assertEyeHealthLinks(html, locale, label) {
  const expectedPath = EYE_HEALTH_ROUTES[locale]?.path;
  if (!expectedPath) return;

  const eyeBlock = html.match(/<li\b[^>]*\bdata-eye-health-nav\b[^>]*>[\s\S]*?<\/li>/i)?.[0];
  if (!eyeBlock) {
    fail(`${label}: eye health nav block missing`);
    return;
  }

  const hrefs = [...eyeBlock.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  hrefs.forEach((href, index) => {
    if (href.includes('#')) fail(`${label}: eye health link ${index} contains hash (${href})`);
    const normalized = decodeURIComponent(href.split('#')[0]);
    const expected = decodeURIComponent(expectedPath);
    if (normalized !== expected) {
      fail(`${label}: eye health link ${index} expected ${expected}, got ${normalized}`);
    }
  });
}

const publicHeaderJs = read(resolve(ROOT, 'src/public-header.js'));
const navSharedJs = read(resolve(ROOT, 'src/nav-shared.js'));

if (!publicHeaderJs.includes('nav-drawer-close')) {
  fail('public-header.js must define drawer close handler');
}
if (!publicHeaderJs.includes('bindMobileAccordions')) {
  fail('public-header.js must bind mobile accordion handlers');
}
if (!publicHeaderJs.includes('upgradeCategoryTriggers')) {
  fail('public-header.js must upgrade static category triggers for mobile');
}
if (!navSharedJs.includes('renderMobileCategoryTrigger')) {
  fail('nav-shared.js must expose canonical mobile category trigger markup');
}

for (const locale of EYE_HEALTH_LOCALES) {
  const filePath = resolve(DIST, locale, 'index.html');
  const label = `dist/${locale}/index.html`;

  if (!existsSync(filePath)) {
    fail(`Missing ${label}`);
    continue;
  }

  const html = read(filePath);
  const items = extractTopLevelNavItems(html);
  const labels = items.map(topLevelLabel).filter(Boolean);

  if (items.length !== EXPECTED_DROPDOWN_CATEGORIES) {
    fail(
      `${label}: expected ${EXPECTED_DROPDOWN_CATEGORIES} top-level nav categories, found ${items.length}`,
    );
  }

  const duplicateLabels = labels.filter((value, index) => labels.indexOf(value) !== index);
  if (duplicateLabels.length) {
    fail(`${label}: duplicate top-level labels (${duplicateLabels.join(', ')})`);
  }

  items.forEach((item, index) => {
    const mobileButtons = item.match(/class="[^"]*mobile-nav-trigger[^"]*"/gi) || [];
    if (mobileButtons.length > 1) {
      fail(`${label}: category ${index} has ${mobileButtons.length} mobile trigger buttons in markup`);
    }

    const hasTriggerSource =
      /<button[^>]*mobile-nav-trigger/.test(item)
      || /<li class="has-dropdown\b[^>]*>\s*<a/.test(item)
      || /eh-nav-primary-link/.test(item);
    if (!hasTriggerSource) {
      fail(`${label}: category ${index} missing mobile or desktop trigger source`);
    }
  });

  const eyeItem = html.match(/<li\b[^>]*\bdata-eye-health-nav\b[^>]*>[\s\S]*?<\/li>/i)?.[0];
  if (eyeItem) {
    const eyeButton = eyeItem.match(/<button[^>]*eh-mobile-nav-trigger[^>]*>[\s\S]*?<\/button>/i)?.[0];
    const hasDesktopPrimary = /eh-nav-primary-link/.test(eyeItem);
    if (!eyeButton && !hasDesktopPrimary) {
      fail(`${label}: eye health nav missing trigger source`);
    }
    if (eyeButton && (!/aria-expanded="false"/.test(eyeButton) || !/aria-controls="[^"]+"/.test(eyeButton))) {
      fail(`${label}: eye health mobile trigger missing aria attributes`);
    }
  }

  if (/nav-mobile-cta-item|nav-mobile-cta/.test(html)) {
    fail(`${label}: mobile drawer CTA markup present`);
  }

  if (locale !== 'tr' && /data-tr-only-nav/.test(html)) {
    fail(`${label}: TR-only eye health nav block must be replaced for non-TR locales`);
  }

  assertEyeHealthLinks(html, locale, label);
}

if (failures.length) {
  console.error('[verify-mobile-nav-markup] Failed:');
  failures.forEach((item) => console.error(`  - ${item}`));
  process.exit(1);
}

console.log('[verify-mobile-nav-markup] Verified mobile nav markup for all locale home pages');
