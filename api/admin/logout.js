import { clearSessionCookie } from '../lib/admin-auth.js';
import { sendJson, rejectMethodNotAllowed } from '../lib/api-auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    rejectMethodNotAllowed(req, res, ['POST']);
    return;
  }

  res.setHeader('Set-Cookie', clearSessionCookie());
  sendJson(res, 200, { ok: true, data: { authenticated: false } });
}
