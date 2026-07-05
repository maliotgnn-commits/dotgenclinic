export const LEGAL_DEPARTMENT_PATH = '/tr/hukuk-departmani.html';
export const LEGAL_NAV_LABEL = 'Hukuk Departmanı';

export function renderLegalCorporateNavLink() {
  return `<a href="${LEGAL_DEPARTMENT_PATH}" data-tr-legal-nav>${LEGAL_NAV_LABEL}</a>`;
}

export function stripLegalNavLink(html) {
  return html.replace(/<a\b[^>]*\bdata-tr-legal-nav\b[^>]*>[\s\S]*?<\/a>\s*/gi, '');
}
