import './style.css';
import './medikal-rd-department.css';
import { initCustomCursor } from './cursor.js';
import { initSiteHeader, renderMobileCategoryTrigger } from './public-header.js';
import { desktopMenuIdForCategory, insertNavItemBeforeDesktopMenuId } from './nav-shared.js';
import { renderEyeHealthNavItem } from './tr-eye-health-nav.js';
import { appendFinanceNavLink } from './tr-finance-nav.js';
import { appendArgeNavItem } from './tr-arge-nav.js';
import { argeLandingPath } from './arge-routes.js';
import { loadEyeHealthContent } from './eye-health-content.js';
import { loadBlockchainRdContent } from './blockchain-rd-content.js';
import { detectBlockchainRdLocale } from './blockchain-rd-routes.js';
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

const app = document.getElementById('blockchain-rd-app');
const pathLocale = detectBlockchainRdLocale();
const locale = getCurrentLocale('blockchain-rd');
const blockchainLocale = pathLocale || locale;
const [catalog, uiDictionary, eyeContent, blockchainContent] = await Promise.all([
  loadContentCatalog(locale),
  loadUiDictionary(locale),
  loadEyeHealthContent(locale),
  loadBlockchainRdContent(blockchainLocale),
]);
const { page } = blockchainContent;
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
          ${renderMobileCategoryTrigger({
            label: escapeHtml(group.navLabel),
            panelId: `nav-panel-${group.key}`,
            fullLabel: escapeHtml(group.label),
          })}
          <div class="mega-dropdown" id="nav-panel-${group.key}">
            <div class="mega-col">
              <h4>${escapeHtml(group.label)}</h4>
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

function renderSkipLink() {
  return `<a href="#main-content" class="skip-link">${escapeHtml(t('Ana içeriğe atla'))}</a>`;
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
              ${renderLanguageSwitcher(locale, 'blockchain-rd', uiDictionary)}
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

function renderHero() {
  const heroImage = page.hero.image || '/images/blockchain_rd/blockchain_rd_hero.png';
  return `
    <section class="mr-hero" style="--mr-hero-image: url('${heroImage}')" aria-labelledby="mr-hero-title">
      <div class="mr-hero-panel-wrap">
        <div class="container mr-hero-panel">
          <span class="mr-hero-tag">${escapeHtml(page.hero.tag)}</span>
          <h1 id="mr-hero-title">${escapeHtml(page.hero.title)}</h1>
          <p class="mr-hero-subtitle">${escapeHtml(page.hero.subtitle)}</p>
          <p class="mr-hero-lead">${escapeHtml(page.hero.lead)}</p>
        </div>
      </div>
    </section>
  `;
}

function renderBreadcrumb() {
  return `
    <nav class="mr-breadcrumb" aria-label="Breadcrumb">
      <div class="container">
        <ol>
          <li><a href="${homeUrlFor(locale)}">${escapeHtml(page.breadcrumbHome)}</a></li>
          <li><a href="${argeLandingPath(blockchainLocale)}">${escapeHtml(page.sectionName)}</a></li>
          <li aria-current="page">${escapeHtml(page.pageShortName)}</li>
        </ol>
      </div>
    </nav>
  `;
}

function renderIntroSection() {
  return `
    <section class="mr-section" aria-labelledby="mr-intro-title">
      <div class="container mr-prose">
        <div class="mr-section-head">
          <h2 id="mr-intro-title">${escapeHtml(page.intro.title)}</h2>
          ${page.intro.paragraphs
            .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
            .join('')}
        </div>
      </div>
    </section>
  `;
}

function renderFocusAreas() {
  return `
    <section class="mr-section mr-section-soft" aria-labelledby="mr-focus-title">
      <div class="container">
        <div class="mr-section-head">
          <h2 id="mr-focus-title">${escapeHtml(page.focusAreas.title)}</h2>
        </div>
        <div class="mr-focus-grid">
          ${page.focusAreas.items
            .map(
              (item) => `
            <article class="mr-focus-card">
              <span aria-hidden="true"></span>
              <p>${escapeHtml(item)}</p>
            </article>
          `,
            )
            .join('')}
        </div>
      </div>
    </section>
  `;
}

function renderClosing() {
  return `
    <section class="mr-closing" aria-labelledby="mr-closing-quote">
      <div class="container">
        <blockquote id="mr-closing-quote">${escapeHtml(page.closing.quote)}</blockquote>
        <a href="${homeUrlFor(locale, '#randevu')}" class="btn btn-gold">${escapeHtml(page.closing.cta)}</a>
      </div>
    </section>
  `;
}

function renderPage() {
  document.title = page.title;
  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) descriptionMeta.setAttribute('content', page.description);
  applySeoLinks(blockchainLocale, 'blockchain-rd');

  app.innerHTML = `
    ${renderSkipLink()}
    ${renderHeader()}
    <div class="mr-page" id="main-content" tabindex="-1">
      ${renderHero()}
      ${renderBreadcrumb()}
      ${renderIntroSection()}
      ${renderFocusAreas()}
      ${renderClosing()}
    </div>
  `;
}

function initSkipLink() {
  const skipLink = document.querySelector('.skip-link');
  const target = document.getElementById('main-content');
  if (!skipLink || !target) return;

  skipLink.addEventListener('click', () => {
    window.requestAnimationFrame(() => {
      target.focus({ preventScroll: true });
    });
  });
}

function bootstrapBlockchainRdPage() {
  renderPage();
  initSkipLink();
  initCustomCursor();
  initSiteHeader(document, { trackScroll: true });
  initLanguageSwitchers();
}

bootstrapBlockchainRdPage();
