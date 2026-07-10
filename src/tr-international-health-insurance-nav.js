import { serviceUrlForLocale } from './i18n.js';

const INTERNATIONAL_HEALTH_INSURANCE_NAV_LABELS = {
  tr: 'Uluslararası Sağlık Sigortası',
  en: 'International Health Insurance',
  ar: 'التأمين الصحي الدولي',
  es: 'Seguro de Salud Internacional',
  fr: 'Assurance Santé Internationale',
  it: 'Assicurazione Sanitaria Internazionale',
  ru: 'Международное медицинское страхование',
  de: 'Internationale Krankenversicherung',
};

export const INTERNATIONAL_HEALTH_INSURANCE_SLUG = 'international-health-insurance';

export function internationalHealthInsuranceNavLabelForLocale(locale = 'tr') {
  return INTERNATIONAL_HEALTH_INSURANCE_NAV_LABELS[locale] || INTERNATIONAL_HEALTH_INSURANCE_NAV_LABELS.tr;
}

export function renderInternationalHealthInsuranceCorporateNavLink(locale = 'tr') {
  return `<a href="${serviceUrlForLocale(INTERNATIONAL_HEALTH_INSURANCE_SLUG, locale)}" data-international-health-insurance-nav>${internationalHealthInsuranceNavLabelForLocale(locale)}</a>`;
}

export function stripInternationalHealthInsuranceNavLink(html) {
  return html.replace(/<a\b[^>]*\bdata-international-health-insurance-nav\b[^>]*>[\s\S]*?<\/a>\s*/gi, '');
}

export function injectInternationalHealthInsuranceNavForLocale(html, locale) {
  const link = renderInternationalHealthInsuranceCorporateNavLink(locale);
  return html.replace(
    /(<div class="mega-dropdown" id="nav-panel-corporate">[\s\S]*?<div class="mega-col">[\s\S]*?)(<\/div>\s*<\/div>)/i,
    `$1\n              ${link}$2`,
  ).replace(
    /(<li class="has-dropdown" data-desktop-menu-id="corporate">[\s\S]*?<div class="mega-dropdown">[\s\S]*?<div class="mega-col">[\s\S]*?)(<\/div>\s*<\/div>\s*<\/li>)/i,
    `$1\n              ${link}$2`,
  );
}
