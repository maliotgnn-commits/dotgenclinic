import './style.css';
import './eye-health.css';
import { initCustomCursor } from './cursor.js';
import { initSiteHeader } from './public-header.js';
import { loadEyeHealthContent } from './eye-health-content.js';
import { detectEyeHealthLocale } from './eye-health-routes.js';
import {
  normalizeEyeHealthLandingHash,
  renderEyeHealthNavItem,
} from './tr-eye-health-nav.js';
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

const app = document.getElementById('eye-health-app');
const pathLocale = detectEyeHealthLocale();
const locale = getCurrentLocale('eye-health');
const eyeLocale = pathLocale || locale;
const [catalog, uiDictionary, eyeContent] = await Promise.all([
  loadContentCatalog(locale),
  loadUiDictionary(locale),
  loadEyeHealthContent(eyeLocale),
]);
const { page: EYE_HEALTH_PAGE, categories: EYE_HEALTH_CATEGORIES, nav: eyeNav } = eyeContent;
const categoryGroups = buildCategoryGroups(catalog);
const t = (source) => translate(uiDictionary, source);
const appointmentUrl = homeUrlFor(locale, '#randevu');

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

const CATEGORY_EYE_IMAGES = {
  exam: '/images/goz-hastaliklari/category-eyes/category-eye-general-health.png',
  laser: '/images/goz-hastaliklari/category-eyes/category-eye-laser.png',
  lens: '/images/goz-hastaliklari/category-eyes/category-eye-cataract.png',
  retina: '/images/goz-hastaliklari/category-eyes/category-eye-retina.png',
  eyelid: '/images/goz-hastaliklari/category-eyes/category-eye-eyelid-orbita.png',
  care: '/images/goz-hastaliklari/category-eyes/category-eye-other-treatments.png',
};

function renderCategoryEyeImage(iconKey) {
  const src = CATEGORY_EYE_IMAGES[iconKey];
  if (!src) return '';
  return `<span class="eh-category-eye-frame"><img class="eh-category-eye" src="${src}" alt="" width="96" height="60" loading="lazy" decoding="async" aria-hidden="true" /></span>`;
}

function renderNavGroups() {
  const serviceGroups = categoryGroups
    .map((group) => {
      const links = group.items
        .map((item) => `<a href="${serviceUrlForLocale(item.slug, locale)}">${escapeHtml(item.navLabel)}</a>`)
        .join('');

      return `
        <li class="has-dropdown">
          <a href="#">${escapeHtml(group.label)} ${renderChevron()}</a>
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

  return `${serviceGroups}${renderEyeHealthNavItem({ locale: eyeLocale, content: eyeContent })}`;
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
          <ul class="nav-menu" id="nav-menu">
            ${renderNavGroups()}
          </ul>
          <div class="nav-actions">
            <div class="nav-language-slot">
              ${renderLanguageSwitcher(locale, 'eye-health', uiDictionary)}
            </div>
            <a href="${appointmentUrl}" class="nav-cta">${escapeHtml(t('Randevu Al'))}</a>
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
  const { hero } = EYE_HEALTH_PAGE;
  return `
    <section class="eh-hero" aria-labelledby="eh-hero-title">
      <div class="eh-hero-media">
        <img src="${hero.image}" alt="${escapeHtml(hero.imageAlt)}" width="1536" height="1024" fetchpriority="high" decoding="async" />
      </div>
      <div class="eh-hero-panel-wrap">
        <div class="container eh-hero-panel">
          <span class="eh-hero-tag">${escapeHtml(hero.tag)}</span>
          <h1 id="eh-hero-title">${escapeHtml(hero.title)}</h1>
          <p>${escapeHtml(hero.description)}</p>
          <a href="${appointmentUrl}" class="btn btn-gold">${escapeHtml(hero.cta)}</a>
        </div>
      </div>
    </section>
  `;
}

function renderProcess() {
  return `
    <section class="eh-section eh-section-soft" aria-labelledby="eh-process-title">
      <div class="container">
        <div class="eh-section-head">
          <h2 id="eh-process-title">${escapeHtml(eyeNav.processTitle)}</h2>
        </div>
        <div class="eh-process-grid">
          ${EYE_HEALTH_PAGE.process
            .map(
              (step, index) => `
            <article class="eh-process-card">
              <span dir="ltr">${String(index + 1).padStart(2, '0')}</span>
              <h3>${escapeHtml(step.title)}</h3>
              <p>${escapeHtml(step.description)}</p>
            </article>
          `,
            )
            .join('')}
        </div>
      </div>
    </section>
  `;
}

function renderDoctor() {
  const { doctor } = EYE_HEALTH_PAGE;
  return `
    <section class="eh-section" aria-labelledby="eh-doctor-title">
      <div class="container">
        <div class="eh-section-head">
          <h2 id="eh-doctor-title">${escapeHtml(doctor.sectionTitle)}</h2>
        </div>
        <article class="eh-doctor-card">
          <figure class="eh-doctor-photo">
            <img src="${doctor.image}" alt="${escapeHtml(doctor.imageAlt)}" width="1086" height="1448" loading="lazy" decoding="async" />
          </figure>
          <div class="eh-doctor-content">
            <h3>${escapeHtml(doctor.name)}</h3>
            <p class="eh-doctor-role">${escapeHtml(doctor.role)}</p>
            <p>${escapeHtml(doctor.description)}</p>
            <a href="${appointmentUrl}" class="btn btn-gold">${escapeHtml(doctor.cta)}</a>
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderCategories() {
  const { categoriesIntro } = EYE_HEALTH_PAGE;
  return `
    <section class="eh-section eh-section-soft" aria-labelledby="eh-categories-title">
      <div class="container">
        <div class="eh-section-head">
          <h2 id="eh-categories-title">${escapeHtml(categoriesIntro.title)}</h2>
          <p>${escapeHtml(categoriesIntro.description)}</p>
        </div>
        <div class="eh-category-grid">
          ${EYE_HEALTH_CATEGORIES.map((category) => renderCategoryCard(category)).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderCategoryCard(category) {
  return `
    <article class="eh-category-card" id="${escapeHtml(category.id)}">
      ${renderCategoryEyeImage(category.icon)}
      <h3>${escapeHtml(category.title)}</h3>
      <div class="eh-topic-list">
        ${category.topics
          .map((topic, index) => {
            const panelId = `${category.id}-topic-${index}`;
            return `
              <div class="eh-topic-item">
                <button
                  type="button"
                  class="eh-topic-toggle"
                  aria-expanded="false"
                  aria-controls="${panelId}"
                  data-topic-toggle
                >
                  <span>${escapeHtml(topic.title)}</span>
                  <svg width="12" height="8" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1l5 5 5-5" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>
                </button>
                <div class="eh-topic-panel" id="${panelId}" hidden>
                  <div class="eh-topic-panel-inner">
                    <p>${escapeHtml(topic.description)}</p>
                    <a href="${appointmentUrl}">${escapeHtml(eyeNav.topicCta)}</a>
                  </div>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    </article>
  `;
}

function renderClosingCta() {
  const { closingCta } = EYE_HEALTH_PAGE;
  return `
    <section class="eh-closing" aria-labelledby="eh-closing-title">
      <div class="container">
        <h2 id="eh-closing-title">${escapeHtml(closingCta.title)}</h2>
        <p>${escapeHtml(closingCta.description)}</p>
        <a href="${appointmentUrl}" class="btn btn-gold">${escapeHtml(closingCta.cta)}</a>
      </div>
    </section>
  `;
}

function renderPage() {
  document.title = EYE_HEALTH_PAGE.title;

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', EYE_HEALTH_PAGE.description);
  }
  applySeoLinks(locale, 'eye-health');

  app.innerHTML = `
    ${renderSkipLink()}
    ${renderHeader()}
    <div class="eh-page" id="main-content" tabindex="-1">
      ${renderHero()}
      ${renderProcess()}
      ${renderDoctor()}
      ${renderCategories()}
      ${renderClosingCta()}
    </div>
  `;
}

function initTopicAccordions() {
  const toggles = [...document.querySelectorAll('[data-topic-toggle]')];

  const closePanel = (toggle) => {
    const panel = document.getElementById(toggle.getAttribute('aria-controls'));
    toggle.setAttribute('aria-expanded', 'false');
    panel?.classList.remove('is-open');
    panel?.style.setProperty('max-height', '0px');
    panel?.setAttribute('hidden', '');
  };

  const openPanel = (toggle) => {
    const panel = document.getElementById(toggle.getAttribute('aria-controls'));
    if (!panel) return;
    toggle.setAttribute('aria-expanded', 'true');
    panel.removeAttribute('hidden');
    panel.classList.add('is-open');
    panel.style.maxHeight = `${panel.scrollHeight}px`;
  };

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggles.forEach((other) => {
        if (other !== toggle) closePanel(other);
      });
      if (isOpen) {
        closePanel(toggle);
      } else {
        openPanel(toggle);
      }
    });
  });
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

function bootstrapEyeHealthPage() {
  normalizeEyeHealthLandingHash();
  renderPage();
  initSkipLink();
  initCustomCursor();
  initSiteHeader(document, { trackScroll: true });
  initLanguageSwitchers();
  initTopicAccordions();
}

bootstrapEyeHealthPage();
