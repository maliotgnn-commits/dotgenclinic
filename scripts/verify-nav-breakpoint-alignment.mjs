import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDesktopNavViewport, isMobileNavViewport, MOBILE_NAV_MAX_WIDTH } from '../src/nav-shared.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

assert(MOBILE_NAV_MAX_WIDTH === 1280, 'MOBILE_NAV_MAX_WIDTH must stay 1280 for CSS parity');
assert(isDesktopNavViewport(1280), '1280px must use desktop nav JS to match CSS (width>=1280px)');
assert(isMobileNavViewport(1279), '1279px must use mobile nav JS to match CSS (width<=1279px)');
assert(!isMobileNavViewport(1280), '1280px must not be treated as mobile nav viewport');
assert(!isDesktopNavViewport(1279), '1279px must not be treated as desktop nav viewport');

const styleCss = readFileSync(resolve(ROOT, 'src/style.css'), 'utf8');
assert(styleCss.includes('@media (width>=1280px)'), 'style.css must keep desktop nav breakpoint at 1280px');

const desktopNavJs = readFileSync(resolve(ROOT, 'src/desktop-nav.js'), 'utf8');
const publicHeaderJs = readFileSync(resolve(ROOT, 'src/public-header.js'), 'utf8');
const megaMenuA11yJs = readFileSync(resolve(ROOT, 'src/mega-menu-a11y.js'), 'utf8');

assert(!desktopNavJs.includes('innerWidth > DESKTOP_NAV_MIN_WIDTH'), 'desktop-nav.js must not use strict > breakpoint');
assert(publicHeaderJs.includes('isMobileNavViewport'), 'public-header.js must use shared mobile viewport helper');
assert(!publicHeaderJs.includes('innerWidth <= MOBILE_NAV_MAX_WIDTH'), 'public-header.js must not keep <= mobile breakpoint');
assert(megaMenuA11yJs.includes('isMobileNavViewport'), 'mega-menu-a11y.js must use shared mobile viewport helper');
assert(!megaMenuA11yJs.includes('innerWidth <= 1280'), 'mega-menu-a11y.js must not hardcode <= 1280 checks');

if (failures.length) {
  console.error('[verify-nav-breakpoint-alignment] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-nav-breakpoint-alignment] Verified JS/CSS nav breakpoint alignment at 1280px');
