import { getGoogleBusinessConfig, isGoogleBusinessConfigured } from './client.js';
import { fetchBusinessLocations } from './locations.js';
import { fetchAccountReviewSummary } from './reviews.js';

export async function fetchLocalSeoReport() {
  const config = getGoogleBusinessConfig();

  if (!isGoogleBusinessConfigured()) {
    return {
      configured: false,
      generatedAt: new Date().toISOString(),
      accountId: config.accountId || null,
      locations: [],
      reviews: [],
      message:
        'Google Business Profile API is not configured. Manual local SEO management may be required. Set GOOGLE_BUSINESS_ACCOUNT_ID and GOOGLE_BUSINESS_ACCESS_TOKEN when API access is available.',
    };
  }

  try {
    const [locationsResult, reviewsResult] = await Promise.all([
      fetchBusinessLocations(),
      fetchAccountReviewSummary(),
    ]);

    return {
      configured: true,
      generatedAt: new Date().toISOString(),
      accountId: config.accountId,
      locations: locationsResult.locations,
      reviews: reviewsResult.locations,
    };
  } catch (error) {
    return {
      configured: true,
      generatedAt: new Date().toISOString(),
      accountId: config.accountId,
      locations: [],
      reviews: [],
      error: {
        code: error?.code || 'GBP_REPORT_ERROR',
        message: error instanceof Error ? error.message : String(error),
      },
    };
  }
}
