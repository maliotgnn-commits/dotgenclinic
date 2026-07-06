import {
  PHARMA_RD_ROUTES,
  argeMenuLabelForLocale,
  detectPharmaRdLocale,
  isPharmaRdPath,
  pharmaRdFileForLocale,
  pharmaRdPageNavLabelForLocale,
  pharmaRdPathForLocale,
} from './pharma-rd-routes.js';

export const ARGE_MENU_LABEL = PHARMA_RD_ROUTES.tr.menuLabel;

export function argeLandingPath(locale = 'tr') {
  return pharmaRdPathForLocale(locale);
}

export function argePagesForLocale(locale = 'tr') {
  return [
    {
      id: 'ilac-ar-ge',
      navLabel: pharmaRdPageNavLabelForLocale(locale),
      path: pharmaRdPathForLocale(locale),
      file: pharmaRdFileForLocale(locale),
    },
  ];
}

/** @deprecated Use argePagesForLocale */
export const ARGE_PAGES = argePagesForLocale('tr');

export function argePageByFile(file) {
  return argePagesForLocale('tr').find((page) => page.file === file) || null;
}

export function argePagePathForId(id, locale = 'tr') {
  const page = argePagesForLocale(locale).find((entry) => entry.id === id);
  return page?.path || argeLandingPath(locale);
}

export function detectArgePage(pathname = window.location.pathname) {
  const locale = detectPharmaRdLocale(pathname);
  if (!locale) return null;
  return argePagesForLocale(locale)[0] || null;
}

export function isArgePagePath(pathname = window.location.pathname) {
  return isPharmaRdPath(pathname);
}

export { argeMenuLabelForLocale, detectPharmaRdLocale, pharmaRdPathForLocale };
