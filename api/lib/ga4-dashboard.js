import { BetaAnalyticsDataClient } from '@google-analytics/data';
import {
  getGa4PropertyResourceName,
  getGoogleServiceAccountCredentials,
} from './google-credentials.js';
import { Ga4ApiError } from './ga4-data-api.js';

const CONVERSION_EVENTS = Object.freeze([
  'whatsapp_click',
  'appointment_cta',
  'form_submit',
]);

const LOCALE_CODES = new Set(['tr', 'en', 'ar', 'es', 'fr', 'it', 'ru', 'de']);

let cachedClient = null;

function getAnalyticsClient() {
  if (cachedClient) return cachedClient;

  const credentials = getGoogleServiceAccountCredentials();
  cachedClient = new BetaAnalyticsDataClient({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
  });

  return cachedClient;
}

function parseMetricValue(rawValue) {
  const parsed = Number(rawValue ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function runReport(request) {
  const client = getAnalyticsClient();

  try {
    const [response] = await client.runReport(request);
    return response;
  } catch (error) {
    console.error('[ga4-dashboard] runReport failed:', error?.message || error);
    throw new Ga4ApiError(
      {
        status: 502,
        code: 'GA4_UPSTREAM_ERROR',
        message: 'Unable to fetch analytics dashboard data from GA4.',
      },
      error,
    );
  }
}

function sumMetric(response, index = 0) {
  return (response?.rows || []).reduce((total, row) => {
    return total + parseMetricValue(row.metricValues?.[index]?.value);
  }, 0);
}

async function fetchVisitorBundle(startDate, endDate) {
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
    totals: {
      activeUsers: sumMetric(totalsResponse, 0),
      sessions: sumMetric(totalsResponse, 1),
      screenPageViews: sumMetric(totalsResponse, 2),
      newUsers: sumMetric(totalsResponse, 3),
    },
    daily: (dailyResponse?.rows || []).map((row) => ({
      date: row.dimensionValues?.[0]?.value || '',
      activeUsers: parseMetricValue(row.metricValues?.[0]?.value),
      sessions: parseMetricValue(row.metricValues?.[1]?.value),
      screenPageViews: parseMetricValue(row.metricValues?.[2]?.value),
      newUsers: parseMetricValue(row.metricValues?.[3]?.value),
    })),
  };
}

async function fetchEventCounts(startDate, endDate, eventNames) {
  const property = getGa4PropertyResourceName();

  const response = await runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        inListFilter: { values: eventNames },
      },
    },
  });

  const counts = Object.fromEntries(eventNames.map((name) => [name, 0]));

  for (const row of response?.rows || []) {
    const eventName = row.dimensionValues?.[0]?.value;
    if (eventName && counts[eventName] != null) {
      counts[eventName] = parseMetricValue(row.metricValues?.[0]?.value);
    }
  }

  return counts;
}

async function fetchDimensionReport({
  startDate,
  endDate,
  dimension,
  metric = 'eventCount',
  eventName = null,
  dimensionFilter = null,
  limit = 10,
}) {
  const property = getGa4PropertyResourceName();

  const request = {
    property,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: dimension }],
    metrics: [{ name: metric }],
    orderBys: [{ metric: { metricName: metric }, desc: true }],
    limit,
  };

  if (eventName) {
    request.dimensionFilter = {
      filter: {
        fieldName: 'eventName',
        stringFilter: { matchType: 'EXACT', value: eventName },
      },
    };
  }

  if (dimensionFilter) {
    request.dimensionFilter = dimensionFilter;
  }

  try {
    const response = await runReport(request);
    return (response?.rows || []).map((row) => ({
      label: row.dimensionValues?.[0]?.value || 'unknown',
      value: parseMetricValue(row.metricValues?.[0]?.value),
    }));
  } catch (error) {
    console.warn(`[ga4-dashboard] dimension "${dimension}" unavailable:`, error?.message || error);
    return null;
  }
}

function normalizeServiceTitle(rawTitle) {
  if (!rawTitle || typeof rawTitle !== 'string') return 'Bilinmeyen';
  return rawTitle.replace(/\s*\|\s*Dr Otgen Clinic\s*$/i, '').trim() || 'Bilinmeyen';
}

function createServiceEntry(map, serviceName) {
  if (!map.has(serviceName)) {
    map.set(serviceName, {
      serviceName,
      views: 0,
      whatsappClicks: 0,
      appointmentCta: 0,
    });
  }

  return map.get(serviceName);
}

async function fetchServiceViewsByEvent(startDate, endDate) {
  const property = getGa4PropertyResourceName();
  const dimensions = ['customEvent:service_title', 'customEvent:service_slug'];

  for (const dimension of dimensions) {
    try {
      const response = await runReport({
        property,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: dimension }],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            stringFilter: { matchType: 'EXACT', value: 'service_page_view' },
          },
        },
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
        limit: 25,
      });

      const map = new Map();

      for (const row of response?.rows || []) {
        const serviceName = normalizeServiceTitle(row.dimensionValues?.[0]?.value);
        const count = parseMetricValue(row.metricValues?.[0]?.value);
        createServiceEntry(map, serviceName).views += count;
      }

      if (map.size > 0) {
        return map;
      }
    } catch (error) {
      console.warn(`[ga4-dashboard] service views dimension "${dimension}" unavailable:`, error?.message || error);
    }
  }

  return new Map();
}

async function fetchServiceEngagementByPageTitle(startDate, endDate) {
  const property = getGa4PropertyResourceName();

  try {
    const response = await runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pageTitle' }, { name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        andGroup: {
          expressions: [
            {
              filter: {
                fieldName: 'eventName',
                inListFilter: { values: ['whatsapp_click', 'appointment_cta'] },
              },
            },
            {
              filter: {
                fieldName: 'pagePath',
                stringFilter: { matchType: 'CONTAINS', value: 'service.html' },
              },
            },
          ],
        },
      },
      limit: 250,
    });

    const map = new Map();

    for (const row of response?.rows || []) {
      const serviceName = normalizeServiceTitle(row.dimensionValues?.[0]?.value);
      const eventName = row.dimensionValues?.[1]?.value || '';
      const count = parseMetricValue(row.metricValues?.[0]?.value);
      const entry = createServiceEntry(map, serviceName);

      if (eventName === 'whatsapp_click') entry.whatsappClicks += count;
      if (eventName === 'appointment_cta') entry.appointmentCta += count;
    }

    return map;
  } catch (error) {
    console.warn('[ga4-dashboard] service engagement by page title unavailable:', error?.message || error);
    return new Map();
  }
}

function mergeServicePerformanceMaps(...maps) {
  const merged = new Map();

  for (const map of maps) {
    for (const [serviceName, entry] of map.entries()) {
      const target = createServiceEntry(merged, serviceName);
      target.views += entry.views || 0;
      target.whatsappClicks += entry.whatsappClicks || 0;
      target.appointmentCta += entry.appointmentCta || 0;
    }
  }

  return [...merged.values()]
    .filter((entry) => entry.views > 0 || entry.whatsappClicks > 0 || entry.appointmentCta > 0)
    .sort((a, b) => b.views - a.views || b.whatsappClicks - a.whatsappClicks)
    .slice(0, 20);
}

async function fetchServicePerformance(startDate, endDate) {
  const [viewsMap, engagementMap] = await Promise.all([
    fetchServiceViewsByEvent(startDate, endDate),
    fetchServiceEngagementByPageTitle(startDate, endDate),
  ]);

  const rows = mergeServicePerformanceMaps(viewsMap, engagementMap);

  if (rows.length > 0) {
    return rows;
  }

  const fallback = await fetchDimensionReport({
    startDate,
    endDate,
    dimension: 'customEvent:service_title',
    eventName: 'service_page_view',
    limit: 20,
  });

  return (fallback || []).map((row) => ({
    serviceName: normalizeServiceTitle(row.label),
    views: row.value,
    whatsappClicks: 0,
    appointmentCta: 0,
  }));
}

function detectLocaleFromPath(pagePath) {
  if (!pagePath || typeof pagePath !== 'string') return 'other';
  const match = pagePath.match(/^\/([a-z]{2})(?:\/|$)/i);
  if (!match) return 'other';
  const code = match[1].toLowerCase();
  return LOCALE_CODES.has(code) ? code : 'other';
}

async function fetchLanguageBreakdown(startDate, endDate) {
  const property = getGa4PropertyResourceName();

  try {
    const response = await runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'customEvent:page_locale' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: { matchType: 'EXACT', value: 'page_view' },
        },
      },
      limit: 50,
    });

    const buckets = { tr: 0, en: 0, other: 0 };

    for (const row of response?.rows || []) {
      const locale = (row.dimensionValues?.[0]?.value || 'other').toLowerCase();
      const count = parseMetricValue(row.metricValues?.[0]?.value);

      if (locale === 'tr') buckets.tr += count;
      else if (locale === 'en') buckets.en += count;
      else buckets.other += count;
    }

    if (buckets.tr + buckets.en + buckets.other > 0) {
      return [
        { label: 'TR', value: buckets.tr },
        { label: 'EN', value: buckets.en },
        { label: 'Diğer', value: buckets.other },
      ];
    }
  } catch (error) {
    console.warn('[ga4-dashboard] page_locale language fallback:', error?.message || error);
  }

  try {
    const response = await runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'activeUsers' }],
      limit: 250,
    });

    const buckets = { tr: 0, en: 0, other: 0 };

    for (const row of response?.rows || []) {
      const pagePath = row.dimensionValues?.[0]?.value || '';
      const users = parseMetricValue(row.metricValues?.[0]?.value);
      const locale = detectLocaleFromPath(pagePath);

      if (locale === 'tr') buckets.tr += users;
      else if (locale === 'en') buckets.en += users;
      else buckets.other += users;
    }

    return [
      { label: 'TR', value: buckets.tr },
      { label: 'EN', value: buckets.en },
      { label: 'Diğer', value: buckets.other },
    ];
  } catch (error) {
    console.warn('[ga4-dashboard] language breakdown fallback:', error?.message || error);
    return [
      { label: 'TR', value: 0 },
      { label: 'EN', value: 0 },
      { label: 'Diğer', value: 0 },
    ];
  }
}

async function fetchCountryBreakdown(startDate, endDate) {
  const property = getGa4PropertyResourceName();

  try {
    const response = await runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 10,
    });

    return (response?.rows || []).map((row) => ({
      label: row.dimensionValues?.[0]?.value || 'Bilinmeyen',
      value: parseMetricValue(row.metricValues?.[0]?.value),
    }));
  } catch (error) {
    console.warn('[ga4-dashboard] country breakdown unavailable:', error?.message || error);
    return [];
  }
}

function buildConversionFunnel(visitorTotals, eventCounts) {
  const visitors = visitorTotals.activeUsers || 0;
  const serviceViews = eventCounts.service_page_view || 0;
  const whatsappClicks = eventCounts.whatsapp_click || 0;
  const appointmentCta = eventCounts.appointment_cta || 0;

  const toRate = (value, base) => {
    if (!base) return 0;
    return Number(((value / base) * 100).toFixed(2));
  };

  const steps = [
    {
      key: 'visitors',
      label: 'Visitors',
      value: visitors,
      rateFromVisitors: visitors > 0 ? 100 : 0,
      rateFromPrevious: null,
    },
    {
      key: 'service_views',
      label: 'Service Views',
      value: serviceViews,
      rateFromVisitors: toRate(serviceViews, visitors),
      rateFromPrevious: toRate(serviceViews, visitors),
    },
    {
      key: 'whatsapp_clicks',
      label: 'WhatsApp Clicks',
      value: whatsappClicks,
      rateFromVisitors: toRate(whatsappClicks, visitors),
      rateFromPrevious: toRate(whatsappClicks, serviceViews),
    },
    {
      key: 'appointment_cta',
      label: 'Appointment CTA',
      value: appointmentCta,
      rateFromVisitors: toRate(appointmentCta, visitors),
      rateFromPrevious: toRate(appointmentCta, whatsappClicks),
    },
  ];

  return { steps };
}

function buildConversionRates(eventCounts, sessions) {
  const totalEvents =
    eventCounts.whatsapp_click + eventCounts.appointment_cta + eventCounts.form_submit;

  const toRate = (count) => {
    if (sessions > 0) return Number(((count / sessions) * 100).toFixed(2));
    if (totalEvents > 0) return Number(((count / totalEvents) * 100).toFixed(2));
    return 0;
  };

  return {
    whatsapp_click: {
      count: eventCounts.whatsapp_click,
      rate: toRate(eventCounts.whatsapp_click),
    },
    appointment_cta: {
      count: eventCounts.appointment_cta,
      rate: toRate(eventCounts.appointment_cta),
    },
    form_submit: {
      count: eventCounts.form_submit,
      rate: toRate(eventCounts.form_submit),
    },
  };
}

export async function fetchDashboardData() {
  const property = getGa4PropertyResourceName();
  const funnelEvents = ['service_page_view', ...CONVERSION_EVENTS];

  const [today, last7Days, last30Days, eventCounts, funnelEventCounts, topServices, countries, languages, servicePerformance] =
    await Promise.all([
      fetchVisitorBundle('today', 'today'),
      fetchVisitorBundle('7daysAgo', 'today'),
      fetchVisitorBundle('30daysAgo', 'today'),
      fetchEventCounts('30daysAgo', 'today', CONVERSION_EVENTS),
      fetchEventCounts('30daysAgo', 'today', funnelEvents),
      fetchDimensionReport({
        startDate: '30daysAgo',
        endDate: 'today',
        dimension: 'customEvent:service_title',
        eventName: 'service_page_view',
        limit: 10,
      }),
      fetchCountryBreakdown('30daysAgo', 'today'),
      fetchLanguageBreakdown('30daysAgo', 'today'),
      fetchServicePerformance('30daysAgo', 'today'),
    ]);

  return {
    property,
    generatedAt: new Date().toISOString(),
    summary: {
      today: today.totals,
      last7Days: last7Days.totals,
      last30Days: last30Days.totals,
    },
    cards: {
      todayVisitors: today.totals.activeUsers,
      last7DaysVisitors: last7Days.totals.activeUsers,
      last30DaysVisitors: last30Days.totals.activeUsers,
      sessions: last30Days.totals.sessions,
      pageViews: last30Days.totals.screenPageViews,
      newUsers: last30Days.totals.newUsers,
    },
    dailyVisitors: last30Days.daily,
    topServices: topServices || [],
    conversions: buildConversionRates(eventCounts, last30Days.totals.sessions),
    conversionFunnel: buildConversionFunnel(last30Days.totals, funnelEventCounts),
    languages: languages || [],
    countries: countries || [],
    servicePerformance: servicePerformance || [],
  };
}
