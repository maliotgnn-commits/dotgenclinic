import { serviceUrlForLocale } from './i18n.js';

const PRODUCTION_NAV_LABELS = {
  tr: 'Prodüksiyon',
  en: 'Production',
  ar: 'الإنتاج',
  es: 'Producción',
  fr: 'Production',
  it: 'Produzione',
  ru: 'Производство',
  de: 'Produktion',
};

export const PRODUCTION_SLUG = 'production';

export function productionNavLabelForLocale(locale = 'tr') {
  return PRODUCTION_NAV_LABELS[locale] || PRODUCTION_NAV_LABELS.tr;
}

export function renderProductionCorporateNavLink(locale = 'tr') {
  return `<a href="${serviceUrlForLocale(PRODUCTION_SLUG, locale)}" data-production-nav>${productionNavLabelForLocale(locale)}</a>`;
}

export function stripProductionNavLink(html) {
  return html.replace(/<a\b[^>]*\bdata-production-nav\b[^>]*>[\s\S]*?<\/a>\s*/gi, '');
}

export function injectProductionNavForLocale(html, locale) {
  const link = renderProductionCorporateNavLink(locale);
  return html.replace(
    /(<div class="mega-dropdown" id="nav-panel-corporate">[\s\S]*?<div class="mega-col">[\s\S]*?)(<\/div>\s*<\/div>)/i,
    `$1\n              ${link}$2`,
  ).replace(
    /(<li class="has-dropdown" data-desktop-menu-id="corporate">[\s\S]*?<div class="mega-dropdown">[\s\S]*?<div class="mega-col">[\s\S]*?)(<\/div>\s*<\/div>\s*<\/li>)/i,
    `$1\n              ${link}$2`,
  );
}
