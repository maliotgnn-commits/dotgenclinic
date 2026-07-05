import {
  ARGE_PAGES,
  argeLandingPath,
  argePageByFile,
  detectArgePage,
  isArgePagePath,
} from './arge-routes.js';

export const PHARMA_RD_ROUTES = {
  tr: {
    path: '/tr/ilac-ar-ge.html',
    file: 'ilac-ar-ge.html',
    navLabel: 'İlaç Ar-Ge',
  },
};

export const PHARMA_RD_LOCALES = Object.keys(PHARMA_RD_ROUTES);

export function pharmaRdPathForLocale(locale) {
  return PHARMA_RD_ROUTES[locale]?.path || PHARMA_RD_ROUTES.tr.path;
}

export function pharmaRdFileForLocale(locale) {
  return PHARMA_RD_ROUTES[locale]?.file || PHARMA_RD_ROUTES.tr.file;
}

export function pharmaRdNavLabelForLocale(locale) {
  return PHARMA_RD_ROUTES[locale]?.navLabel || PHARMA_RD_ROUTES.tr.navLabel;
}

function normalizePathname(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

export function detectPharmaRdLocale(pathname = window.location.pathname) {
  const page = detectArgePage(pathname);
  if (!page) return null;
  return 'tr';
}

export function isPharmaRdPath(pathname = window.location.pathname) {
  return isArgePagePath(pathname);
}

export function pharmaRdUrlForLocale(locale) {
  return pharmaRdPathForLocale(locale);
}

export { ARGE_PAGES, argeLandingPath, argePageByFile, detectArgePage, isArgePagePath };
