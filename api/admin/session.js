import { authorizeAdminRequest } from '../lib/admin-auth.js';
import { sendJson, rejectMethodNotAllowed } from '../lib/api-auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    rejectMethodNotAllowed(req, res, ['GET']);
    return;
  }

  const auth = authorizeAdminRequest(req);
  if (!auth.ok) {
    sendJson(res, auth.status, {
      ok: false,
      error: {
        code: auth.code,
        message: auth.message,
      },
    });
    return;
  }

  sendJson(res, 200, {
    ok: true,
    data: {
      authenticated: true,
      devBypass: Boolean(auth.devBypass),
    },
  });
}
