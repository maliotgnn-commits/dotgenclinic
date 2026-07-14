const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const GA4_RELATIVE_DATE_PATTERN = /^(today|yesterday|\d+daysAgo)$/;

/**
 * Vercel env:
 * - ANALYTICS_API_SECRET  (required on Vercel production/preview)
 */
export function getAnalyticsApiSecret() {
  return process.env.ANALYTICS_API_SECRET || '';
}

export function isAnalyticsAuthConfigured() {
  return Boolean(getAnalyticsApiSecret());
}

function readBearerToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization;
  if (!header || typeof header !== 'string') {
    return '';
  }

  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || '';
}

function readApiKey(req) {
  const apiKey = req.headers?.['x-analytics-api-key'];
  return typeof apiKey === 'string' ? apiKey.trim() : '';
}

function safeEqual(a, b) {
  if (!a || !b || a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
}

export function authorizeAnalyticsRequest(req) {
  const configuredSecret = getAnalyticsApiSecret();

  if (!configuredSecret) {
    if (process.env.VERCEL) {
      return {
        ok: false,
        status: 503,
        code: 'ANALYTICS_AUTH_NOT_CONFIGURED',
        message: 'Analytics API authentication is not configured.',
      };
    }

    // Local development without secret: allow for easier testing.
    return { ok: true };
  }

  const provided = readBearerToken(req) || readApiKey(req);

  if (!provided) {
    return {
      ok: false,
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Missing analytics API credentials.',
    };
  }

  if (!safeEqual(provided, configuredSecret)) {
    return {
      ok: false,
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Invalid analytics API credentials.',
    };
  }

  return { ok: true };
}

export function sendJson(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(status).json(body);
}

export function rejectMethodNotAllowed(req, res, allowedMethods = ['GET']) {
  res.setHeader('Allow', allowedMethods.join(', '));
  sendJson(res, 405, {
    ok: false,
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: `Method ${req.method} is not allowed.`,
    },
  });
}

const DEFAULT_MAX_BODY_BYTES = 4096;

export function rejectOversizedBody(req, res, maxBytes = DEFAULT_MAX_BODY_BYTES) {
  const contentLength = Number(req.headers?.['content-length'] || 0);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    sendJson(res, 413, {
      ok: false,
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request body is too large.',
      },
    });
    return true;
  }

  return false;
}

export function parseDateRange(query = {}) {
  const startDate = typeof query.startDate === 'string' ? query.startDate.trim() : '30daysAgo';
  const endDate = typeof query.endDate === 'string' ? query.endDate.trim() : 'today';

  const isValidDate = (value) =>
    ISO_DATE_PATTERN.test(value) || GA4_RELATIVE_DATE_PATTERN.test(value);

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return {
      ok: false,
      status: 400,
      code: 'INVALID_DATE_RANGE',
      message: 'startDate and endDate must be YYYY-MM-DD or GA4 relative values like 30daysAgo.',
    };
  }

  return {
    ok: true,
    startDate,
    endDate,
  };
}

export function handleEndpointError(res, error) {
  if (error?.name === 'Ga4ApiError') {
    sendJson(res, error.status || 502, {
      ok: false,
      error: {
        code: error.code || 'GA4_UPSTREAM_ERROR',
        message: error.message,
      },
    });
    return;
  }

  if (error instanceof Error && /credentials|GA4_PROPERTY_ID/i.test(error.message)) {
    sendJson(res, 500, {
      ok: false,
      error: {
        code: 'ANALYTICS_CONFIG_ERROR',
        message: 'Analytics backend is not configured correctly.',
      },
    });
    return;
  }

  console.error('[analytics-api] unexpected error:', error?.message || error);

  sendJson(res, 500, {
    ok: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred while fetching analytics data.',
    },
  });
}
