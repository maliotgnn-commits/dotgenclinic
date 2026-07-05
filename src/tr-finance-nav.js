export const FINANCE_DEPARTMENT_PATH = '/tr/finans-departmani.html';
export const FINANCE_NAV_LABEL = 'Finans Departmanı';

export function renderFinanceCorporateNavLink() {
  return `<a href="${FINANCE_DEPARTMENT_PATH}" data-tr-finance-nav>${FINANCE_NAV_LABEL}</a>`;
}

export function appendFinanceNavLinkIfTr(linksHtml, groupKey, locale) {
  if (groupKey !== 'corporate' || locale !== 'tr') return linksHtml;
  return `${linksHtml}\n              ${renderFinanceCorporateNavLink()}`;
}

export function stripFinanceNavLink(html) {
  return html.replace(/<a\b[^>]*\bdata-tr-finance-nav\b[^>]*>[\s\S]*?<\/a>\s*/gi, '');
}
