import { EYE_HEALTH_CATEGORIES } from './eye-health-data.js';

export const EYE_HEALTH_LANDING_PATH = '/tr/goz-hastaliklari.html';

const CHEVRON = '<svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>';

function eyeHealthMegaColumns(landingPath = EYE_HEALTH_LANDING_PATH) {
  const url = landingPath;

  return `
    <div class="mega-col">
      <h4><a href="${url}">Göz Muayenesi ve Genel Göz Sağlığı</a></h4>
      <a href="${url}">Göz Muayenesi</a>
      <a href="${url}">Konjonktivit</a>
      <a href="${url}">Arpacık</a>
      <a href="${url}">Şalazyon</a>
    </div>
    <div class="mega-col">
      <h4><a href="${url}">Göz Kusurları ve Lazer Uygulamaları</a></h4>
      <a href="${url}">Göz Çizdirme</a>
      <a href="${url}">Miyop</a>
      <a href="${url}">Astigmat</a>
      <a href="${url}">Hipermetrop</a>
    </div>
    <div class="mega-col">
      <h4><a href="${url}">Katarakt ve Göz İçi Mercekler</a></h4>
      <a href="${url}">Katarakt Nedir?</a>
      <a href="${url}">Katarakt Ameliyatı</a>
      <a href="${url}">Göz İçi Mercek</a>
      <a href="${url}">Trifokal Mercek</a>
    </div>
    <div class="mega-col">
      <h4><a href="${url}">Retina ve Göz İçi Hastalıklar</a></h4>
      <a href="${url}">Sarı Nokta Hastalığı</a>
      <a href="${url}">Retina</a>
      <a href="${url}">Üveit</a>
    </div>
    <div class="mega-col">
      <h4><a href="${url}">Göz Kapağı ve Orbita</a></h4>
      <a href="${url}">Göz Kapağı Düşüklüğü</a>
      <a href="${url}">Göz Kapağı Estetiği</a>
      <a href="${url}">Orbita Cerrahisi</a>
    </div>
    <div class="mega-col">
      <h4><a href="${url}">Diğer Göz Tedavileri</a></h4>
      <a href="${url}">Göz Ameliyatı</a>
      <a href="${url}">Göz Kayması</a>
    </div>
  `;
}

function eyeHealthMobileGroups(landingPath = EYE_HEALTH_LANDING_PATH) {
  return EYE_HEALTH_CATEGORIES.map(
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
  ).join('');
}

export function renderEyeHealthNavItem({ pagePath = EYE_HEALTH_LANDING_PATH } = {}) {
  const dropdownId = 'eye-health-mega-menu';
  const landingPath = pagePath.split('#')[0] || EYE_HEALTH_LANDING_PATH;

  return `
    <li class="has-dropdown" data-tr-only-nav data-eye-health-nav>
      <div class="eh-nav-item-head">
        <a href="${landingPath}" class="eh-nav-primary-link" id="eye-health-nav-link">Göz Hastalıkları</a>
        <button
          type="button"
          class="eh-nav-toggle"
          id="eye-health-nav-trigger"
          aria-expanded="false"
          aria-controls="${dropdownId}"
          aria-label="Göz Hastalıkları alt menüsünü aç"
        >${CHEVRON}</button>
      </div>
      <div class="mega-dropdown eh-mega-dropdown" id="${dropdownId}" role="region" aria-label="Göz Hastalıkları menüsü">
        <div class="eh-desktop-mega">
          ${eyeHealthMegaColumns(landingPath)}
        </div>
        <div class="eh-mobile-mega">
          ${eyeHealthMobileGroups(landingPath)}
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

export function normalizeEyeHealthLandingHash() {
  const onEyeHealthPage = /\/goz-hastaliklari\.html$/i.test(window.location.pathname);
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

function setDesktopEyeMegaOpen(navRoot, isOpen) {
  if (window.innerWidth <= 1360) return;

  const toggle = navRoot.querySelector('.eh-nav-toggle');
  const dropdown = navRoot.querySelector('.mega-dropdown');

  navRoot.classList.toggle('open', isOpen);
  toggle?.setAttribute('aria-expanded', String(isOpen));

  if (isOpen) {
    dropdown?.removeAttribute('hidden');
    return;
  }

  dropdown?.removeAttribute('hidden');
}

export function initEyeHealthNavBehavior(root = document) {
  const navRoot = root.querySelector('[data-eye-health-nav]');
  if (!navRoot) return;

  const toggle = navRoot.querySelector('.eh-nav-toggle');
  const dropdown = navRoot.querySelector('.mega-dropdown');
  const primaryLink = navRoot.querySelector('.eh-nav-primary-link');

  toggle?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (window.innerWidth <= 1360) {
      const willOpen = !navRoot.classList.contains('open');
      if (!willOpen) {
        closeEyeHealthTopLevel(navRoot);
        return;
      }
      navRoot.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      closeEyeHealthMobileGroups(navRoot);
      return;
    }

    const willOpen = !navRoot.classList.contains('open');
    root.querySelectorAll('[data-eye-health-nav].has-dropdown.open').forEach((item) => {
      if (item === navRoot) return;
      item.classList.remove('open');
      item.querySelector('.eh-nav-toggle')?.setAttribute('aria-expanded', 'false');
    });
    navRoot.classList.toggle('open', willOpen);
    toggle.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) {
      dropdown?.removeAttribute('hidden');
    }
  });

  navRoot.addEventListener('mouseenter', () => {
    if (window.innerWidth <= 1360) return;
    setDesktopEyeMegaOpen(navRoot, true);
  });

  navRoot.addEventListener('mouseleave', (event) => {
    if (window.innerWidth <= 1360) return;
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && navRoot.contains(nextTarget)) return;
    setDesktopEyeMegaOpen(navRoot, false);
  });

  navRoot.querySelectorAll('.eh-mobile-group-toggle').forEach((groupToggle) => {
    groupToggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (window.innerWidth > 1360) return;

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

  navRoot.querySelectorAll(`a[href="${EYE_HEALTH_LANDING_PATH}"], a[href$="/goz-hastaliklari.html"]`).forEach((link) => {
    if (link.classList.contains('eh-nav-primary-link')) return;

    link.addEventListener('click', () => {
      if (window.innerWidth <= 1360) {
        closeEyeHealthTopLevel(navRoot);
        root.querySelector('#main-header')?.querySelector('.nav-menu')?.classList.remove('active');
        root.querySelector('#hamburger')?.classList.remove('active');
        root.querySelector('#hamburger')?.setAttribute('aria-expanded', 'false');
      }

      if (!/\/goz-hastaliklari\.html$/i.test(window.location.pathname)) return;

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
    if (/\/goz-hastaliklari\.html$/i.test(window.location.pathname)) {
      event.preventDefault();
      normalizeEyeHealthLandingHash();
      window.scrollTo(0, 0);
    }
  });
}
