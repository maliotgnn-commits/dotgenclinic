import { clearSessionCookie } from '../../server/analytics/admin-auth.js';
import { sendJson, rejectMethodNotAllowed } from '../../server/analytics/api-auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    rejectMethodNotAllowed(req, res, ['POST']);
    return;
  }

  res.setHeader('Set-Cookie', clearSessionCookie());
  sendJson(res, 200, { ok: true, data: { authenticated: false } });
}
