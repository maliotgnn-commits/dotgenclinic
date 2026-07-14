import './cookie-consent.css';
import { COOKIE_CONSENT_COPY } from './cookie-consent-i18n.js';

const GTM_ID = 'GTM-T89LPZWD';
const CONSENT_STORAGE_KEY = 'dotgen_cookie_consent_v1';

const CONSENT_DENIED = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 500,
};

const CONSENT_GRANTED = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
  functionality_storage: 'granted',
  personalization_storage: 'granted',
  security_storage: 'granted',
};

const AUTO_DISMISS_MS = 6000;

let widgetMounted = false;
let consentModeInitialized = false;
let autoDismissTimer = null;

const COOKIE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.2.86 4.2 2.28 5.74A4.98 4.98 0 0 0 7 20.5c.55 0 1-.45 1-1v-1.08c0-.55-.45-1-1-1-.83 0-1.5-.67-1.5-1.5 0-.83.67-1.5 1.5-1.5H8c.55 0 1-.45 1-1v-.5c0-1.1.9-2 2-2h.5c.55 0 1-.45 1-1V9c0-1.1.9-2 2-2h.5c.55 0 1-.45 1-1V5c0-1.1.9-2 2-2h.5c.55 0 1-.45 1-1V2h.5c2.76 0 5 2.24 5 5v.5c0 .55.45 1 1 1H21c1.1 0 2 .9 2 2v.5c0 .55.45 1 1 1h.5c1.1 0 2 .9 2 2v.5c0 2.76-2.24 5-5 5h-.5c-.55 0-1 .45-1 1v.5c0 1.1-.9 2-2 2h-.5c-.55 0-1 .45-1 1v.5c0 .55-.45 1-1 1h-.5c-2.76 0-5-2.24-5-5v-.5c0-.55-.45-1-1-1h-.5c-1.1 0-2-.9-2-2v-.5c0-.55-.45-1-1-1H12c-.55 0-1-.45-1-1v-.5c0-1.1-.9-2-2-2H8.5c-.55 0-1-.45-1-1V11c0-2.76 2.24-5 5-5h.5c.55 0 1-.45 1-1V4.5c0-.83.67-1.5 1.5-1.5S12 3.67 12 4.5V6c0 .55.45 1 1 1h.5c1.38 0 2.5 1.12 2.5 2.5V10c0 .55.45 1 1 1H17c1.38 0 2.5 1.12 2.5 2.5v.5c0 .55.45 1 1 1h.5c.83 0 1.5.67 1.5 1.5S22.17 17 21.34 17H21c-.55 0-1 .45-1 1v.5c0 2.21-1.79 4-4 4h-.34A6.99 6.99 0 0 1 12 22z"/></svg>`;

function detectLocale() {
  return location.pathname.match(/^\/(tr|en|ar|es|fr|it|ru|de)(?:\/|$)/)?.[1] || 'tr';
}

export function readCookieConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.analytics !== 'boolean') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent() {
  return readCookieConsent()?.analytics === true;
}

function writeCookieConsent(analytics) {
  localStorage.setItem(
    CONSENT_STORAGE_KEY,
    JSON.stringify({
      analytics,
      updatedAt: new Date().toISOString(),
    }),
  );
}

function ensureDataLayer() {
  window.dataLayer = window.dataLayer || [];
}

function gtag() {
  ensureDataLayer();
  window.dataLayer.push(arguments);
}

export function initializeConsentMode() {
  if (consentModeInitialized) return;
  consentModeInitialized = true;
  ensureDataLayer();
  gtag('consent', 'default', CONSENT_DENIED);

  const stored = readCookieConsent();
  if (stored?.analytics === true) {
    gtag('consent', 'update', CONSENT_GRANTED);
  } else if (stored?.analytics === false) {
    gtag('consent', 'update', CONSENT_DENIED);
  }
}

export function updateAnalyticsConsent(granted) {
  gtag('consent', 'update', granted ? CONSENT_GRANTED : CONSENT_DENIED);
  if (granted) {
    scheduleGoogleTagManagerLoad();
  }
}

let gtmLoadScheduled = false;

function scheduleGoogleTagManagerLoad() {
  if (gtmLoadScheduled || window.__dotgenGtmLoaded || !hasAnalyticsConsent()) return;
  gtmLoadScheduled = true;

  const load = () => {
    if (window.__dotgenGtmLoaded) return;
    loadGoogleTagManager();
  };

  let loaded = false;
  const runOnce = () => {
    if (loaded) return;
    loaded = true;
    if ('requestIdleCallback' in window) {
      requestIdleCallback(load, { timeout: 2500 });
    } else {
      load();
    }
  };

  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        if (list.getEntries().length > 0) {
          lcpObserver.disconnect();
          runOnce();
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      // LCP observer unavailable
    }
  }

  document.addEventListener('pointerdown', runOnce, { once: true, passive: true });
  document.addEventListener('keydown', runOnce, { once: true, passive: true });
  window.addEventListener('load', runOnce, { once: true });
}

export function loadGoogleTagManager() {
  if (window.__dotgenGtmLoaded || !hasAnalyticsConsent()) return;
  window.__dotgenGtmLoaded = true;
  initializeConsentMode();
  ensureDataLayer();
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);

  if (!document.querySelector('noscript[data-dotgen-gtm]')) {
    const noscript = document.createElement('noscript');
    noscript.setAttribute('data-dotgen-gtm', 'true');
    noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.prepend(noscript);
  }
}

function copyForLocale(locale) {
  return COOKIE_CONSENT_COPY[locale] || COOKIE_CONSENT_COPY.en;
}

function hideWidget() {
  if (autoDismissTimer) {
    clearTimeout(autoDismissTimer);
    autoDismissTimer = null;
  }
  document.getElementById('cookie-consent')?.remove();
  widgetMounted = false;
  document.removeEventListener('click', handleOutsideClick);
}

function dismissWidgetAfterTimeout() {
  const root = document.getElementById('cookie-consent');
  if (!root) return;
  // KVKK: analytics consent requires an explicit accept action.
  setPanelOpen(root, false);
  autoDismissTimer = null;
}

function setPanelOpen(root, open) {
  root.classList.toggle('is-open', open);
  const trigger = root.querySelector('.cookie-consent__trigger');
  const panel = root.querySelector('.cookie-consent__panel');
  trigger?.setAttribute('aria-expanded', open ? 'true' : 'false');
  panel?.setAttribute('aria-modal', open ? 'true' : 'false');
  if (open) {
    panel?.querySelector('[data-cookie-consent="accept"]')?.focus();
  }
}

function bindConsentKeyboard(root) {
  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !root.classList.contains('is-open')) return;
    setPanelOpen(root, false);
    root.querySelector('.cookie-consent__trigger')?.focus();
  });
}

function handleOutsideClick(event) {
  const root = document.getElementById('cookie-consent');
  if (!root || root.contains(event.target)) return;
  setPanelOpen(root, false);
}

function mountConsentWidget(locale) {
  if (widgetMounted || readCookieConsent()) return;
  widgetMounted = true;

  const copy = copyForLocale(locale);
  const privacyHref = `/${locale}/privacy.html`;
  const root = document.createElement('section');
  root.id = 'cookie-consent';
  root.className = 'cookie-consent';
  root.setAttribute('aria-live', 'polite');
  root.innerHTML = `
    <button type="button" class="cookie-consent__trigger" aria-expanded="false" aria-controls="cookie-consent-panel" aria-label="${copy.triggerLabel}" title="${copy.triggerLabel}">
      ${COOKIE_ICON}
    </button>
    <div id="cookie-consent-panel" class="cookie-consent__panel" role="dialog" aria-labelledby="cookie-consent-title" aria-modal="false">
      <h2 id="cookie-consent-title" class="cookie-consent__title">${copy.title}</h2>
      <p class="cookie-consent__message">${copy.message}</p>
      <div class="cookie-consent__actions">
        <button type="button" class="cookie-consent__btn cookie-consent__btn--accept" data-cookie-consent="accept">${copy.accept}</button>
        <button type="button" class="cookie-consent__btn cookie-consent__btn--reject" data-cookie-consent="reject">${copy.reject}</button>
        <a class="cookie-consent__link" href="${privacyHref}">${copy.privacy}</a>
      </div>
    </div>
  `;

  root.addEventListener('click', (event) => {
    const trigger = event.target.closest('.cookie-consent__trigger');
    if (trigger) {
      setPanelOpen(root, !root.classList.contains('is-open'));
      return;
    }

    const action = event.target.closest('[data-cookie-consent]')?.getAttribute('data-cookie-consent');
    if (!action) return;

    if (action === 'accept') {
      writeCookieConsent(true);
      updateAnalyticsConsent(true);
    } else if (action === 'reject') {
      writeCookieConsent(false);
      updateAnalyticsConsent(false);
    }
    hideWidget();
  });

  document.body.appendChild(root);
  document.addEventListener('click', handleOutsideClick);
  bindConsentKeyboard(root);
  autoDismissTimer = setTimeout(dismissWidgetAfterTimeout, AUTO_DISMISS_MS);
}

export function initCookieConsent(locale = detectLocale()) {
  initializeConsentMode();

  const stored = readCookieConsent();
  if (stored) {
    updateAnalyticsConsent(stored.analytics);
    return;
  }

  mountConsentWidget(locale);
}

initCookieConsent();
