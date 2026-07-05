import { FINANCE_NAV, FINANCE_PAGE } from './finance-data.js';
import { financePathForLocale } from './finance-routes.js';

const CONTENT_LOADERS = {
  en: () => import('./i18n/finance/en.json').then((module) => module.default),
  ar: () => import('./i18n/finance/ar.json').then((module) => module.default),
  es: () => import('./i18n/finance/es.json').then((module) => module.default),
  fr: () => import('./i18n/finance/fr.json').then((module) => module.default),
  it: () => import('./i18n/finance/it.json').then((module) => module.default),
  ru: () => import('./i18n/finance/ru.json').then((module) => module.default),
  de: () => import('./i18n/finance/de.json').then((module) => module.default),
};

export function buildTrFinanceContent() {
  return {
    page: { ...FINANCE_PAGE },
    nav: { ...FINANCE_NAV },
  };
}

function normalizeLoadedContent(locale, data) {
  return {
    page: {
      ...data.page,
      canonicalPath: financePathForLocale(locale),
    },
    nav: data.nav,
  };
}

export async function loadFinanceContent(locale) {
  if (locale === 'tr') return buildTrFinanceContent();
  const data = await CONTENT_LOADERS[locale]?.();
  if (!data) return buildTrFinanceContent();
  return normalizeLoadedContent(locale, data);
}
