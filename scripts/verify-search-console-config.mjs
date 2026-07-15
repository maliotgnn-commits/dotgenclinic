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
bootstrapVercelServiceAccountEnv();

const { getSearchConsoleConfigSummary } = await import(
  pathToFileURL(resolve(ROOT, 'server/seo/search-console/seo-report.js')).href
);
const config = getSearchConsoleConfigSummary();

let apiReachable = false;
let apiError = null;
let sampleMetrics = null;

if (config.ready) {
  try {
    const { fetchPerformanceReport } = await import(
      pathToFileURL(resolve(ROOT, 'server/seo/search-console/performance.js')).href
    );
    const result = await fetchPerformanceReport();
    apiReachable = Boolean(result && typeof result.clicks === 'number');
    sampleMetrics = {
      clicks: result.clicks,
      impressions: result.impressions,
      topQueries: result.topQueries?.length || 0,
      topPages: result.topPages?.length || 0,
    };
  } catch (error) {
    apiError = error instanceof Error ? error.message : String(error);
  }
}

console.log('[verify-search-console-config] Site URL:', config.siteUrl);
console.log('[verify-search-console-config] Service account:', config.serviceAccountEmail);
console.log('[verify-search-console-config] Credentials valid:', config.credentialsValid);
console.log('[verify-search-console-config] Config ready:', config.ready);

if (!config.ready) {
  if (config.siteUrlError) console.error('  - Site URL error:', config.siteUrlError);
  if (config.credentialsError) console.error('  - Credentials error:', config.credentialsError);
  console.error('[verify-search-console-config] Search Console is not configured.');
  process.exit(1);
}

if (!apiReachable) {
  console.error('[verify-search-console-config] API test failed:', apiError);
  process.exit(1);
}

console.log('[verify-search-console-config] API reachable. Sample metrics:', sampleMetrics);
console.log('[verify-search-console-config] Search Console configuration looks ready');
