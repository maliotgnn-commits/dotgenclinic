import { INSTAGRAM_URL } from './social-links.js';
import { buildWhatsAppUrl } from './whatsapp-links.js';
import { getCurrentLocale, loadUiDictionary, translate } from './i18n.js';
import { isHomePage } from './page-type.js';

const STACK_SELECTOR = '[data-floating-social-stack]';
const INSTAGRAM_ARIA_LABEL = 'Instagram hesabımızı ziyaret edin';

const INSTAGRAM_ICON = `
  <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 11-2.881.001 1.44 1.44 0 012.881-.001z"/>
  </svg>
`;

const WHATSAPP_ICON = `
  <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
`;

const DEPARTMENT_PATH_RE = /\/(?:hukuk-departmani|legal-department|finans-departmani|finance-department|goz-hastaliklari|eye-health|privacy|ilac-ar-ge|medikal-ar-ge|yazilim-ar-ge|blockchain-ar-ge|e-ticaret-ar-ge|pharma-rd|medikal-rd|software-rd|blockchain-rd|ecommerce-rd|departamento-juridico|departement-juridique|dipartimento-legale|rechtsabteilung|юридический-отдел|قسم-الشؤون-القانونية)/i;

function isAdminPage() {
  return /\/admin(?:\/|$)/.test(window.location.pathname);
}

function isDoctorPage() {
  return /\/doctor\.html$/i.test(window.location.pathname);
}

function isServicePage() {
  return /\/service\.html$/i.test(window.location.pathname);
}

export function resolveWhatsAppContext(overrides = {}) {
  const locale = overrides.locale || getCurrentLocale();
  const pathname = window.location.pathname;

  if (overrides.category || overrides.pageTitle) {
    return {
      locale,
      category: overrides.category || 'default',
      pageTitle: overrides.pageTitle || '',
    };
  }

  if (isHomePage(pathname)) {
    return { locale, category: 'default', pageTitle: '' };
  }

  if (isServicePage()) {
    return { locale, category: 'default', pageTitle: '' };
  }

  if (isDoctorPage()) {
    return { locale, category: 'default', pageTitle: '' };
  }

  if (DEPARTMENT_PATH_RE.test(pathname) || pathname.includes('privacy')) {
    return { locale, category: 'corporate', pageTitle: '' };
  }

  return { locale, category: 'default', pageTitle: '' };
}

function removeOrphanFloats() {
  document.querySelectorAll('.instagram-float').forEach((node) => {
    if (!node.closest(STACK_SELECTOR)) node.remove();
  });
  document.querySelectorAll('.whatsapp-float').forEach((node) => {
    if (!node.closest(STACK_SELECTOR)) node.remove();
  });
}

function ensureStackContainer() {
  let stack = document.querySelector(STACK_SELECTOR);
  if (stack) return stack;

  stack = document.createElement('div');
  stack.className = 'floating-social-stack';
  stack.setAttribute('data-floating-social-stack', '');
  document.body.appendChild(stack);
  return stack;
}

function ensureInstagramLink(stack, dictionary) {
  let link = stack.querySelector('[data-floating-social="instagram"]');
  if (!link) {
    link = document.createElement('a');
    link.href = INSTAGRAM_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'instagram-float floating-social floating-instagram';
    link.setAttribute('data-floating-social', 'instagram');
    link.innerHTML = INSTAGRAM_ICON;
    stack.appendChild(link);
  }

  link.setAttribute('aria-label', translate(dictionary, INSTAGRAM_ARIA_LABEL));
  return link;
}

function ensureWhatsAppLink(stack, context, dictionary) {
  let link = stack.querySelector('[data-floating-social="whatsapp"]');
  if (!link) {
    link = document.createElement('a');
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'whatsapp-float floating-social floating-whatsapp';
    link.setAttribute('data-floating-social', 'whatsapp');
    link.innerHTML = WHATSAPP_ICON;
    stack.appendChild(link);
  }

  link.href = buildWhatsAppUrl(context);
  link.setAttribute('aria-label', translate(dictionary, 'WhatsApp'));
  return link;
}

export function mountFloatingSocialStack({ dictionary, whatsapp } = {}) {
  if (isAdminPage()) return null;

  removeOrphanFloats();

  const stack = ensureStackContainer();
  const context = resolveWhatsAppContext(whatsapp);
  ensureInstagramLink(stack, dictionary);
  ensureWhatsAppLink(stack, context, dictionary);

  return stack;
}

let mountPromise = null;

export function ensureFloatingSocialStackMounted(options = {}) {
  if (isAdminPage()) return Promise.resolve();

  if (document.querySelector(STACK_SELECTOR)) {
    if (options.whatsapp) {
      return loadUiDictionary(getCurrentLocale()).then((dictionary) => {
        const stack = document.querySelector(STACK_SELECTOR);
        ensureWhatsAppLink(stack, resolveWhatsAppContext(options.whatsapp), dictionary);
      });
    }
    return Promise.resolve();
  }

  if (options.dictionary) {
    mountFloatingSocialStack(options);
    return Promise.resolve();
  }

  const pending = (async () => {
    if (document.querySelector(STACK_SELECTOR)) return;
    const locale = getCurrentLocale();
    const dictionary = await loadUiDictionary(locale);
    mountFloatingSocialStack({ dictionary, whatsapp: options.whatsapp });
  })();

  mountPromise = pending;
  return pending;
}

/** @deprecated Use ensureFloatingSocialStackMounted */
export function ensureInstagramFloatMounted(dictionary) {
  return ensureFloatingSocialStackMounted({ dictionary });
}
