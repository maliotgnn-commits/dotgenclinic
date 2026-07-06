import { YAZILIM_RD_PAGE } from './yazilim-rd-data.js';
import { yazilimRdPathForLocale } from './yazilim-rd-routes.js';

const CONTENT_LOADERS = {
  en: () => import('./i18n/yazilim-rd/en.json').then((module) => module.default),
  ar: () => import('./i18n/yazilim-rd/ar.json').then((module) => module.default),
  es: () => import('./i18n/yazilim-rd/es.json').then((module) => module.default),
  fr: () => import('./i18n/yazilim-rd/fr.json').then((module) => module.default),
  it: () => import('./i18n/yazilim-rd/it.json').then((module) => module.default),
  ru: () => import('./i18n/yazilim-rd/ru.json').then((module) => module.default),
  de: () => import('./i18n/yazilim-rd/de.json').then((module) => module.default),
};

export function buildTrYazilimRdContent() {
  return {
    page: {
      ...YAZILIM_RD_PAGE,
      canonicalPath: yazilimRdPathForLocale('tr'),
    },
  };
}

function normalizeLoadedContent(locale, data) {
  return {
    page: {
      ...data.page,
      canonicalPath: yazilimRdPathForLocale(locale),
    },
  };
}

export async function loadYazilimRdContent(locale) {
  if (locale === 'tr') return buildTrYazilimRdContent();
  const data = await CONTENT_LOADERS[locale]?.();
  if (!data) return buildTrYazilimRdContent();
  return normalizeLoadedContent(locale, data);
}
