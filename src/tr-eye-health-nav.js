import { buildTrEyeHealthContent } from './eye-health-content.js';
import { eyeHealthHeaderNavLabelForLocale, eyeHealthPathForLocale } from './eye-health-routes.js';
import { NAV_CHEVRON_SVG } from './nav-shared.js';

export const EYE_HEALTH_LANDING_PATH = '/tr/goz-hastaliklari.html';

const CHEVRON = NAV_CHEVRON_SVG;

function eyeHealthMegaColumns(categories, landingPath) {
  const url = landingPath;

  return categories
    .map(
      (category) => `
    <div class="mega-col">
      <h4><a href="${url}">${category.title}</a></h4>
      ${category.topics.map((topic) => `<a href="${url}">${topic.title}</a>`).join('')}
    </div>
  `,
    )
    .join('');
}

function eyeHealthMobileGroups(categories, landingPath) {
  return categories
    .map(
      (category, index) => `
      <div class="eh-mobile-group">
        <button
          type="button"
          class="eh-mobile-group-toggle"
          id="eh-mobile-group-toggle-${index}"
          aria-expanded="false"
          aria-controls="eh-mobile-group-panel-${index}"
        >${category.title}</button>
        <div class="eh-mobile-topics" id="eh-mobile-group-panel-${index}" hidden>
          ${category.topics
            .map((topic) => `<a href="${landingPath}">${topic.title}</a>`)
            .join('')}
        </div>
      </div>
    `,
    )
    .join('');
}

export function renderEyeHealthNavItem({ locale = 'tr', pagePath, content } = {}) {
  const eyeContent = content || buildTrEyeHealthContent();
  const { categories, nav } = eyeContent;
  const landingPath = (pagePath || eyeHealthPathForLocale(locale)).split('#')[0];
  const headerLabel = nav.headerNavLabel || eyeHealthHeaderNavLabelForLocale(locale);
  const fullNavLabel = nav.menuLabel;
  const dropdownId = 'eye-health-mega-menu';
  const trOnlyAttr = locale === 'tr' ? ' data-tr-only-nav' : '';

  return `
    <li class="has-dropdown"${trOnlyAttr} data-eye-health-nav>
      <button
        type="button"
        class="mobile-nav-trigger eh-mobile-nav-trigger"
        aria-expanded="false"
        aria-controls="${dropdownId}"
        aria-label="${fullNavLabel}"
      >
        <span class="mobile-nav-label">${headerLabel}</span>
        ${CHEVRON}
      </button>
      <div class="eh-nav-item-head">
        <a href="${landingPath}" class="eh-nav-primary-link" id="eye-health-nav-link" aria-label="${fullNavLabel}">${headerLabel}</a>
        <button
          type="button"
          class="eh-nav-toggle"
          id="eye-health-nav-trigger"
          aria-expanded="false"
          aria-controls="${dropdownId}"
          aria-label="${nav.toggleAriaLabel}"
        >${CHEVRON}</button>
      </div>
      <div class="mega-dropdown eh-mega-dropdown" id="${dropdownId}" role="region" aria-label="${nav.submenuAriaLabel}">
        <div class="eh-desktop-mega">
          ${eyeHealthMegaColumns(categories, landingPath)}
        </div>
        <div class="eh-mobile-mega">
          ${eyeHealthMobileGroups(categories, landingPath)}
        </div>
      </div>
    </li>
  `;
}

export function stripTrOnlyNav(html) {
  return html.replace(/<li\b[^>]*\bdata-tr-only-nav\b[^>]*>[\s\S]*?<\/li>/gi, '');
}

export function extractEyeHealthNavBlock(html) {
  const match = html.match(/<li\b[^>]*\bdata-eye-health-nav\b[^>]*>[\s\S]*?<\/li>/i);
  return match?.[0] ?? '';
}

export function upgradeLocalizedEyeHealthNav(navMenu, locale, content) {
  if (!navMenu || locale === 'tr') return false;

  const trOnlyItem = navMenu.querySelector('li[data-eye-health-nav][data-tr-only-nav]');
  if (!trOnlyItem) return false;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = renderEyeHealthNavItem({ locale, content }).trim();
  const newItem = wrapper.firstElementChild;
  if (!newItem) return false;

  trOnlyItem.replaceWith(newItem);
  return true;
}

export function injectEyeHealthNavForLocale(html, locale, content) {
  if (locale === 'tr') return html;
  const stripped = stripTrOnlyNav(html);
  const navBlock = renderEyeHealthNavItem({ locale, content });
  return stripped.replace(
    /(<ul class="nav-menu" id="nav-menu">[\s\S]*?)(\s*<\/ul>)/,
    `$1\n            ${navBlock}$2`,
  );
}

export function normalizeEyeHealthLandingHash() {
  const onEyeHealthPage = /\/goz-hastaliklari\.html$|\/eye-health\.html$|\/salud-ocular\.html$|\/sante-oculaire\.html$|\/salute-oculare\.html$|\/augengesundheit\.html$|\/[\u0600-\u06FF\u0400-\u04FF-]+\.html$/i.test(
    window.location.pathname,
  );
  if (!onEyeHealthPage || !window.location.hash) return false;

  const cleanUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(window.history.state, '', cleanUrl);
  window.scrollTo(0, 0);
  return true;
}

function closeEyeHealthMobileGroups(navRoot) {
  navRoot.querySelectorAll('.eh-mobile-group').forEach((group) => {
    group.classList.remove('open');
    const toggle = group.querySelector('.eh-mobile-group-toggle');
    const panel = group.querySelector('.eh-mobile-topics');
    toggle?.setAttribute('aria-expanded', 'false');
    panel?.setAttribute('hidden', '');
  });
}

function closeEyeHealthTopLevel(navRoot) {
  navRoot.classList.remove('open');
  navRoot.querySelector('.eh-nav-toggle')?.setAttribute('aria-expanded', 'false');
  closeEyeHealthMobileGroups(navRoot);
}

export function initEyeHealthNavBehavior(root = document) {
  const navRoot = root.querySelector('[data-eye-health-nav]');
  if (!navRoot) return;

  const primaryLink = navRoot.querySelector('.eh-nav-primary-link');

  navRoot.querySelectorAll('.eh-mobile-group-toggle').forEach((groupToggle) => {
    groupToggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (window.innerWidth > 1280) return;

      const group = groupToggle.closest('.eh-mobile-group');
      const panel = document.getElementById(groupToggle.getAttribute('aria-controls'));
      const willOpen = !group?.classList.contains('open');

      closeEyeHealthMobileGroups(navRoot);
      if (willOpen && group && panel) {
        group.classList.add('open');
        groupToggle.setAttribute('aria-expanded', 'true');
        panel.removeAttribute('hidden');
      }
    });
  });

  const landingHref = primaryLink?.getAttribute('href') || EYE_HEALTH_LANDING_PATH;

  navRoot.querySelectorAll(`a[href="${landingHref}"]`).forEach((link) => {
    if (link.classList.contains('eh-nav-primary-link')) return;

    link.addEventListener('click', () => {
      if (window.innerWidth <= 1280) {
        closeEyeHealthTopLevel(navRoot);
        root.querySelector('#nav-drawer')?.classList.remove('active');
        root.querySelector('#hamburger')?.classList.remove('active');
        root.querySelector('#hamburger')?.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('mobile-nav-open');
      }

      if (window.location.pathname !== landingHref.split('#')[0]) return;

      primaryLink?.click();
      normalizeEyeHealthLandingHash();
      window.scrollTo(0, 0);
      root.querySelectorAll('[data-topic-toggle][aria-expanded="true"]').forEach((topicToggle) => {
        topicToggle.setAttribute('aria-expanded', 'false');
        const panel = document.getElementById(topicToggle.getAttribute('aria-controls'));
        panel?.classList.remove('is-open');
        panel?.style.setProperty('max-height', '0px');
        panel?.setAttribute('hidden', '');
      });
    });
  });

  primaryLink?.addEventListener('click', (event) => {
    if (window.location.pathname === landingHref.split('#')[0]) {
      event.preventDefault();
      normalizeEyeHealthLandingHash();
      window.scrollTo(0, 0);
    }
  });
}
