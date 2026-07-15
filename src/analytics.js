import { hasAnalyticsConsent } from './cookie-consent.js';

let trackingInitialized = false;

function ensureDataLayer() {
  window.dataLayer = window.dataLayer || [];
}

export function pushEvent(event, params = {}) {
  if (!hasAnalyticsConsent()) return;
  ensureDataLayer();
  window.dataLayer.push({
    event,
    page_path: `${window.location.pathname}${window.location.search}`,
    ...params,
  });
}

export function trackServicePageView({ locale, slug, category, title }) {
  pushEvent('service_page_view', {
    page_locale: locale,
    service_slug: slug,
    service_category: category,
    service_title: title,
  });
}

function resolveWhatsAppLocation(link) {
  if (link.closest('.sv-sticky-cta')) return 'sticky';
  if (link.closest('footer')) return 'footer';
  if (link.closest('.appointment-contact')) return 'contact';
  if (link.closest('.sv-page')) return 'service';
  if (link.classList.contains('whatsapp-float')) return 'float';
  return 'other';
}

function resolveAppointmentCtaLocation(cta) {
  if (cta.closest('.sv-sticky-cta')) return 'sticky';
  if (cta.classList.contains('nav-cta')) return 'nav';
  if (cta.dataset.appointmentFrom) return cta.dataset.appointmentFrom;
  if (cta.classList.contains('btn-gold')) return 'closing';
  return 'section';
}

export function initAnalyticsTracking(getLocale) {
  if (trackingInitialized) return;
  trackingInitialized = true;

  document.addEventListener(
    'click',
    (event) => {
      const whatsappLink = event.target.closest('a[href*="wa.me"]');
      if (whatsappLink) {
        const params = new URL(window.location.href).searchParams;
        pushEvent('whatsapp_click', {
          page_locale: getLocale(),
          link_location: resolveWhatsAppLocation(whatsappLink),
          service_slug: params.get('slug') || undefined,
        });
        return;
      }

      const appointmentCta =
        event.target.closest('.nav-cta')
        || event.target.closest('[data-appointment-from]')
        || event.target.closest('a[href*="#randevu"]');
      if (appointmentCta) {
        const params = new URL(window.location.href).searchParams;
        pushEvent('appointment_cta', {
          page_locale: getLocale(),
          cta_location: resolveAppointmentCtaLocation(appointmentCta),
          service_slug: params.get('slug') || undefined,
        });
      }
    },
    { capture: true },
  );
}
