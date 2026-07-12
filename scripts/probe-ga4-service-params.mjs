import { appendFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchDashboardData } from '../api/lib/ga4-dashboard.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOG_PATH = resolve(__dirname, '..', 'debug-cc8c65.log');

function debugLog(message, data, hypothesisId) {
  const entry = {
    sessionId: 'cc8c65',
    runId: 'probe-local',
    hypothesisId,
    location: 'scripts/probe-ga4-service-params.mjs',
    message,
    data,
    timestamp: Date.now(),
  };

  appendFileSync(LOG_PATH, `${JSON.stringify(entry)}\n`);
  console.log(`[${hypothesisId}] ${message}`, JSON.stringify(data, null, 2));
}

async function main() {
  try {
    const data = await fetchDashboardData();

    debugLog('service performance row count', {
      count: data.servicePerformance?.length || 0,
      sample: (data.servicePerformance || []).slice(0, 5),
    }, 'H1');

    debugLog('top services row count', {
      count: data.topServices?.length || 0,
      sample: (data.topServices || []).slice(0, 5),
    }, 'H2');

    debugLog('service probe meta', data.meta?.serviceProbe || null, 'H3');

    debugLog('conversion funnel steps', data.conversionFunnel?.steps || [], 'H6');

    debugLog('funnel rates over 100', {
      over100: (data.conversionFunnel?.steps || []).filter(
        (step) => (step.rateFromVisitors || 0) > 100 || (step.rateFromPrevious || 0) > 100,
      ),
    }, 'H6');
  } catch (error) {
    debugLog('probe failed', { error: error?.message || String(error) }, 'H0');
    process.exit(1);
  }
}

main();
