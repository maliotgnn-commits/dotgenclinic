import { PHARMA_RD_NAV, PHARMA_RD_PAGE } from './pharma-rd-data.js';
import { pharmaRdPathForLocale } from './pharma-rd-routes.js';

const CONTENT_LOADERS = {
  en: () => import('./i18n/pharma-rd/en.json').then((module) => module.default),
  ar: () => import('./i18n/pharma-rd/ar.json').then((module) => module.default),
  es: () => import('./i18n/pharma-rd/es.json').then((module) => module.default),
  fr: () => import('./i18n/pharma-rd/fr.json').then((module) => module.default),
  it: () => import('./i18n/pharma-rd/it.json').then((module) => module.default),
  ru: () => import('./i18n/pharma-rd/ru.json').then((module) => module.default),
  de: () => import('./i18n/pharma-rd/de.json').then((module) => module.default),
};

export function buildTrPharmaRdContent() {
  return {
    page: {
      ...PHARMA_RD_PAGE,
      canonicalPath: pharmaRdPathForLocale('tr'),
    },
    nav: { ...PHARMA_RD_NAV },
  };
}

function normalizeLoadedContent(locale, data) {
  return {
    page: {
      ...data.page,
      canonicalPath: pharmaRdPathForLocale(locale),
    },
    nav: data.nav,
  };
}

export async function loadPharmaRdContent(locale) {
  if (locale === 'tr') return buildTrPharmaRdContent();
  const data = await CONTENT_LOADERS[locale]?.();
  if (!data) return buildTrPharmaRdContent();
  return normalizeLoadedContent(locale, data);
}
