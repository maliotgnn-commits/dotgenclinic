import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ENV_PATH = resolve(ROOT, '.env');
const SECRETS_DIR = resolve(ROOT, 'secrets');
const SERVICE_ACCOUNT_PATH = resolve(SECRETS_DIR, 'google-service-account.json');
const ONE_LINE_PATH = resolve(SECRETS_DIR, 'vercel-google-service-account.oneline.txt');

function loadLocalEnvFile() {
  if (!existsSync(ENV_PATH)) return;

  const text = readFileSync(ENV_PATH, 'utf8');
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
}

loadLocalEnvFile();

const checklist = [
  {
    key: 'ADMIN_PASSWORD',
    ready: Boolean(process.env.ADMIN_PASSWORD),
    note: 'Admin dashboard login password',
  },
  {
    key: 'ADMIN_SESSION_SECRET',
    ready: Boolean(process.env.ADMIN_SESSION_SECRET),
    note: 'Session signing secret (32+ random chars)',
  },
  {
    key: 'GA4_PROPERTY_ID',
    ready: /^\d+$/.test(process.env.GA4_PROPERTY_ID || ''),
    note: 'Numeric GA4 property ID',
  },
  {
    key: 'GOOGLE_SERVICE_ACCOUNT_JSON',
    ready: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
    note: 'Full service account JSON as one line (required on Vercel)',
  },
  {
    key: 'ANALYTICS_API_SECRET',
    ready: Boolean(process.env.ANALYTICS_API_SECRET),
    note: 'Optional: protects /api/analytics/* routes',
  },
];

console.log('[prepare-vercel-analytics-env] Vercel environment checklist:');
for (const item of checklist) {
  console.log(`  [${item.ready ? 'x' : ' '}] ${item.key} — ${item.note}`);
}

if (!existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error('\n[prepare-vercel-analytics-env] Missing secrets/google-service-account.json');
  console.error('Create the service account in Google Cloud and save the JSON file there first.');
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
} catch {
  console.error('[prepare-vercel-analytics-env] secrets/google-service-account.json is not valid JSON');
  process.exit(1);
}

if (parsed?.type !== 'service_account' || !parsed.client_email || !parsed.private_key) {
  console.error('[prepare-vercel-analytics-env] Service account JSON is missing required fields');
  process.exit(1);
}

mkdirSync(SECRETS_DIR, { recursive: true });
const oneLine = JSON.stringify(parsed);
writeFileSync(ONE_LINE_PATH, oneLine, 'utf8');

console.log('\n[prepare-vercel-analytics-env] Prepared one-line JSON for Vercel:');
console.log(`  ${ONE_LINE_PATH}`);
console.log('\nNext steps:');
console.log('  1. Vercel → Project → Settings → Environment Variables');
console.log('  2. Add ADMIN_PASSWORD, ADMIN_SESSION_SECRET, GA4_PROPERTY_ID for Production + Preview');
console.log('  3. Add GOOGLE_SERVICE_ACCOUNT_JSON using the one-line file above (paste entire line as value)');
console.log('  4. Redeploy, then open /api/admin/health and /admin/analytics');
console.log('  5. Local check: node scripts/debug-admin-analytics-config.mjs --vercel');
