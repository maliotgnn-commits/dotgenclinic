import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const SESSION_COOKIE = 'admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Vercel env:
 * - ADMIN_PASSWORD       (required on Vercel for admin login)
 * - ADMIN_SESSION_SECRET (optional; falls back to ANALYTICS_API_SECRET)
 */
export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || '';
}

export function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ANALYTICS_API_SECRET || '';
}

export function isAdminAuthConfigured() {
  return Boolean(getAdminPassword() && getAdminSessionSecret());
}

function safeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function signPayload(payload) {
  const secret = getAdminSessionSecret();
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function buildSessionToken() {
  const issuedAt = Date.now();
  const nonce = randomBytes(16).toString('hex');
  const payload = `${issuedAt}.${nonce}`;
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

function parseSessionToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [issuedAtRaw, nonce, signature] = parts;
  const issuedAt = Number(issuedAtRaw);

  if (!Number.isFinite(issuedAt) || !nonce || !signature) return null;

  const expected = signPayload(`${issuedAtRaw}.${nonce}`);
  if (!safeEqual(signature, expected)) return null;

  if (Date.now() - issuedAt > SESSION_TTL_MS) return null;

  return { issuedAt, nonce };
}

function readCookie(req, name) {
  const header = req.headers?.cookie || req.headers?.Cookie;
  if (!header || typeof header !== 'string') return '';

  const cookies = header.split(';');
  for (const part of cookies) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return '';
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

function cookieFlags() {
  const secure = process.env.VERCEL ? '; Secure' : '';
  return `Path=/; HttpOnly; SameSite=Strict${secure}`;
}

export function createSessionCookie() {
  const token = buildSessionToken();
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);

  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; ${cookieFlags()}; Max-Age=${maxAge}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; ${cookieFlags()}; Max-Age=0`;
}

export function authorizeAdminRequest(req) {
  const password = getAdminPassword();
  const secret = getAdminSessionSecret();

  if (!password || !secret) {
    if (process.env.VERCEL) {
      return {
        ok: false,
        status: 503,
        code: 'ADMIN_AUTH_NOT_CONFIGURED',
        message: 'Admin authentication is not configured.',
      };
    }

    // Local development: allow access without login when credentials are unset.
    return { ok: true, devBypass: true };
  }

  const token = readCookie(req, SESSION_COOKIE);
  const session = parseSessionToken(token);

  if (!session) {
    return {
      ok: false,
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Admin session is missing or expired.',
    };
  }

  return { ok: true };
}

export function verifyAdminPassword(candidate) {
  const password = getAdminPassword();
  if (!password || typeof candidate !== 'string') return false;
  return safeEqual(candidate.trim(), password);
}
