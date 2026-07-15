import { chromium } from 'playwright';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { getAllSitemapUrls } from './sitemap-urls.mjs';
import { DOCTORS } from '../src/doctors-data.js';
import { LOCALES } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const REPORT_DIR = resolve(ROOT, 'reports');
const CONSENT_KEY = 'dotgen_cookie_consent_v1';

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
};

const EXCLUDED_PATH_RE = /\/admin(?:\/|$)/;
const MAX_URLS = Number(process.env.FLOATING_SOCIAL_MAX_URLS || 0);
const FULL_MATRIX = process.env.FLOATING_SOCIAL_FULL === '1';
const SKIP_BUILD = process.env.FLOATING_SOCIAL_SKIP_BUILD === '1'
  || (existsSync(resolve(ROOT, 'dist/index.html')) && process.env.FLOATING_SOCIAL_FORCE_BUILD !== '1');
const REQUIRED_URL = process.env.FLOATING_SOCIAL_REQUIRED_URL
  || 'http://127.0.0.1:4173/tr/hukuk-departmani.html';

function buildRepresentativeUrls(baseOrigin) {
  const all = getAllSitemapUrls(baseOrigin);
  const byType = new Map();

  for (const url of all) {
    const type = inferPageType(url);
    const locale = inferLocale(url);
    const key = `${type}:${locale}`;
    if (!byType.has(key)) byType.set(key, url);
  }

  const serviceSamples = LOCALES.map((locale) =>
    all.find((url) => inferLocale(url) === locale && inferPageType(url) === 'service'),
  ).filter(Boolean);

  const doctorUrls = LOCALES.flatMap((locale) =>
    DOCTORS.map((doctor) => `${baseOrigin}/${locale}/doctor.html?slug=${doctor.slug}`),
  );

  return [...new Set([
    ...byType.values(),
    ...serviceSamples,
    ...doctorUrls,
    REQUIRED_URL.replace(/^https?:\/\/[^/]+/, baseOrigin),
  ])].filter((url) => !EXCLUDED_PATH_RE.test(new URL(url).pathname));
}

function buildTestUrls(baseOrigin) {
  if (FULL_MATRIX) {
    const doctorUrls = LOCALES.flatMap((locale) =>
      DOCTORS.map((doctor) => `${baseOrigin}/${locale}/doctor.html?slug=${doctor.slug}`),
    );
    return [...new Set([...getAllSitemapUrls(baseOrigin), ...doctorUrls])]
      .filter((url) => !EXCLUDED_PATH_RE.test(new URL(url).pathname));
  }

  const urls = buildRepresentativeUrls(baseOrigin);
  if (MAX_URLS > 0) return urls.slice(0, MAX_URLS);
  return urls;
}

function inferLocale(url) {
  const match = new URL(url).pathname.match(/^\/(tr|en|ar|es|fr|it|ru|de)(?:\/|$)/);
  return match?.[1] || 'unknown';
}

function inferPageType(url) {
  const { pathname, search } = new URL(url);
  if (pathname.endsWith('/service.html')) return 'service';
  if (pathname.endsWith('/doctor.html')) return 'doctor';
  if (pathname.includes('privacy')) return 'privacy';
  if (pathname.includes('goz-hastaliklari') || pathname.includes('eye-health')) return 'eye-health';
  if (pathname.includes('hukuk') || pathname.includes('legal')) return 'legal';
  if (pathname.includes('finans') || pathname.includes('finance')) return 'finance';
  if (pathname.includes('ar-ge') || pathname.includes('-rd')) return 'rd-department';
  if (pathname.match(/^\/(tr|en|ar|es|fr|it|ru|de)\/?$/)) return 'home';
  return 'content';
}

async function dismissIntro(page) {
  await page.evaluate(() => {
    const overlay = document.getElementById('intro-overlay');
    const section = document.getElementById('intro-section');
    if (overlay) {
      overlay.classList.add('completed');
      overlay.style.display = 'none';
    }
    if (section) section.style.display = 'none';
    document.body.style.overflow = '';
  });
}

async function acceptConsent(page) {
  await page.evaluate((key) => {
    localStorage.setItem(key, JSON.stringify({
      version: 1,
      analytics: true,
      marketing: false,
      updatedAt: new Date().toISOString(),
    }));
  }, CONSENT_KEY);
}

async function inspectFloatingSocial(page) {
  return page.evaluate(() => {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const stacks = Array.from(document.querySelectorAll('[data-floating-social-stack]'));
    const instagramLinks = Array.from(document.querySelectorAll('.instagram-float'));
    const whatsappLinks = Array.from(document.querySelectorAll('.whatsapp-float'));

    function describeLink(link) {
      const rect = link.getBoundingClientRect();
      const style = window.getComputedStyle(link);
      return {
        href: link.getAttribute('href') || '',
        target: link.getAttribute('target') || '',
        rel: link.getAttribute('rel') || '',
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right,
        inViewport:
          rect.width > 0
          && rect.height > 0
          && rect.bottom > 0
          && rect.right > 0
          && rect.top < viewport.height
          && rect.left < viewport.width,
      };
    }

    const ig = instagramLinks.map(describeLink);
    const wa = whatsappLinks.map(describeLink);

    let instagramAboveWhatsapp = null;
    if (ig[0] && wa[0]) {
      instagramAboveWhatsapp = ig[0].top < wa[0].top;
    }

    let overlap = false;
    if (ig[0] && wa[0]) {
      overlap = !(
        ig[0].right <= wa[0].left
        || wa[0].right <= ig[0].left
        || ig[0].bottom <= wa[0].top
        || wa[0].bottom <= ig[0].top
      );
    }

    return {
      viewport,
      stackCount: stacks.length,
      instagramCount: instagramLinks.length,
      whatsappCount: whatsappLinks.length,
      instagram: ig,
      whatsapp: wa,
      instagramAboveWhatsapp,
      overlap,
    };
  });
}

function validateInspection(url, viewportName, inspection, consoleErrors) {
  const failures = [];
  const locale = inferLocale(url);
  const pageType = inferPageType(url);

  if (inspection.stackCount !== 1) {
    failures.push(`stackCount=${inspection.stackCount}, expected 1`);
  }
  if (inspection.instagramCount !== 1) {
    failures.push(`instagramCount=${inspection.instagramCount}, expected 1`);
  }
  if (inspection.whatsappCount !== 1) {
    failures.push(`whatsappCount=${inspection.whatsappCount}, expected 1`);
  }

  const ig = inspection.instagram[0];
  const wa = inspection.whatsapp[0];

  if (!ig?.href) failures.push('Instagram href empty');
  if (!wa?.href) failures.push('WhatsApp href empty');
  if (wa?.href && !/^https:\/\/wa\.me\/\d+/i.test(wa.href)) {
    failures.push(`WhatsApp href invalid: ${wa.href}`);
  }
  if (wa?.target !== '_blank') failures.push('WhatsApp target not _blank');
  if (ig?.target !== '_blank') failures.push('Instagram target not _blank');
  if (!wa?.rel?.includes('noopener')) failures.push('WhatsApp rel missing noopener');
  if (!ig?.rel?.includes('noopener')) failures.push('Instagram rel missing noopener');

  for (const [label, link] of [['Instagram', ig], ['WhatsApp', wa]]) {
    if (!link) continue;
    if (link.display === 'none') failures.push(`${label} display:none`);
    if (link.visibility === 'hidden') failures.push(`${label} visibility:hidden`);
    if (Number(link.opacity) <= 0) failures.push(`${label} opacity:${link.opacity}`);
    if (link.width <= 0 || link.height <= 0) failures.push(`${label} zero size`);
    if (!link.inViewport) failures.push(`${label} outside viewport`);
  }

  if (inspection.instagramAboveWhatsapp !== true) {
    failures.push('Instagram not above WhatsApp');
  }
  if (inspection.overlap) {
    failures.push('Instagram and WhatsApp overlap');
  }

  const criticalConsole = consoleErrors.filter((entry) =>
    !entry.includes('favicon')
    && !entry.includes('404')
    && !entry.includes('net::ERR'),
  );

  if (criticalConsole.length) {
    failures.push(`console: ${criticalConsole[0]}`);
  }

  return {
    url,
    locale,
    pageType,
    viewport: viewportName,
    passed: failures.length === 0,
    failures,
    inspection,
    consoleErrors: criticalConsole,
  };
}

async function testUrl(browser, url, viewportName, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const consoleErrors = [];

  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (!response || response.status() >= 400) {
      return {
        url,
        locale: inferLocale(url),
        pageType: inferPageType(url),
        viewport: viewportName,
        passed: false,
        failures: [`HTTP ${response?.status() ?? 'no response'}`],
        inspection: null,
        consoleErrors,
      };
    }

    await acceptConsent(page);
    await page.reload({ waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await dismissIntro(page);
    await page.waitForSelector('[data-floating-social-stack]', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(500);

    const inspection = await inspectFloatingSocial(page);
    return validateInspection(url, viewportName, inspection, consoleErrors);
  } finally {
    await context.close();
  }
}

function startPreviewServer() {
  const existing = spawnSync('node', ['-e', "fetch('http://127.0.0.1:4173/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"], {
    cwd: ROOT,
    shell: process.platform === 'win32',
  });
  if (existing.status === 0) {
    return { proc: null, baseOrigin: 'http://127.0.0.1:4173' };
  }

  const proc = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173'], {
    cwd: ROOT,
    stdio: 'ignore',
    shell: process.platform === 'win32',
    detached: process.platform !== 'win32',
  });

  return { proc, baseOrigin: 'http://127.0.0.1:4173' };
}

async function waitForServer(baseOrigin, attempts = 60) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(baseOrigin);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 1000));
  }
  throw new Error(`Preview server not ready at ${baseOrigin}`);
}

async function main() {
  if (process.env.VERCEL === '1') {
    console.log('[verify-floating-social-stack] Skipped on Vercel (Playwright UI tests run in GitHub CI)');
    return;
  }

  if (!SKIP_BUILD) {
    const build = spawnSync('npm', ['run', 'build'], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    if (build.status !== 0) process.exit(build.status || 1);
  }

  const { proc, baseOrigin } = startPreviewServer();
  await waitForServer(baseOrigin);

  const urls = buildTestUrls(baseOrigin);
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const url of urls) {
      for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
        results.push(await testUrl(browser, url, viewportName, viewport));
      }
    }
  } finally {
    await browser.close();
    if (proc) proc.kill();
  }

  mkdirSync(REPORT_DIR, { recursive: true });
  const passed = results.filter((r) => r.passed);
  const failed = results.filter((r) => !r.passed);

  const matrix = results.map((r) => ({
    locale: r.locale,
    url: r.url,
    pageType: r.pageType,
    instagram: r.inspection?.instagramCount === 1 ? 'ok' : `fail(${r.inspection?.instagramCount ?? 0})`,
    whatsapp: r.inspection?.whatsappCount === 1 ? 'ok' : `fail(${r.inspection?.whatsappCount ?? 0})`,
    singleComponent: r.inspection?.stackCount === 1 ? 'ok' : `fail(${r.inspection?.stackCount ?? 0})`,
    desktop: r.viewport === 'desktop' ? (r.passed ? 'pass' : `fail: ${r.failures.join('; ')}`) : '-',
    tablet: r.viewport === 'tablet' ? (r.passed ? 'pass' : `fail: ${r.failures.join('; ')}`) : '-',
    mobile: r.viewport === 'mobile' ? (r.passed ? 'pass' : `fail: ${r.failures.join('; ')}`) : '-',
    consoleError: r.consoleErrors?.[0] || '',
    result: r.passed ? 'pass' : 'fail',
  }));

  const summary = {
    generatedAt: new Date().toISOString(),
    totalChecks: results.length,
    passed: passed.length,
    failed: failed.length,
    urlsTested: urls.length,
    viewports: Object.keys(VIEWPORTS),
    requiredUrl: REQUIRED_URL.replace(/^https?:\/\/[^/]+/, baseOrigin),
    failures: failed.map((r) => ({
      url: r.url,
      viewport: r.viewport,
      failures: r.failures,
    })),
    matrix,
  };

  writeFileSync(resolve(REPORT_DIR, 'floating-social-stack-report.json'), JSON.stringify(summary, null, 2));

  console.log(`[verify-floating-social-stack] URLs: ${urls.length}, checks: ${results.length}, passed: ${passed.length}, failed: ${failed.length}`);

  if (failed.length) {
    failed.slice(0, 20).forEach((r) => {
      console.error(`FAIL ${r.viewport} ${r.url}`);
      r.failures.forEach((f) => console.error(`  - ${f}`));
    });
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
