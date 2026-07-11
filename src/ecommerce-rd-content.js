import { ECOMMERCE_RD_PAGE } from './ecommerce-rd-data.js';
import { ecommerceRdPathForLocale } from './ecommerce-rd-routes.js';

const CONTENT_LOADERS = {
  en: () => import('./i18n/ecommerce-rd/en.json').then((module) => module.default),
  ar: () => import('./i18n/ecommerce-rd/ar.json').then((module) => module.default),
  es: () => import('./i18n/ecommerce-rd/es.json').then((module) => module.default),
  fr: () => import('./i18n/ecommerce-rd/fr.json').then((module) => module.default),
  it: () => import('./i18n/ecommerce-rd/it.json').then((module) => module.default),
  ru: () => import('./i18n/ecommerce-rd/ru.json').then((module) => module.default),
  de: () => import('./i18n/ecommerce-rd/de.json').then((module) => module.default),
};

export function buildTrEcommerceRdContent() {
  return {
    page: {
      ...ECOMMERCE_RD_PAGE,
      canonicalPath: ecommerceRdPathForLocale('tr'),
    },
  };
}

function normalizeLoadedContent(locale, data) {
  return {
    page: {
      ...data.page,
      canonicalPath: ecommerceRdPathForLocale(locale),
    },
  };
}

export async function loadEcommerceRdContent(locale) {
  if (locale === 'tr') return buildTrEcommerceRdContent();
  const data = await CONTENT_LOADERS[locale]?.();
  if (!data) return buildTrEcommerceRdContent();
  return normalizeLoadedContent(locale, data);
}
