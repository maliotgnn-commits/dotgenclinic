import './cookie-consent.js';
import './style.css';
import './service.css';
import { initCustomCursor } from './cursor.js';
import { initSiteHeader, renderMobileCategoryTrigger, renderNavChevron } from './public-header.js';
import { desktopMenuIdForCategory, insertNavItemBeforeDesktopMenuId } from './nav-shared.js';
import { renderEyeHealthNavItem } from './tr-eye-health-nav.js';
import { appendFinanceNavLink } from './tr-finance-nav.js';
import { appendArgeNavItem } from './tr-arge-nav.js';
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
import { initAnalyticsTracking, trackServicePageView } from './analytics.js';
import { buildWhatsAppUrl } from './whatsapp-links.js';
import { enhanceRelatedPages, getClusterNavLinks, getDoctorsForServicePage } from './seo-internal-links.js';
import { storeAppointmentReferrer } from './appointment-attribution.js';
import { buildDoctorAriaLabel, initDoctorClickHandling } from './doctor-click.js';

const app = document.getElementById('service-app');
const params = new URLSearchParams(window.location.search);
const locale = getCurrentLocale('service');
const [catalog, uiDictionary, eyeContent] = await Promise.all([
  loadContentCatalog(locale),
  loadUiDictionary(locale),
  loadEyeHealthContent(locale),
]);
const pagesBySlug = Object.fromEntries(catalog.pages.map((page) => [page.slug, page]));
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

function renderChevron() {
  return renderNavChevron();
}

function renderNavGroups() {
  const serviceGroups = categoryGroups
    .map((group) => {
      const links = appendFinanceNavLink(
        group.items
          .map((item) => `
          <a href="${serviceUrlForLocale(item.slug, locale)}">${escapeHtml(item.navLabel)}</a>
        `)
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

function renderNavLogo() {
  return `
    <picture>
      <source srcset="/images/logo-transparent-180.avif 180w, /images/logo-transparent-360.avif 360w" sizes="127px" type="image/avif" />
      <source srcset="/images/logo-transparent-180.webp 180w, /images/logo-transparent-360.webp 360w" sizes="127px" type="image/webp" />
      <img src="/images/logo-transparent-180.webp" width="180" height="105" alt="Dr Otgen Clinic" decoding="async" />
    </picture>
  `;
}

function appointmentUrl(currentPage, location = 'section') {
  storeAppointmentReferrer({
    locale,
    slug: currentPage.slug,
    category: currentPage.category,
    title: currentPage.title,
    source: location,
  });
  return homeUrlFor(locale, '#randevu');
}

function renderHeader() {
  return `
    <header id="main-header">
      <nav class="main-nav" aria-label="${escapeHtml(t('Menü'))}">
        <div class="container nav-container">
          <a href="${homeUrlFor(locale)}" class="nav-logo">${renderNavLogo()}</a>
          <div class="nav-primary">
            <ul class="nav-menu" id="nav-menu">
              ${renderNavGroups()}
            </ul>
          </div>
          <div class="nav-actions">
            <div class="nav-language-slot">
              ${renderLanguageSwitcher(locale, 'service', uiDictionary)}
            </div>
            <a href="${homeUrlFor(locale, '#randevu')}" class="nav-cta" data-appointment-from="nav">${escapeHtml(t('Randevu Al'))}</a>
            <button class="hamburger" id="hamburger" aria-label="${escapeHtml(t('Menü'))}" aria-expanded="false">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  `;
}

function renderDetailSections(sections = []) {
  if (!Array.isArray(sections) || !sections.length) return '';

  return `
    <section class="sv-section sv-detail-section-wrap">
      <div class="container sv-detail-stack">
        ${sections
          .map((section) => {
            const blocks = Array.isArray(section.blocks) ? section.blocks : [];
            if (!blocks.length) return '';
            const body = blocks
              .map((block) => {
                if (block.type === 'paragraph') {
                  return `<p>${escapeHtml(block.text)}</p>`;
                }
                if (block.type === 'subheading') {
                  return `<h4 class="sv-detail-subheading">${escapeHtml(block.text)}</h4>`;
                }
                if (block.type === 'list' && Array.isArray(block.items)) {
                  return `<ul class="sv-detail-list">${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
                }
                return '';
              })
              .join('');

            return `
              <article class="sv-detail-block">
                <h3>${escapeHtml(section.title)}</h3>
                ${body}
              </article>
            `;
          })
          .join('')}
      </div>
    </section>
  `;
}

function renderDoctorLinks(doctors) {
  if (!doctors.length) return '';
  return `
    <section class="sv-section sv-section-soft">
      <div class="container">
        <h3>${escapeHtml(t('İlgili Hekimler'))}</h3>
        <div class="sv-related-grid">
          ${doctors
            .map(
              (doctor) => `
            <a
              class="sv-related-card"
              href="#"
              data-doctor-slug="${escapeHtml(doctor.slug)}"
              aria-label="${escapeHtml(buildDoctorAriaLabel(locale, doctor.name))}"
            >
              <strong>${escapeHtml(doctor.name)}</strong>
              <span>${escapeHtml(doctor.specialty)}</span>
            </a>
          `,
            )
            .join('')}
        </div>
      </div>
    </section>
  `;
}

function renderFaqCta(currentPage) {
  return `
    <section class="sv-section sv-faq-cta">
      <div class="container sv-faq-cta-inner">
        <h3>${escapeHtml(t('Sorularınız mı var?'))}</h3>
        <p>${escapeHtml(t('Tedavi planınız için uzman ekibimizle iletişime geçebilirsiniz.'))}</p>
        <div class="sv-faq-cta-actions">
          <a href="${buildWhatsAppUrl({ locale, category: currentPage.category, pageTitle: currentPage.title })}" class="btn-gold premium-gold-cta" target="_blank" rel="noopener noreferrer">${escapeHtml(t('WhatsApp ile Bilgi Al'))}</a>
          <a href="${appointmentUrl(currentPage, 'faq')}" class="btn-outline premium-gold-cta" data-appointment-from="faq">${escapeHtml(t('Randevu Al'))}</a>
        </div>
      </div>
    </section>
  `;
}

function renderStickyCta(currentPage) {
  return `
    <aside class="sv-sticky-cta" data-sticky-cta hidden>
      <div class="container sv-sticky-cta-inner">
        <span>${escapeHtml(currentPage.title)}</span>
        <div class="sv-sticky-cta-actions">
          <a href="${buildWhatsAppUrl({ locale, category: currentPage.category, pageTitle: currentPage.title })}" class="btn-gold premium-gold-cta" target="_blank" rel="noopener noreferrer">${escapeHtml(t('WhatsApp'))}</a>
          <a href="${appointmentUrl(currentPage, 'sticky')}" class="btn-outline premium-gold-cta" data-appointment-from="sticky">${escapeHtml(t('Randevu Al'))}</a>
        </div>
      </div>
    </aside>
  `;
}

function initStickyCta() {
  const bar = document.querySelector('[data-sticky-cta]');
  if (!bar) return;

  const show = () => {
    const visible = window.scrollY > 480;
    bar.hidden = !visible;
    bar.classList.toggle('is-visible', visible);
  };

  show();
  window.addEventListener('scroll', show, { passive: true });
}

function renderClusterLinks(clusterPages, currentPage) {
  if (!clusterPages.length) return '';
  return `
    <section class="sv-section sv-section-soft">
      <div class="container">
        <h3>${escapeHtml(t('İlgili Tedaviler'))}</h3>
        <div class="sv-related-grid">
          ${clusterPages
            .map(
              (item) => `
            <a class="sv-related-card" href="${serviceUrlForLocale(item.slug, locale)}">
              <h4>${escapeHtml(item.title)}</h4>
              <p>${escapeHtml(item.summary)}</p>
            </a>
          `,
            )
            .join('')}
        </div>
      </div>
    </section>
  `;
}

function renderRelated(relatedPages) {
  if (!relatedPages.length) return '';

  return relatedPages
    .map(
      (item) => `
        <a class="sv-related-card" href="${serviceUrlForLocale(item.slug, locale)}">
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.summary)}</p>
        </a>
      `,
    )
    .join('');
}

function renderProcess(processItems) {
  return processItems
    .map(
      (step, index) => `
        <article class="sv-process-card">
          <span dir="ltr">${String(index + 1).padStart(2, '0')}</span>
          <h4>${escapeHtml(step.title)}</h4>
          <p>${escapeHtml(step.description)}</p>
        </article>
      `,
    )
    .join('');
}

function renderFaq(faqItems) {
  return faqItems
    .map(
      (faq) => `
        <details class="sv-faq-item">
          <summary>${escapeHtml(faq.question)}</summary>
          <p>${escapeHtml(faq.answer)}</p>
        </details>
      `,
    )
    .join('');
}

function renderOverviewQuickFacts(facts) {
  if (!facts.length) return '';

  return `
    <div class="sv-overview-facts" aria-label="${escapeHtml(t('Kısa Bilgiler'))}">
      ${facts
        .map(
          (fact) => `
        <article class="sv-overview-fact">
          <strong>${escapeHtml(fact.label)}</strong>
          <span>${escapeHtml(fact.value)}</span>
        </article>
      `,
        )
        .join('')}
    </div>
  `;
}

function getProcessSectionTitle(page) {
  return page.processTitle ?? t('Tedavi Süreci');
}

function renderGalleryCarousel(page) {
  const gallery = Array.isArray(page.images?.gallery) ? page.images.gallery.filter(Boolean) : [];
  if (gallery.length < 2) return '';

  const slides = gallery
    .map(
      (src, index) => `
        <li class="sv-gallery-slide" role="group" aria-roledescription="${escapeHtml(t('Görsel'))}" aria-label="${index + 1} / ${gallery.length}">
          <img src="${src}" alt="${escapeHtml(page.title)} ${index + 1}" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async" />
        </li>
      `,
    )
    .join('');
  const dots = gallery
    .map(
      (_src, index) => `<button type="button" class="sv-gallery-dot${index === 0 ? ' is-active' : ''}" data-gallery-index="${index}" aria-label="${index + 1}"></button>`,
    )
    .join('');

  return `
    <div class="sv-gallery-wrap">
      <div class="sv-gallery" data-gallery>
        <ul class="sv-gallery-track" data-gallery-track>${slides}</ul>
        <button type="button" class="sv-gallery-nav sv-gallery-prev" data-gallery-prev aria-label="${escapeHtml(t('Önceki'))}">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button type="button" class="sv-gallery-nav sv-gallery-next" data-gallery-next aria-label="${escapeHtml(t('Sonraki'))}">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
      <div class="sv-gallery-dots" data-gallery-dots>${dots}</div>
    </div>
  `;
}

function setServiceRobotsMeta(indexable) {
  let robotsMeta = document.querySelector('meta[name="robots"]');
  if (!robotsMeta) {
    robotsMeta = document.createElement('meta');
    robotsMeta.setAttribute('name', 'robots');
    document.head.appendChild(robotsMeta);
  }
  robotsMeta.setAttribute('content', indexable ? 'index, follow' : 'noindex, follow');
}

function renderPage(currentPage, relatedPages) {
  setServiceRobotsMeta(true);
  document.title = `${currentPage.title} | Dr Otgen Clinic`;

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', `${currentPage.title}: ${currentPage.summary}`);
  }
  applySeoLinks(locale, 'service', currentPage.slug);

  const quickFacts = Array.isArray(currentPage.quickFacts) ? currentPage.quickFacts : [];
  const heroGradientDirection = document.documentElement.dir === 'rtl' ? '270deg' : '90deg';
  const processSectionTitle = getProcessSectionTitle(currentPage);

  app.innerHTML = `
    ${renderSkipLink()}
    ${renderHeader()}
    <div class="sv-page" id="main-content" tabindex="-1">
      <nav class="sv-breadcrumb-band" aria-label="${escapeHtml(t('Gezinti yolu'))}">
        <div class="container">
          <a href="${homeUrlFor(locale)}">${escapeHtml(t('Ana Sayfa'))}</a>
          <span aria-hidden="true">/</span>
          <strong>${escapeHtml(currentPage.categoryLabel)}</strong>
          <span aria-hidden="true">/</span>
          <strong aria-current="page">${escapeHtml(currentPage.title)}</strong>
        </div>
      </nav>

      <section class="sv-hero" style="background-image: linear-gradient(${heroGradientDirection}, rgba(5, 17, 34, 0.86), rgba(5, 17, 34, 0.58)), url('${currentPage.images.hero}')">
        <div class="container sv-hero-inner">
          <article class="sv-hero-card">
            <span>${escapeHtml(currentPage.heroTag)}</span>
            <h1>${escapeHtml(currentPage.title)}</h1>
            ${currentPage.heroSubtitle ? `<strong class="sv-hero-subtitle">${escapeHtml(currentPage.heroSubtitle)}</strong>` : ''}
            <p>${escapeHtml(currentPage.summary)}</p>
            <div class="sv-hero-actions">
              <a href="${buildWhatsAppUrl({ locale, category: currentPage.category, pageTitle: currentPage.title })}" class="btn-gold premium-gold-cta sv-hero-whatsapp" target="_blank" rel="noopener noreferrer">${escapeHtml(t('WhatsApp ile Bilgi Al'))}</a>
              <a href="${appointmentUrl(currentPage, 'hero')}" class="btn-outline premium-gold-cta sv-hero-appointment" data-appointment-from="hero">${escapeHtml(t('Randevu Al'))}</a>
            </div>
          </article>
        </div>
      </section>

      <section class="sv-section">
        <div class="container sv-split">
          <div class="sv-image-col">
            ${renderGalleryCarousel(currentPage) || `<img
              src="${currentPage.images.content}"
              alt="${escapeHtml(currentPage.title)}"
              loading="lazy"
              decoding="async"
            />`}
          </div>
          <div class="sv-text-col">
            <h2>${escapeHtml(t('Genel Bakış'))}</h2>
            ${currentPage.overview.slice(0, 3).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
            ${currentPage.highlights?.length ? `<ul>${currentPage.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
            ${renderOverviewQuickFacts(quickFacts)}
          </div>
        </div>
      </section>

      ${renderDetailSections(currentPage.sections)}

      <section class="sv-section sv-section-soft">
        <div class="container">
          <h3>${escapeHtml(processSectionTitle)}</h3>
          <div class="sv-process-grid">
            ${renderProcess(currentPage.process || [])}
          </div>
        </div>
      </section>

      <section class="sv-section">
        <div class="container sv-info-grid">
          <article class="sv-info-card">
            <h4>${escapeHtml(t('Kimler İçin Uygundur?'))}</h4>
            ${currentPage.suitableIntro ? `<p>${escapeHtml(currentPage.suitableIntro)}</p>` : ''}
            <ul>
              ${(currentPage.suitableFor || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>
          </article>
          <article class="sv-info-card">
            <h4>${escapeHtml(t('Kısa Bilgiler'))}</h4>
            ${quickFacts.map((fact) => `<p><strong>${escapeHtml(fact.label)}:</strong> ${escapeHtml(fact.value)}</p>`).join('')}
          </article>
        </div>
      </section>

      ${currentPage.faqs?.length ? `
        <section class="sv-section sv-section-soft">
          <div class="container">
            <h3>${escapeHtml(t('Sık Sorulan Sorular'))}</h3>
            <div class="sv-faq-list">
              ${renderFaq(currentPage.faqs)}
            </div>
          </div>
        </section>
        ${renderFaqCta(currentPage)}
      ` : ''}

      ${renderClusterLinks(getClusterNavLinks(catalog, currentPage), currentPage)}

      ${renderDoctorLinks(getDoctorsForServicePage(currentPage))}

      <section class="sv-section">
        <div class="container">
          <h3>${escapeHtml(t('İlgili Sayfalar'))}</h3>
          <div class="sv-related-grid">
            ${renderRelated(relatedPages)}
          </div>
        </div>
      </section>
    </div>
    ${renderStickyCta(currentPage)}
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

function initRelatedCardNavigation() {
  document.querySelectorAll('.sv-related-card:not([data-doctor-slug])').forEach((card) => {
    const href = card.getAttribute('href') || '';
    if (/\/doctor\.html(?:\?|$)/i.test(href)) return;
    card.addEventListener('click', (event) => {
      const href = card.getAttribute('href');
      if (!href) return;
      if (event.target instanceof HTMLElement && event.target.closest('a') && event.target !== card) return;
      window.location.assign(href);
    });
  });
}

function initGalleryCarousel() {
  const gallery = document.querySelector('[data-gallery]');
  if (!gallery) return;

  const track = gallery.querySelector('[data-gallery-track]');
  const slides = Array.from(gallery.querySelectorAll('.sv-gallery-slide'));
  const prevBtn = gallery.querySelector('[data-gallery-prev]');
  const nextBtn = gallery.querySelector('[data-gallery-next]');
  const dots = Array.from(document.querySelectorAll('.sv-gallery-dot'));
  if (!track || slides.length < 2) return;

  let index = 0;

  const update = () => {
    track.style.transform = `translateX(${document.documentElement.dir === 'rtl' ? '' : '-'}${index * 100}%)`;
    dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
  };

  const goTo = (next) => {
    index = (next + slides.length) % slides.length;
    update();
  };

  prevBtn?.addEventListener('click', () => goTo(index - 1));
  nextBtn?.addEventListener('click', () => goTo(index + 1));
  dots.forEach((dot) => {
    dot.addEventListener('click', () => goTo(Number(dot.dataset.galleryIndex)));
  });

  let startX = 0;
  let isDragging = false;
  const onStart = (clientX) => {
    startX = clientX;
    isDragging = true;
  };
  const onEnd = (clientX) => {
    if (!isDragging) return;
    isDragging = false;
    const delta = clientX - startX;
    const rtl = document.documentElement.dir === 'rtl';
    if (Math.abs(delta) < 40) return;
    const forward = rtl ? delta > 0 : delta < 0;
    goTo(index + (forward ? 1 : -1));
  };

  gallery.addEventListener('touchstart', (event) => onStart(event.touches[0].clientX), { passive: true });
  gallery.addEventListener('touchend', (event) => onEnd(event.changedTouches[0].clientX));
  gallery.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') onStart(event.clientX);
  });
  gallery.addEventListener('pointerup', (event) => {
    if (event.pointerType === 'mouse') onEnd(event.clientX);
  });

  update();
}

function bootstrapServicePage() {
  const requestedSlug = params.get('slug');
  const currentPage = requestedSlug ? pagesBySlug[requestedSlug] : null;

  if (!currentPage) {
    window.location.replace(homeUrlFor(locale, '#hizmetler'));
    return;
  }

  renderPage(currentPage, enhanceRelatedPages(catalog, currentPage));
  initAnalyticsTracking(() => locale);
  trackServicePageView({
    locale,
    slug: currentPage.slug,
    category: currentPage.category,
    title: currentPage.title,
  });
  initSkipLink();
  initCustomCursor();
  initSiteHeader(document, {
    trackScroll: true,
    whatsapp: { locale, category: currentPage.category, pageTitle: currentPage.title },
  });
  initLanguageSwitchers();
  initDoctorClickHandling({ pageType: 'service', locale, currentPage });
  initRelatedCardNavigation();
  initGalleryCarousel();
  initStickyCta();
}

bootstrapServicePage();
