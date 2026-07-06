import {
  medikalRdFileForLocale,
  medikalRdPageNavLabelForLocale,
  medikalRdPathForLocale,
  detectMedikalRdLocale,
  isMedikalRdPath,
} from './medikal-rd-routes.js';
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
    {
      id: 'medikal-ar-ge',
      navLabel: medikalRdPageNavLabelForLocale(locale),
      path: medikalRdPathForLocale(locale),
      file: medikalRdFileForLocale(locale),
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
  const medikalLocale = detectMedikalRdLocale(pathname);
  if (medikalLocale) {
    return argePagesForLocale(medikalLocale).find((page) => page.id === 'medikal-ar-ge') || null;
  }
  const locale = detectPharmaRdLocale(pathname);
  if (!locale) return null;
  return argePagesForLocale(locale).find((page) => page.id === 'ilac-ar-ge') || null;
}

export function isArgePagePath(pathname = window.location.pathname) {
  return isPharmaRdPath(pathname) || isMedikalRdPath(pathname);
}

export { argeMenuLabelForLocale, detectPharmaRdLocale, pharmaRdPathForLocale };
