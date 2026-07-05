import './style.css';
import './pharma-rd-department.css';
import { initCustomCursor } from './cursor.js';
import { initSiteHeader, renderMobileCategoryTrigger } from './public-header.js';
import { desktopMenuIdForCategory } from './nav-shared.js';
import { renderEyeHealthNavItem } from './tr-eye-health-nav.js';
import { appendFinanceNavLink } from './tr-finance-nav.js';
import { appendArgeNavItem } from './tr-arge-nav.js';
import { argeLandingPath } from './arge-routes.js';
import { loadEyeHealthContent } from './eye-health-content.js';
import { loadPharmaRdContent } from './pharma-rd-content.js';
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

const app = document.getElementById('pharma-rd-app');
const locale = getCurrentLocale('pharma-rd');
const [catalog, uiDictionary, eyeContent, pharmaContent] = await Promise.all([
  loadContentCatalog(locale),
  loadUiDictionary(locale),
  loadEyeHealthContent(locale),
  loadPharmaRdContent(locale),
]);
const { page } = pharmaContent;
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

  return appendArgeNavItem(
    `${serviceGroups}${renderEyeHealthNavItem({ locale, content: eyeContent })}`,
    locale,
  );
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
              ${renderLanguageSwitcher(locale, 'pharma-rd', uiDictionary)}
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
  const { partnerLogo } = page.hero;
  return `
    <section class="pr-hero" aria-labelledby="pr-hero-title">
      <div class="pr-hero-panel-wrap">
        <div class="container pr-hero-panel">
          <span class="pr-hero-tag">${escapeHtml(page.hero.tag)}</span>
          <h1 id="pr-hero-title">${escapeHtml(page.hero.title)}</h1>
          <p class="pr-hero-subtitle">${escapeHtml(page.hero.subtitle)}</p>
          <p class="pr-hero-lead">${escapeHtml(page.hero.lead)}</p>
          <div class="pr-hero-partner">
            <img
              class="pr-hero-partner-logo"
              src="${escapeHtml(partnerLogo.src)}"
              alt="${escapeHtml(partnerLogo.alt)}"
              width="220"
              height="72"
              loading="eager"
              decoding="async"
            />
          </div>
          <p class="pr-hero-description">${escapeHtml(page.hero.description)}</p>
        </div>
      </div>
    </section>
  `;
}

function renderBreadcrumb() {
  return `
    <nav class="pr-breadcrumb" aria-label="Breadcrumb">
      <div class="container">
        <ol>
          <li><a href="${homeUrlFor(locale)}">${escapeHtml(page.breadcrumbHome)}</a></li>
          <li><a href="${argeLandingPath()}">${escapeHtml(page.sectionName)}</a></li>
          <li aria-current="page">${escapeHtml(page.pageShortName)}</li>
        </ol>
      </div>
    </nav>
  `;
}

function renderVisionSection() {
  return `
    <section class="pr-section" aria-labelledby="pr-vision-title">
      <div class="container pr-prose">
        <div class="pr-section-head">
          <h2 id="pr-vision-title">${escapeHtml(page.vision.title)}</h2>
          <p>${escapeHtml(page.vision.description)}</p>
        </div>
      </div>
    </section>
  `;
}

function renderFocusAreas() {
  return `
    <section class="pr-section pr-section-soft" aria-labelledby="pr-focus-title">
      <div class="container">
        <div class="pr-section-head">
          <h2 id="pr-focus-title">${escapeHtml(page.focusAreas.title)}</h2>
        </div>
        <div class="pr-focus-grid">
          ${page.focusAreas.items
            .map(
              (item) => `
            <article class="pr-focus-card">
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

function renderClinicalSection() {
  return `
    <section class="pr-section" aria-labelledby="pr-clinical-title">
      <div class="container pr-prose">
        <div class="pr-section-head">
          <h2 id="pr-clinical-title">${escapeHtml(page.clinical.title)}</h2>
          <p>${escapeHtml(page.clinical.description)}</p>
        </div>
      </div>
    </section>
  `;
}

function renderStandardsSection() {
  return `
    <section class="pr-section pr-section-soft" aria-labelledby="pr-standards-title">
      <div class="container pr-prose">
        <div class="pr-section-head">
          <h2 id="pr-standards-title">${escapeHtml(page.standards.title)}</h2>
          <p>${escapeHtml(page.standards.description)}</p>
        </div>
      </div>
    </section>
  `;
}

function renderCooperationSection() {
  return `
    <section class="pr-section" aria-labelledby="pr-cooperation-title">
      <div class="container pr-prose">
        <div class="pr-section-head">
          <h2 id="pr-cooperation-title">${escapeHtml(page.cooperation.title)}</h2>
          <p>${escapeHtml(page.cooperation.description)}</p>
        </div>
      </div>
    </section>
  `;
}

function renderClosing() {
  return `
    <section class="pr-closing" aria-labelledby="pr-closing-quote">
      <div class="container">
        <blockquote id="pr-closing-quote">${escapeHtml(page.closing.quote)}</blockquote>
        <a href="${homeUrlFor(locale, '#randevu')}" class="btn btn-gold">${escapeHtml(page.closing.cta)}</a>
      </div>
    </section>
  `;
}

function renderPage() {
  document.title = page.title;
  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) descriptionMeta.setAttribute('content', page.description);
  applySeoLinks(locale, 'pharma-rd');

  app.innerHTML = `
    ${renderSkipLink()}
    ${renderHeader()}
    <div class="pr-page" id="main-content" tabindex="-1">
      ${renderHero()}
      ${renderBreadcrumb()}
      ${renderVisionSection()}
      ${renderFocusAreas()}
      ${renderClinicalSection()}
      ${renderStandardsSection()}
      ${renderCooperationSection()}
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

function bootstrapPharmaRdPage() {
  renderPage();
  initSkipLink();
  initCustomCursor();
  initSiteHeader(document, { trackScroll: true });
  initLanguageSwitchers();
}

bootstrapPharmaRdPage();
