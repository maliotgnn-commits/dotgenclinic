export const FINANCE_ROUTES = {
  tr: {
    path: '/tr/finans-departmani.html',
    file: 'finans-departmani.html',
    navLabel: 'Finans Departmanı',
  },
  en: {
    path: '/en/finance-department.html',
    file: 'finance-department.html',
    navLabel: 'Finance Department',
  },
  ar: {
    path: '/ar/قسم-المالية.html',
    file: 'قسم-المالية.html',
    navLabel: 'قسم المالية',
  },
  es: {
    path: '/es/departamento-financiero.html',
    file: 'departamento-financiero.html',
    navLabel: 'Departamento Financiero',
  },
  fr: {
    path: '/fr/departement-financier.html',
    file: 'departement-financier.html',
    navLabel: 'Département Financier',
  },
  it: {
    path: '/it/dipartimento-finanziario.html',
    file: 'dipartimento-finanziario.html',
    navLabel: 'Dipartimento Finanziario',
  },
  ru: {
    path: '/ru/финансовый-отдел.html',
    file: 'финансовый-отдел.html',
    navLabel: 'Финансовый отдел',
  },
  de: {
    path: '/de/finanzabteilung.html',
    file: 'finanzabteilung.html',
    navLabel: 'Finanzabteilung',
  },
};

export const FINANCE_LOCALES = Object.keys(FINANCE_ROUTES);

export function financePathForLocale(locale) {
  return FINANCE_ROUTES[locale]?.path || FINANCE_ROUTES.tr.path;
}

export function financeFileForLocale(locale) {
  return FINANCE_ROUTES[locale]?.file || FINANCE_ROUTES.tr.file;
}

export function financeNavLabelForLocale(locale) {
  return FINANCE_ROUTES[locale]?.navLabel || FINANCE_ROUTES.tr.navLabel;
}

function normalizePathname(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

export function detectFinanceLocale(pathname = window.location.pathname) {
  const normalized = normalizePathname(pathname);
  for (const [locale, route] of Object.entries(FINANCE_ROUTES)) {
    if (normalized.endsWith(`/${route.file}`) || normalized === route.path) {
      return locale;
    }
  }
  return null;
}

export function isFinancePath(pathname = window.location.pathname) {
  return Boolean(detectFinanceLocale(pathname));
}

export function financeUrlForLocale(locale) {
  return financePathForLocale(locale);
}

export function financeCanonicalUrl(origin, locale) {
  return `${origin}${financePathForLocale(locale)}`;
}
