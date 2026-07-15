import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BASE = (process.env.VERIFY_SMOKE_BASE_URL || 'https://www.drotgenclinic.com').replace(/\/$/, '');
const LOCAL_DIST = resolve(ROOT, 'dist/tr/index.html');
const USE_LOCAL = process.env.VERIFY_SMOKE_LOCAL === '1' && existsSync(LOCAL_DIST);

const DEBUG_ENDPOINT = 'http://127.0.0.1:7351/ingest/978326e2-ed1a-492b-ba34-cad4578e33a0';
const DEBUG_SESSION = '0a33d4';
const DEBUG_ENABLED = process.env.VERIFY_SMOKE_DEBUG === '1';

const PAGES = [
  { path: '/tr/', label: 'TR home', checks: ['home-form'] },
  { path: '/en/', label: 'EN home', checks: ['no-inline-gtm'] },
  { path: '/tr/service.html?slug=rhinoplasty', label: 'TR rhinoplasty service', checks: ['service-faq'] },
  { path: '/tr/privacy.html', label: 'TR privacy', checks: ['canonical'] },
];

const failures = [];

function fail(message) {
  failures.push(message);
}

function debugLog(hypothesisId, message, data = {}) {
  if (!DEBUG_ENABLED) return;
  fetch(DEBUG_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': DEBUG_SESSION },
    body: JSON.stringify({
      sessionId: DEBUG_SESSION,
      runId: process.env.VERIFY_SMOKE_RUN_ID || 'smoke',
      hypothesisId,
      location: 'verify-production-smoke.mjs',
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
}

async function loadHtml(path) {
  if (USE_LOCAL && (path === '/tr/' || path === '/tr')) {
    return readFileSync(LOCAL_DIST, 'utf8');
  }

  const url = `${BASE}${path}`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'dotgen-smoke/1.0' },
    redirect: 'follow',
  });

  debugLog('H1', 'page fetch', { path, status: response.status, ok: response.ok });

  if (!response.ok) {
    fail(`${path} returned HTTP ${response.status}`);
    return '';
  }

  return response.text();
}

function assertNoInlineGtm(html, label) {
  if (html.includes('googletagmanager.com/gtm.js') || html.includes('googletagmanager.com/ns.html')) {
    fail(`${label} must not load GTM inline`);
  }
}

function assertHomeForm(html, label) {
  if (!/id="form-phone"[^>]*inputmode="tel"/.test(html)) {
    fail(`${label} phone input must include inputmode="tel"`);
  }
  if (!html.includes('id="form-privacy-consent"')) {
    fail(`${label} must include privacy consent checkbox`);
  }
  if (!html.includes('id="appointment-form"')) {
    fail(`${label} must include appointment form`);
  }
}

function assertCanonical(html, label) {
  if (!/rel="canonical" href="https:\/\/www\.drotgenclinic\.com\//.test(html)) {
    fail(`${label} must include absolute canonical link`);
  }
}

function assertServiceFaq(html, label) {
  if (!html.includes('Rinoplasti sonrası') && !html.includes('application/ld+json')) {
    fail(`${label} expected differentiated rhinoplasty FAQ or schema content`);
  }
}

async function verifyRobotsAndSitemap() {
  for (const path of ['/robots.txt', '/sitemap.xml']) {
    const response = await fetch(`${BASE}${path}`, { redirect: 'follow' });
    debugLog('H2', 'asset fetch', { path, status: response.status });
    if (!response.ok) {
      fail(`${path} returned HTTP ${response.status}`);
      continue;
    }
    const body = await response.text();
    if (path === '/robots.txt' && !body.includes('Sitemap:')) {
      fail('robots.txt must reference sitemap');
    }
    if (path === '/sitemap.xml' && !body.includes('<urlset')) {
      fail('sitemap.xml must be valid XML urlset');
    }
  }
}

async function verifyMainBundleGuard() {
  const homeHtml = await loadHtml('/tr/');
  const scriptMatch = homeHtml.match(/\/assets\/main-[^"]+\.js/);
  if (!scriptMatch) {
    fail('TR home must reference main bundle');
    return;
  }

  const scriptUrl = `${BASE}${scriptMatch[0]}`;
  const response = await fetch(scriptUrl, { redirect: 'follow' });
  if (!response.ok) {
    fail(`main bundle returned HTTP ${response.status}`);
    return;
  }

  const js = await response.text();
  const hasFormHardening =
    js.includes('dotgen_form_last_submit')
    && js.includes('is-loading')
    && js.includes('form_submit');
  debugLog('H3', 'main bundle form hardening', { hasFormHardening, script: scriptMatch[0] });
  if (!hasFormHardening) {
    fail('main bundle must include appointment form hardening markers');
  }
}

async function run() {
  console.log(`[verify-production-smoke] Base URL: ${USE_LOCAL ? 'local dist/tr/index.html + remote assets' : BASE}`);

  for (const page of PAGES) {
    const html = await loadHtml(page.path);
    if (!html) continue;

    if (page.checks.includes('no-inline-gtm') || page.checks.includes('home-form')) {
      assertNoInlineGtm(html, page.label);
    }
    if (page.checks.includes('home-form')) assertHomeForm(html, page.label);
    if (page.checks.includes('canonical')) assertCanonical(html, page.label);
    if (page.checks.includes('service-faq')) assertServiceFaq(html, page.label);
  }

  if (!USE_LOCAL) {
    await verifyRobotsAndSitemap();
    await verifyMainBundleGuard();
  }

  if (failures.length) {
    console.error('[verify-production-smoke] Failed:');
    failures.forEach((message) => console.error(`  - ${message}`));
    process.exit(1);
  }

  console.log('[verify-production-smoke] Production smoke checks passed');
}

run().catch((error) => {
  console.error('[verify-production-smoke] Unexpected error:', error?.message || error);
  process.exit(1);
});
