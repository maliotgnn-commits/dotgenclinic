import './style.css';
import './finance-department.css';
import { initCustomCursor } from './cursor.js';
import { initSiteHeader, renderMobileCategoryTrigger, renderNavChevron } from './public-header.js';
import { desktopMenuIdForCategory } from './nav-shared.js';
import { renderEyeHealthNavItem } from './tr-eye-health-nav.js';
import { appendFinanceNavLinkIfTr } from './tr-finance-nav.js';
import { loadEyeHealthContent } from './eye-health-content.js';
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

const app = document.getElementById('finance-app');
const locale = 'tr';
const [catalog, uiDictionary, eyeContent] = await Promise.all([
  loadContentCatalog(locale),
  loadUiDictionary(locale),
  loadEyeHealthContent(locale),
]);
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
      const links = appendFinanceNavLinkIfTr(
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

  return `${serviceGroups}${renderEyeHealthNavItem({ locale, content: eyeContent })}`;
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
              ${renderLanguageSwitcher(locale, 'home', uiDictionary)}
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
          <span class="fd-hero-tag">FİNANS DEPARTMANI</span>
          <h1 id="fd-hero-title">Finansal Süreçlerde Şeffaf ve Güvenilir Koordinasyon</h1>
          <p>Ödeme, faturalandırma, belge talepleri ve sağlık turizmi kapsamındaki uygun mali süreçler hakkında bilgi almak için Finans Departmanımızla iletişime geçebilirsiniz. Talebiniz, ilgili kayıtlar ve yürürlükteki mevzuat çerçevesinde değerlendirilir.</p>
          <a href="#finance_contact" class="btn btn-gold">Finans Departmanına Ulaşın</a>
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
          <h2 id="fd-profiles-title">Mali Süreçlerimizde Uzman Koordinasyon</h2>
          <p>Finans Departmanımız; ödeme, belge, faturalandırma ve sağlık turizmiyle ilişkili uygun mali süreçlerin düzenli, şeffaf ve ilgili kayıtlar doğrultusunda yürütülmesine katkı sağlar.</p>
        </div>
        <div class="fd-profile-grid">
          <article class="fd-profile-card">
            <div class="fd-profile-photo">
              <img src="/images/finance_department/ahmet_otgen_finance.jpg" alt="Yeminli Mali Müşavir Ahmet ÖTGEN" width="160" height="200" loading="lazy" decoding="async" />
            </div>
            <div>
              <span class="fd-profile-role">Yeminli Mali Müşavir</span>
              <h3>Ahmet ÖTGEN</h3>
              <p>Mali süreçlerin mevzuata uygun yürütülmesi, finansal kayıtların değerlendirilmesi ve sağlık turizmi kapsamındaki uygun işlemlere ilişkin mali koordinasyon konularında danışmanlık yaklaşımı sunar.</p>
            </div>
          </article>
          <article class="fd-profile-card">
            <div class="fd-profile-photo">
              <img src="/images/finance_department/zehra_otgen_finance.jpg" alt="Mali Müşavir Zehra ÖTGEN" width="160" height="200" loading="lazy" decoding="async" />
            </div>
            <div>
              <span class="fd-profile-role">Mali Müşavir</span>
              <h3>Zehra ÖTGEN</h3>
              <p>Faturalandırma, belge takibi, finansal talep yönetimi ve ilgili departmanlarla süreç koordinasyonunda destek sağlar.</p>
            </div>
          </article>
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
            <h2 id="fd-tourism-title">Sağlık Turizmi Kapsamındaki Mali Süreçler</h2>
          </div>
          <p>Uluslararası hasta hizmetlerinde, uygun sağlık hizmetlerine ilişkin mali kayıt, belge ve başvuru süreçleri ilgili mevzuat çerçevesinde değerlendirilir. Sağlık turizmi kapsamındaki istisna ve iade dosyalarına ilişkin finansal koordinasyon; hizmetin niteliği, ilgili izinler, hasta bilgileri ve gerekli belgeler dikkate alınarak yürütülür.</p>
          <p class="fd-note">Sağlık turizmi kapsamındaki istisna veya iade süreçleri otomatik bir hak ya da sonuç taahhüdü değildir. Uygunluk; hizmetin niteliği, ilgili mevzuat, izin koşulları, hasta statüsü ve belge düzeni çerçevesinde her işlem için ayrıca değerlendirilir.</p>
        </div>
        <aside class="fd-highlight-card" aria-labelledby="fd-highlight-title">
          <h3 id="fd-highlight-title">KDV İstisna ve İade Süreçleri</h3>
          <p>Sağlık turizmi kapsamına giren uygun işlemlerde, KDV istisnası ve iade sürecine ilişkin mali kayıtların, belge düzeninin ve başvuru dosyalarının değerlendirilmesine yönelik koordinasyon sağlanır.</p>
        </aside>
      </div>
    </section>
  `;
}

function renderSupportAreas() {
  const cards = [
    {
      title: 'Ödeme ve Faturalandırma',
      text: 'İşlem öncesi veya devam eden süreçlerde ödeme adımları, fatura düzeni ve ilgili finansal belgeler hakkında bilgi almak için Finans Departmanımızla iletişime geçebilirsiniz.',
    },
    {
      title: 'Fatura ve Belge Talepleri',
      text: 'Fatura, ödeme belgesi, mali kayıt veya ilgili finansal doküman talepleriniz, mevcut işlem bilgileriniz doğrultusunda değerlendirilir.',
    },
    {
      title: 'Sağlık Turizmi Mali Koordinasyonu',
      text: 'Uluslararası hasta hizmetlerinde, uygun mali işlem ve belge süreçlerine ilişkin yönlendirme; ilgili mevzuat ve kayıt düzeni çerçevesinde ele alınır.',
    },
  ];

  return `
    <section class="fd-section fd-section-soft" aria-labelledby="fd-support-title">
      <div class="container">
        <div class="fd-section-head">
          <h2 id="fd-support-title">Hangi Konularda Destek Alabilirsiniz?</h2>
        </div>
        <div class="fd-support-grid">
          ${cards
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
  const steps = [
    {
      num: '01',
      title: 'Talebinizi İletin',
      text: 'Ödeme, fatura, belge veya sağlık turizmiyle ilişkili mali talebinizi iletişim formu üzerinden paylaşın.',
    },
    {
      num: '02',
      title: 'Kayıt ve Belgeler İncelensin',
      text: 'Talebiniz, mevcut işlem bilgileri, ilgili finansal kayıtlar ve gerekli belgeler doğrultusunda değerlendirilir.',
    },
    {
      num: '03',
      title: 'Bilgilendirme ve Yönlendirme',
      text: 'Süreç kapsamında ihtiyaç duyulan bilgilendirme ve yönlendirmeler, ilgili departmanlar aracılığıyla paylaşılır.',
    },
  ];

  return `
    <section class="fd-section" aria-labelledby="fd-process-title">
      <div class="container">
        <div class="fd-section-head">
          <h2 id="fd-process-title">Talebiniz Nasıl Değerlendirilir?</h2>
        </div>
        <div class="fd-process-grid">
          ${steps
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
          <h2 id="fd-security-title">Güvenli Bilgi Paylaşımı</h2>
        </div>
        <p>Kart numarası, kart güvenlik kodu, şifre veya diğer hassas finansal bilgileri iletişim formu üzerinden paylaşmayın. Finans Departmanımız, ihtiyaç duyulan bilgi ve belgeler için sizinle uygun iletişim kanalı üzerinden bağlantı kuracaktır.</p>
      </div>
    </section>
  `;
}

function renderContactForm() {
  return `
    <section class="fd-section fd-form-section" id="finance_contact" aria-labelledby="fd-form-title">
      <div class="container">
        <div class="fd-section-head">
          <h2 id="fd-form-title">Finans Departmanımızla İletişime Geçin</h2>
          <p>Ödeme, faturalandırma veya finansal süreçlerle ilgili talebinizi iletmek için aşağıdaki formu kullanabilirsiniz.</p>
        </div>
        <div class="fd-form-wrap">
          <form id="finance-preview-form" class="fd-form-grid" novalidate>
            <div class="fd-form-row">
              <label for="finance-name">Ad Soyad</label>
              <input id="finance-name" name="name" type="text" autocomplete="name" required />
            </div>
            <div class="fd-form-row">
              <label for="finance-phone">Telefon Numarası</label>
              <input id="finance-phone" name="phone" type="tel" autocomplete="tel" required />
            </div>
            <div class="fd-form-row">
              <label for="finance-email">E-posta Adresi</label>
              <input id="finance-email" name="email" type="email" autocomplete="email" required />
            </div>
            <div class="fd-form-row">
              <label for="finance-topic">Talep Konusu</label>
              <select id="finance-topic" name="topic" required>
                <option value="">Seçiniz</option>
                <option>Ödeme Süreci Hakkında Bilgi</option>
                <option>Fatura Talebi</option>
                <option>Ödeme Belgesi Talebi</option>
                <option>Mevcut İşlem Kaydı</option>
                <option>Sağlık Turizmi Mali Süreçleri</option>
                <option>KDV İstisna / İade Süreci Hakkında Bilgi</option>
                <option>Diğer</option>
              </select>
            </div>
            <div class="fd-form-row">
              <label for="finance-message">Mesajınız</label>
              <textarea id="finance-message" name="message" required></textarea>
            </div>
            <div class="fd-form-actions">
              <button type="submit" class="btn btn-gold">Talebi Gönder</button>
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
        <h2 id="fd-closing-title">Finansal Süreçleriniz Hakkında Bilgi Alın</h2>
        <p>Ödeme, faturalandırma ve ilgili finansal işlemler hakkında bilgi almak için Finans Departmanımıza ulaşabilirsiniz.</p>
        <a href="#finance_contact" class="btn btn-gold">Finans Departmanına Ulaşın</a>
      </div>
    </section>
  `;
}

function renderPage() {
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
    status.textContent = 'Preview testi kapsamında form gönderimi aktif değildir.';
  });
}

function bootstrapFinancePage() {
  renderPage();
  initSkipLink();
  initCustomCursor();
  initSiteHeader(document, { trackScroll: true });
  initLanguageSwitchers();
  initSmoothScroll();
  initPreviewForm();
}

bootstrapFinancePage();
