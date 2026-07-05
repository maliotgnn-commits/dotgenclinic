import { PHARMA_RD_NAV, PHARMA_RD_PAGE } from './pharma-rd-data.js';
import { pharmaRdPathForLocale } from './pharma-rd-routes.js';

export function buildTrPharmaRdContent() {
  return {
    page: { ...PHARMA_RD_PAGE },
    nav: { ...PHARMA_RD_NAV },
  };
}

export async function loadPharmaRdContent(locale) {
  if (locale !== 'tr') return buildTrPharmaRdContent();
  return {
    page: {
      ...PHARMA_RD_PAGE,
      canonicalPath: pharmaRdPathForLocale(locale),
    },
    nav: { ...PHARMA_RD_NAV },
  };
}
