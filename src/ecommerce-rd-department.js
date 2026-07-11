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
import { loadEcommerceRdContent } from './ecommerce-rd-content.js';
import { detectEcommerceRdLocale } from './ecommerce-rd-routes.js';
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

const app = document.getElementById('ecommerce-rd-app');
const pathLocale = detectEcommerceRdLocale();
const locale = getCurrentLocale('ecommerce-rd');
const ecommerceLocale = pathLocale || locale;
const [catalog, uiDictionary, eyeContent, ecommerceContent] = await Promise.all([
  loadContentCatalog(locale),
  loadUiDictionary(locale),
  loadEyeHealthContent(locale),
  loadEcommerceRdContent(ecommerceLocale),
]);
const { page } = ecommerceContent;
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
              ${renderLanguageSwitcher(locale, 'ecommerce-rd', uiDictionary)}
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
  const heroImage = page.hero.image || '/images/ecommerce_rd/ecommerce_rd_hero.webp';
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
          <li><a href="${argeLandingPath(ecommerceLocale)}">${escapeHtml(page.sectionName)}</a></li>
          <li aria-current="page">${escapeHtml(page.pageShortName)}</li>
        </ol>
      </div>
    </nav>
  `;
}

function renderIntroSection() {
  const showcase = page.showcase;
  const proseContent = `
        <div class="mr-section-head">
          <h2 id="mr-intro-title">${escapeHtml(page.intro.title)}</h2>
          ${page.intro.paragraphs
            .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
            .join('')}
        </div>
  `;

  if (!showcase?.image) {
    return `
    <section class="mr-section" aria-labelledby="mr-intro-title">
      <div class="container mr-prose">
        ${proseContent}
      </div>
    </section>
  `;
  }

  return `
    <section class="mr-section" aria-labelledby="mr-intro-title">
      <div class="container mr-split">
        <div class="mr-split-text mr-prose">
          ${proseContent}
        </div>
        <div class="mr-split-media">
          <img
            src="${showcase.image}"
            alt="${escapeHtml(showcase.alt || page.hero.title)}"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  `;
}

function renderContentSections() {
  const sections = page.sections || [];
  return sections
    .map((section, index) => {
      const isSoft = index % 2 === 0;
      const sectionClass = isSoft ? 'mr-section mr-section-soft' : 'mr-section';
      const sectionId = `mr-section-${index + 1}`;
      return `
    <section class="${sectionClass}" aria-labelledby="${sectionId}">
      <div class="container mr-prose">
        <div class="mr-section-head">
          <h2 id="${sectionId}">${escapeHtml(section.title)}</h2>
          ${section.paragraphs
            .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
            .join('')}
        </div>
      </div>
    </section>
  `;
    })
    .join('');
}

function renderFocusAreas() {
  return `
    <section class="mr-section${(page.sections?.length || 0) % 2 === 0 ? '' : ' mr-section-soft'}" aria-labelledby="mr-focus-title">
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
  applySeoLinks(ecommerceLocale, 'ecommerce-rd');

  app.innerHTML = `
    ${renderSkipLink()}
    ${renderHeader()}
    <div class="mr-page" id="main-content" tabindex="-1">
      ${renderHero()}
      ${renderBreadcrumb()}
      ${renderIntroSection()}
      ${renderContentSections()}
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

function bootstrapEcommerceRdPage() {
  renderPage();
  initSkipLink();
  initCustomCursor();
  initSiteHeader(document, { trackScroll: true });
  initLanguageSwitchers();
  initAnalyticsTracking(() => locale);
}

bootstrapEcommerceRdPage();
