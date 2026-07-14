import {
  argeLandingPath,
  argeMenuLabelForLocale,
  argePagesForLocale,
} from './arge-routes.js';
import { argeSubmenuAriaLabelForLocale } from './pharma-rd-routes.js';
import { NAV_CHEVRON_SVG } from './nav-shared.js';

export const ARGE_LANDING_PATH = argeLandingPath('tr');
export const ARGE_NAV_LABEL = argeMenuLabelForLocale('tr');

export function renderArgeNavItem(locale = 'tr') {
  const menuLabel = argeMenuLabelForLocale(locale);
  const landingPath = argeLandingPath(locale);
  const submenuAriaLabel = argeSubmenuAriaLabelForLocale(locale);
  const pageLinks = argePagesForLocale(locale)
    .map(
      (page) => `<a href="${page.path}" data-arge-page-link="${page.id}">${page.navLabel}</a>`,
    )
    .join('\n              ');

  return `
    <li class="has-dropdown" data-desktop-menu-id="arge"${locale === 'tr' ? ' data-tr-only-nav' : ''} data-arge-nav>
      <button
        type="button"
        class="mobile-nav-trigger"
        aria-expanded="false"
        aria-controls="nav-panel-arge"
        aria-label="${menuLabel}"
      >
        <span class="mobile-nav-label">${menuLabel}</span>
        ${NAV_CHEVRON_SVG}
      </button>
      <a href="${landingPath}" class="desktop-nav-trigger" aria-label="${menuLabel}">${menuLabel} ${NAV_CHEVRON_SVG}</a>
      <div class="mega-dropdown" id="nav-panel-arge" role="region" aria-label="${submenuAriaLabel}">
        <div class="mega-col">
          <div class="mega-col-title"><a href="${landingPath}">${menuLabel}</a></div>
          ${pageLinks}
        </div>
      </div>
    </li>
  `;
}

export function appendArgeNavItem(navHtml, locale) {
  return `${navHtml}${renderArgeNavItem(locale)}`;
}

export function stripArgeNavItem(html) {
  return html.replace(/<li\b[^>]*\bdata-arge-nav\b[^>]*>[\s\S]*?<\/li>\s*/gi, '');
}

export function injectArgeNavForLocale(html, locale) {
  if (locale === 'tr') return html;
  const stripped = stripArgeNavItem(html);
  const navBlock = renderArgeNavItem(locale);
  return stripped.replace(
    /(<ul class="nav-menu" id="nav-menu">[\s\S]*?)(\s*<\/ul>)/,
    `$1\n            ${navBlock}$2`,
  );
}

export function upgradeLocalizedArgeNav(navMenu, locale) {
  if (!navMenu || locale === 'tr') return false;

  const trOnlyItem = navMenu.querySelector('li[data-arge-nav][data-tr-only-nav]');
  if (!trOnlyItem) return false;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = renderArgeNavItem(locale).trim();
  const newItem = wrapper.firstElementChild;
  if (!newItem) return false;

  trOnlyItem.replaceWith(newItem);
  return true;
}

/** @deprecated Use appendArgeNavItem */
export function appendPharmaRdNavItem(navHtml, locale) {
  return appendArgeNavItem(navHtml, locale);
}

/** @deprecated Use renderArgeNavItem */
export function renderPharmaRdNavItem(locale) {
  return renderArgeNavItem(locale);
}

/** @deprecated Use ARGE_LANDING_PATH */
export const PHARMA_RD_PATH = ARGE_LANDING_PATH;

/** @deprecated Use ARGE_NAV_LABEL */
export const PHARMA_RD_NAV_LABEL = ARGE_NAV_LABEL;
