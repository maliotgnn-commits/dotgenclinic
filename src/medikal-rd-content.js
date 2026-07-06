import { MEDIKAL_RD_PAGE } from './medikal-rd-data.js';
import { medikalRdPathForLocale } from './medikal-rd-routes.js';

const CONTENT_LOADERS = {
  en: () => import('./i18n/medikal-rd/en.json').then((module) => module.default),
  ar: () => import('./i18n/medikal-rd/ar.json').then((module) => module.default),
  es: () => import('./i18n/medikal-rd/es.json').then((module) => module.default),
  fr: () => import('./i18n/medikal-rd/fr.json').then((module) => module.default),
  it: () => import('./i18n/medikal-rd/it.json').then((module) => module.default),
  ru: () => import('./i18n/medikal-rd/ru.json').then((module) => module.default),
  de: () => import('./i18n/medikal-rd/de.json').then((module) => module.default),
};

export function buildTrMedikalRdContent() {
  return {
    page: {
      ...MEDIKAL_RD_PAGE,
      canonicalPath: medikalRdPathForLocale('tr'),
    },
  };
}

function normalizeLoadedContent(locale, data) {
  return {
    page: {
      ...data.page,
      canonicalPath: medikalRdPathForLocale(locale),
    },
  };
}

export async function loadMedikalRdContent(locale) {
  if (locale === 'tr') return buildTrMedikalRdContent();
  const data = await CONTENT_LOADERS[locale]?.();
  if (!data) return buildTrMedikalRdContent();
  return normalizeLoadedContent(locale, data);
}
