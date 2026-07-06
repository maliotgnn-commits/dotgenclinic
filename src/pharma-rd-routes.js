export const PHARMA_RD_ROUTES = {
  tr: {
    path: '/tr/ilac-ar-ge.html',
    file: 'ilac-ar-ge.html',
    menuLabel: 'Ar-Ge',
    pageNavLabel: 'İlaç Ar-Ge',
    submenuAriaLabel: 'Ar-Ge menüsü',
  },
  en: {
    path: '/en/pharmaceutical-r-d.html',
    file: 'pharmaceutical-r-d.html',
    menuLabel: 'R&D',
    pageNavLabel: 'Pharmaceutical R&D',
    submenuAriaLabel: 'R&D menu',
  },
  ar: {
    path: '/ar/البحث-والتطوير-الدوائي.html',
    file: 'البحث-والتطوير-الدوائي.html',
    menuLabel: 'البحث والتطوير',
    pageNavLabel: 'البحث والتطوير الدوائي',
    submenuAriaLabel: 'قائمة البحث والتطوير',
  },
  es: {
    path: '/es/i-d-farmaceutica.html',
    file: 'i-d-farmaceutica.html',
    menuLabel: 'I+D',
    pageNavLabel: 'I+D Farmacéutica',
    submenuAriaLabel: 'Menú de I+D',
  },
  fr: {
    path: '/fr/r-d-pharmaceutique.html',
    file: 'r-d-pharmaceutique.html',
    menuLabel: 'R&D',
    pageNavLabel: 'R&D Pharmaceutique',
    submenuAriaLabel: 'Menu R&D',
  },
  it: {
    path: '/it/r-d-farmaceutica.html',
    file: 'r-d-farmaceutica.html',
    menuLabel: 'R&S',
    pageNavLabel: 'R&S Farmaceutica',
    submenuAriaLabel: 'Menu R&S',
  },
  ru: {
    path: '/ru/фармацевтические-разработки.html',
    file: 'фармацевтические-разработки.html',
    menuLabel: 'НИОКР',
    pageNavLabel: 'Фармацевтические разработки',
    submenuAriaLabel: 'Меню НИОКР',
  },
  de: {
    path: '/de/pharmazeutische-forschung.html',
    file: 'pharmazeutische-forschung.html',
    menuLabel: 'F&E',
    pageNavLabel: 'Pharmazeutische F&E',
    submenuAriaLabel: 'F&E-Menü',
  },
};

export const PHARMA_RD_LOCALES = Object.keys(PHARMA_RD_ROUTES);

export function pharmaRdPathForLocale(locale) {
  return PHARMA_RD_ROUTES[locale]?.path || PHARMA_RD_ROUTES.tr.path;
}

export function pharmaRdFileForLocale(locale) {
  return PHARMA_RD_ROUTES[locale]?.file || PHARMA_RD_ROUTES.tr.file;
}

export function argeMenuLabelForLocale(locale) {
  return PHARMA_RD_ROUTES[locale]?.menuLabel || PHARMA_RD_ROUTES.tr.menuLabel;
}

export function argeSubmenuAriaLabelForLocale(locale) {
  return PHARMA_RD_ROUTES[locale]?.submenuAriaLabel || PHARMA_RD_ROUTES.tr.submenuAriaLabel;
}

export function pharmaRdPageNavLabelForLocale(locale) {
  return PHARMA_RD_ROUTES[locale]?.pageNavLabel || PHARMA_RD_ROUTES.tr.pageNavLabel;
}

/** @deprecated Use pharmaRdPageNavLabelForLocale */
export function pharmaRdNavLabelForLocale(locale) {
  return pharmaRdPageNavLabelForLocale(locale);
}

function normalizePathname(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

export function detectPharmaRdLocale(pathname = window.location.pathname) {
  const normalized = normalizePathname(pathname);
  for (const [locale, route] of Object.entries(PHARMA_RD_ROUTES)) {
    if (normalized.endsWith(`/${route.file}`) || normalized === route.path) {
      return locale;
    }
  }
  return null;
}

export function isPharmaRdPath(pathname = window.location.pathname) {
  return Boolean(detectPharmaRdLocale(pathname));
}

export function pharmaRdUrlForLocale(locale) {
  return pharmaRdPathForLocale(locale);
}
