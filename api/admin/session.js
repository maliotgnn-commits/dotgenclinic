import { authorizeAdminRequest } from '../../server/analytics/admin-auth.js';
import { getAnalyticsConfigStatus } from '../../server/analytics/analytics-config.js';
import { sendJson, rejectMethodNotAllowed } from '../../server/analytics/api-auth.js';

function isHealthCheck(req) {
  return req.query?.healthCheck === '1';
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    rejectMethodNotAllowed(req, res, ['GET']);
    return;
  }

  if (isHealthCheck(req)) {
    const status = getAnalyticsConfigStatus();
    sendJson(res, status.ready.adminDashboard ? 200 : 503, {
      ok: status.ready.adminDashboard,
      data: status,
    });
    return;
  }

  const auth = authorizeAdminRequest(req);
  if (!auth.ok) {
    sendJson(res, auth.status, {
      ok: false,
      error: {
        code: auth.code,
        message: auth.message,
      },
    });
    return;
  }

  sendJson(res, 200, {
    ok: true,
    data: {
      authenticated: true,
      devBypass: Boolean(auth.devBypass),
    },
  });
}
