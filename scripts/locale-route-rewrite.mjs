export const LOCALE_CODES = ['tr', 'en', 'ar', 'es', 'fr', 'it', 'ru', 'de'];

export const FINANCE_PREVIEW_FILE = 'finans-departmani.html';
export const LEGAL_PREVIEW_FILE = 'hukuk-departmani.html';
export const PHARMA_RD_PREVIEW_FILE = 'ilac-ar-ge.html';
export const MEDIKAL_RD_PREVIEW_FILE = 'medikal-ar-ge.html';
export const YAZILIM_RD_PREVIEW_FILE = 'yazilim-ar-ge.html';
export const BLOCKCHAIN_RD_PREVIEW_FILE = 'blockchain-ar-ge.html';
export const ECOMMERCE_RD_PREVIEW_FILE = 'e-ticaret-ar-ge.html';
export const DENIZLI_LOCATION_FILE = 'denizli.html';
export const IZMIR_LOCATION_FILE = 'izmir.html';

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

export const MEDIKAL_RD_FILES = new Set([
  'medikal-ar-ge.html',
  'medical-r-d.html',
  'البحث-والتطوير-الطبي.html',
  'i-d-medica.html',
  'r-d-medical.html',
  'r-d-medica.html',
  'медицинские-разработки.html',
  'medizinische-forschung.html',
]);

export const YAZILIM_RD_FILES = new Set([
  'yazilim-ar-ge.html',
  'software-r-d.html',
  'البحث-والتطوير-البرمجي.html',
  'i-d-de-software.html',
  'r-d-logiciel.html',
  'r-d-software.html',
  'программные-разработки.html',
  'software-forschung.html',
]);

export const BLOCKCHAIN_RD_FILES = new Set([
  'blockchain-ar-ge.html',
  'blockchain-r-d.html',
  'البحث-والتطوير-البلوكشين.html',
  'i-d-blockchain.html',
  'r-d-blockchain.html',
  'r-s-blockchain.html',
  'блокчейн-разработки.html',
  'blockchain-forschung.html',
]);

export const ECOMMERCE_RD_FILES = new Set([
  'e-ticaret-ar-ge.html',
  'e-commerce-r-d.html',
  'البحث-والتطوير-التجارة-الإلكترونية.html',
  'i-d-comercio-electronico.html',
  'r-d-e-commerce.html',
  'r-s-e-commerce.html',
  'электронная-торговля-разработки.html',
  'e-commerce-forschung.html',
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

  if (routeFile === 'doctor.html') {
    return `/doctor.html${search}`;
  }

  if (routeFile === 'privacy.html') {
    return `/privacy.html${search}`;
  }

  if (routeFile === DENIZLI_LOCATION_FILE) {
    return `/${DENIZLI_LOCATION_FILE}${search}`;
  }

  if (routeFile === IZMIR_LOCATION_FILE) {
    return `/${IZMIR_LOCATION_FILE}${search}`;
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

  if (routeFile === MEDIKAL_RD_PREVIEW_FILE || routeFileRaw === MEDIKAL_RD_PREVIEW_FILE) {
    return `/medikal-ar-ge.html${search}`;
  }

  if (MEDIKAL_RD_FILES.has(routeFile) || MEDIKAL_RD_FILES.has(routeFileRaw)) {
    return `/medikal-ar-ge.html${search}`;
  }

  if (routeFile === YAZILIM_RD_PREVIEW_FILE || routeFileRaw === YAZILIM_RD_PREVIEW_FILE) {
    return `/yazilim-ar-ge.html${search}`;
  }

  if (YAZILIM_RD_FILES.has(routeFile) || YAZILIM_RD_FILES.has(routeFileRaw)) {
    return `/yazilim-ar-ge.html${search}`;
  }

  if (routeFile === BLOCKCHAIN_RD_PREVIEW_FILE || routeFileRaw === BLOCKCHAIN_RD_PREVIEW_FILE) {
    return `/blockchain-ar-ge.html${search}`;
  }

  if (BLOCKCHAIN_RD_FILES.has(routeFile) || BLOCKCHAIN_RD_FILES.has(routeFileRaw)) {
    return `/blockchain-ar-ge.html${search}`;
  }

  if (routeFile === ECOMMERCE_RD_PREVIEW_FILE || routeFileRaw === ECOMMERCE_RD_PREVIEW_FILE) {
    return `/e-ticaret-ar-ge.html${search}`;
  }

  if (ECOMMERCE_RD_FILES.has(routeFile) || ECOMMERCE_RD_FILES.has(routeFileRaw)) {
    return `/e-ticaret-ar-ge.html${search}`;
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
