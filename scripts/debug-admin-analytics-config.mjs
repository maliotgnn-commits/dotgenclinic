import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const LOG_PATH = resolve(ROOT, 'debug-f9a1ae.log');
const INGEST = 'http://127.0.0.1:7351/ingest/978326e2-ed1a-492b-ba34-cad4578e33a0';
const SESSION_ID = 'f9a1ae';

function loadLocalEnvFile() {
  const envPath = resolve(ROOT, '.env');
  if (!existsSync(envPath)) return false;

  const text = readFileSync(envPath, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const index = line.indexOf('=');
    if (index <= 0) continue;

    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] == null || process.env[key] === '') {
      process.env[key] = value;
    }
  }

  return true;
}

function sendLog(entry) {
  const payload = { sessionId: SESSION_ID, timestamp: Date.now(), ...entry };
  fetch(INGEST, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': SESSION_ID },
    body: JSON.stringify(payload),
  }).catch(() => {});
  appendFileSync(LOG_PATH, `${JSON.stringify(payload)}\n`);
}

const envFileLoaded = loadLocalEnvFile();
const simulateVercel = process.argv.includes('--vercel') || process.env.SIMULATE_VERCEL === '1';

if (simulateVercel) {
  process.env.VERCEL = '1';
  process.env.VERCEL_ENV = process.env.VERCEL_ENV || 'production';
}

const { getAnalyticsConfigStatus } = await import(pathToFileURL(resolve(ROOT, 'api/lib/analytics-config.js')).href);
const status = getAnalyticsConfigStatus();

// #region agent log
sendLog({
  runId: 'pre-fix',
  hypothesisId: 'H0',
  location: 'scripts/debug-admin-analytics-config.mjs:env-file',
  message: 'Local .env file load attempt',
  data: { envFileLoaded },
});
// #endregion

// #region agent log
sendLog({
  runId: 'pre-fix',
  hypothesisId: 'H1',
  location: 'scripts/debug-admin-analytics-config.mjs:admin-auth',
  message: 'Admin auth env presence',
  data: status.adminAuth,
});
// #endregion

// #region agent log
sendLog({
  runId: 'pre-fix',
  hypothesisId: 'H2',
  location: 'scripts/debug-admin-analytics-config.mjs:analytics-api',
  message: 'Analytics API secret presence',
  data: status.analyticsApi,
});
// #endregion

// #region agent log
sendLog({
  runId: 'pre-fix',
  hypothesisId: 'H3',
  location: 'scripts/debug-admin-analytics-config.mjs:ga4-property',
  message: 'GA4 property ID configuration',
  data: {
    propertyConfigured: status.ga4.propertyConfigured,
    propertyId: status.ga4.propertyId,
    propertyError: status.ga4.propertyError,
  },
});
// #endregion

// #region agent log
sendLog({
  runId: 'pre-fix',
  hypothesisId: 'H4',
  location: 'scripts/debug-admin-analytics-config.mjs:google-credentials',
  message: 'Google service account configuration',
  data: {
    credentialsFromEnv: status.ga4.credentialsFromEnv,
    credentialsFromFile: status.ga4.credentialsFromFile,
    credentialsValid: status.ga4.credentialsValid,
    credentialsError: status.ga4.credentialsError,
  },
});
// #endregion

let ga4ApiReachable = false;
let ga4ApiError = null;

if (status.ga4.dataReady) {
  try {
    const { fetchVisitorMetrics } = await import(pathToFileURL(resolve(ROOT, 'api/lib/ga4-data-api.js')).href);
    const result = await fetchVisitorMetrics({ startDate: 'yesterday', endDate: 'yesterday' });
    ga4ApiReachable = Boolean(result?.totals);
  } catch (error) {
    ga4ApiError = error instanceof Error ? error.message : String(error);
  }
}

// #region agent log
sendLog({
  runId: 'pre-fix',
  hypothesisId: 'H5',
  location: 'scripts/debug-admin-analytics-config.mjs:ga4-api',
  message: 'GA4 Data API connectivity test',
  data: {
    attempted: status.ga4.dataReady,
    reachable: ga4ApiReachable,
    error: ga4ApiError,
  },
});
// #endregion

// #region agent log
sendLog({
  runId: simulateVercel ? 'vercel-sim' : 'pre-fix',
  hypothesisId: 'H7',
  location: 'scripts/debug-admin-analytics-config.mjs:vercel-sim',
  message: 'Vercel production simulation flag',
  data: { simulateVercel, vercelEnv: process.env.VERCEL_ENV || null },
});
// #endregion

// #region agent log
sendLog({
  runId: simulateVercel ? 'vercel-sim' : 'pre-fix',
  hypothesisId: 'H6',
  location: 'scripts/debug-admin-analytics-config.mjs:summary',
  message: 'Admin analytics readiness summary',
  data: status.ready,
});
// #endregion

const missing = [];

if (!status.adminAuth.hasPassword) missing.push('ADMIN_PASSWORD');
if (!status.adminAuth.hasSessionSecret) missing.push('ADMIN_SESSION_SECRET or ANALYTICS_API_SECRET');
if (!status.ga4.propertyConfigured) missing.push('GA4_PROPERTY_ID');
if (!status.ga4.credentialsValid) {
  if (simulateVercel && !status.ga4.credentialsFromEnv) {
    missing.push('GOOGLE_SERVICE_ACCOUNT_JSON on Vercel (local secrets/ file is not used in production)');
  } else if (!status.ga4.credentialsFromEnv && !status.ga4.credentialsFromFile) {
    missing.push('GOOGLE_SERVICE_ACCOUNT_JSON (or secrets/google-service-account.json locally)');
  } else if (status.ga4.credentialsError) {
    missing.push(`Google credentials fix: ${status.ga4.credentialsError}`);
  }
}

console.log('[debug-admin-analytics-config] Runtime:', status.runtime);
console.log('[debug-admin-analytics-config] Admin auth configured:', status.adminAuth.configured);
console.log('[debug-admin-analytics-config] GA4 data ready:', status.ga4.dataReady);
console.log('[debug-admin-analytics-config] Admin dashboard ready:', status.ready.adminDashboard);

if (missing.length) {
  console.error('[debug-admin-analytics-config] Missing or invalid:');
  for (const item of missing) console.error(`  - ${item}`);
  process.exit(1);
}

if (status.ga4.dataReady && !ga4ApiReachable) {
  console.error('[debug-admin-analytics-config] GA4 API test failed:', ga4ApiError);
  process.exit(1);
}

console.log('[debug-admin-analytics-config] Admin analytics configuration looks ready');
