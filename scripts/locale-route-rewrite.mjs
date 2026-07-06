export const LOCALE_CODES = ['tr', 'en', 'ar', 'es', 'fr', 'it', 'ru', 'de'];

export const FINANCE_PREVIEW_FILE = 'finans-departmani.html';
export const LEGAL_PREVIEW_FILE = 'hukuk-departmani.html';
export const PHARMA_RD_PREVIEW_FILE = 'ilac-ar-ge.html';

export const PHARMA_RD_FILES = new Set([
  'ilac-ar-ge.html',
  'pharmaceutical-r-d.html',
  'البحث-والتطوير-الدوائي.html',
  'i-d-farmaceutica.html',
  'r-d-pharmaceutique.html',
  'r-d-farmaceutica.html',
  'фармацевтические-разработки.html',
  'pharmazeutische-forschung.html',
]);

export const LEGAL_FILES = new Set([
  'hukuk-departmani.html',
  'legal-department.html',
  'departamento-juridico.html',
  'departement-juridique.html',
  'dipartimento-legale.html',
  'rechtsabteilung.html',
  'قسم-الشؤون-القانونية.html',
  'юридический-отдел.html',
]);

export const FINANCE_FILES = new Set([
  'finans-departmani.html',
  'finance-department.html',
  'departamento-financiero.html',
  'departement-financier.html',
  'dipartimento-finanziario.html',
  'finanzabteilung.html',
  'قسم-المالية.html',
  'финансовый-отдел.html',
]);

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

  if (FINANCE_FILES.has(routeFile) || FINANCE_FILES.has(routeFileRaw)) {
    return `/finans-departmani.html${search}`;
  }

  if (routeFile === LEGAL_PREVIEW_FILE || routeFileRaw === LEGAL_PREVIEW_FILE) {
    return `/hukuk-departmani.html${search}`;
  }

  if (LEGAL_FILES.has(routeFile) || LEGAL_FILES.has(routeFileRaw)) {
    return `/hukuk-departmani.html${search}`;
  }

  if (routeFile === PHARMA_RD_PREVIEW_FILE || routeFileRaw === PHARMA_RD_PREVIEW_FILE) {
    return `/ilac-ar-ge.html${search}`;
  }

  if (PHARMA_RD_FILES.has(routeFile) || PHARMA_RD_FILES.has(routeFileRaw)) {
    return `/ilac-ar-ge.html${search}`;
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
