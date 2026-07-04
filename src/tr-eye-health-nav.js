const CHEVRON = '<svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>';

function eyeHealthMegaColumns() {
  return `
    <div class="mega-col">
      <h4>Göz Muayenesi ve Genel Göz Sağlığı</h4>
      <a href="/tr/goz-hastaliklari.html#goz-muayenesi-genel-saglik">Göz Muayenesi</a>
      <a href="/tr/goz-hastaliklari.html#goz-muayenesi-genel-saglik">Konjonktivit</a>
      <a href="/tr/goz-hastaliklari.html#goz-muayenesi-genel-saglik">Arpacık</a>
      <a href="/tr/goz-hastaliklari.html#goz-muayenesi-genel-saglik">Şalazyon</a>
    </div>
    <div class="mega-col">
      <h4>Göz Kusurları ve Lazer Uygulamaları</h4>
      <a href="/tr/goz-hastaliklari.html#goz-kusurlari-ve-lazer">Göz Çizdirme</a>
      <a href="/tr/goz-hastaliklari.html#goz-kusurlari-ve-lazer">Miyop</a>
      <a href="/tr/goz-hastaliklari.html#goz-kusurlari-ve-lazer">Astigmat</a>
      <a href="/tr/goz-hastaliklari.html#goz-kusurlari-ve-lazer">Hipermetrop</a>
    </div>
    <div class="mega-col">
      <h4>Katarakt ve Göz İçi Mercekler</h4>
      <a href="/tr/goz-hastaliklari.html#katarakt-ve-goz-ici-mercekler">Katarakt Nedir?</a>
      <a href="/tr/goz-hastaliklari.html#katarakt-ve-goz-ici-mercekler">Katarakt Ameliyatı</a>
      <a href="/tr/goz-hastaliklari.html#katarakt-ve-goz-ici-mercekler">Göz İçi Mercek</a>
      <a href="/tr/goz-hastaliklari.html#katarakt-ve-goz-ici-mercekler">Trifokal Mercek</a>
    </div>
    <div class="mega-col">
      <h4>Retina ve Göz İçi Hastalıklar</h4>
      <a href="/tr/goz-hastaliklari.html#retina-ve-goz-ici-hastaliklar">Sarı Nokta Hastalığı</a>
      <a href="/tr/goz-hastaliklari.html#retina-ve-goz-ici-hastaliklar">Retina</a>
      <a href="/tr/goz-hastaliklari.html#retina-ve-goz-ici-hastaliklar">Üveit</a>
    </div>
    <div class="mega-col">
      <h4>Göz Kapağı ve Orbita</h4>
      <a href="/tr/goz-hastaliklari.html#goz-kapagi-ve-orbita">Göz Kapağı Düşüklüğü</a>
      <a href="/tr/goz-hastaliklari.html#goz-kapagi-ve-orbita">Göz Kapağı Estetiği</a>
      <a href="/tr/goz-hastaliklari.html#goz-kapagi-ve-orbita">Orbita Cerrahisi</a>
    </div>
    <div class="mega-col">
      <h4>Diğer Göz Tedavileri</h4>
      <a href="/tr/goz-hastaliklari.html#diger-goz-tedavileri">Göz Ameliyatı</a>
      <a href="/tr/goz-hastaliklari.html#diger-goz-tedavileri">Göz Kayması</a>
    </div>
  `;
}

export function renderEyeHealthNavItem({ pagePath = '/tr/goz-hastaliklari.html' } = {}) {
  const dropdownId = 'eye-health-mega-menu';
  const prefix = pagePath.includes('#') ? pagePath.split('#')[0] : pagePath;
  const columns = eyeHealthMegaColumns().replaceAll('/tr/goz-hastaliklari.html', prefix);

  return `
    <li class="has-dropdown" data-tr-only-nav data-eye-health-nav>
      <a
        href="${pagePath}"
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
