const GBP_API_BASE = 'https://mybusinessbusinessinformation.googleapis.com/v1';

export class GoogleBusinessApiError extends Error {
  constructor(mappedError, cause) {
    super(mappedError.message);
    this.name = 'GoogleBusinessApiError';
    this.status = mappedError.status;
    this.code = mappedError.code;
    this.cause = cause;
  }
}

export function getGoogleBusinessConfig() {
  return {
    accountId: process.env.GOOGLE_BUSINESS_ACCOUNT_ID || '',
    accessToken: process.env.GOOGLE_BUSINESS_ACCESS_TOKEN || '',
  };
}

export function isGoogleBusinessConfigured() {
  const config = getGoogleBusinessConfig();
  return Boolean(config.accountId && config.accessToken);
}

function mapGoogleBusinessError(error, status) {
  const message = error?.error?.message || error?.message || 'Unknown Google Business API error';

  if (status === 401 || /UNAUTHENTICATED/i.test(message)) {
    return {
      status: 401,
      code: 'GBP_AUTH_FAILED',
      message: 'Google Business Profile authentication failed. Check GOOGLE_BUSINESS_ACCESS_TOKEN.',
    };
  }

  if (status === 403 || /PERMISSION_DENIED/i.test(message)) {
    return {
      status: 403,
      code: 'GBP_PERMISSION_DENIED',
      message: 'Google Business Profile API access denied.',
    };
  }

  if (status === 404 || /NOT_FOUND/i.test(message)) {
    return {
      status: 404,
      code: 'GBP_NOT_FOUND',
      message: 'Google Business Profile resource was not found.',
    };
  }

  return {
    status: status || 502,
    code: 'GBP_UPSTREAM_ERROR',
    message: 'Unable to fetch Google Business Profile data.',
  };
}

export async function googleBusinessRequest(path, options = {}) {
  if (!isGoogleBusinessConfigured()) {
    throw new GoogleBusinessApiError(
      {
        status: 503,
        code: 'GBP_NOT_CONFIGURED',
        message:
          'Google Business Profile API is not configured. Set GOOGLE_BUSINESS_ACCOUNT_ID and GOOGLE_BUSINESS_ACCESS_TOKEN.',
      },
      null,
    );
  }

  const { accessToken } = getGoogleBusinessConfig();
  const url = `${GBP_API_BASE}${path}`;

  let response;
  try {
    response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (error) {
    throw new GoogleBusinessApiError(
      {
        status: 502,
        code: 'GBP_NETWORK_ERROR',
        message: 'Network error while contacting Google Business Profile API.',
      },
      error,
    );
  }

  const text = await response.text();
  let payload = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text };
    }
  }

  if (!response.ok) {
    throw new GoogleBusinessApiError(mapGoogleBusinessError(payload, response.status), payload);
  }

  return payload;
}
