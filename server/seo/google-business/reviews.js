import { getGoogleBusinessConfig, googleBusinessRequest, isGoogleBusinessConfigured } from './client.js';

function normalizeReview(review) {
  return {
    name: review?.name || '',
    reviewer: review?.reviewer?.displayName || 'Anonymous',
    rating: Number(review?.starRating?.replace('FIVE', '5').replace('FOUR', '4').replace('THREE', '3').replace('TWO', '2').replace('ONE', '1')) || null,
    comment: review?.comment || '',
    createTime: review?.createTime || null,
    updateTime: review?.updateTime || null,
  };
}

export async function fetchBusinessReviews(locationName) {
  if (!isGoogleBusinessConfigured()) {
    return {
      configured: false,
      reviews: [],
      averageRating: null,
      totalReviewCount: 0,
      message: 'Google Business Profile API credentials are not configured.',
    };
  }

  if (!locationName) {
    return {
      configured: true,
      reviews: [],
      averageRating: null,
      totalReviewCount: 0,
      message: 'Location name is required to fetch reviews.',
    };
  }

  const response = await googleBusinessRequest(`/${locationName}/reviews`, {
    method: 'GET',
  });

  const reviews = (response?.reviews || []).map(normalizeReview);
  const ratings = reviews.map((review) => review.rating).filter((value) => Number.isFinite(value));
  const averageRating = ratings.length
    ? Number((ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(2))
    : null;

  return {
    configured: true,
    locationName,
    reviews,
    averageRating,
    totalReviewCount: reviews.length,
  };
}

export async function fetchAccountReviewSummary() {
  const { accountId } = getGoogleBusinessConfig();

  if (!isGoogleBusinessConfigured()) {
    return {
      configured: false,
      accountId: null,
      locations: [],
      message: 'Google Business Profile API credentials are not configured.',
    };
  }

  const locationsResponse = await googleBusinessRequest(`/accounts/${accountId}/locations`, {
    method: 'GET',
  });

  const locations = locationsResponse?.locations || [];
  const summaries = [];

  for (const location of locations.slice(0, 5)) {
    try {
      const reviewData = await fetchBusinessReviews(location.name);
      summaries.push({
        locationName: location.name,
        title: location.title || location.storefrontAddress?.locality || location.name,
        averageRating: reviewData.averageRating,
        totalReviewCount: reviewData.totalReviewCount,
      });
    } catch (error) {
      summaries.push({
        locationName: location.name,
        title: location.title || location.name,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    configured: true,
    accountId,
    locations: summaries,
  };
}
