import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PREPARED_SERVICE_ACCOUNT_PATH = resolve(
  ROOT,
  'secrets/vercel-google-service-account.oneline.txt',
);

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

function bootstrapVercelServiceAccountEnv() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) return true;
  if (!existsSync(PREPARED_SERVICE_ACCOUNT_PATH)) return false;

  process.env.GOOGLE_SERVICE_ACCOUNT_JSON = readFileSync(PREPARED_SERVICE_ACCOUNT_PATH, 'utf8').trim();
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
}

loadLocalEnvFile();

const simulateVercel = process.argv.includes('--vercel') || process.env.SIMULATE_VERCEL === '1';

if (simulateVercel) {
  process.env.VERCEL = '1';
  process.env.VERCEL_ENV = process.env.VERCEL_ENV || 'production';
  bootstrapVercelServiceAccountEnv();
}

const { getAnalyticsConfigStatus } = await import(pathToFileURL(resolve(ROOT, 'server/analytics/analytics-config.js')).href);
const status = getAnalyticsConfigStatus();

let ga4ApiReachable = false;
let ga4ApiError = null;

if (status.ga4.dataReady) {
  try {
    const { fetchVisitorMetrics } = await import(pathToFileURL(resolve(ROOT, 'server/analytics/ga4-data-api.js')).href);
    const result = await fetchVisitorMetrics({ startDate: 'yesterday', endDate: 'yesterday' });
    ga4ApiReachable = Boolean(result?.totals);
  } catch (error) {
    ga4ApiError = error instanceof Error ? error.message : String(error);
  }
}

const missing = [];

if (!status.adminAuth.hasPassword) missing.push('ADMIN_PASSWORD');
if (!status.adminAuth.hasSessionSecret) missing.push('ADMIN_SESSION_SECRET or ANALYTICS_API_SECRET');
if (!status.ga4.propertyConfigured) missing.push('GA4_PROPERTY_ID');
if (!status.ga4.credentialsValid) {
  if (simulateVercel && !status.ga4.credentialsFromEnv) {
    missing.push(
      'GOOGLE_SERVICE_ACCOUNT_JSON on Vercel (run: node scripts/prepare-vercel-analytics-env.mjs)',
    );
  } else if (!status.ga4.credentialsFromEnv && !status.ga4.credentialsFromFile) {
    missing.push('GOOGLE_SERVICE_ACCOUNT_JSON (or secrets/google-service-account.json locally)');
  } else if (status.ga4.credentialsError) {
    missing.push(`Google credentials fix: ${status.ga4.credentialsError}`);
  }
}

console.log(`[verify-admin-analytics-config] Mode: ${simulateVercel ? 'vercel-simulation' : 'local'}`);
console.log('[verify-admin-analytics-config] Runtime:', status.runtime);
console.log('[verify-admin-analytics-config] Admin auth configured:', status.adminAuth.configured);
console.log('[verify-admin-analytics-config] GA4 data ready:', status.ga4.dataReady);
console.log('[verify-admin-analytics-config] Admin dashboard ready:', status.ready.adminDashboard);

if (missing.length) {
  console.error('[verify-admin-analytics-config] Missing or invalid:');
  for (const item of missing) console.error(`  - ${item}`);
  process.exit(1);
}

if (status.ga4.dataReady && !ga4ApiReachable) {
  console.error('[verify-admin-analytics-config] GA4 API test failed:', ga4ApiError);
  process.exit(1);
}

console.log('[verify-admin-analytics-config] Admin analytics configuration looks ready');
