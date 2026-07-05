import './style.css';
import { initCustomCursor } from './cursor.js';
import { initSiteHeader } from './public-header.js';
import { desktopMenuIdForCategory } from './nav-shared.js';
import { renderEyeHealthNavItem } from './tr-eye-health-nav.js';
import { appendFinanceNavLink } from './tr-finance-nav.js';
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
              <h4>${escapeHtml(group.label)}</h4>
              ${links}
            </div>
          </div>
        </li>
      `;
    })
    .join('');

  return `${serviceGroups}${renderEyeHealthNavItem({ locale, content: eyeContent })}`;
}

function renderHeader() {
  return `
    <header id="main-header">
      <nav class="main-nav" aria-label="${escapeHtml(t('Menü'))}">
        <div class="container nav-container">
          <a href="${homeUrlFor(locale)}" class="nav-logo">
            <img src="/images/logo-transparent.png" alt="Dr Otgen Clinic" />
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
  initSiteHeader(document, { trackScroll: true });
  initCustomCursor();
  initLanguageSwitchers();
}

bootstrapPrivacyPage();
