import { authorizeAdminRequest } from '../lib/admin-auth.js';
import { handleEndpointError, rejectMethodNotAllowed, sendJson } from '../lib/api-auth.js';
import { fetchDashboardData } from '../lib/ga4-dashboard.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    rejectMethodNotAllowed(req, res, ['GET']);
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

  try {
    const data = await fetchDashboardData();
    sendJson(res, 200, { ok: true, data });
  } catch (error) {
    handleEndpointError(res, error);
  }
}
