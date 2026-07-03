import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC = resolve(ROOT, 'public');
const DIST = resolve(ROOT, 'dist');

const HTML_TEMPLATES = ['index.html', 'service.html', 'privacy.html'];
const DIST_HTML_CHECKS = [
  'dist/tr/index.html',
  'dist/en/index.html',
  'dist/ar/index.html',
  'dist/tr/privacy.html',
  'dist/service.html',
  'dist/_seo/tr/service/botox.html',
];

const FAVICON_LINKS = [
  '<link rel="icon" href="/favicon.ico" sizes="any" />',
  '<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png" />',
  '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />',
];

const FORBIDDEN_ICON_PATTERNS = [
  /rel=["']icon["'][^>]*href=["']\/favicon\.svg["']/i,
  /rel=["']icon["'][^>]*href=["']\/images\/logo-transparent\.png["']/i,
];

const LOGO_IMG_PATTERN = /src=["']\/images\/logo-transparent\.png["']/g;
const SCHEMA_LOGO_PATTERN = /"logo"\s*:\s*"https:\/\/www\.drotgenclinic\.com\/images\/logo-transparent\.png"/;

function fail(message) {
  console.error(`[verify-favicon-assets] ${message}`);
  process.exit(1);
}

function readPngDimensions(filePath) {
  const png = readFileSync(filePath);
  const signature = png.subarray(0, 8).toString('hex');
  if (signature !== '89504e470d0a1a0a') {
    fail(`Expected PNG file at ${filePath}`);
  }
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  const colorType = png[25];
  const hasAlpha = colorType === 4 || colorType === 6;
  return { width, height, hasAlpha, size: png.length };
}

function readIcoSizes(filePath) {
  const ico = readFileSync(filePath);
  if (ico.length < 6) fail(`Invalid ICO file: ${filePath}`);
  if (ico.readUInt16LE(0) !== 0 || ico.readUInt16LE(2) !== 1) {
    fail(`Invalid ICO header: ${filePath}`);
  }
  const count = ico.readUInt16LE(4);
  if (count < 1) fail(`ICO has no images: ${filePath}`);

  const sizes = new Set();
  for (let i = 0; i < count; i++) {
    const offset = 6 + i * 16;
    const w = ico[offset] === 0 ? 256 : ico[offset];
    const h = ico[offset + 1] === 0 ? 256 : ico[offset + 1];
    sizes.add(Math.min(w, h));
  }
  return sizes;
}

function verifyPublicAssets() {
  const icoPath = resolve(PUBLIC, 'favicon.ico');
  const png48Path = resolve(PUBLIC, 'favicon-48.png');
  const applePath = resolve(PUBLIC, 'apple-touch-icon.png');

  if (!existsSync(icoPath) || readFileSync(icoPath).length === 0) {
    fail('Missing or empty public/favicon.ico');
  }
  if (!existsSync(png48Path)) fail('Missing public/favicon-48.png');
  if (!existsSync(applePath)) fail('Missing public/apple-touch-icon.png');

  const png48 = readPngDimensions(png48Path);
  if (png48.width !== 48 || png48.height !== 48) {
    fail(`Expected favicon-48.png to be 48x48, got ${png48.width}x${png48.height}`);
  }
  if (!png48.hasAlpha) fail('favicon-48.png must preserve alpha/transparency');

  const apple = readPngDimensions(applePath);
  if (apple.width !== 180 || apple.height !== 180) {
    fail(`Expected apple-touch-icon.png to be 180x180, got ${apple.width}x${apple.height}`);
  }
  if (!apple.hasAlpha) fail('apple-touch-icon.png must preserve alpha/transparency');

  const icoSizes = readIcoSizes(icoPath);
  for (const required of [16, 32, 48]) {
    if (!icoSizes.has(required)) {
      fail(`favicon.ico missing ${required}x${required} size (found: ${[...icoSizes].sort((a, b) => a - b).join(', ')})`);
    }
  }

  console.log('[verify-favicon-assets] Public favicon assets verified');
}

function verifyHtmlFile(relativePath) {
  const fullPath = resolve(ROOT, relativePath);
  if (!existsSync(fullPath)) fail(`Missing HTML template: ${relativePath}`);
  const html = readFileSync(fullPath, 'utf8');

  for (const link of FAVICON_LINKS) {
    if (!html.includes(link)) {
      fail(`${relativePath} missing favicon link: ${link}`);
    }
  }

  for (const pattern of FORBIDDEN_ICON_PATTERNS) {
    if (pattern.test(html)) {
      fail(`${relativePath} still contains forbidden favicon reference`);
    }
  }

  if ((html.match(/rel=["']icon["']/gi) || []).length !== 2) {
    fail(`${relativePath} must contain exactly two rel="icon" links`);
  }

  console.log(`[verify-favicon-assets] Verified favicon links in ${relativePath}`);
}

function verifyTemplateLogoAndSchema() {
  const indexHtml = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
  const logoMatches = indexHtml.match(LOGO_IMG_PATTERN) || [];
  if (logoMatches.length < 1) {
    fail('index.html logo img references were removed or changed unexpectedly');
  }

  const distTrIndex = resolve(DIST, 'tr/index.html');
  if (existsSync(distTrIndex)) {
    const distHtml = readFileSync(distTrIndex, 'utf8');
    if (!SCHEMA_LOGO_PATTERN.test(distHtml)) {
      fail('dist/tr/index.html schema logo URL changed or missing');
    }
  }

  console.log('[verify-favicon-assets] Logo img and schema logo URL unchanged');
}

function verifyDistOutputs() {
  for (const asset of ['favicon.ico', 'favicon-48.png', 'apple-touch-icon.png']) {
    const path = resolve(DIST, asset);
    if (!existsSync(path)) {
      fail(`Missing dist asset: ${asset}`);
    }
  }

  for (const relativePath of DIST_HTML_CHECKS) {
    const fullPath = resolve(ROOT, relativePath);
    if (!existsSync(fullPath)) {
      fail(`Missing dist HTML output: ${relativePath}`);
    }
    const html = readFileSync(fullPath, 'utf8');
    for (const link of FAVICON_LINKS) {
      if (!html.includes(link)) {
        fail(`${relativePath} missing favicon link after build: ${link}`);
      }
    }
    for (const pattern of FORBIDDEN_ICON_PATTERNS) {
      if (pattern.test(html)) {
        fail(`${relativePath} still contains forbidden favicon reference after build`);
      }
    }
  }

  console.log('[verify-favicon-assets] Dist favicon assets and HTML outputs verified');
}

export function verifyFaviconAssets({ requireDist = false } = {}) {
  verifyPublicAssets();
  for (const file of HTML_TEMPLATES) {
    verifyHtmlFile(file);
  }
  if (requireDist) {
    verifyDistOutputs();
    verifyTemplateLogoAndSchema();
  }
  console.log('[verify-favicon-assets] All favicon checks passed');
}

if (import.meta.url.endsWith('verify-favicon-assets.mjs') && process.argv[1]?.endsWith('verify-favicon-assets.mjs')) {
  verifyFaviconAssets({ requireDist: existsSync(DIST) });
}
