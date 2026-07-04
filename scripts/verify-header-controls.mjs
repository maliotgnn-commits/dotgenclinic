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

function assertHeaderTemplate(label, source) {
  assert(source.includes('class="nav-actions"'), `${label}: nav-actions wrapper missing`);
  assert(
    /class="nav-actions"[\s\S]*?nav-language-slot/.test(source),
    `${label}: language switcher must live inside nav-actions`,
  );
  assert(
    /class="nav-actions"[\s\S]*?class="nav-cta"/.test(source),
    `${label}: nav-cta must live inside nav-actions`,
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

assert(
  /\.nav-container[\s\S]*?display:\s*grid[\s\S]*?grid-template-columns:\s*auto minmax\(0,\s*1fr\) auto/.test(styleCss),
  'nav-container must use a three-column grid (auto minmax(0, 1fr) auto)',
);

assert(
  /\.nav-container[\s\S]*?min-height:\s*80px/.test(styleCss),
  'nav-container must grow with wrapped navigation (min-height, not fixed height only)',
);

function extractRule(css, selector) {
  const re = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([\\s\\S]*?)\\}`, '');
  return re.exec(css)?.[1] ?? '';
}

const navContainerBase = extractRule(styleCss, '\\.nav-container');
assert(
  !/(?:^|[;\s])height:\s*80px/.test(navContainerBase),
  'nav-container base rule must not lock header to a fixed 80px height',
);

assert(
  /\.nav-menu[\s\S]*?flex-wrap:\s*wrap/.test(styleCss),
  'nav-menu must allow safe wrapping within the middle column',
);

assert(
  /\.nav-menu[\s\S]*?min-width:\s*0/.test(styleCss),
  'nav-menu must allow middle-column shrinking with min-width: 0',
);

assert(
  /\.nav-menu[\s\S]*?max-width:\s*100%/.test(styleCss),
  'nav-menu must stay within the middle column (max-width: 100%)',
);

assert(
  !/\.nav-menu\s*\{[^}]*max-height:/.test(styleCss),
  'nav-menu must not clip wrapped rows with max-height',
);

assert(
  !/\.nav-menu\s*\{[^}]*overflow:\s*hidden/.test(styleCss),
  'nav-menu must not hide wrapped items with overflow: hidden',
);

assert(
  !/\.nav-menu\s*\{[^}]*text-overflow:\s*ellipsis/.test(styleCss),
  'nav-menu must not ellipsize navigation labels',
);

const navMenuBase = extractRule(styleCss, '\\.nav-menu');
const navMenuDesktopRules = (
  styleCss.match(/@media \(width>=1280px\)[\s\S]*?@media \(width<=1279px\)/)?.[0] || ''
).match(/\.nav-menu\s*\{[^}]*\}/g)?.join('\n') || '';

assert(
  !/(?:^|[;\s])position:\s*absolute/.test(navMenuBase),
  'desktop nav-menu must stay in normal flow (no absolute positioning)',
);

assert(
  !/(?:^|[;\s])left:\s*50%/.test(navMenuBase + navMenuDesktopRules),
  'desktop nav-menu must not use viewport-centered left: 50% positioning',
);

assert(
  !/translateX\(/.test(navMenuBase + navMenuDesktopRules),
  'desktop nav-menu must not use translateX centering hacks',
);

assert(
  /\.nav-actions[\s\S]*?flex-shrink:\s*0/.test(styleCss),
  'nav-actions must not shrink',
);

assert(
  /\.nav-logo[\s\S]*?flex-shrink:\s*0/.test(styleCss),
  'nav-logo must not shrink',
);

assert(
  !/\.nav-cta\s*\{[^}]*display:\s*none/.test(styleCss),
  'nav-cta must never use display:none in CSS',
);

assert(
  styleCss.includes('@media (width>=1280px) and (width<=1535px)'),
  'Missing compact desktop header breakpoint (1280px–1535px)',
);

assertHeaderTemplate('index.html', read(resolve(ROOT, 'index.html')));
assertHeaderTemplate('service.js', read(resolve(ROOT, 'src/service.js')));
assertHeaderTemplate('privacy.js', read(resolve(ROOT, 'src/privacy.js')));
assertHeaderTemplate('eye-health.js', read(resolve(ROOT, 'src/eye-health.js')));

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

const deUi = JSON.parse(read(resolve(ROOT, 'src/i18n/ui/de.json')));
const ruUi = JSON.parse(read(resolve(ROOT, 'src/i18n/ui/ru.json')));

assert(deUi.text['Randevu Al'] === 'Termin buchen', 'DE header CTA must use short label "Termin buchen"');
assert(ruUi.text['Randevu Al'] === 'Записаться', 'RU header CTA must use short label "Записаться"');

const deHomePath = resolve(DIST, 'de/index.html');
if (existsSync(deHomePath)) {
  assert(read(deHomePath).includes('Termin buchen'), 'DE home must render compact CTA label');
}

const ruHomePath = resolve(DIST, 'ru/index.html');
if (existsSync(ruHomePath)) {
  assert(read(ruHomePath).includes('Записаться'), 'RU home must render compact CTA label');
}

const arHomePath = resolve(DIST, 'ar/index.html');
if (existsSync(arHomePath)) {
  const arHome = read(arHomePath);
  assert(arHome.includes('dir="rtl"'), 'AR home must preserve dir="rtl"');
  assert(arHome.includes('lang="ar"'), 'AR home must preserve lang="ar"');
}

const publicHeaderJs = read(resolve(ROOT, 'src/public-header.js'));
assert(publicHeaderJs.includes('1280'), 'public-header.js must use 1280px mobile breakpoint');

if (failures.length) {
  console.error('[verify-header-controls] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-header-controls] Verified header controls layout and visibility rules');
