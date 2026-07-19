import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUBPAGES } from '../src/subpages-data.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANAGED_SERVER = !process.env.VERIFY_BASE_URL;
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = Number(process.env.VERIFY_PORT || 5173);
let BASE_URL = process.env.VERIFY_BASE_URL || `http://${DEFAULT_HOST}:${DEFAULT_PORT}`;
const LOCALES = ['tr', 'en', 'ar', 'es', 'fr', 'it', 'ru', 'de'];
const SERVICE_SLUGS = process.env.VERIFY_ALL_SLUGS === '1'
  ? SUBPAGES.map((page) => page.slug)
  : ['dhi-hair-transplant', 'face-lift', 'rhinoplasty'];
const SERVER_READY_TIMEOUT_MS = 30_000;
const SERVER_POLL_INTERVAL_MS = 250;
const KNOWN_THIRD_PARTY_HOSTS = [
  'analytics.google.com',
  'cdn.jsdelivr.net',
  'connect.facebook.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'formsubmit.co',
  'google-analytics.com',
  'googletagmanager.com',
  'gstatic.com',
  'stats.g.doubleclick.net',
  'www.google-analytics.com',
  'www.googletagmanager.com',
];

const TURKISH_CTA_PHRASES = [
  'Sorularınız mı var?',
  'Tedavi planınız için uzman ekibimizle iletişime geçebilirsiniz.',
  'WhatsApp ile Bilgi Al',
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function toHostname(value) {
  try {
    return new URL(value).hostname;
  } catch {
    return '';
  }
}

function isKnownThirdPartyUrl(value) {
  const hostname = toHostname(value);
  if (!hostname) return false;
  const baseHostname = toHostname(BASE_URL);
  if (hostname === baseHostname || hostname === 'localhost' || hostname === DEFAULT_HOST) return false;
  return KNOWN_THIRD_PARTY_HOSTS.some((knownHost) => (
    hostname === knownHost || hostname.endsWith(`.${knownHost}`)
  ));
}

function isKnownThirdPartyConsoleMessage(text) {
  return KNOWN_THIRD_PARTY_HOSTS.some((knownHost) => text.includes(knownHost));
}

async function findAvailablePort(preferredPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', (error) => {
      if (error.code !== 'EADDRINUSE') {
        reject(error);
        return;
      }

      const fallback = net.createServer();
      fallback.once('error', reject);
      fallback.listen(0, DEFAULT_HOST, () => {
        const address = fallback.address();
        fallback.close(() => resolve(address.port));
      });
    });
    server.listen(preferredPort, DEFAULT_HOST, () => {
      server.close(() => resolve(preferredPort));
    });
  });
}

async function waitForServer(url, childProcess) {
  const deadline = Date.now() + SERVER_READY_TIMEOUT_MS;
  let lastError;

  while (Date.now() < deadline) {
    if (childProcess.exitCode !== null) {
      throw new Error(`Vite server exited before it was ready (code ${childProcess.exitCode})`);
    }

    try {
      const response = await fetch(url);
      if (response.ok || response.status < 500) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await delay(SERVER_POLL_INTERVAL_MS);
  }

  throw new Error(`Vite server did not become ready at ${url}: ${lastError?.message || 'timeout'}`);
}

async function startViteServer() {
  if (!MANAGED_SERVER) return null;

  const port = await findAvailablePort(DEFAULT_PORT);
  BASE_URL = `http://${DEFAULT_HOST}:${port}`;
  const viteBin = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
  const childProcess = spawn(
    process.execPath,
    [viteBin, '--host', DEFAULT_HOST, '--port', String(port), '--strictPort'],
    {
      cwd: ROOT,
      env: {
        ...process.env,
        BROWSER: 'none',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  const serverLogs = [];
  childProcess.stdout.on('data', (chunk) => serverLogs.push(chunk.toString()));
  childProcess.stderr.on('data', (chunk) => serverLogs.push(chunk.toString()));

  try {
    await waitForServer(BASE_URL, childProcess);
  } catch (error) {
    childProcess.kill();
    throw new Error(`${error.message}\n${serverLogs.join('').trim()}`);
  }

  console.log(`[verify-i18n] Started temporary Vite server at ${BASE_URL}`);
  return childProcess;
}

async function stopViteServer(childProcess) {
  if (!childProcess || childProcess.exitCode !== null) return;
  childProcess.kill();
  await Promise.race([
    new Promise((resolve) => childProcess.once('exit', resolve)),
    delay(3_000),
  ]);
}

function attachPageDiagnostics(targetPage, diagnostics) {
  targetPage.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (text.startsWith('Failed to load resource:')) {
      diagnostics.thirdPartyWarnings.push(`resource console: ${text}`);
      return;
    }
    if (isKnownThirdPartyConsoleMessage(text)) {
      diagnostics.thirdPartyWarnings.push(`console: ${text}`);
      return;
    }
    diagnostics.consoleErrors.push(text);
  });

  targetPage.on('pageerror', (error) => diagnostics.consoleErrors.push(error.message));

  targetPage.on('requestfailed', (request) => {
    const url = request.url();
    const failure = request.failure()?.errorText || 'unknown network error';
    const message = `${failure}: ${url}`;
    if (isKnownThirdPartyUrl(url)) {
      diagnostics.thirdPartyWarnings.push(message);
      return;
    }
    diagnostics.networkErrors.push(message);
  });
}

async function waitForHomeReady(targetPage) {
  await targetPage.waitForSelector('#intro-overlay', { state: 'attached' });
  await targetPage.waitForFunction(() => document.querySelectorAll('.language-option').length === 8);
  await targetPage.mouse.wheel(0, 1600);
  await targetPage.waitForSelector('#intro-section', { state: 'hidden' });
}

async function runVerification() {
  let browser;
  let serverProcess;
  const diagnostics = {
    consoleErrors: [],
    networkErrors: [],
    thirdPartyWarnings: [],
  };

  try {
    serverProcess = await startViteServer();
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    attachPageDiagnostics(page, diagnostics);

for (const locale of LOCALES) {
  await page.goto(`${BASE_URL}/${locale}/`, { waitUntil: 'domcontentloaded' });
  await waitForHomeReady(page);

  const home = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    dir: document.documentElement.dir,
    title: document.title,
    heading: document.querySelector('#hero h1')?.textContent.trim(),
    languageOptions: document.querySelectorAll('.language-option').length,
    navSingleLine: [...document.querySelectorAll('#nav-menu > li > a')]
      .every((link) => getComputedStyle(link).whiteSpace === 'nowrap' && link.scrollWidth <= link.clientWidth + 1),
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    ltrSensitiveValues: [...document.querySelectorAll('input[type="tel"], input[type="email"], a[href^="tel:"]')]
      .every((element) => element.getAttribute('dir') === 'ltr' || Boolean(element.closest('[dir="ltr"]'))),
    hasOverlay: Boolean(document.querySelector('.vite-error-overlay')),
  }));

  assert(home.lang === locale, `[${locale}] Incorrect html lang: ${home.lang}`);
  assert(home.dir === (locale === 'ar' ? 'rtl' : 'ltr'), `[${locale}] Incorrect direction`);
  assert(home.languageOptions === 8, `[${locale}] Language menu does not contain 8 options`);
  assert(home.navSingleLine, `[${locale}] A desktop header category wrapped or overlapped`);
  assert(home.heading, `[${locale}] Homepage heading is missing`);
  assert(home.overflow <= 1, `[${locale}] Homepage has horizontal overflow (${home.overflow}px)`);
  assert(!home.hasOverlay, `[${locale}] Vite error overlay is visible`);
  if (locale === 'ar') {
    assert(home.ltrSensitiveValues, '[ar] Phone and email values are not isolated as LTR');
  }
  if (locale !== 'tr') {
    assert(home.heading !== 'Güzelliğinize Değer Katıyoruz', `[${locale}] Turkish homepage text leaked`);
  }

  for (const serviceSlug of SERVICE_SLUGS) {
    await page.goto(
      `${BASE_URL}/${locale}/service.html?slug=${serviceSlug}`,
      { waitUntil: 'domcontentloaded' },
    );
    await page.waitForSelector('.sv-hero h1');

    const service = await page.evaluate((phrases) => {
      const bodyText = document.body.innerText || '';
      const leaked = phrases.filter((phrase) => bodyText.includes(phrase));
      return {
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        heading: document.querySelector('.sv-hero h1')?.textContent.trim(),
        languageOptions: document.querySelectorAll('.language-option').length,
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        alternates: document.querySelectorAll('link[rel="alternate"][hreflang]').length,
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        hasOverlay: Boolean(document.querySelector('.vite-error-overlay')),
        whatsappCta: document.querySelector('.sv-hero-whatsapp')?.textContent.trim(),
        leakedTurkishCta: leaked,
        undefinedMarkers: bodyText.includes('undefined') || bodyText.includes('[object Object]'),
      };
    }, locale === 'tr' ? [] : TURKISH_CTA_PHRASES);

    assert(service.lang === locale, `[${locale}/${serviceSlug}] Service page lang is incorrect`);
    assert(service.dir === (locale === 'ar' ? 'rtl' : 'ltr'), `[${locale}/${serviceSlug}] Service direction is incorrect`);
    assert(service.languageOptions === 8, `[${locale}/${serviceSlug}] Service language menu is incomplete`);
    assert(service.heading, `[${locale}/${serviceSlug}] Service heading is missing`);
    assert(service.canonical?.includes(`/${locale}/service.html?slug=${serviceSlug}`), `[${locale}/${serviceSlug}] Canonical is incorrect`);
    assert(service.alternates === 9, `[${locale}/${serviceSlug}] Expected 8 locale alternates and x-default`);
    assert(service.overflow <= 1, `[${locale}/${serviceSlug}] Service page has horizontal overflow (${service.overflow}px)`);
    assert(!service.hasOverlay, `[${locale}/${serviceSlug}] Service Vite error overlay is visible`);
    assert(!service.undefinedMarkers, `[${locale}/${serviceSlug}] undefined or [object Object] leaked in DOM`);
    if (locale !== 'tr') {
      assert(service.heading !== 'DHI Saç Ekimi', `[${locale}/${serviceSlug}] Turkish service text leaked`);
      assert(service.leakedTurkishCta.length === 0, `[${locale}/${serviceSlug}] Turkish CTA leaked: ${service.leakedTurkishCta.join(', ')}`);
      assert(
        !service.whatsappCta || !TURKISH_CTA_PHRASES.includes(service.whatsappCta),
        `[${locale}/${serviceSlug}] Hero WhatsApp CTA is still Turkish: ${service.whatsappCta}`,
      );
    }
  }
}

await page.setViewportSize({ width: 1366, height: 900 });
for (const locale of ['en', 'de', 'ru']) {
  await page.goto(`${BASE_URL}/${locale}/`, { waitUntil: 'domcontentloaded' });
  await waitForHomeReady(page);
  const compactHeader = await page.evaluate(() => ({
    hamburgerVisible: getComputedStyle(document.querySelector('.hamburger')).display !== 'none',
    singleLine: [...document.querySelectorAll('#nav-menu > li > a')]
      .every((link) => getComputedStyle(link).whiteSpace === 'nowrap' && link.scrollWidth <= link.clientWidth + 1),
    overflow: document.documentElement.scrollWidth - window.innerWidth,
  }));
  assert(!compactHeader.hamburgerVisible, `[${locale} 1366px] Desktop navigation switched too early`);
  assert(compactHeader.singleLine, `[${locale} 1366px] Header categories do not remain on one line`);
  assert(compactHeader.overflow <= 1, `[${locale} 1366px] Header causes horizontal overflow`);
}
await page.setViewportSize({ width: 1440, height: 900 });

if (LOCALES.includes('en')) {
  await page.goto(`${BASE_URL}/en/`, { waitUntil: 'domcontentloaded' });
  await waitForHomeReady(page);
  await page.screenshot({
    path: path.join(ROOT, '.verify-en-home.png'),
    fullPage: false,
  });
}

const languageSwitchSlug = 'dhi-hair-transplant';
await page.goto(
  `${BASE_URL}/en/service.html?slug=${languageSwitchSlug}`,
  { waitUntil: 'domcontentloaded' },
);
await page.locator('.language-trigger').click();
await Promise.all([
  page.waitForURL(`**/de/service.html?slug=${languageSwitchSlug}`),
  page.locator('.language-option[data-locale="de"]').click(),
]);
assert(page.url().includes(`/de/service.html?slug=${languageSwitchSlug}`), 'Language switch did not preserve the service slug');

const mobilePage = await context.newPage();
attachPageDiagnostics(mobilePage, diagnostics);
await mobilePage.setViewportSize({ width: 390, height: 844 });
await mobilePage.goto(
  `${BASE_URL}/ar/service.html?slug=${languageSwitchSlug}`,
  { waitUntil: 'domcontentloaded' },
);
await mobilePage.waitForSelector('.sv-hero h1');
await mobilePage.locator('.hamburger').click();
await mobilePage.waitForSelector('#nav-drawer.active');

const mobile = await mobilePage.evaluate(() => ({
  dir: document.documentElement.dir,
  menuOpen: Boolean(document.querySelector('#nav-drawer.active')),
  overflow: document.documentElement.scrollWidth - window.innerWidth,
}));
assert(mobile.dir === 'rtl', '[ar mobile] RTL direction is missing');
assert(mobile.menuOpen, '[ar mobile] Hamburger menu did not open');
assert(mobile.overflow <= 1, `[ar mobile] Horizontal overflow detected (${mobile.overflow}px)`);

await mobilePage.screenshot({
  path: path.join(ROOT, '.verify-ar-service-mobile.png'),
  fullPage: false,
});

await mobilePage.goto(`${BASE_URL}/ar/`, { waitUntil: 'domcontentloaded' });
await waitForHomeReady(mobilePage);
await mobilePage.locator('#randevu').scrollIntoViewIfNeeded();

const mobileForm = await mobilePage.evaluate(() => ({
  direction: getComputedStyle(document.querySelector('#appointment-form')).direction,
  overflow: document.documentElement.scrollWidth - window.innerWidth,
  ltrInputs: [...document.querySelectorAll('input[type="tel"], input[type="email"]')]
    .every((element) => element.getAttribute('dir') === 'ltr'),
}));
assert(mobileForm.direction === 'rtl', '[ar mobile] Appointment form is not RTL');
assert(mobileForm.overflow <= 1, `[ar mobile form] Horizontal overflow detected (${mobileForm.overflow}px)`);
assert(mobileForm.ltrInputs, '[ar mobile] Phone and email inputs are not LTR');

assert(
  diagnostics.consoleErrors.length === 0,
  `Browser console errors:\n${diagnostics.consoleErrors.join('\n')}`,
);
assert(
  diagnostics.networkErrors.length === 0,
  `First-party network errors:\n${diagnostics.networkErrors.join('\n')}`,
);

const uniqueThirdPartyWarnings = [...new Set(diagnostics.thirdPartyWarnings)];
if (uniqueThirdPartyWarnings.length > 0) {
  console.warn(
    `[verify-i18n] Ignored ${uniqueThirdPartyWarnings.length} known third-party network/console warning(s):\n`
    + uniqueThirdPartyWarnings.map((warning) => `  - ${warning}`).join('\n'),
  );
}

console.log(`Browser verification passed for 8 home routes, ${LOCALES.length * SERVICE_SLUGS.length} service routes (${SERVICE_SLUGS.length} slugs x ${LOCALES.length} locales), CTA regression checks, language persistence, and Arabic RTL.`);
  } finally {
    await browser?.close();
    await stopViteServer(serverProcess);
  }
}

await runVerification();
