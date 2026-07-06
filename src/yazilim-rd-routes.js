export const YAZILIM_RD_ROUTES = {
  tr: {
    path: '/tr/yazilim-ar-ge.html',
    file: 'yazilim-ar-ge.html',
    pageNavLabel: 'Yazılım Ar-Ge',
  },
  en: {
    path: '/en/software-r-d.html',
    file: 'software-r-d.html',
    pageNavLabel: 'Software R&D',
  },
  ar: {
    path: '/ar/البحث-والتطوير-البرمجي.html',
    file: 'البحث-والتطوير-البرمجي.html',
    pageNavLabel: 'البحث والتطوير البرمجي',
  },
  es: {
    path: '/es/i-d-de-software.html',
    file: 'i-d-de-software.html',
    pageNavLabel: 'I+D de Software',
  },
  fr: {
    path: '/fr/r-d-logiciel.html',
    file: 'r-d-logiciel.html',
    pageNavLabel: 'R&D Logiciel',
  },
  it: {
    path: '/it/r-d-software.html',
    file: 'r-d-software.html',
    pageNavLabel: 'R&S Software',
  },
  ru: {
    path: '/ru/программные-разработки.html',
    file: 'программные-разработки.html',
    pageNavLabel: 'Программные разработки',
  },
  de: {
    path: '/de/software-forschung.html',
    file: 'software-forschung.html',
    pageNavLabel: 'Software F&E',
  },
};

export const YAZILIM_RD_LOCALES = Object.keys(YAZILIM_RD_ROUTES);

export function yazilimRdPathForLocale(locale) {
  return YAZILIM_RD_ROUTES[locale]?.path || YAZILIM_RD_ROUTES.tr.path;
}

export function yazilimRdFileForLocale(locale) {
  return YAZILIM_RD_ROUTES[locale]?.file || YAZILIM_RD_ROUTES.tr.file;
}

export function yazilimRdPageNavLabelForLocale(locale) {
  return YAZILIM_RD_ROUTES[locale]?.pageNavLabel || YAZILIM_RD_ROUTES.tr.pageNavLabel;
}

function normalizePathname(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

export function detectYazilimRdLocale(pathname = window.location.pathname) {
  const normalized = normalizePathname(pathname);
  for (const [locale, route] of Object.entries(YAZILIM_RD_ROUTES)) {
    if (normalized.endsWith(`/${route.file}`) || normalized === route.path) {
      return locale;
    }
  }
  return null;
}

export function isYazilimRdPath(pathname = window.location.pathname) {
  return Boolean(detectYazilimRdLocale(pathname));
}
