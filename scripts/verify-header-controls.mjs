import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function read(path) {
  return readFileSync(path, 'utf8');
}

function extractRule(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`, '');
  return re.exec(css)?.[1] ?? '';
}

function assertHeaderTemplate(label, source) {
  assert(source.includes('class="nav-primary"'), `${label}: nav-primary wrapper missing`);
  assert(source.includes('class="nav-actions"'), `${label}: nav-actions wrapper missing`);
  assert(
    /class="nav-primary"[\s\S]*?class="nav-menu"/.test(source),
    `${label}: nav-menu must live inside nav-primary`,
  );
  assert(
    /class="nav-actions"[\s\S]*?nav-language-slot/.test(source),
    `${label}: language switcher must live inside nav-actions`,
  );
  assert(
    /class="nav-actions"[\s\S]*?class="nav-cta"/.test(source),
    `${label}: nav-cta must live inside nav-actions`,
  );
  assert(
    !/nav-mobile-cta-item|renderMobileNavCtaItem/.test(source),
    `${label}: mobile drawer must not include appointment CTA`,
  );
  assert(
    /class="nav-actions"[\s\S]*?(class="hamburger"|id="hamburger")/.test(source),
    `${label}: hamburger must live inside nav-actions`,
  );
}

function assertBuiltHeader(label, html) {
  assertHeaderTemplate(label, html);
  assert(
    !/class="nav-cta"[^>]*style="[^"]*display:\s*none/i.test(html),
    `${label}: nav-cta must not be inline-hidden`,
  );
}

const styleCss = read(resolve(ROOT, 'src/style.css'));
const navContainerBase = extractRule(styleCss, '.nav-container');
const navMenuBase = extractRule(styleCss, '.nav-menu');
const navPrimaryBase = extractRule(styleCss, '.nav-primary');
const navMenuDesktopRules = (
  styleCss.match(/@media \(width>=1280px\)[\s\S]*?@media \(width<=1279px\)/)?.[0] || ''
).match(/\.nav-menu\s*\{[^}]*\}/g)?.join('\n') || '';

assert(
  /\.nav-container[\s\S]*?display:\s*grid[\s\S]*?grid-template-columns:\s*auto minmax\(0,\s*1fr\) auto/.test(styleCss),
  'nav-container must use a three-column grid (auto minmax(0, 1fr) auto)',
);

assert(
  /(?:^|[;\s])height:\s*80px/.test(navContainerBase),
  'nav-container must keep a fixed 80px header height',
);

assert(
  navPrimaryBase.includes('min-width: 0') && navPrimaryBase.includes('max-width: 100%'),
  'nav-primary must constrain navigation to the middle column',
);

assert(
  navMenuBase.includes('flex-wrap: nowrap'),
  'nav-menu must stay on a single row (flex-wrap: nowrap)',
);

assert(
  !/flex-wrap:\s*wrap/.test(navMenuBase + navMenuDesktopRules),
  'nav-menu must not use flex-wrap: wrap',
);

assert(
  navMenuBase.includes('justify-content: center'),
  'nav-menu must center symmetrically within nav-primary',
);

assert(
  navMenuBase.includes('position: relative'),
  'nav-menu must stay in normal document flow',
);

assert(
  !/(?:^|[;\s])position:\s*absolute/.test(navMenuBase + navMenuDesktopRules),
  'nav-menu must not use absolute positioning',
);

assert(
  !/(?:^|[;\s])left:\s*50%/.test(navMenuBase + navMenuDesktopRules),
  'nav-menu must not use viewport-centered left: 50% positioning',
);

assert(
  !/translateX\(/.test(navMenuBase + navMenuDesktopRules),
  'nav-menu must not use translateX centering hacks',
);

assert(
  !/\.nav-menu\s*\{[^}]*max-height:/.test(styleCss),
  'nav-menu must not clip rows with max-height',
);

assert(
  !/\.nav-menu\s*\{[^}]*overflow:\s*hidden/.test(navMenuBase),
  'nav-menu must not hide items with overflow: hidden',
);

assert(
  !/text-overflow:\s*ellipsis/.test(styleCss.match(/\.nav-menu>li>a\s*\{[\s\S]*?\n\}/)?.[0] || ''),
  'nav links must not use text-overflow: ellipsis',
);

assert(
  /\.nav-actions[\s\S]*?flex-shrink:\s*0/.test(styleCss),
  'nav-actions must not shrink',
);

assert(
  /\.nav-logo[\s\S]*?flex-shrink:\s*0/.test(styleCss),
  'nav-logo must not shrink',
);

function collectMobileBreakpointRules(css) {
  const blocks = [];
  const marker = '@media (width<=1279px)';
  let searchFrom = 0;
  while (searchFrom < css.length) {
    const start = css.indexOf(marker, searchFrom);
    if (start === -1) break;
    const block = css.slice(start).match(/@media \(width<=1279px\)[\s\S]*?(?=@media|$)/)?.[0] || '';
    blocks.push(block);
    searchFrom = start + marker.length;
  }
  return blocks.join('\n');
}

const mobileNavRules = collectMobileBreakpointRules(styleCss);

assert(
  !/\.nav-cta\s*\{[^}]*display:\s*none/.test(navMenuBase + navContainerBase),
  'nav-cta must not use display:none outside mobile breakpoint',
);

assert(
  mobileNavRules.includes('.nav-actions > .nav-cta') && /display:\s*none/.test(
    mobileNavRules.slice(mobileNavRules.indexOf('.nav-actions > .nav-cta')),
  ),
  'header nav-cta must hide only within the mobile breakpoint',
);

assert(
  mobileNavRules.includes('.nav-drawer-scroll') && mobileNavRules.includes('flex: 1 1 auto'),
  'mobile drawer must use a dedicated scroll area below the top bar',
);

assert(
  !/nav-mobile-cta-item|renderMobileNavCtaItem/.test(styleCss + read(resolve(ROOT, 'src/public-header.js'))),
  'mobile drawer appointment CTA must be removed',
);

assert(
  /\.mobile-nav-trigger/.test(styleCss) && /min-height:\s*56px/.test(mobileNavRules),
  'mobile drawer category triggers must share unified row styles',
);

assertHeaderTemplate('index.html', read(resolve(ROOT, 'index.html')));
assertHeaderTemplate('service.js', read(resolve(ROOT, 'src/service.js')));
assertHeaderTemplate('privacy.js', read(resolve(ROOT, 'src/privacy.js')));
assertHeaderTemplate('eye-health.js', read(resolve(ROOT, 'src/eye-health.js')));

const publicHeaderJs = read(resolve(ROOT, 'src/public-header.js'));
const navSharedJs = read(resolve(ROOT, 'src/nav-shared.js'));
const i18nJs = read(resolve(ROOT, 'src/i18n.js'));
assert(!publicHeaderJs.includes('fitHeaderNavigation'), 'public-header.js must not use runtime nav fit scaling');
assert(!publicHeaderJs.includes('ResizeObserver'), 'public-header.js must not use ResizeObserver for header density');
assert(publicHeaderJs.includes('nav-drawer') || navSharedJs.includes('1280'), 'mobile header must define drawer behavior and 1280px breakpoint');
assert(navSharedJs.includes('1280'), 'nav-shared.js must use 1280px mobile breakpoint');
assert(i18nJs.includes('CATEGORY_NAV_UI_KEYS'), 'i18n.js must map category nav labels to home ui keys');
assert(i18nJs.includes('RU_HEADER_NAV_LABELS'), 'i18n.js must define compact Russian header nav labels');
assert(i18nJs.includes('navLabel: categoryNavLabel'), 'buildCategoryGroups must expose short nav labels');

const staticHomePages = [
  ['de home', resolve(DIST, 'de/index.html')],
  ['ru home', resolve(DIST, 'ru/index.html')],
  ['ar home (RTL)', resolve(DIST, 'ar/index.html')],
  ['tr home', resolve(DIST, 'tr/index.html')],
];

for (const [label, filePath] of staticHomePages) {
  if (!existsSync(filePath)) {
    failures.push(`Missing built page for header check: ${filePath}`);
    continue;
  }
  assertBuiltHeader(label, read(filePath));
}

const arHomePath = resolve(DIST, 'ar/index.html');
if (existsSync(arHomePath)) {
  const arHome = read(arHomePath);
  assert(arHome.includes('dir="rtl"'), 'AR home must preserve dir="rtl"');
  assert(arHome.includes('lang="ar"'), 'AR home must preserve lang="ar"');
}

if (failures.length) {
  console.error('[verify-header-controls] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-header-controls] Verified header controls layout and visibility rules');
