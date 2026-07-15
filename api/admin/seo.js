import { authorizeAdminRequest } from '../../server/analytics/admin-auth.js';
import { handleEndpointError, rejectMethodNotAllowed, sendJson } from '../../server/analytics/api-auth.js';
import { fetchSeoReport, getSearchConsolePublicHealthSummary } from '../../server/seo/search-console/seo-report.js';

function isHealthCheck(req) {
  return req.query?.healthCheck === '1';
}

function handleSeoEndpointError(res, error) {
  if (error?.name === 'SearchConsoleApiError') {
    sendJson(res, error.status || 502, {
      ok: false,
      error: {
        code: error.code || 'GSC_UPSTREAM_ERROR',
        message: error.message,
      },
    });
    return;
  }

  handleEndpointError(res, error);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    rejectMethodNotAllowed(req, res, ['GET']);
    return;
  }

  if (isHealthCheck(req)) {
    const config = getSearchConsolePublicHealthSummary();
    sendJson(res, config.ready ? 200 : 503, {
      ok: config.ready,
      data: config,
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

  try {
    const data = await fetchSeoReport();
    sendJson(res, 200, { ok: true, data });
  } catch (error) {
    handleSeoEndpointError(res, error);
  }
}
