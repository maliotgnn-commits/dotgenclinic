import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.VERIFY_LIVE_BASE_URL || 'https://www.drotgenclinic.com';

async function fetchJson(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, options);
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: response.status, json };
}

const health = await fetchJson('/api/admin/health');
const session = await fetchJson('/api/admin/session');
const dashboard = await fetchJson('/api/admin/dashboard');
const adminPage = await fetch(`${BASE}/admin/analytics`);
const adminHtml = await adminPage.text();
const healthViaRewrite = await fetchJson('/api/admin/session?healthCheck=1');

const failures = [];

if (health.status !== 200 || !health.json?.ok) {
  failures.push('Health endpoint must return 200 with ok:true');
}
if (!health.json?.data?.ready) {
  failures.push('adminDashboard readiness flag must be true');
}
if (session.status !== 401) {
  failures.push('Session without cookie must return 401');
}
if (dashboard.status !== 401) {
  failures.push('Dashboard without cookie must return 401');
}
if (adminPage.status !== 200 || !adminHtml.includes('admin-analytics-app')) {
  failures.push('Admin analytics page must load with app mount');
}
if (!healthViaRewrite.json?.ok) {
  failures.push('Health rewrite via /api/admin/session?healthCheck=1 must work');
}

console.log(`[verify-live-admin-analytics] Base URL: ${BASE}`);
console.log(`[verify-live-admin-analytics] Health: ${health.status} ok=${health.json?.ok}`);
console.log(`[verify-live-admin-analytics] Session (no cookie): ${session.status}`);
console.log(`[verify-live-admin-analytics] Dashboard (no cookie): ${dashboard.status}`);
console.log(`[verify-live-admin-analytics] Admin page: ${adminPage.status}`);

if (failures.length) {
  console.error('[verify-live-admin-analytics] FAILED:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log('[verify-live-admin-analytics] Production admin analytics checks passed');
