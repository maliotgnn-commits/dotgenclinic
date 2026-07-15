import { JWT } from 'google-auth-library';
import { getGoogleServiceAccountCredentials } from '../../analytics/google-credentials.js';

const SEARCH_CONSOLE_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const API_BASE = 'https://searchconsole.googleapis.com/webmasters/v3';

const DEFAULT_SITE_URL = 'https://www.drotgenclinic.com/';

let cachedAuthClient = null;

export function getSearchConsoleSiteUrl() {
  const raw = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || DEFAULT_SITE_URL;
  const trimmed = raw.trim();

  if (!trimmed) {
    throw new Error('GOOGLE_SEARCH_CONSOLE_SITE_URL must not be empty.');
  }

  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
}

export function encodeSiteUrl(siteUrl) {
  return encodeURIComponent(siteUrl);
}

function getAuthClient() {
  if (cachedAuthClient) {
    return cachedAuthClient;
  }

  const credentials = getGoogleServiceAccountCredentials();

  cachedAuthClient = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: [SEARCH_CONSOLE_SCOPE],
  });

  return cachedAuthClient;
}

function mapSearchConsoleError(error) {
  const status = error?.response?.status || error?.code;
  const message = error?.message || error?.response?.data?.error?.message || 'Unknown Search Console API error';

  if (status === 403 || /PERMISSION_DENIED|Forbidden/i.test(message)) {
    return {
      status: 403,
      code: 'GSC_PERMISSION_DENIED',
      message:
        'Search Console API access denied. Add the service account as a user in Search Console with Full or Restricted access.',
    };
  }

  if (status === 404 || /NOT_FOUND|not found/i.test(message)) {
    return {
      status: 404,
      code: 'GSC_SITE_NOT_FOUND',
      message: 'Search Console property was not found for the configured site URL.',
    };
  }

  if (status === 400 || /INVALID_ARGUMENT/i.test(message)) {
    return {
      status: 400,
      code: 'GSC_INVALID_REQUEST',
      message: 'Invalid Search Console API request.',
    };
  }

  if (status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(message)) {
    return {
      status: 429,
      code: 'GSC_QUOTA_EXCEEDED',
      message: 'Search Console API quota exceeded. Try again later.',
    };
  }

  return {
    status: 502,
    code: 'GSC_UPSTREAM_ERROR',
    message: 'Unable to fetch data from Google Search Console.',
  };
}

export class SearchConsoleApiError extends Error {
  constructor(mappedError, cause) {
    super(mappedError.message);
    this.name = 'SearchConsoleApiError';
    this.status = mappedError.status;
    this.code = mappedError.code;
    this.cause = cause;
  }
}

export async function getAccessToken() {
  const client = getAuthClient();

  try {
    const tokenResponse = await client.getAccessToken();
    const token = typeof tokenResponse === 'string' ? tokenResponse : tokenResponse?.token;

    if (!token) {
      throw new Error('Failed to obtain Search Console access token.');
    }

    return token;
  } catch (error) {
    console.error('[search-console] token request failed:', error?.message || error);
    throw new SearchConsoleApiError(mapSearchConsoleError(error), error);
  }
}

export async function searchConsoleRequest(path, options = {}) {
  const siteUrl = options.siteUrl || getSearchConsoleSiteUrl();
  const encodedSite = encodeSiteUrl(siteUrl);
  const resolvedPath = path.replace('{siteUrl}', encodedSite);
  const url = `${API_BASE}${resolvedPath}`;
  const token = await getAccessToken();

  const init = {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
  };

  if (options.body) {
    init.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    console.error('[search-console] network request failed:', error?.message || error);
    throw new SearchConsoleApiError(
      {
        status: 502,
        code: 'GSC_NETWORK_ERROR',
        message: 'Network error while contacting Google Search Console.',
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
    const apiMessage = payload?.error?.message || response.statusText;
    console.error('[search-console] API error:', response.status, apiMessage);
    throw new SearchConsoleApiError(
      mapSearchConsoleError({
        response: { status: response.status, data: payload },
        message: apiMessage,
      }),
      payload,
    );
  }

  return payload;
}

export function getServiceAccountEmail() {
  return getGoogleServiceAccountCredentials().client_email;
}
