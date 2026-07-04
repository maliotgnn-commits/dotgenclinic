export const EYE_HEALTH_LANDING_PATH = '/tr/goz-hastaliklari.html';

const CHEVRON = '<svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>';

function eyeHealthMegaColumns() {
  const url = EYE_HEALTH_LANDING_PATH;

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

export function renderEyeHealthNavItem({ pagePath = EYE_HEALTH_LANDING_PATH } = {}) {
  const dropdownId = 'eye-health-mega-menu';
  const landingPath = pagePath.split('#')[0] || EYE_HEALTH_LANDING_PATH;
  const columns = eyeHealthMegaColumns().replaceAll(EYE_HEALTH_LANDING_PATH, landingPath);

  return `
    <li class="has-dropdown" data-tr-only-nav data-eye-health-nav>
      <a
        href="${landingPath}"
        aria-haspopup="true"
        aria-expanded="false"
        aria-controls="${dropdownId}"
        id="eye-health-nav-trigger"
      >Göz Hastalıkları ${CHEVRON}</a>
      <div class="mega-dropdown eh-mega-dropdown" id="${dropdownId}" role="region" aria-label="Göz Hastalıkları menüsü">
        ${columns}
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

export function initEyeHealthNavLinks(root = document) {
  const navRoot = root.querySelector('[data-eye-health-nav]');
  if (!navRoot) return;

  navRoot.querySelectorAll(`a[href="${EYE_HEALTH_LANDING_PATH}"], a[href$="/goz-hastaliklari.html"]`).forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!/\/goz-hastaliklari\.html$/i.test(window.location.pathname)) return;

      event.preventDefault();
      normalizeEyeHealthLandingHash();
      window.scrollTo(0, 0);

      root.querySelectorAll('[data-topic-toggle][aria-expanded="true"]').forEach((toggle) => {
        toggle.setAttribute('aria-expanded', 'false');
        const panel = document.getElementById(toggle.getAttribute('aria-controls'));
        panel?.classList.remove('is-open');
        panel?.style.setProperty('max-height', '0px');
        panel?.setAttribute('hidden', '');
      });
    });
  });
}
