import {
  ARGE_MENU_LABEL,
  ARGE_PAGES,
  argeLandingPath,
} from './arge-routes.js';
import { NAV_CHEVRON_SVG } from './nav-shared.js';

export const ARGE_LANDING_PATH = argeLandingPath();
export const ARGE_NAV_LABEL = ARGE_MENU_LABEL;

export function renderArgeNavItem(locale = 'tr') {
  if (locale !== 'tr') return '';

  const landingPath = argeLandingPath();
  const pageLinks = ARGE_PAGES.map(
    (page) => `<a href="${page.path}" data-arge-page-link="${page.id}">${page.navLabel}</a>`,
  ).join('\n              ');

  return `
    <li class="has-dropdown" data-desktop-menu-id="arge" data-tr-only-nav data-arge-nav>
      <button
        type="button"
        class="mobile-nav-trigger"
        aria-expanded="false"
        aria-controls="nav-panel-arge"
        aria-label="${ARGE_MENU_LABEL}"
      >
        <span class="mobile-nav-label">${ARGE_MENU_LABEL}</span>
        ${NAV_CHEVRON_SVG}
      </button>
      <a href="${landingPath}" class="desktop-nav-trigger" aria-label="${ARGE_MENU_LABEL}">${ARGE_MENU_LABEL} ${NAV_CHEVRON_SVG}</a>
      <div class="mega-dropdown" id="nav-panel-arge" role="region" aria-label="${ARGE_MENU_LABEL} menüsü">
        <div class="mega-col">
          <h4><a href="${landingPath}">${ARGE_MENU_LABEL}</a></h4>
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
