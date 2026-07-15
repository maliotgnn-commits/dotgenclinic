import { getGoogleServiceAccountCredentials } from '../../analytics/google-credentials.js';
import { getIndexHealthReport } from '../index-health.js';
import { fetchLocalSeoReport } from '../google-business/local-report.js';
import { getSearchConsoleSiteUrl } from './client.js';
import { fetchIndexingReport } from './indexing.js';
import { fetchPerformanceComparison, fetchPerformanceReport } from './performance.js';
import { fetchServicePerformanceReport } from './service-performance.js';

export async function fetchSeoReport(options = {}) {
  const [performanceComparison, indexing, servicePerformance, localSeo] = await Promise.all([
    fetchPerformanceComparison(options),
    fetchIndexingReport(),
    fetchServicePerformanceReport(options),
    fetchLocalSeoReport().catch((error) => ({
      configured: false,
      error: error instanceof Error ? error.message : String(error),
    })),
  ]);

  const performance = performanceComparison.current;
  const indexHealth = getIndexHealthReport(indexing);
  const credentials = getGoogleServiceAccountCredentials();

  return {
    generatedAt: new Date().toISOString(),
    siteUrl: getSearchConsoleSiteUrl(),
    serviceAccount: credentials.client_email,
    performance: {
      dateRange: performance.dateRange,
      clicks: performance.clicks,
      impressions: performance.impressions,
      ctr: performance.ctr,
      averagePosition: performance.averagePosition,
      topQueries: performance.topQueries,
      topPages: performance.topPages,
      change: performanceComparison.change,
      previousPeriod: performanceComparison.previous.dateRange,
    },
    indexing: {
      sitemapUrlCount: indexing.sitemapUrlCount,
      indexCandidates: indexing.indexCandidates,
      excluded: indexing.excluded,
      totals: indexing.totals,
      sitemaps: indexing.sitemaps,
      note: indexing.note,
    },
    indexHealth,
    servicePerformance,
    localSeo,
  };
}

export function getSearchConsoleConfigSummary() {
  let siteUrl = null;
  let siteUrlError = null;
  let credentialsValid = false;
  let credentialsError = null;
  let serviceAccountEmail = null;

  try {
    siteUrl = getSearchConsoleSiteUrl();
  } catch (error) {
    siteUrlError = error instanceof Error ? error.message : 'Invalid site URL';
  }

  try {
    const credentials = getGoogleServiceAccountCredentials();
    credentialsValid = Boolean(credentials?.client_email && credentials?.private_key);
    serviceAccountEmail = credentials.client_email;
  } catch (error) {
    credentialsError = error instanceof Error ? error.message : 'Invalid Google credentials';
  }

  return {
    siteUrl,
    siteUrlError,
    serviceAccountEmail,
    credentialsValid,
    credentialsError,
    ready: Boolean(siteUrl && credentialsValid),
  };
}

/** Public health payload — no credentials, emails, or internal errors. */
export function getSearchConsolePublicHealthSummary() {
  const summary = getSearchConsoleConfigSummary();

  return {
    ready: summary.ready,
    siteUrlConfigured: Boolean(summary.siteUrl),
    credentialsConfigured: summary.credentialsValid,
  };
}
