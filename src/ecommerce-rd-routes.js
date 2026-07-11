export const ECOMMERCE_RD_ROUTES = {
  tr: {
    path: '/tr/e-ticaret-ar-ge.html',
    file: 'e-ticaret-ar-ge.html',
    pageNavLabel: 'E-Ticaret Ar-Ge',
  },
  en: {
    path: '/en/e-commerce-r-d.html',
    file: 'e-commerce-r-d.html',
    pageNavLabel: 'E-Commerce R&D',
  },
  ar: {
    path: '/ar/البحث-والتطوير-التجارة-الإلكترونية.html',
    file: 'البحث-والتطوير-التجارة-الإلكترونية.html',
    pageNavLabel: 'البحث والتطوير في التجارة الإلكترونية',
  },
  es: {
    path: '/es/i-d-comercio-electronico.html',
    file: 'i-d-comercio-electronico.html',
    pageNavLabel: 'I+D Comercio Electrónico',
  },
  fr: {
    path: '/fr/r-d-e-commerce.html',
    file: 'r-d-e-commerce.html',
    pageNavLabel: 'R&D E-Commerce',
  },
  it: {
    path: '/it/r-s-e-commerce.html',
    file: 'r-s-e-commerce.html',
    pageNavLabel: 'R&S E-Commerce',
  },
  ru: {
    path: '/ru/электронная-торговля-разработки.html',
    file: 'электронная-торговля-разработки.html',
    pageNavLabel: 'Разработки электронной торговли',
  },
  de: {
    path: '/de/e-commerce-forschung.html',
    file: 'e-commerce-forschung.html',
    pageNavLabel: 'E-Commerce F&E',
  },
};

export const ECOMMERCE_RD_LOCALES = Object.keys(ECOMMERCE_RD_ROUTES);

export function ecommerceRdPathForLocale(locale) {
  return ECOMMERCE_RD_ROUTES[locale]?.path || ECOMMERCE_RD_ROUTES.tr.path;
}

export function ecommerceRdFileForLocale(locale) {
  return ECOMMERCE_RD_ROUTES[locale]?.file || ECOMMERCE_RD_ROUTES.tr.file;
}

export function ecommerceRdPageNavLabelForLocale(locale) {
  return ECOMMERCE_RD_ROUTES[locale]?.pageNavLabel || ECOMMERCE_RD_ROUTES.tr.pageNavLabel;
}

function normalizePathname(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

export function detectEcommerceRdLocale(pathname = window.location.pathname) {
  const normalized = normalizePathname(pathname);
  for (const [locale, route] of Object.entries(ECOMMERCE_RD_ROUTES)) {
    if (normalized.endsWith(`/${route.file}`) || normalized === route.path) {
      return locale;
    }
  }
  return null;
}

export function isEcommerceRdPath(pathname = window.location.pathname) {
  return Boolean(detectEcommerceRdLocale(pathname));
}
