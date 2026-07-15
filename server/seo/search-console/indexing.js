import { getSearchConsoleSiteUrl, searchConsoleRequest } from './client.js';

function parseCount(value) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function summarizeSitemapContents(contents = []) {
  return contents.reduce(
    (acc, item) => {
      acc.submitted += parseCount(item?.submitted);
      acc.indexed += parseCount(item?.indexed);
      return acc;
    },
    { submitted: 0, indexed: 0 },
  );
}

function buildExcludedSummary(totals) {
  const notIndexed = Math.max(0, totals.submitted - totals.indexed);

  return {
    submitted: totals.submitted,
    indexed: totals.indexed,
    notIndexed,
    indexCandidates: totals.submitted,
    excluded: notIndexed,
  };
}

export async function fetchIndexingReport() {
  const siteUrl = getSearchConsoleSiteUrl();

  const response = await searchConsoleRequest('/sites/{siteUrl}/sitemaps', {
    method: 'GET',
  });

  const sitemaps = (response?.sitemap || []).map((entry) => {
    const contentsSummary = summarizeSitemapContents(entry?.contents);
    const excluded = Math.max(0, contentsSummary.submitted - contentsSummary.indexed);

    return {
      path: entry?.path || '',
      lastSubmitted: entry?.lastSubmitted || null,
      lastDownloaded: entry?.lastDownloaded || null,
      isPending: Boolean(entry?.isPending),
      isSitemapsIndex: Boolean(entry?.isSitemapsIndex),
      warnings: parseCount(entry?.warnings),
      errors: parseCount(entry?.errors),
      submittedUrls: contentsSummary.submitted,
      indexedUrls: contentsSummary.indexed,
      excludedUrls: excluded,
      contents: (entry?.contents || []).map((item) => ({
        type: item?.type || 'unknown',
        submitted: parseCount(item?.submitted),
        indexed: parseCount(item?.indexed),
        excluded: Math.max(0, parseCount(item?.submitted) - parseCount(item?.indexed)),
      })),
    };
  });

  const totals = sitemaps.reduce(
    (acc, item) => {
      acc.sitemapCount += 1;
      acc.submitted += item.submittedUrls;
      acc.indexed += item.indexedUrls;
      acc.excluded += item.excludedUrls;
      acc.warnings += item.warnings;
      acc.errors += item.errors;
      return acc;
    },
    {
      sitemapCount: 0,
      submitted: 0,
      indexed: 0,
      excluded: 0,
      warnings: 0,
      errors: 0,
    },
  );

  const summary = buildExcludedSummary(totals);

  return {
    siteUrl,
    sitemapUrlCount: totals.sitemapCount,
    totals,
    indexCandidates: summary.indexCandidates,
    excluded: {
      count: summary.excluded,
      warnings: totals.warnings,
      errors: totals.errors,
    },
    sitemaps,
    note:
      'Index and exclusion counts are derived from Search Console sitemap coverage. Full Page Indexing report breakdown is not exposed in bulk via the API.',
  };
}
