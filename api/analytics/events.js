import { fetchEventMetrics, getTrackedEventNames } from '../lib/ga4-data-api.js';
import {
  authorizeAnalyticsRequest,
  handleEndpointError,
  parseDateRange,
  rejectMethodNotAllowed,
  sendJson,
} from '../lib/api-auth.js';

function parseEventNames(query = {}) {
  const raw = query.events;

  if (raw == null || raw === '') {
    return getTrackedEventNames();
  }

  if (typeof raw !== 'string') {
    return null;
  }

  const names = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (names.length === 0) {
    return null;
  }

  const invalid = names.find((name) => !/^[a-zA-Z0-9_]+$/.test(name));
  if (invalid) {
    return null;
  }

  return names;
}

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

  const eventNames = parseEventNames(req.query);
  if (!eventNames) {
    sendJson(res, 400, {
      ok: false,
      error: {
        code: 'INVALID_EVENT_FILTER',
        message: 'events must be a comma-separated list of GA4 event names.',
      },
    });
    return;
  }

  try {
    const data = await fetchEventMetrics({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      eventNames,
    });

    sendJson(res, 200, {
      ok: true,
      data,
    });
  } catch (error) {
    handleEndpointError(res, error);
  }
}
