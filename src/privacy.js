import './cookie-consent.js';
import './style.css';
import { initCustomCursor } from './cursor.js';
import { initSiteHeader } from './public-header.js';
import { desktopMenuIdForCategory, insertNavItemBeforeDesktopMenuId } from './nav-shared.js';
import { renderEyeHealthNavItem } from './tr-eye-health-nav.js';
import { appendFinanceNavLink } from './tr-finance-nav.js';
import { appendArgeNavItem } from './tr-arge-nav.js';
import { loadEyeHealthContent } from './eye-health-content.js';
import {
  applySeoLinks,
  buildCategoryGroups,
  getCurrentLocale,
  homeUrlFor,
  loadContentCatalog,
  loadUiDictionary,
  serviceUrlForLocale,
  translate,
} from './i18n.js';
import {
  initLanguageSwitchers,
  renderLanguageSwitcher,
} from './language-switcher.js';
import { initAnalyticsTracking } from './analytics.js';

const locale = getCurrentLocale('privacy');
const [catalog, uiDictionary, eyeContent] = await Promise.all([
  loadContentCatalog(locale),
  loadUiDictionary(locale),
  loadEyeHealthContent(locale),
]);
const categoryGroups = buildCategoryGroups(catalog, uiDictionary, locale);
const t = (source) => translate(uiDictionary, source);

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderChevron() {
  return '<svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>';
}

function renderNavGroups() {
  const serviceGroups = categoryGroups
    .map((group) => {
      const links = appendFinanceNavLink(
        group.items
          .map((item) => `<a href="${serviceUrlForLocale(item.slug, locale)}">${escapeHtml(item.navLabel)}</a>`)
          .join(''),
        group.key,
        locale,
      );

      return `
        <li class="has-dropdown" data-desktop-menu-id="${desktopMenuIdForCategory(group.key)}">
          <a href="#" aria-label="${escapeHtml(group.label)}">${escapeHtml(group.navLabel)} ${renderChevron()}</a>
          <div class="mega-dropdown">
            <div class="mega-col">
              <div class="mega-col-title" aria-hidden="true">${escapeHtml(group.label)}</div>
              ${links}
            </div>
          </div>
        </li>
      `;
    })
    .join('');

  const navWithEyeHealth = insertNavItemBeforeDesktopMenuId(
    serviceGroups,
    desktopMenuIdForCategory('longevity'),
    renderEyeHealthNavItem({ locale, content: eyeContent }),
  );

  return appendArgeNavItem(navWithEyeHealth, locale);
}

function renderHeader() {
  return `
    <header id="main-header">
      <nav class="main-nav" aria-label="${escapeHtml(t('Menü'))}">
        <div class="container nav-container">
          <a href="${homeUrlFor(locale)}" class="nav-logo" aria-label="${escapeHtml(t('Dr Otgen Clinic ana sayfa'))}">
            <img src="/images/logo-transparent.png" alt="" />
          </a>
          <div class="nav-primary">
            <ul class="nav-menu" id="nav-menu">
              ${renderNavGroups()}
            </ul>
          </div>
          <div class="nav-actions">
            <div class="nav-language-slot">
              ${renderLanguageSwitcher(locale, 'privacy', uiDictionary)}
            </div>
            <a href="${homeUrlFor(locale, '#randevu')}" class="nav-cta">${escapeHtml(t('Randevu Al'))}</a>
            <button class="hamburger" id="hamburger" aria-label="${escapeHtml(t('Menü'))}" aria-expanded="false">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  `;
}

function bootstrapPrivacyPage() {
  const container = document.querySelector('.container');
  if (container) {
    container.insertAdjacentHTML('beforebegin', renderHeader());
  }
  applySeoLinks(locale, 'privacy');
  initAnalyticsTracking(() => locale);
  initSiteHeader(document, { trackScroll: true });
  initCustomCursor();
  initLanguageSwitchers();
}

bootstrapPrivacyPage();
