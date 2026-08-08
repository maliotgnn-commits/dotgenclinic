const MEDICAL_HOST = 'medical.drotgenclinic.com';

const PATH_TARGETS = {
  '/': '/medical/index.html',
  '/privacy.html': '/medical/privacy.html',
};

export default function middleware(request) {
  const host = request.headers.get('host') || '';
  if (host !== MEDICAL_HOST) return;

  const url = new URL(request.url);
  const target = PATH_TARGETS[url.pathname];
  if (!target) return;

  const rewriteUrl = new URL(target, url);
  return new Response(null, {
    headers: { 'x-middleware-rewrite': rewriteUrl.toString() },
  });
}

export const config = {
  matcher: ['/', '/privacy.html'],
};
