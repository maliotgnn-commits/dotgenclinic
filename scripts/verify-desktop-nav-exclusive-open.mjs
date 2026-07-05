import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const failures = [];

const EXPECTED_MENU_IDS = [
  'corporate',
  'hair',
  'dental',
  'plastic',
  'medical-aesthetics',
  'functional-health',
  'eye-health',
];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function collectMenuIds(html) {
  return [...html.matchAll(/<li\b[^>]*\bdata-desktop-menu-id="([^"]+)"/g)].map((match) => match[1]);
}

const desktopNavJs = readFileSync(resolve(ROOT, 'src/desktop-nav.js'), 'utf8');
const navSharedJs = readFileSync(resolve(ROOT, 'src/nav-shared.js'), 'utf8');
const publicHeaderJs = readFileSync(resolve(ROOT, 'src/public-header.js'), 'utf8');
const eyeHealthNavJs = readFileSync(resolve(ROOT, 'src/tr-eye-health-nav.js'), 'utf8');
const styleCss = readFileSync(resolve(ROOT, 'src/style.css'), 'utf8');
const indexHtml = readFileSync(resolve(ROOT, 'index.html'), 'utf8');

assert(navSharedJs.includes('desktopMenuIdForCategory'), 'nav-shared.js must define desktopMenuIdForCategory');
assert(navSharedJs.includes('medical-aesthetics'), 'nav-shared.js must map medical category to medical-aesthetics');
assert(navSharedJs.includes('functional-health'), 'nav-shared.js must map longevity category to functional-health');
assert(!desktopNavJs.includes('textContent'), 'desktop-nav.js must not derive menu IDs from visible text');
assert(desktopNavJs.includes('dataset.desktopMenuId'), 'desktop-nav.js must read stable data-desktop-menu-id attributes');
assert(publicHeaderJs.includes('desktopMenuIdForIndex'), 'public-header.js must assign stable menu IDs during trigger upgrade');
assert(eyeHealthNavJs.includes('data-desktop-menu-id="eye-health"'), 'eye health nav must expose stable eye-health menu id');

const indexIds = collectMenuIds(indexHtml);
assert(indexIds.length === 7, `index.html must define 7 desktop menu ids (found ${indexIds.length})`);
EXPECTED_MENU_IDS.forEach((menuId) => {
  assert(indexIds.includes(menuId), `index.html missing data-desktop-menu-id="${menuId}"`);
});
assert(new Set(indexIds).size === indexIds.length, `index.html desktop menu ids must be unique: ${indexIds.join(', ')}`);

assert(styleCss.includes('.nav-menu > li.has-dropdown.open'), 'desktop nav triggers must stack above open panels');

assert(desktopNavJs.includes('export function initDesktopNav'), 'desktop-nav.js must export initDesktopNav');
assert(desktopNavJs.includes('pointerenter'), 'Desktop nav must use pointerenter for hover open');
assert(publicHeaderJs.includes('initDesktopNav(navMenu'), 'public-header.js must initialize centralized desktop nav');
assert(!eyeHealthNavJs.includes('bindDesktopHover'), 'tr-eye-health-nav.js must not keep separate desktop hover handlers');

const desktopMediaBlock = styleCss.match(/@media \(width>=1280px\) \{([\s\S]*?)\n\}/);
assert(desktopMediaBlock, 'Desktop media query block missing in style.css');
const desktopCss = desktopMediaBlock?.[1] ?? '';
assert(desktopCss.includes('.has-dropdown.open .mega-dropdown'), 'Desktop panels must open via .open class');
assert(!desktopCss.includes('.has-dropdown[data-eye-health-nav]:hover .eh-nav-item-head'), 'Eye Health desktop trigger must not rely on :hover');

const ruHome = resolve(DIST, 'ru', 'index.html');
assert(existsSync(ruHome), 'Missing dist/ru/index.html for desktop nav trigger coverage check');
if (existsSync(ruHome)) {
  const ruHtml = readFileSync(ruHome, 'utf8');
  const ruIds = collectMenuIds(ruHtml);
  assert(ruIds.length === 7, `[dist/ru/index.html] expected 7 desktop menu ids, found ${ruIds.length}`);
  assert(new Set(ruIds).size === 7, `[dist/ru/index.html] desktop menu ids must be unique: ${ruIds.join(', ')}`);
  EXPECTED_MENU_IDS.forEach((menuId) => {
    assert(ruIds.includes(menuId), `[dist/ru/index.html] missing data-desktop-menu-id="${menuId}"`);
  });
  assert(ruHtml.includes('О клинике'), '[dist/ru/index.html] Russian short corporate label must remain visible');
  assert(ruHtml.includes('Офтальмология'), '[dist/ru/index.html] Russian short eye health label must remain visible');
}

if (failures.length) {
  console.error('[verify-desktop-nav-exclusive-open] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-desktop-nav-exclusive-open] Verified centralized exclusive desktop navigation state and stable menu IDs');
