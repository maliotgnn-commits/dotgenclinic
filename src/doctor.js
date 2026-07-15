import './cookie-consent.js';
import './style.css';
import './doctor.css';
import { initCustomCursor } from './cursor.js';
import { initSiteHeader, renderNavChevron } from './public-header.js';
import {
  applySeoLinks,
  getCurrentLocale,
  homeUrlFor,
  loadContentCatalog,
  loadUiDictionary,
  serviceUrlForLocale,
  translate,
} from './i18n.js';
import { initLanguageSwitchers, renderLanguageSwitcher } from './language-switcher.js';
import { initAnalyticsTracking } from './analytics.js';
import { buildWhatsAppUrl } from './whatsapp-links.js';
import { eyeHealthPathForLocale } from './eye-health-routes.js';
import {
  getDoctorBySlug,
  isDoctorProfileComplete,
  MISSING_DATA,
} from './doctors-data.js';
import { applyDoctorSchema } from './doctor-schema.js';

const app = document.getElementById('doctor-app');
const params = new URLSearchParams(window.location.search);
const locale = getCurrentLocale('doctor');
const [catalog, uiDictionary] = await Promise.all([
  loadContentCatalog(locale),
  loadUiDictionary(locale),
]);
const pagesBySlug = Object.fromEntries(catalog.pages.map((page) => [page.slug, page]));
const t = (source) => translate(uiDictionary, source);

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
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
          <div class="nav-actions" style="margin-left:auto;display:flex;align-items:center;gap:12px;">
            <div class="nav-language-slot">
              ${renderLanguageSwitcher(locale, 'doctor', uiDictionary)}
            </div>
            <a href="${homeUrlFor(locale, '#randevu')}" class="nav-cta">${escapeHtml(t('Randevu Al'))}</a>
          </div>
        </div>
      </nav>
    </header>
  `;
}

function renderProfileField(label, value) {
  const pending = !value || value === MISSING_DATA;
  return `
    <article class="dr-info-card${pending ? ' is-pending' : ''}">
      <h3>${escapeHtml(label)}</h3>
      <p>${escapeHtml(pending ? MISSING_DATA : value)}</p>
    </article>
  `;
}

function renderRelatedServices(doctor) {
  const links = [];

  if (doctor.serviceCategories.includes('eye-health')) {
    links.push({
      href: eyeHealthPathForLocale(locale),
      label: t('Göz Sağlığı'),
    });
  }

  doctor.relatedServiceSlugs.forEach((slug) => {
    const page = pagesBySlug[slug];
    if (page) {
      links.push({
        href: serviceUrlForLocale(slug, locale),
        label: page.title,
      });
    }
  });

  if (!links.length) return '';

  return `
    <section class="dr-section dr-section-soft">
      <div class="container">
        <h2>${escapeHtml(t('İlgili Hizmetler'))}</h2>
        <div class="dr-related-grid">
          ${links
            .map(
              (link) => `
            <a class="dr-related-card" href="${link.href}">${escapeHtml(link.label)}</a>
          `,
            )
            .join('')}
        </div>
      </div>
    </section>
  `;
}

function renderDoctorPage(doctor) {
  const complete = isDoctorProfileComplete(doctor);
  let robotsMeta = document.querySelector('meta[name="robots"]');
  if (!robotsMeta) {
    robotsMeta = document.createElement('meta');
    robotsMeta.setAttribute('name', 'robots');
    document.head.appendChild(robotsMeta);
  }
  robotsMeta.setAttribute('content', complete && doctor.indexed ? 'index, follow' : 'noindex, follow');

  document.title = `${doctor.name} | Dr Otgen Clinic`;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute(
      'content',
      `${doctor.name} – ${doctor.specialty}. Dr Otgen Clinic hekim profili.`,
    );
  }
  applySeoLinks(locale, 'doctor', doctor.slug);
  applyDoctorSchema(doctor, locale);

  const imageMarkup = doctor.imageAvif
    ? `<picture><source srcset="${doctor.imageAvif}" type="image/avif" /><img src="${doctor.image}" alt="${escapeHtml(doctor.imageAlt)}" width="560" height="700" loading="eager" decoding="async" /></picture>`
    : `<img src="${doctor.image}" alt="${escapeHtml(doctor.imageAlt)}" width="560" height="700" loading="eager" decoding="async" />`;

  app.innerHTML = `
    ${renderSkipLink()}
    ${renderHeader()}
    <div class="dr-page" id="main-content" tabindex="-1">
      <nav class="dr-breadcrumb-band" aria-label="${escapeHtml(t('Gezinti yolu'))}">
        <div class="container">
          <a href="${homeUrlFor(locale)}">${escapeHtml(t('Ana Sayfa'))}</a>
          <span aria-hidden="true">/</span>
          <a href="${serviceUrlForLocale('our-doctors', locale)}">${escapeHtml(t('Doktorlarımız'))}</a>
          <span aria-hidden="true">/</span>
          <strong aria-current="page">${escapeHtml(doctor.name)}</strong>
        </div>
      </nav>

      <section class="dr-hero">
        <div class="container dr-hero-grid">
          <figure class="dr-photo">${imageMarkup}</figure>
          <div class="dr-hero-copy">
            <h1>${escapeHtml(doctor.name)}</h1>
            <p class="dr-role">${escapeHtml(doctor.specialty)}</p>
            <p>${escapeHtml(t('Profil bilgileri klinik tarafından doğrulandıkça güncellenir.'))}</p>
            <div class="dr-hero-actions">
              <a href="${buildWhatsAppUrl({ locale, pageTitle: doctor.name })}" class="btn-gold premium-gold-cta" target="_blank" rel="noopener noreferrer">${escapeHtml(t('WhatsApp ile Bilgi Al'))}</a>
              <a href="${homeUrlFor(locale, '#randevu')}" class="btn-outline premium-gold-cta">${escapeHtml(t('Randevu Al'))}</a>
            </div>
            ${complete ? '' : `<div class="dr-notice">${escapeHtml(MISSING_DATA)} — ${escapeHtml(t('Profil tamamlanmadan indexlenmez.'))}</div>`}
          </div>
        </div>
      </section>

      <section class="dr-section">
        <div class="container">
          <h2>${escapeHtml(t('Profil Bilgileri'))}</h2>
          <div class="dr-info-grid">
            ${renderProfileField(t('Eğitim'), doctor.education)}
            ${renderProfileField(t('Deneyim'), doctor.experience)}
            ${renderProfileField(t('İlgi Alanları'), doctor.interests)}
            ${renderProfileField(t('Yayınlar'), doctor.publications)}
            ${renderProfileField(t('Kongreler'), doctor.conferences)}
            ${renderProfileField(t('Mesleki Üyelikler'), doctor.memberships)}
            ${renderProfileField(t('Klinik Yaklaşım'), doctor.approach)}
          </div>
        </div>
      </section>

      ${renderRelatedServices(doctor)}
    </div>
  `;
}

function bootstrapDoctorPage() {
  const slug = params.get('slug');
  const doctor = slug ? getDoctorBySlug(slug) : null;

  if (!doctor) {
    window.location.replace(serviceUrlForLocale('our-doctors', locale));
    return;
  }

  renderDoctorPage(doctor);
  initAnalyticsTracking(() => locale);
  initCustomCursor();
  initSiteHeader(document, {
    trackScroll: true,
    whatsapp: { locale, pageTitle: doctor.name },
  });
  initLanguageSwitchers();
}

bootstrapDoctorPage();
