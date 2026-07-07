import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const LOG_PATH = resolve(ROOT, 'debug-f34c93.log');
const SITE_ORIGIN = 'https://www.drotgenclinic.com';

const FAVICON_LINKS = [
  '<link rel="icon" href="/favicon.ico" sizes="any" />',
  '<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png" />',
  '<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png" />',
  '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />',
];

function log(hypothesisId, message, data = {}) {
  const entry = {
    sessionId: 'f34c93',
    runId: process.env.DEBUG_RUN_ID || 'baseline',
    hypothesisId,
    location: 'scripts/debug-favicon-runtime.mjs',
    message,
    data,
    timestamp: Date.now(),
  };
  appendFileSync(LOG_PATH, `${JSON.stringify(entry)}\n`, 'utf8');
}

function readPngMeta(filePath) {
  const png = readFileSync(filePath);
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  const colorType = png[25];
  const hasAlpha = colorType === 4 || colorType === 6;
  return { width, height, hasAlpha, bytes: png.length };
}

async function probeUrl(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)' },
    });
    const contentType = response.headers.get('content-type') || '';
    const body = response.ok ? Buffer.from(await response.arrayBuffer()) : Buffer.alloc(0);
    return {
      url,
      status: response.status,
      ok: response.ok,
      contentType,
      bytes: body.length,
      finalUrl: response.url,
    };
  } catch (error) {
    return {
      url,
      status: 0,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  log('INIT', 'Starting favicon runtime diagnostics');

  // Hypothesis A: live favicon URLs are not reachable (404/403/500)
  const liveTargets = [
    `${SITE_ORIGIN}/favicon.ico`,
    `${SITE_ORIGIN}/favicon-48.png`,
    `${SITE_ORIGIN}/favicon-192.png`,
    `${SITE_ORIGIN}/apple-touch-icon.png`,
    `${SITE_ORIGIN}/images/logo-transparent.png`,
    `${SITE_ORIGIN}/tr/`,
  ];
  for (const url of liveTargets) {
    const result = await probeUrl(url);
    log('A', 'Live URL probe', result);
  }

  // Hypothesis B: deployed HTML missing favicon link tags
  const homeHtmlResult = await probeUrl(`${SITE_ORIGIN}/tr/`);
  if (homeHtmlResult.ok) {
    const htmlResponse = await fetch(`${SITE_ORIGIN}/tr/`, {
      headers: { 'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)' },
    });
    const html = await htmlResponse.text();
    const missingLinks = FAVICON_LINKS.filter((link) => !html.includes(link));
    const iconLinkCount = (html.match(/rel=["']icon["']/gi) || []).length;
    const hasSchemaLogo = html.includes('"logo":"https://www.drotgenclinic.com/images/logo-transparent.png"');
    log('B', 'Live homepage favicon markup', {
      missingLinks,
      iconLinkCount,
      hasSchemaLogo,
      hasFaviconIcoLink: html.includes('href="/favicon.ico"'),
    });
  } else {
    log('B', 'Live homepage unavailable for markup check', homeHtmlResult);
  }

  // Hypothesis C: favicon asset format/size fails Google-friendly checks
  const favicon48Path = resolve(ROOT, 'public/favicon-48.png');
  if (existsSync(favicon48Path)) {
    const meta = readPngMeta(favicon48Path);
    log('C', 'Local favicon-48 metadata', {
      ...meta,
      isSquare: meta.width === meta.height,
      isMultipleOf48: meta.width % 48 === 0 && meta.height % 48 === 0,
      meetsMinSize: meta.width >= 48 && meta.height >= 48,
      isOpaque: !meta.hasAlpha,
    });
  } else {
    log('C', 'Local favicon-48.png missing', { path: favicon48Path });
  }

  // Hypothesis D: build output omits favicon assets or head links
  const distChecks = [
    'dist/favicon.ico',
    'dist/favicon-48.png',
    'dist/apple-touch-icon.png',
    'dist/tr/index.html',
  ];
  for (const relativePath of distChecks) {
    const fullPath = resolve(ROOT, relativePath);
    const exists = existsSync(fullPath);
    const payload = { relativePath, exists };
    if (exists && relativePath.endsWith('.html')) {
      const html = readFileSync(fullPath, 'utf8');
      payload.missingLinks = FAVICON_LINKS.filter((link) => !html.includes(link));
      payload.iconLinkCount = (html.match(/rel=["']icon["']/gi) || []).length;
    }
    log('D', 'Dist asset check', payload);
  }

  // Hypothesis E: root homepage redirect chain hides favicon discovery
  const rootProbe = await probeUrl(`${SITE_ORIGIN}/`);
  log('E', 'Root homepage redirect probe', rootProbe);

  log('INIT', 'Favicon runtime diagnostics complete');
  console.log(`[debug-favicon-runtime] Wrote diagnostics to ${LOG_PATH}`);
}

main().catch((error) => {
  log('INIT', 'Diagnostics failed', { error: error instanceof Error ? error.message : String(error) });
  console.error('[debug-favicon-runtime] Failed:', error);
  process.exit(1);
});
