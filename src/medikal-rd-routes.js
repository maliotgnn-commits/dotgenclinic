export const MEDIKAL_RD_ROUTES = {
  tr: {
    path: '/tr/medikal-ar-ge.html',
    file: 'medikal-ar-ge.html',
    pageNavLabel: 'Medikal Ar-Ge',
  },
  en: {
    path: '/en/medical-r-d.html',
    file: 'medical-r-d.html',
    pageNavLabel: 'Medical R&D',
  },
  ar: {
    path: '/ar/البحث-والتطوير-الطبي.html',
    file: 'البحث-والتطوير-الطبي.html',
    pageNavLabel: 'البحث والتطوير الطبي',
  },
  es: {
    path: '/es/i-d-medica.html',
    file: 'i-d-medica.html',
    pageNavLabel: 'I+D Médica',
  },
  fr: {
    path: '/fr/r-d-medical.html',
    file: 'r-d-medical.html',
    pageNavLabel: 'R&D Médical',
  },
  it: {
    path: '/it/r-d-medica.html',
    file: 'r-d-medica.html',
    pageNavLabel: 'R&S Medica',
  },
  ru: {
    path: '/ru/медицинские-разработки.html',
    file: 'медицинские-разработки.html',
    pageNavLabel: 'Медицинские разработки',
  },
  de: {
    path: '/de/medizinische-forschung.html',
    file: 'medizinische-forschung.html',
    pageNavLabel: 'Medizinische F&E',
  },
};

export const MEDIKAL_RD_LOCALES = Object.keys(MEDIKAL_RD_ROUTES);

export function medikalRdPathForLocale(locale) {
  return MEDIKAL_RD_ROUTES[locale]?.path || MEDIKAL_RD_ROUTES.tr.path;
}

export function medikalRdFileForLocale(locale) {
  return MEDIKAL_RD_ROUTES[locale]?.file || MEDIKAL_RD_ROUTES.tr.file;
}

export function medikalRdPageNavLabelForLocale(locale) {
  return MEDIKAL_RD_ROUTES[locale]?.pageNavLabel || MEDIKAL_RD_ROUTES.tr.pageNavLabel;
}

function normalizePathname(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

export function detectMedikalRdLocale(pathname = window.location.pathname) {
  const normalized = normalizePathname(pathname);
  for (const [locale, route] of Object.entries(MEDIKAL_RD_ROUTES)) {
    if (normalized.endsWith(`/${route.file}`) || normalized === route.path) {
      return locale;
    }
  }
  return null;
}

export function isMedikalRdPath(pathname = window.location.pathname) {
  return Boolean(detectMedikalRdLocale(pathname));
}
