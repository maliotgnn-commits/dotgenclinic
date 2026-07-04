import {
  EYE_HEALTH_CATEGORIES,
  EYE_HEALTH_PAGE,
} from './eye-health-data.js';
import { eyeHealthPathForLocale } from './eye-health-routes.js';

const TR_NAV = {
  menuLabel: 'Göz Hastalıkları',
  submenuAriaLabel: 'Göz Hastalıkları menüsü',
  toggleAriaLabel: 'Göz Hastalıkları alt menüsünü aç',
  processTitle: 'Değerlendirme Süreci',
  topicCta: 'Randevu Talep Et',
  breadcrumbHome: 'Ana Sayfa',
  pageShortName: 'Göz Hastalıkları',
};

const CONTENT_LOADERS = {
  en: () => import('./i18n/eye-health/en.json').then((module) => module.default),
  ar: () => import('./i18n/eye-health/ar.json').then((module) => module.default),
  es: () => import('./i18n/eye-health/es.json').then((module) => module.default),
  fr: () => import('./i18n/eye-health/fr.json').then((module) => module.default),
  it: () => import('./i18n/eye-health/it.json').then((module) => module.default),
  ru: () => import('./i18n/eye-health/ru.json').then((module) => module.default),
  de: () => import('./i18n/eye-health/de.json').then((module) => module.default),
};

export function buildTrEyeHealthContent() {
  return {
    page: { ...EYE_HEALTH_PAGE },
    categories: EYE_HEALTH_CATEGORIES,
    nav: { ...TR_NAV },
  };
}

function normalizeLoadedContent(locale, data) {
  return {
    page: {
      ...data.page,
      canonicalPath: eyeHealthPathForLocale(locale),
    },
    categories: data.categories,
    nav: data.nav,
  };
}

export async function loadEyeHealthContent(locale) {
  if (locale === 'tr') return buildTrEyeHealthContent();
  const data = await CONTENT_LOADERS[locale]?.();
  if (!data) return buildTrEyeHealthContent();
  return normalizeLoadedContent(locale, data);
}

export function eyeHealthBreadcrumbLabels(content, locale) {
  return {
    home: content.nav.breadcrumbHome,
    page: content.nav.pageShortName || content.nav.menuLabel,
  };
}
