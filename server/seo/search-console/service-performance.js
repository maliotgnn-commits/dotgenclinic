import { SUBPAGES, SUBPAGES_BY_SLUG } from '../../../src/subpages-data.js';
import { getSearchConsoleSiteUrl, searchConsoleRequest } from './client.js';

const SERVICE_CATEGORIES = ['hair', 'dental', 'plastic', 'medical', 'longevity', 'eye-health'];

const SLUG_TO_CATEGORY = Object.fromEntries(SUBPAGES.map((page) => [page.slug, page.category]));

function parseNumber(value) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function computeCtr(clicks, impressions) {
  if (!impressions) return 0;
  return Number(((clicks / impressions) * 100).toFixed(2));
}

function extractSlugFromPageUrl(pageUrl) {
  if (!pageUrl || typeof pageUrl !== 'string') return null;

  try {
    const url = new URL(pageUrl);
    const slug = url.searchParams.get('slug');
    if (slug && SLUG_TO_CATEGORY[slug]) return slug;

    if (url.pathname.includes('goz-hastaliklari')) {
      return '__eye_health__';
    }
  } catch {
    const slugMatch = pageUrl.match(/[?&]slug=([^&]+)/i);
    if (slugMatch?.[1] && SLUG_TO_CATEGORY[slugMatch[1]]) {
      return slugMatch[1];
    }
    if (/goz-hastaliklari/i.test(pageUrl)) {
      return '__eye_health__';
    }
  }

  return null;
}

function resolveCategory(slugKey) {
  if (slugKey === '__eye_health__') return 'eye-health';
  return SLUG_TO_CATEGORY[slugKey] || 'other';
}

function mapRow(row) {
  const page = row?.keys?.[0] || '';
  const slugKey = extractSlugFromPageUrl(page);
  const category = resolveCategory(slugKey);
  const serviceSlug = slugKey === '__eye_health__' ? 'goz-hastaliklari' : slugKey;
  const servicePage = serviceSlug && serviceSlug !== '__eye_health__' ? SUBPAGES_BY_SLUG[serviceSlug] : null;

  return {
    page,
    slug: serviceSlug,
    serviceName: servicePage?.title || (category === 'eye-health' ? 'Göz Sağlığı' : 'Diğer'),
    category,
    clicks: parseNumber(row?.clicks),
    impressions: parseNumber(row?.impressions),
    ctr: computeCtr(parseNumber(row?.clicks), parseNumber(row?.impressions)),
    averagePosition: parseNumber(row?.position),
  };
}

function emptyCategoryBuckets() {
  return Object.fromEntries(SERVICE_CATEGORIES.map((key) => [key, []]));
}

function groupByCategory(rows) {
  const buckets = emptyCategoryBuckets();

  for (const row of rows) {
    if (!buckets[row.category]) continue;
    buckets[row.category].push(row);
  }

  for (const key of SERVICE_CATEGORIES) {
    buckets[key].sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions);
  }

  return buckets;
}

function pickTopPerformers(rows, limit = 5) {
  return [...rows]
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
    .slice(0, limit);
}

function pickOpportunities(rows, limit = 10) {
  const candidates = rows.filter(
    (row) => row.impressions >= 10 && row.averagePosition >= 5 && row.averagePosition <= 20,
  );

  return candidates
    .sort((a, b) => b.impressions - a.impressions || a.averagePosition - b.averagePosition)
    .slice(0, limit);
}

async function fetchAllPageRows(startDate, endDate, rowLimit = 500) {
  const response = await searchConsoleRequest('/sites/{siteUrl}/searchAnalytics/query', {
    method: 'POST',
    body: {
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit,
    },
  });

  return (response?.rows || []).map(mapRow);
}

export async function fetchServicePerformanceReport(options = {}) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 28);

  const startDate = options.startDate || start.toISOString().slice(0, 10);
  const endDate = options.endDate || end.toISOString().slice(0, 10);

  const pageRows = await fetchAllPageRows(startDate, endDate, options.rowLimit || 500);
  const serviceRows = pageRows.filter((row) => row.category !== 'other');
  const byCategory = groupByCategory(serviceRows);

  const topPerformers = pickTopPerformers(serviceRows, options.topLimit || 10);
  const opportunities = pickOpportunities(serviceRows, options.opportunityLimit || 15);

  const categorySummary = Object.fromEntries(
    SERVICE_CATEGORIES.map((key) => {
      const rows = byCategory[key] || [];
      const totals = rows.reduce(
        (acc, row) => {
          acc.clicks += row.clicks;
          acc.impressions += row.impressions;
          return acc;
        },
        { clicks: 0, impressions: 0 },
      );

      return [
        key,
        {
          pageCount: rows.length,
          clicks: totals.clicks,
          impressions: totals.impressions,
          ctr: computeCtr(totals.clicks, totals.impressions),
          averagePosition: rows.length
            ? Number(
                (
                  rows.reduce((sum, row) => sum + row.averagePosition * row.impressions, 0) /
                  Math.max(1, rows.reduce((sum, row) => sum + row.impressions, 0))
                ).toFixed(2),
              )
            : 0,
          topPages: rows.slice(0, 5),
        },
      ];
    }),
  );

  return {
    siteUrl: getSearchConsoleSiteUrl(),
    dateRange: { startDate, endDate },
    categories: categorySummary,
    topPerformers,
    opportunities,
    rules: {
      opportunityImpressionsMin: 10,
      opportunityPositionMin: 5,
      opportunityPositionMax: 20,
    },
  };
}
