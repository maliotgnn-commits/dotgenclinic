export const EYE_HEALTH_ROUTES = {
  tr: {
    path: '/tr/goz-hastaliklari.html',
    file: 'goz-hastaliklari.html',
    navLabel: 'Göz Hastalıkları',
  },
  en: {
    path: '/en/eye-health.html',
    file: 'eye-health.html',
    navLabel: 'Eye Health',
  },
  ar: {
    path: '/ar/صحة-العين.html',
    file: 'صحة-العين.html',
    navLabel: 'صحة العين',
  },
  es: {
    path: '/es/salud-ocular.html',
    file: 'salud-ocular.html',
    navLabel: 'Salud Ocular',
  },
  fr: {
    path: '/fr/sante-oculaire.html',
    file: 'sante-oculaire.html',
    navLabel: 'Santé oculaire',
  },
  it: {
    path: '/it/salute-oculare.html',
    file: 'salute-oculare.html',
    navLabel: 'Salute oculare',
  },
  ru: {
    path: '/ru/здоровье-глаз.html',
    file: 'здоровье-глаз.html',
    navLabel: 'Здоровье глаз',
    headerNavLabel: 'Офтальмология',
  },
  de: {
    path: '/de/augengesundheit.html',
    file: 'augengesundheit.html',
    navLabel: 'Augengesundheit',
  },
};

export const EYE_HEALTH_LOCALES = Object.keys(EYE_HEALTH_ROUTES);

export function eyeHealthPathForLocale(locale) {
  return EYE_HEALTH_ROUTES[locale]?.path || EYE_HEALTH_ROUTES.tr.path;
}

export function eyeHealthFileForLocale(locale) {
  return EYE_HEALTH_ROUTES[locale]?.file || EYE_HEALTH_ROUTES.tr.file;
}

export function eyeHealthNavLabelForLocale(locale) {
  return EYE_HEALTH_ROUTES[locale]?.navLabel || EYE_HEALTH_ROUTES.tr.navLabel;
}

export function eyeHealthHeaderNavLabelForLocale(locale) {
  return EYE_HEALTH_ROUTES[locale]?.headerNavLabel || eyeHealthNavLabelForLocale(locale);
}

function normalizePathname(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

export function detectEyeHealthLocale(pathname = window.location.pathname) {
  const normalized = normalizePathname(pathname);
  for (const [locale, route] of Object.entries(EYE_HEALTH_ROUTES)) {
    if (normalized.endsWith(`/${route.file}`) || normalized === route.path) {
      return locale;
    }
  }
  return null;
}

export function isEyeHealthPath(pathname = window.location.pathname) {
  return Boolean(detectEyeHealthLocale(pathname));
}

export function eyeHealthUrlForLocale(locale) {
  return eyeHealthPathForLocale(locale);
}

export function eyeHealthCanonicalUrl(origin, locale) {
  return `${origin}${eyeHealthPathForLocale(locale)}`;
}
