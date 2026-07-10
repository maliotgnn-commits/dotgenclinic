import './style.css';
import './finance-department.css';
import { initCustomCursor } from './cursor.js';
import { initSiteHeader, renderMobileCategoryTrigger, renderNavChevron } from './public-header.js';
import { desktopMenuIdForCategory, insertNavItemBeforeDesktopMenuId } from './nav-shared.js';
import { renderEyeHealthNavItem } from './tr-eye-health-nav.js';
import { appendFinanceNavLink } from './tr-finance-nav.js';
import { appendArgeNavItem } from './tr-arge-nav.js';
import { loadEyeHealthContent } from './eye-health-content.js';
import { loadFinanceContent } from './finance-content.js';
import { detectFinanceLocale } from './finance-routes.js';
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

const app = document.getElementById('finance-app');
const pathLocale = detectFinanceLocale();
const locale = getCurrentLocale('finance');
const financeLocale = pathLocale || locale;
const [catalog, uiDictionary, eyeContent, financeContent] = await Promise.all([
  loadContentCatalog(locale),
  loadUiDictionary(locale),
  loadEyeHealthContent(locale),
  loadFinanceContent(financeLocale),
]);
const { page } = financeContent;
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
              ${renderLanguageSwitcher(locale, 'finance', uiDictionary)}
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
  return `
    <section class="fd-hero" aria-labelledby="fd-hero-title">
      <div class="fd-hero-panel-wrap">
        <div class="container fd-hero-panel">
          <span class="fd-hero-tag">${escapeHtml(page.hero.tag)}</span>
          <h1 id="fd-hero-title">${escapeHtml(page.hero.title)}</h1>
          <p>${escapeHtml(page.hero.description)}</p>
          <a href="#finance_contact" class="btn btn-gold">${escapeHtml(page.hero.cta)}</a>
        </div>
      </div>
    </section>
  `;
}

function renderProfiles() {
  return `
    <section class="fd-section fd-section-soft" aria-labelledby="fd-profiles-title">
      <div class="container">
        <div class="fd-section-head">
          <h2 id="fd-profiles-title">${escapeHtml(page.profiles.title)}</h2>
          <p>${escapeHtml(page.profiles.description)}</p>
        </div>
        <div class="fd-profile-grid">
          ${page.profiles.people
            .map(
              (person) => `
          <article class="fd-profile-card">
            <div class="fd-profile-photo">
              <img src="${person.image}" alt="${escapeHtml(person.imageAlt)}" width="160" height="200" loading="lazy" decoding="async" />
            </div>
            <div>
              <span class="fd-profile-role">${escapeHtml(person.role)}</span>
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

function renderTourismSection() {
  return `
    <section class="fd-section" aria-labelledby="fd-tourism-title">
      <div class="container fd-tourism-grid">
        <div class="fd-tourism-copy">
          <div class="fd-section-head">
            <h2 id="fd-tourism-title">${escapeHtml(page.tourism.title)}</h2>
          </div>
          <p>${escapeHtml(page.tourism.description)}</p>
          <p class="fd-note">${escapeHtml(page.tourism.note)}</p>
        </div>
        <aside class="fd-highlight-card" aria-labelledby="fd-highlight-title">
          <h3 id="fd-highlight-title">${escapeHtml(page.tourism.highlight.title)}</h3>
          <p>${escapeHtml(page.tourism.highlight.description)}</p>
        </aside>
      </div>
    </section>
  `;
}

function renderSupportAreas() {
  return `
    <section class="fd-section fd-section-soft" aria-labelledby="fd-support-title">
      <div class="container">
        <div class="fd-section-head">
          <h2 id="fd-support-title">${escapeHtml(page.support.title)}</h2>
        </div>
        <div class="fd-support-grid">
          ${page.support.cards
            .map(
              (card) => `
            <article class="fd-card">
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
    <section class="fd-section" aria-labelledby="fd-process-title">
      <div class="container">
        <div class="fd-section-head">
          <h2 id="fd-process-title">${escapeHtml(page.process.title)}</h2>
        </div>
        <div class="fd-process-grid">
          ${page.process.steps
            .map(
              (step) => `
            <article class="fd-card fd-process-step">
              <span class="fd-process-num">${step.num} — ${escapeHtml(step.title)}</span>
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
    <section class="fd-section fd-section-soft" aria-labelledby="fd-security-title">
      <div class="container fd-security-copy">
        <div class="fd-section-head">
          <h2 id="fd-security-title">${escapeHtml(page.security.title)}</h2>
        </div>
        <p>${escapeHtml(page.security.description)}</p>
      </div>
    </section>
  `;
}

function renderContactForm() {
  const { fields, topics } = page.contact;
  return `
    <section class="fd-section fd-form-section" id="finance_contact" aria-labelledby="fd-form-title">
      <div class="container">
        <div class="fd-section-head">
          <h2 id="fd-form-title">${escapeHtml(page.contact.title)}</h2>
          <p>${escapeHtml(page.contact.description)}</p>
        </div>
        <div class="fd-form-wrap">
          <form id="finance-preview-form" class="fd-form-grid" novalidate>
            <div class="fd-form-row">
              <label for="finance-name">${escapeHtml(fields.name)}</label>
              <input id="finance-name" name="name" type="text" autocomplete="name" required />
            </div>
            <div class="fd-form-row">
              <label for="finance-phone">${escapeHtml(fields.phone)}</label>
              <input id="finance-phone" name="phone" type="tel" autocomplete="tel" required />
            </div>
            <div class="fd-form-row">
              <label for="finance-email">${escapeHtml(fields.email)}</label>
              <input id="finance-email" name="email" type="email" autocomplete="email" required />
            </div>
            <div class="fd-form-row">
              <label for="finance-topic">${escapeHtml(fields.topic)}</label>
              <select id="finance-topic" name="topic" required>
                <option value="">${escapeHtml(fields.topicPlaceholder)}</option>
                ${topics.map((topic) => `<option>${escapeHtml(topic)}</option>`).join('')}
              </select>
            </div>
            <div class="fd-form-row">
              <label for="finance-message">${escapeHtml(fields.message)}</label>
              <textarea id="finance-message" name="message" required></textarea>
            </div>
            <div class="fd-form-actions">
              <button type="submit" class="btn btn-gold">${escapeHtml(fields.submit)}</button>
            </div>
            <p id="finance-form-status" class="fd-form-status" aria-live="polite"></p>
          </form>
        </div>
      </div>
    </section>
  `;
}

function renderClosingCta() {
  return `
    <section class="fd-section fd-closing-cta" aria-labelledby="fd-closing-title">
      <div class="container">
        <h2 id="fd-closing-title">${escapeHtml(page.closing.title)}</h2>
        <p>${escapeHtml(page.closing.description)}</p>
        <a href="#finance_contact" class="btn btn-gold">${escapeHtml(page.closing.cta)}</a>
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
    <div class="fd-page" id="main-content" tabindex="-1">
      ${renderHero()}
      ${renderProfiles()}
      ${renderTourismSection()}
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
  const form = document.getElementById('finance-preview-form');
  const status = document.getElementById('finance-form-status');
  if (!form || !status) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.textContent = page.contact.previewMessage;
  });
}

function bootstrapFinancePage() {
  renderPage();
  initSkipLink();
  initCustomCursor();
  initSiteHeader(document, { trackScroll: true });
  initLanguageSwitchers();
  initAnalyticsTracking(() => locale);
  initSmoothScroll();
  initPreviewForm();
}

bootstrapFinancePage();
