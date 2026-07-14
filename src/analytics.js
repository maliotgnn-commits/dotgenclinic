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
  if (link.classList.contains('whatsapp-float')) return 'float';
  if (link.closest('.appointment-contact')) return 'contact';
  if (link.closest('footer')) return 'footer';
  return 'other';
}

function resolveAppointmentCtaLocation(cta) {
  if (cta.classList.contains('nav-cta')) return 'nav';
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
        event.target.closest('.nav-cta') || event.target.closest('a[href*="#randevu"]');
      if (appointmentCta) {
        pushEvent('appointment_cta', {
          page_locale: getLocale(),
          cta_location: resolveAppointmentCtaLocation(appointmentCta),
        });
      }
    },
    { capture: true },
  );
}
