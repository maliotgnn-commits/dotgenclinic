import { pushEvent } from './analytics.js';
import { storeAppointmentReferrer } from './appointment-attribution.js';
import { getDoctorBySlug } from './doctors-data.js';
import { doctorUrlForLocale } from './doctor-routes.js';

const APPOINTMENT_SECTION_ID = 'randevu';
const HEADER_SELECTOR = '#main-header';

const ARIA_LABEL_BY_LOCALE = {
  tr: (name) => `${name} için randevu al`,
  en: (name) => `Book an appointment with ${name}`,
  ar: (name) => `احجز موعدًا مع ${name}`,
  es: (name) => `Reservar cita con ${name}`,
  fr: (name) => `Prendre rendez-vous avec ${name}`,
  it: (name) => `Prenota un appuntamento con ${name}`,
  ru: (name) => `Записаться на приём к ${name}`,
  de: (name) => `Termin vereinbaren mit ${name}`,
};

function isDevEnvironment() {
  return Boolean(import.meta.env?.DEV);
}

export function buildDoctorAriaLabel(locale, doctorName) {
  const formatter = ARIA_LABEL_BY_LOCALE[locale] || ARIA_LABEL_BY_LOCALE.en;
  return formatter(doctorName);
}

function isServiceDoctorLink(element) {
  if (!element) return false;
  if (element.dataset.doctorSlug) return true;
  const href = element.getAttribute('href') || '';
  return /\/doctor\.html(?:\?|$)/i.test(href) || (/[?&]slug=[^&#]+/.test(href) && href.includes('doctor'));
}

function findDoctorClickTarget(target, pageType) {
  const slugCard = target.closest('a[data-doctor-slug]');
  if (slugCard) return slugCard;

  if (pageType !== 'service') return null;

  const relatedCard = target.closest('a.sv-related-card');
  if (relatedCard && isServiceDoctorLink(relatedCard)) return relatedCard;

  return null;
}

export function extractDoctorData(element) {
  if (!element) return {};
  let slug = element.dataset.doctorSlug || '';
  if (!slug) {
    const href = element.getAttribute('href') || '';
    const match = href.match(/[?&]slug=([^&#]+)/);
    if (match) slug = decodeURIComponent(match[1]);
  }
  const doctor = slug ? getDoctorBySlug(slug) : null;
  const nameFromDom = element.querySelector('h3, strong')?.textContent?.trim() || '';
  const titleFromDom = element.querySelector('.team-role, span:not(.popular-category)')?.textContent?.trim() || '';

  return {
    slug: slug || undefined,
    name: doctor?.name || nameFromDom || undefined,
    title: doctor?.title || titleFromDom || undefined,
    specialty: doctor?.specialty || undefined,
  };
}

export function getHeaderHeight(headerEl = document.querySelector(HEADER_SELECTOR)) {
  return headerEl?.offsetHeight || 0;
}

export function scrollToAppointmentSection(options = {}) {
  const targetEl = document.getElementById(APPOINTMENT_SECTION_ID);
  if (!targetEl) {
    if (isDevEnvironment()) {
      console.warn('[doctor-click] Appointment section not found:', `#${APPOINTMENT_SECTION_ID}`);
    }
    return false;
  }

  const headerHeight = options.headerHeight ?? getHeaderHeight(options.headerEl);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.scrollTo({
    top: targetEl.offsetTop - headerHeight,
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  });
  return true;
}

export function revealStickyAppointmentCta() {
  const stickyBar = document.querySelector('[data-sticky-cta]');
  const stickyBtn = document.querySelector('.sv-sticky-cta [data-appointment-from="sticky"]');

  if (!stickyBtn) {
    if (isDevEnvironment()) {
      console.warn('[doctor-click] Sticky appointment CTA not found on service page');
    }
    return false;
  }

  if (stickyBar) {
    stickyBar.hidden = false;
    stickyBar.classList.add('is-visible');
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  stickyBtn.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'nearest',
  });

  window.requestAnimationFrame(() => {
    stickyBtn.focus({ preventScroll: true });
  });

  return true;
}

export function openServiceAppointment({
  locale,
  currentPage,
  ctaLocation = 'service_related_doctor',
  doctorData = {},
}) {
  if (!currentPage?.slug) {
    if (isDevEnvironment()) {
      console.warn('[doctor-click] Service appointment requires currentPage.slug');
    }
    return false;
  }

  storeAppointmentReferrer({
    locale,
    slug: currentPage.slug,
    category: currentPage.category,
    title: currentPage.title,
    source: ctaLocation,
  });

  pushEvent('appointment_cta', {
    page_locale: locale,
    cta_location: ctaLocation,
    service_slug: currentPage.slug,
    doctor_name: doctorData.name,
    doctor_slug: doctorData.slug,
  });

  return revealStickyAppointmentCta();
}

function trackHomeDoctorClick(locale, doctorData) {
  pushEvent('appointment_cta', {
    page_locale: locale,
    cta_location: 'home_doctor_card',
    doctor_name: doctorData.name,
    doctor_slug: doctorData.slug,
  });
}

export function prepareDoctorCards(root = document, locale, pageType = 'home') {
  root.querySelectorAll('a[data-doctor-slug], a.sv-related-card[href*="doctor.html"]').forEach((card) => {
    const doctorData = extractDoctorData(card);
    if (doctorData.slug) {
      card.dataset.doctorSlug = doctorData.slug;
      card.href = pageType === 'service' ? doctorUrlForLocale(doctorData.slug, locale) : '#';
    }
    if (doctorData.name) {
      card.setAttribute('aria-label', buildDoctorAriaLabel(locale, doctorData.name));
    }
  });
}

export function initDoctorClickHandling({ pageType, locale, currentPage = null } = {}) {
  if (pageType !== 'home' && pageType !== 'service') return;

  prepareDoctorCards(document, locale, pageType);

  document.addEventListener(
    'click',
    (event) => {
      const card = findDoctorClickTarget(event.target, pageType);
      if (!card) return;

      const doctorData = extractDoctorData(card);

      if (pageType === 'home') {
        event.preventDefault();
        event.stopPropagation();
        scrollToAppointmentSection();
        trackHomeDoctorClick(locale, doctorData);
        return;
      }

      if (pageType === 'service' && currentPage) {
        event.preventDefault();
        event.stopPropagation();
        openServiceAppointment({
          locale,
          currentPage,
          ctaLocation: 'service_related_doctor',
          doctorData,
        });
      }
    },
    { capture: true },
  );
}
