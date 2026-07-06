import './style.css';
import './legal-department.css';
import { initCustomCursor } from './cursor.js';
import { initSiteHeader, renderMobileCategoryTrigger } from './public-header.js';
import { desktopMenuIdForCategory } from './nav-shared.js';
import { renderEyeHealthNavItem } from './tr-eye-health-nav.js';
import { appendFinanceNavLink } from './tr-finance-nav.js';
import { appendArgeNavItem } from './tr-arge-nav.js';
import { loadEyeHealthContent } from './eye-health-content.js';
import { loadLegalContent } from './legal-content.js';
import { detectLegalLocale } from './legal-routes.js';
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

const app = document.getElementById('legal-app');
const pathLocale = detectLegalLocale();
const locale = getCurrentLocale('legal');
const legalLocale = pathLocale || locale;
const [catalog, uiDictionary, eyeContent, legalContent] = await Promise.all([
  loadContentCatalog(locale),
  loadUiDictionary(locale),
  loadEyeHealthContent(locale),
  loadLegalContent(legalLocale),
]);
const { page } = legalContent;
const categoryGroups = buildCategoryGroups(catalog, uiDictionary, locale);
const t = (source) => translate(uiDictionary, source);
const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

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
              ${renderLanguageSwitcher(locale, 'legal', uiDictionary)}
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
  const heroImage = page.hero.image || '/images/legal_department/legal_hero.png';
  return `
    <section class="ld-hero" style="--ld-hero-image: url('${heroImage}')" aria-labelledby="ld-hero-title">
      <div class="ld-hero-panel-wrap">
        <div class="container ld-hero-panel">
          <span class="ld-hero-tag">${escapeHtml(page.hero.tag)}</span>
          <h1 id="ld-hero-title">${escapeHtml(page.hero.title)}</h1>
          <p>${escapeHtml(page.hero.description)}</p>
          <a href="#legal_contact" class="btn btn-gold">${escapeHtml(page.hero.cta)}</a>
        </div>
      </div>
    </section>
  `;
}

function renderProfiles() {
  return `
    <section class="ld-section ld-section-soft" aria-labelledby="ld-profiles-title">
      <div class="container">
        <div class="ld-section-head">
          <h2 id="ld-profiles-title">${escapeHtml(page.profiles.title)}</h2>
          <p>${escapeHtml(page.profiles.description)}</p>
        </div>
        <div class="ld-profile-grid">
          ${page.profiles.people
            .map(
              (person) => `
          <article class="ld-profile-card">
            <div class="ld-profile-photo">
              <img src="${person.image}" alt="${escapeHtml(person.imageAlt)}" width="160" height="200" loading="lazy" decoding="async" />
            </div>
            <div>
              <span class="ld-profile-role">${escapeHtml(person.role)}</span>
              <h3>${escapeHtml(person.name)}</h3>
              <p>${escapeHtml(person.description)}</p>
            </div>
          </article>
          `,
            )
            .join('')}
        </div>
      </div>
    </section>
  `;
}

function renderSupportAreas() {
  return `
    <section class="ld-section" aria-labelledby="ld-support-title">
      <div class="container">
        <div class="ld-section-head">
          <h2 id="ld-support-title">${escapeHtml(page.support.title)}</h2>
        </div>
        <div class="ld-support-grid">
          ${page.support.cards
            .map(
              (card) => `
            <article class="ld-card">
              <h3>${escapeHtml(card.title)}</h3>
              <p>${escapeHtml(card.text)}</p>
            </article>
          `,
            )
            .join('')}
        </div>
      </div>
    </section>
  `;
}

function renderProcess() {
  return `
    <section class="ld-section ld-section-soft" aria-labelledby="ld-process-title">
      <div class="container">
        <div class="ld-section-head">
          <h2 id="ld-process-title">${escapeHtml(page.process.title)}</h2>
        </div>
        <div class="ld-process-grid">
          ${page.process.steps
            .map(
              (step) => `
            <article class="ld-card ld-process-step">
              <span class="ld-process-num">${step.num} — ${escapeHtml(step.title)}</span>
              <p>${escapeHtml(step.text)}</p>
            </article>
          `,
            )
            .join('')}
        </div>
      </div>
    </section>
  `;
}

function renderSecuritySection() {
  return `
    <section class="ld-section" aria-labelledby="ld-security-title">
      <div class="container ld-security-copy">
        <div class="ld-section-head">
          <h2 id="ld-security-title">${escapeHtml(page.security.title)}</h2>
        </div>
        <p>${escapeHtml(page.security.description)}</p>
      </div>
    </section>
  `;
}

function renderContactForm() {
  const { fields, topics } = page.contact;
  return `
    <section class="ld-section ld-form-section" id="legal_contact" aria-labelledby="ld-form-title">
      <div class="container">
        <div class="ld-section-head">
          <h2 id="ld-form-title">${escapeHtml(page.contact.title)}</h2>
          <p>${escapeHtml(page.contact.description)}</p>
        </div>
        <div class="ld-form-wrap">
          <form id="legal-preview-form" class="ld-form-grid" novalidate>
            <div class="ld-form-row">
              <label for="legal-name">${escapeHtml(fields.name)}</label>
              <input id="legal-name" name="name" type="text" autocomplete="name" required />
            </div>
            <div class="ld-form-row">
              <label for="legal-phone">${escapeHtml(fields.phone)}</label>
              <input id="legal-phone" name="phone" type="tel" autocomplete="tel" required />
            </div>
            <div class="ld-form-row">
              <label for="legal-email">${escapeHtml(fields.email)}</label>
              <input id="legal-email" name="email" type="email" autocomplete="email" required />
            </div>
            <div class="ld-form-row">
              <label for="legal-topic">${escapeHtml(fields.topic)}</label>
              <select id="legal-topic" name="topic" required>
                <option value="">${escapeHtml(fields.topicPlaceholder)}</option>
                ${topics.map((topic) => `<option>${escapeHtml(topic)}</option>`).join('')}
              </select>
            </div>
            <div class="ld-form-row">
              <label for="legal-message">${escapeHtml(fields.message)}</label>
              <textarea id="legal-message" name="message" required></textarea>
            </div>
            <div class="ld-form-actions">
              <button type="submit" class="btn btn-gold">${escapeHtml(fields.submit)}</button>
            </div>
            <p id="legal-form-status" class="ld-form-status" aria-live="polite"></p>
          </form>
        </div>
      </div>
    </section>
  `;
}

function renderClosingCta() {
  return `
    <section class="ld-section ld-closing-cta" aria-labelledby="ld-closing-title">
      <div class="container">
        <h2 id="ld-closing-title">${escapeHtml(page.closing.title)}</h2>
        <p>${escapeHtml(page.closing.description)}</p>
        <a href="#legal_contact" class="btn btn-gold">${escapeHtml(page.closing.cta)}</a>
      </div>
    </section>
  `;
}

function renderPage() {
  document.title = page.title;
  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) descriptionMeta.setAttribute('content', page.description);
  applySeoLinks(locale, 'home');

  app.innerHTML = `
    ${renderSkipLink()}
    ${renderHeader()}
    <div class="ld-page" id="main-content" tabindex="-1">
      ${renderHero()}
      ${renderProfiles()}
      ${renderSupportAreas()}
      ${renderProcess()}
      ${renderSecuritySection()}
      ${renderContactForm()}
      ${renderClosingCta()}
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

function initSmoothScroll() {
  const header = document.getElementById('main-header');

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || !targetId.startsWith('#') || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      event.preventDefault();
      const headerHeight = header?.offsetHeight || 0;
      window.scrollTo({
        top: targetEl.offsetTop - headerHeight,
        behavior: prefersReducedMotionQuery.matches ? 'auto' : 'smooth',
      });
    });
  });
}

function initPreviewForm() {
  const form = document.getElementById('legal-preview-form');
  const status = document.getElementById('legal-form-status');
  if (!form || !status) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.textContent = page.contact.previewMessage;
  });
}

function bootstrapLegalPage() {
  renderPage();
  initSkipLink();
  initCustomCursor();
  initSiteHeader(document, { trackScroll: true });
  initLanguageSwitchers();
  initSmoothScroll();
  initPreviewForm();
}

bootstrapLegalPage();
