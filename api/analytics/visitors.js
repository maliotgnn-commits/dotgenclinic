import { fetchVisitorMetrics } from '../../server/analytics/ga4-data-api.js';
import {
  authorizeAnalyticsRequest,
  handleEndpointError,
  parseDateRange,
  rejectMethodNotAllowed,
  sendJson,
} from '../../server/analytics/api-auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    rejectMethodNotAllowed(req, res, ['GET']);
    return;
  }

  const auth = authorizeAnalyticsRequest(req);
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

  const dateRange = parseDateRange(req.query);
  if (!dateRange.ok) {
    sendJson(res, dateRange.status, {
      ok: false,
      error: {
        code: dateRange.code,
        message: dateRange.message,
      },
    });
    return;
  }

  try {
    const data = await fetchVisitorMetrics({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });

    sendJson(res, 200, {
      ok: true,
      data,
    });
  } catch (error) {
    handleEndpointError(res, error);
  }
}
