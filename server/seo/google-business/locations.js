import { getGoogleBusinessConfig, googleBusinessRequest, isGoogleBusinessConfigured } from './client.js';

function normalizeLocation(location) {
  return {
    name: location?.name || '',
    title: location?.title || location?.storefrontAddress?.locality || '',
    categories: (location?.categories?.primaryCategory?.displayName
      ? [location.categories.primaryCategory.displayName]
      : []
    ).concat(
      (location?.categories?.additionalCategories || []).map((item) => item.displayName).filter(Boolean),
    ),
    phone: location?.phoneNumbers?.primaryPhone || '',
    website: location?.websiteUri || '',
    address: location?.storefrontAddress || null,
    openingHours: location?.regularHours?.periods || [],
    metadata: {
      placeId: location?.metadata?.placeId || null,
      mapsUri: location?.metadata?.mapsUri || null,
    },
  };
}

export async function fetchBusinessLocations() {
  if (!isGoogleBusinessConfigured()) {
    return {
      configured: false,
      locations: [],
      message: 'Google Business Profile API credentials are not configured.',
    };
  }

  const { accountId } = getGoogleBusinessConfig();
  const readMask = [
    'name',
    'title',
    'storefrontAddress',
    'phoneNumbers',
    'websiteUri',
    'regularHours',
    'metadata',
    'categories',
  ].join(',');
  const response = await googleBusinessRequest(
    `/accounts/${accountId}/locations?readMask=${encodeURIComponent(readMask)}`,
    { method: 'GET' },
  );

  const locations = (response?.locations || []).map(normalizeLocation);

  return {
    configured: true,
    accountId,
    locations,
  };
}
