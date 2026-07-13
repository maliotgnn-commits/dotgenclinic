import { getAnalyticsConfigStatus } from '../lib/analytics-config.js';
import { sendJson, rejectMethodNotAllowed } from '../lib/api-auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    rejectMethodNotAllowed(req, res, ['GET']);
    return;
  }

  const status = getAnalyticsConfigStatus();

  sendJson(res, status.ready.adminDashboard ? 200 : 503, {
    ok: status.ready.adminDashboard,
    data: status,
  });
}
