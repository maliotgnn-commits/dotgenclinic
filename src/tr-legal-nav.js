import { legalNavLabelForLocale, legalPathForLocale } from './legal-routes.js';

export const LEGAL_DEPARTMENT_PATH = legalPathForLocale('tr');
export const LEGAL_NAV_LABEL = legalNavLabelForLocale('tr');

export function renderLegalCorporateNavLink(locale = 'tr') {
  return `<a href="${legalPathForLocale(locale)}" data-legal-nav>${legalNavLabelForLocale(locale)}</a>`;
}

export function stripLegalNavLink(html) {
  return html.replace(/<a\b[^>]*\bdata-legal-nav\b[^>]*>[\s\S]*?<\/a>\s*/gi, '')
    .replace(/<a\b[^>]*\bdata-tr-legal-nav\b[^>]*>[\s\S]*?<\/a>\s*/gi, '');
}

export function injectLegalNavForLocale(html, locale) {
  const link = renderLegalCorporateNavLink(locale);
  return html.replace(
    /(<div class="mega-dropdown" id="nav-panel-corporate">[\s\S]*?<div class="mega-col">[\s\S]*?)(<\/div>\s*<\/div>)/i,
    `$1\n              ${link}$2`,
  ).replace(
    /(<li class="has-dropdown" data-desktop-menu-id="corporate">[\s\S]*?<div class="mega-dropdown">[\s\S]*?<div class="mega-col">[\s\S]*?)(<\/div>\s*<\/div>\s*<\/li>)/i,
    `$1\n              ${link}$2`,
  );
}
