import { LEGAL_NAV, LEGAL_PAGE } from './legal-data.js';
import { legalPathForLocale } from './legal-routes.js';

const CONTENT_LOADERS = {
  en: () => import('./i18n/legal/en.json').then((module) => module.default),
  ar: () => import('./i18n/legal/ar.json').then((module) => module.default),
  es: () => import('./i18n/legal/es.json').then((module) => module.default),
  fr: () => import('./i18n/legal/fr.json').then((module) => module.default),
  it: () => import('./i18n/legal/it.json').then((module) => module.default),
  ru: () => import('./i18n/legal/ru.json').then((module) => module.default),
  de: () => import('./i18n/legal/de.json').then((module) => module.default),
};

export function buildTrLegalContent() {
  return {
    page: { ...LEGAL_PAGE },
    nav: { ...LEGAL_NAV },
  };
}

function normalizeLoadedContent(locale, data) {
  return {
    page: {
      ...data.page,
      canonicalPath: legalPathForLocale(locale),
    },
    nav: data.nav,
  };
}

export async function loadLegalContent(locale) {
  if (locale === 'tr') return buildTrLegalContent();
  const data = await CONTENT_LOADERS[locale]?.();
  if (!data) return buildTrLegalContent();
  return normalizeLoadedContent(locale, data);
}
