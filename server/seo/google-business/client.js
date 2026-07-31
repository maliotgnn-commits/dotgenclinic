const GBP_API_BASE = 'https://mybusinessbusinessinformation.googleapis.com/v1';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const TOKEN_EXPIRY_SKEW_MS = 60_000;

export class GoogleBusinessApiError extends Error {
  constructor(mappedError, cause) {
    super(mappedError.message);
    this.name = 'GoogleBusinessApiError';
    this.status = mappedError.status;
    this.code = mappedError.code;
    this.cause = cause;
  }
}

/** Accept `accounts/123` or bare `123`; always return bare numeric/resource id. */
export function normalizeGoogleBusinessAccountId(accountId) {
  const raw = String(accountId || '').trim();
  if (!raw) return '';
  return raw.replace(/^accounts\//i, '');
}

export function getGoogleBusinessConfig() {
  return {
    accountId: normalizeGoogleBusinessAccountId(process.env.GOOGLE_BUSINESS_ACCOUNT_ID || ''),
    accessToken: (process.env.GOOGLE_BUSINESS_ACCESS_TOKEN || '').trim(),
    refreshToken: (process.env.GOOGLE_BUSINESS_REFRESH_TOKEN || '').trim(),
    clientId: (process.env.GOOGLE_BUSINESS_CLIENT_ID || '').trim(),
    clientSecret: (process.env.GOOGLE_BUSINESS_CLIENT_SECRET || '').trim(),
  };
}

export function hasGoogleBusinessRefreshCredentials(config = getGoogleBusinessConfig()) {
  return Boolean(config.refreshToken && config.clientId && config.clientSecret);
}

export function isGoogleBusinessConfigured() {
  const config = getGoogleBusinessConfig();
  return Boolean(
    config.accountId && (hasGoogleBusinessRefreshCredentials(config) || config.accessToken),
  );
}

let cachedAccessToken = '';
let cachedExpiresAt = 0;
let refreshInFlight = null;

function mapGoogleBusinessError(error, status) {
  const message = error?.error?.message || error?.message || 'Unknown Google Business API error';
  const serialized = JSON.stringify(error || {});

  if (status === 401 || /UNAUTHENTICATED|invalid authentication credentials/i.test(message)) {
    return {
      status: 401,
      code: 'GBP_AUTH_FAILED',
      message:
        'Google Business Profile authentication failed. Check GOOGLE_BUSINESS_REFRESH_TOKEN / OAuth client credentials, or refresh the access token.',
    };
  }

  if (status === 403 || /PERMISSION_DENIED/i.test(message)) {
    return {
      status: 403,
      code: 'GBP_PERMISSION_DENIED',
      message: 'Google Business Profile API access denied.',
    };
  }

  if (
    status === 429 ||
    /RESOURCE_EXHAUSTED|Quota exceeded|RATE_LIMIT_EXCEEDED/i.test(message)
  ) {
    const zeroQuota = /"quota_limit_value"\s*:\s*"0"/.test(serialized);
    return {
      status: 429,
      code: zeroQuota ? 'GBP_QUOTA_NOT_APPROVED' : 'GBP_RATE_LIMITED',
      message: zeroQuota
        ? 'Google Business Profile API project quota is 0. Submit “Application for Basic API Access” for this GCP project and wait until quota becomes 300 QPM.'
        : 'Google Business Profile API rate limit exceeded. Retry shortly.',
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

async function refreshAccessToken(config) {
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: config.refreshToken,
    grant_type: 'refresh_token',
  });

  let response;
  try {
    response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body,
    });
  } catch (error) {
    throw new GoogleBusinessApiError(
      {
        status: 502,
        code: 'GBP_NETWORK_ERROR',
        message: 'Network error while refreshing Google Business Profile access token.',
      },
      error,
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) {
    throw new GoogleBusinessApiError(
      {
        status: 401,
        code: 'GBP_AUTH_FAILED',
        message:
          payload?.error_description ||
          payload?.error ||
          'Unable to refresh Google Business Profile access token.',
      },
      payload,
    );
  }

  const expiresInSec = Number(payload.expires_in) || 3600;
  cachedAccessToken = String(payload.access_token);
  cachedExpiresAt = Date.now() + expiresInSec * 1000;
  process.env.GOOGLE_BUSINESS_ACCESS_TOKEN = cachedAccessToken;
  return cachedAccessToken;
}

async function getValidAccessToken({ forceRefresh = false } = {}) {
  const config = getGoogleBusinessConfig();

  if (
    !forceRefresh &&
    cachedAccessToken &&
    Date.now() < cachedExpiresAt - TOKEN_EXPIRY_SKEW_MS
  ) {
    return cachedAccessToken;
  }

  if (forceRefresh) {
    cachedAccessToken = '';
    cachedExpiresAt = 0;
  }

  if (hasGoogleBusinessRefreshCredentials(config)) {
    if (!refreshInFlight) {
      refreshInFlight = refreshAccessToken(config).finally(() => {
        refreshInFlight = null;
      });
    }
    return refreshInFlight;
  }

  if (config.accessToken) {
    return config.accessToken;
  }

  throw new GoogleBusinessApiError(
    {
      status: 503,
      code: 'GBP_NOT_CONFIGURED',
      message:
        'Google Business Profile API is not configured. Set GOOGLE_BUSINESS_ACCOUNT_ID and either refresh credentials (CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN) or ACCESS_TOKEN.',
    },
    null,
  );
}

async function executeGoogleBusinessFetch(path, options, accessToken) {
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

  return { response, payload };
}

export async function googleBusinessRequest(path, options = {}) {
  if (!isGoogleBusinessConfigured()) {
    throw new GoogleBusinessApiError(
      {
        status: 503,
        code: 'GBP_NOT_CONFIGURED',
        message:
          'Google Business Profile API is not configured. Set GOOGLE_BUSINESS_ACCOUNT_ID and either refresh credentials (CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN) or ACCESS_TOKEN.',
      },
      null,
    );
  }

  let accessToken = await getValidAccessToken();
  let { response, payload } = await executeGoogleBusinessFetch(path, options, accessToken);

  if (
    response.status === 401 &&
    hasGoogleBusinessRefreshCredentials() &&
    !options.__gbpRetried
  ) {
    accessToken = await getValidAccessToken({ forceRefresh: true });
    ({ response, payload } = await executeGoogleBusinessFetch(path, options, accessToken));
  }

  if (!response.ok) {
    throw new GoogleBusinessApiError(mapGoogleBusinessError(payload, response.status), payload);
  }

  return payload;
}
