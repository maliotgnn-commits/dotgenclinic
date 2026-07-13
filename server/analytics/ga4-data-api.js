import { BetaAnalyticsDataClient } from '@google-analytics/data';
import {
  getGa4PropertyResourceName,
  getGoogleServiceAccountCredentials,
} from './google-credentials.js';

const TRACKED_EVENTS = Object.freeze([
  'service_page_view',
  'whatsapp_click',
  'appointment_cta',
  'form_submit',
]);

let cachedClient = null;

export function getTrackedEventNames() {
  return [...TRACKED_EVENTS];
}

function getAnalyticsClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const credentials = getGoogleServiceAccountCredentials();

  cachedClient = new BetaAnalyticsDataClient({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
  });

  return cachedClient;
}

function mapGa4Error(error) {
  const code = error?.code;
  const message = error?.message || 'Unknown GA4 API error';

  if (code === 7 || /PERMISSION_DENIED/i.test(message)) {
    return {
      status: 403,
      code: 'GA4_PERMISSION_DENIED',
      message: 'GA4 Data API access denied. Verify service account permissions on the property.',
    };
  }

  if (code === 5 || /NOT_FOUND/i.test(message)) {
    return {
      status: 404,
      code: 'GA4_PROPERTY_NOT_FOUND',
      message: 'GA4 property was not found for the configured GA4_PROPERTY_ID.',
    };
  }

  if (code === 3 || /INVALID_ARGUMENT/i.test(message)) {
    return {
      status: 400,
      code: 'GA4_INVALID_REQUEST',
      message: 'Invalid GA4 report request.',
    };
  }

  if (code === 8 || /RESOURCE_EXHAUSTED|quota/i.test(message)) {
    return {
      status: 429,
      code: 'GA4_QUOTA_EXCEEDED',
      message: 'GA4 API quota exceeded. Try again later.',
    };
  }

  return {
    status: 502,
    code: 'GA4_UPSTREAM_ERROR',
    message: 'Unable to fetch analytics data from GA4.',
  };
}

export class Ga4ApiError extends Error {
  constructor(mappedError, cause) {
    super(mappedError.message);
    this.name = 'Ga4ApiError';
    this.status = mappedError.status;
    this.code = mappedError.code;
    this.cause = cause;
  }
}

async function runReport(request) {
  const client = getAnalyticsClient();

  try {
    const [response] = await client.runReport(request);
    return response;
  } catch (error) {
    console.error('[ga4-data-api] runReport failed:', error?.message || error);
    throw new Ga4ApiError(mapGa4Error(error), error);
  }
}

function parseMetricValue(rawValue) {
  const parsed = Number(rawValue ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildDailySeries(response) {
  const rows = response?.rows || [];

  return rows.map((row) => {
    const date = row.dimensionValues?.[0]?.value || '';
    const metrics = row.metricValues || [];

    return {
      date,
      activeUsers: parseMetricValue(metrics[0]?.value),
      sessions: parseMetricValue(metrics[1]?.value),
      screenPageViews: parseMetricValue(metrics[2]?.value),
      newUsers: parseMetricValue(metrics[3]?.value),
    };
  });
}

function buildEventRows(response) {
  const rows = response?.rows || [];

  return rows.map((row) => ({
    eventName: row.dimensionValues?.[0]?.value || 'unknown',
    eventCount: parseMetricValue(row.metricValues?.[0]?.value),
  }));
}

function sumMetric(response, index = 0) {
  return (response?.rows || []).reduce((total, row) => {
    return total + parseMetricValue(row.metricValues?.[index]?.value);
  }, 0);
}

export async function fetchVisitorMetrics({ startDate, endDate }) {
  const property = getGa4PropertyResourceName();

  const [dailyResponse, totalsResponse] = await Promise.all([
    runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'newUsers' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    }),
    runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'newUsers' },
      ],
    }),
  ]);

  return {
    property,
    dateRange: { startDate, endDate },
    totals: {
      activeUsers: sumMetric(totalsResponse, 0),
      sessions: sumMetric(totalsResponse, 1),
      screenPageViews: sumMetric(totalsResponse, 2),
      newUsers: sumMetric(totalsResponse, 3),
    },
    daily: buildDailySeries(dailyResponse),
  };
}

export async function fetchEventMetrics({ startDate, endDate, eventNames = TRACKED_EVENTS }) {
  const property = getGa4PropertyResourceName();
  const names = Array.isArray(eventNames) && eventNames.length > 0 ? eventNames : TRACKED_EVENTS;

  const response = await runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        inListFilter: { values: names },
      },
    },
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
  });

  const rows = buildEventRows(response);
  const known = new Set(names);
  const missingEvents = names.filter((name) => !rows.some((row) => row.eventName === name));

  return {
    property,
    dateRange: { startDate, endDate },
    trackedEvents: [...known],
    totals: {
      eventCount: rows.reduce((sum, row) => sum + row.eventCount, 0),
    },
    events: rows,
    missingEvents,
  };
}
