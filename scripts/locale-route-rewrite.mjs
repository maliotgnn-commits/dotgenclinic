export const LOCALE_CODES = ['tr', 'en', 'ar', 'es', 'fr', 'it', 'ru', 'de'];

export const EYE_HEALTH_FILES = new Set([
  'goz-hastaliklari.html',
  'eye-health.html',
  'salud-ocular.html',
  'sante-oculaire.html',
  'salute-oculare.html',
  'augengesundheit.html',
  'صحة-العين.html',
  'здоровье-глаз.html',
]);

const LOCALE_ROUTE_PATTERN = new RegExp(
  `^/(${LOCALE_CODES.join('|')})(?:/([^?#]*))?$`,
);

export function decodePathSegment(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export function resolveLocaleRewrite(pathname, search = '') {
  const match = pathname.match(LOCALE_ROUTE_PATTERN);
  if (!match) return null;

  const routeFileRaw = match[2] ?? '';
  const routeFile = routeFileRaw ? decodePathSegment(routeFileRaw) : '';

  if (!routeFile || routeFile === 'index.html') {
    return `/index.html${search}`;
  }

  if (routeFile === 'service.html') {
    return `/service.html${search}`;
  }

  if (routeFile === 'privacy.html') {
    return `/privacy.html${search}`;
  }

  if (EYE_HEALTH_FILES.has(routeFile) || EYE_HEALTH_FILES.has(routeFileRaw)) {
    return `/goz-hastaliklari.html${search}`;
  }

  return `/index.html${search}`;
}

export function rewriteLocaleRequestUrl(requestUrl) {
  if (!requestUrl) return requestUrl;
  const url = new URL(requestUrl, 'http://localhost');
  const rewritten = resolveLocaleRewrite(url.pathname, url.search);
  if (!rewritten) return requestUrl;
  return rewritten;
}
