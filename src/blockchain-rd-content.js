import { BLOCKCHAIN_RD_PAGE } from './blockchain-rd-data.js';
import { blockchainRdPathForLocale } from './blockchain-rd-routes.js';

const CONTENT_LOADERS = {
  en: () => import('./i18n/blockchain-rd/en.json').then((module) => module.default),
  ar: () => import('./i18n/blockchain-rd/ar.json').then((module) => module.default),
  es: () => import('./i18n/blockchain-rd/es.json').then((module) => module.default),
  fr: () => import('./i18n/blockchain-rd/fr.json').then((module) => module.default),
  it: () => import('./i18n/blockchain-rd/it.json').then((module) => module.default),
  ru: () => import('./i18n/blockchain-rd/ru.json').then((module) => module.default),
  de: () => import('./i18n/blockchain-rd/de.json').then((module) => module.default),
};

export function buildTrBlockchainRdContent() {
  return {
    page: {
      ...BLOCKCHAIN_RD_PAGE,
      canonicalPath: blockchainRdPathForLocale('tr'),
    },
  };
}

function normalizeLoadedContent(locale, data) {
  return {
    page: {
      ...data.page,
      canonicalPath: blockchainRdPathForLocale(locale),
    },
  };
}

export async function loadBlockchainRdContent(locale) {
  if (locale === 'tr') return buildTrBlockchainRdContent();
  const data = await CONTENT_LOADERS[locale]?.();
  if (!data) return buildTrBlockchainRdContent();
  return normalizeLoadedContent(locale, data);
}
