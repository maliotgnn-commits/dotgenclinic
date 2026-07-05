export const LEGAL_ROUTES = {
  tr: {
    path: '/tr/hukuk-departmani.html',
    file: 'hukuk-departmani.html',
    navLabel: 'Hukuk Departmanı',
  },
  en: {
    path: '/en/legal-department.html',
    file: 'legal-department.html',
    navLabel: 'Legal Department',
  },
  ar: {
    path: '/ar/قسم-الشؤون-القانونية.html',
    file: 'قسم-الشؤون-القانونية.html',
    navLabel: 'قسم الشؤون القانونية',
  },
  es: {
    path: '/es/departamento-juridico.html',
    file: 'departamento-juridico.html',
    navLabel: 'Departamento Jurídico',
  },
  fr: {
    path: '/fr/departement-juridique.html',
    file: 'departement-juridique.html',
    navLabel: 'Département Juridique',
  },
  it: {
    path: '/it/dipartimento-legale.html',
    file: 'dipartimento-legale.html',
    navLabel: 'Dipartimento Legale',
  },
  ru: {
    path: '/ru/юридический-отдел.html',
    file: 'юридический-отдел.html',
    navLabel: 'Юридический отдел',
  },
  de: {
    path: '/de/rechtsabteilung.html',
    file: 'rechtsabteilung.html',
    navLabel: 'Rechtsabteilung',
  },
};

export const LEGAL_LOCALES = Object.keys(LEGAL_ROUTES);

export function legalPathForLocale(locale) {
  return LEGAL_ROUTES[locale]?.path || LEGAL_ROUTES.tr.path;
}

export function legalFileForLocale(locale) {
  return LEGAL_ROUTES[locale]?.file || LEGAL_ROUTES.tr.file;
}

export function legalNavLabelForLocale(locale) {
  return LEGAL_ROUTES[locale]?.navLabel || LEGAL_ROUTES.tr.navLabel;
}

function normalizePathname(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

export function detectLegalLocale(pathname = window.location.pathname) {
  const normalized = normalizePathname(pathname);
  for (const [locale, route] of Object.entries(LEGAL_ROUTES)) {
    if (normalized.endsWith(`/${route.file}`) || normalized === route.path) {
      return locale;
    }
  }
  return null;
}

export function isLegalPath(pathname = window.location.pathname) {
  return Boolean(detectLegalLocale(pathname));
}

export function legalUrlForLocale(locale) {
  return legalPathForLocale(locale);
}
