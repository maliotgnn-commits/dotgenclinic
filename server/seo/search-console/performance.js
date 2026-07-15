import { getSearchConsoleSiteUrl, searchConsoleRequest } from './client.js';

function formatIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function defaultDateRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 28);

  return {
    startDate: formatIsoDate(start),
    endDate: formatIsoDate(end),
  };
}

function parseNumber(value) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapPerformanceRow(row, dimensionKey) {
  const keys = row?.keys || [];

  return {
    [dimensionKey]: keys[0] || '',
    clicks: parseNumber(row?.clicks),
    impressions: parseNumber(row?.impressions),
    ctr: parseNumber(row?.ctr),
    averagePosition: parseNumber(row?.position),
  };
}

function aggregateTotals(rows) {
  return (rows || []).reduce(
    (acc, row) => {
      acc.clicks += parseNumber(row?.clicks);
      acc.impressions += parseNumber(row?.impressions);
      return acc;
    },
    { clicks: 0, impressions: 0 },
  );
}

function computeCtr(clicks, impressions) {
  if (!impressions) return 0;
  return Number(((clicks / impressions) * 100).toFixed(2));
}

function computeAveragePosition(rows) {
  const validRows = (rows || []).filter((row) => parseNumber(row?.impressions) > 0);
  if (!validRows.length) return 0;

  const weighted = validRows.reduce(
    (acc, row) => {
      const impressions = parseNumber(row.impressions);
      acc.sum += parseNumber(row.position) * impressions;
      acc.impressions += impressions;
      return acc;
    },
    { sum: 0, impressions: 0 },
  );

  if (!weighted.impressions) return 0;
  return Number((weighted.sum / weighted.impressions).toFixed(2));
}

async function querySearchAnalytics({ startDate, endDate, dimensions = [], rowLimit = 25 }) {
  const body = {
    startDate,
    endDate,
    rowLimit,
  };

  if (dimensions.length > 0) {
    body.dimensions = dimensions;
  }

  const response = await searchConsoleRequest('/sites/{siteUrl}/searchAnalytics/query', {
    method: 'POST',
    body,
  });

  return response?.rows || [];
}

function previousPeriodRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - (days - 1));

  return {
    startDate: formatIsoDate(prevStart),
    endDate: formatIsoDate(prevEnd),
  };
}

function percentChange(current, previous) {
  if (!previous) return current ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(2));
}

export async function fetchPerformanceComparison(options = {}) {
  const current = await fetchPerformanceReport(options);
  const previousRange = previousPeriodRange(current.dateRange.startDate, current.dateRange.endDate);
  const previous = await fetchPerformanceReport({
    ...options,
    startDate: previousRange.startDate,
    endDate: previousRange.endDate,
  });

  return {
    current,
    previous,
    change: {
      clicks: percentChange(current.clicks, previous.clicks),
      impressions: percentChange(current.impressions, previous.impressions),
      ctr: percentChange(current.ctr, previous.ctr),
      averagePosition: percentChange(current.averagePosition, previous.averagePosition),
    },
  };
}

export async function fetchPerformanceReport(options = {}) {
  const siteUrl = getSearchConsoleSiteUrl();
  const range = options.startDate && options.endDate ? options : defaultDateRange();
  const { startDate, endDate } = range;
  const topLimit = options.topLimit || 25;

  const [summaryRows, queryRows, pageRows] = await Promise.all([
    querySearchAnalytics({ startDate, endDate }),
    querySearchAnalytics({
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: topLimit,
    }),
    querySearchAnalytics({
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit: topLimit,
    }),
  ]);

  const totals = aggregateTotals(summaryRows);
  const averagePosition = computeAveragePosition(summaryRows);

  return {
    siteUrl,
    dateRange: { startDate, endDate },
    clicks: totals.clicks,
    impressions: totals.impressions,
    ctr: computeCtr(totals.clicks, totals.impressions),
    averagePosition,
    topQueries: queryRows.map((row) => mapPerformanceRow(row, 'query')),
    topPages: pageRows.map((row) => mapPerformanceRow(row, 'page')),
  };
}
