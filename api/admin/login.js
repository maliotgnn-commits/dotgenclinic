import {
  authorizeAdminRequest,
  createSessionCookie,
  isAdminAuthConfigured,
  verifyAdminPassword,
} from '../../server/analytics/admin-auth.js';
import { sendJson, rejectMethodNotAllowed } from '../../server/analytics/api-auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    rejectMethodNotAllowed(req, res, ['POST']);
    return;
  }

  if (!isAdminAuthConfigured() && !process.env.VERCEL) {
    sendJson(res, 200, { ok: true, data: { authenticated: true, devBypass: true } });
    return;
  }

  const body = typeof req.body === 'string' ? safeParseJson(req.body) : req.body;
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!verifyAdminPassword(password)) {
    sendJson(res, 401, {
      ok: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid admin password.',
      },
    });
    return;
  }

  res.setHeader('Set-Cookie', createSessionCookie());
  sendJson(res, 200, { ok: true, data: { authenticated: true } });
}

function safeParseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
