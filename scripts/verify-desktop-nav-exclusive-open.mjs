import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const desktopNavJs = readFileSync(resolve(ROOT, 'src/desktop-nav.js'), 'utf8');
const publicHeaderJs = readFileSync(resolve(ROOT, 'src/public-header.js'), 'utf8');
const eyeHealthNavJs = readFileSync(resolve(ROOT, 'src/tr-eye-health-nav.js'), 'utf8');
const megaMenuA11yJs = readFileSync(resolve(ROOT, 'src/mega-menu-a11y.js'), 'utf8');
const styleCss = readFileSync(resolve(ROOT, 'src/style.css'), 'utf8');

assert(desktopNavJs.includes('export function initDesktopNav'), 'desktop-nav.js must export initDesktopNav');
assert(desktopNavJs.includes('export function openDesktopMenu'), 'desktop-nav.js must export openDesktopMenu');
assert(desktopNavJs.includes('export function closeAllDesktopMenus'), 'desktop-nav.js must export closeAllDesktopMenus');
assert(desktopNavJs.includes('export function getDesktopMenuRegistry'), 'desktop-nav.js must export getDesktopMenuRegistry');
assert(desktopNavJs.includes("item.hasAttribute('data-eye-health-nav')"), 'Eye Health must resolve into desktop menu registry');
assert(desktopNavJs.includes(':scope > li.has-dropdown'), 'Registry must include all top-level has-dropdown items');
assert(desktopNavJs.includes('pointerenter'), 'Desktop nav must use pointerenter for hover open');
assert(desktopNavJs.includes('relatedTarget') || desktopNavJs.includes('isWithinNode'), 'Desktop nav must guard pointerleave with related target checks');
assert(!desktopNavJs.includes('mouseenter'), 'Desktop nav must not duplicate mouseenter listeners');

assert(publicHeaderJs.includes("import { initDesktopNav } from './desktop-nav.js'"), 'public-header.js must import initDesktopNav');
assert(publicHeaderJs.includes('initDesktopNav(navMenu'), 'public-header.js must initialize centralized desktop nav');

assert(!eyeHealthNavJs.includes('bindDesktopHover'), 'tr-eye-health-nav.js must not keep separate desktop hover handlers');
assert(!eyeHealthNavJs.includes('openDesktopMega'), 'tr-eye-health-nav.js must not keep separate openDesktopMega');
assert(!eyeHealthNavJs.includes('scheduleDesktopClose'), 'tr-eye-health-nav.js must not keep separate desktop close timer');
assert(eyeHealthNavJs.includes('eh-mobile-group-toggle'), 'Mobile eye health accordion behavior must remain');

assert(megaMenuA11yJs.includes('desktopNav'), 'mega-menu-a11y.js must accept centralized desktop nav controller');

const desktopMediaBlock = styleCss.match(/@media \(width>=1280px\) \{([\s\S]*?)\n\}/);
assert(desktopMediaBlock, 'Desktop media query block missing in style.css');

const desktopCss = desktopMediaBlock?.[1] ?? '';
assert(desktopCss.includes('.has-dropdown.open .mega-dropdown'), 'Desktop panels must open via .open class');
assert(desktopCss.includes('.has-dropdown:hover .mega-dropdown'), 'Desktop hover rule must be neutralized in desktop media query');
assert(!desktopCss.includes('.has-dropdown[data-eye-health-nav]:hover .eh-nav-item-head'), 'Eye Health desktop trigger must not rely on :hover');
assert(desktopCss.includes('.has-dropdown.open > a.desktop-nav-trigger'), 'Standard desktop triggers must use .open active state');

assert(!publicHeaderJs.includes('bindDesktopHover'), 'public-header.js must not attach separate desktop hover listeners');

const indexHtml = existsSync(resolve(ROOT, 'index.html'))
  ? readFileSync(resolve(ROOT, 'index.html'), 'utf8')
  : '';
if (indexHtml) {
  const dropdownCount = (indexHtml.match(/<li class="has-dropdown/g) || []).length;
  assert(dropdownCount >= 7, `index.html must include all seven desktop dropdown menus (found ${dropdownCount})`);
  assert(indexHtml.includes('data-eye-health-nav'), 'index.html must include Eye Health nav in shared markup');
}

if (failures.length) {
  console.error('[verify-desktop-nav-exclusive-open] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-desktop-nav-exclusive-open] Verified centralized exclusive desktop navigation state');
