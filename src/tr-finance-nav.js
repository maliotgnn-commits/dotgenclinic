import {
  financeNavLabelForLocale,
  financePathForLocale,
} from './finance-routes.js';
import { renderLegalCorporateNavLink } from './tr-legal-nav.js';

export const FINANCE_DEPARTMENT_PATH = financePathForLocale('tr');
export const FINANCE_NAV_LABEL = financeNavLabelForLocale('tr');

export function renderFinanceCorporateNavLink(locale = 'tr') {
  return `<a href="${financePathForLocale(locale)}" data-finance-nav>${financeNavLabelForLocale(locale)}</a>`;
}

export function appendFinanceNavLink(linksHtml, groupKey, locale) {
  if (groupKey !== 'corporate') return linksHtml;
  return `${linksHtml}\n              ${renderFinanceCorporateNavLink(locale)}\n              ${renderLegalCorporateNavLink(locale)}`;
}

/** @deprecated Use appendFinanceNavLink */
export function appendFinanceNavLinkIfTr(linksHtml, groupKey, locale) {
  return appendFinanceNavLink(linksHtml, groupKey, locale);
}

export function stripFinanceNavLink(html) {
  return html.replace(/<a\b[^>]*\bdata-finance-nav\b[^>]*>[\s\S]*?<\/a>\s*/gi, '')
    .replace(/<a\b[^>]*\bdata-tr-finance-nav\b[^>]*>[\s\S]*?<\/a>\s*/gi, '');
}

export function injectFinanceNavForLocale(html, locale) {
  const link = renderFinanceCorporateNavLink(locale);
  return html.replace(
    /(<div class="mega-dropdown" id="nav-panel-corporate">[\s\S]*?<div class="mega-col">[\s\S]*?)(<\/div>\s*<\/div>)/i,
    `$1\n              ${link}$2`,
  ).replace(
    /(<li class="has-dropdown" data-desktop-menu-id="corporate">[\s\S]*?<div class="mega-dropdown">[\s\S]*?<div class="mega-col">[\s\S]*?)(<\/div>\s*<\/div>\s*<\/li>)/i,
    `$1\n              ${link}$2`,
  );
}
