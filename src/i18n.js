import { eyeHealthPathForLocale } from './eye-health-routes.js';
import { financePathForLocale } from './finance-routes.js';
import { legalPathForLocale } from './legal-routes.js';

export const DEFAULT_LOCALE = 'tr';
export const LOCALE_STORAGE_KEY = 'dr-otgen-locale';

export const LOCALES = [
  { code: 'tr', name: 'Türkçe', intl: 'tr-TR', dir: 'ltr' },
  { code: 'en', name: 'English', intl: 'en-GB', dir: 'ltr' },
  { code: 'ar', name: 'العربية', intl: 'ar', dir: 'rtl' },
  { code: 'es', name: 'Español', intl: 'es-ES', dir: 'ltr' },
  { code: 'fr', name: 'Français', intl: 'fr-FR', dir: 'ltr' },
  { code: 'it', name: 'Italiano', intl: 'it-IT', dir: 'ltr' },
  { code: 'ru', name: 'Русский', intl: 'ru-RU', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', intl: 'de-DE', dir: 'ltr' },
];

const LOCALE_BY_CODE = Object.fromEntries(LOCALES.map((locale) => [locale.code, locale]));
const LOCALE_PATH_PATTERN = new RegExp(`^/(${LOCALES.map(({ code }) => code).join('|')})(?:/|$)`);

const UI_LOADERS = {
  en: () => import('./i18n/ui/en.json').then((module) => module.default),
  ar: () => import('./i18n/ui/ar.json').then((module) => module.default),
  es: () => import('./i18n/ui/es.json').then((module) => module.default),
  fr: () => import('./i18n/ui/fr.json').then((module) => module.default),
  it: () => import('./i18n/ui/it.json').then((module) => module.default),
  ru: () => import('./i18n/ui/ru.json').then((module) => module.default),
  de: () => import('./i18n/ui/de.json').then((module) => module.default),
};

const CONTENT_LOADERS = {
  en: () => import('./i18n/content/en.json').then((module) => module.default),
  ar: () => import('./i18n/content/ar.json').then((module) => module.default),
  es: () => import('./i18n/content/es.json').then((module) => module.default),
  fr: () => import('./i18n/content/fr.json').then((module) => module.default),
  it: () => import('./i18n/content/it.json').then((module) => module.default),
  ru: () => import('./i18n/content/ru.json').then((module) => module.default),
  de: () => import('./i18n/content/de.json').then((module) => module.default),
};

export function isSupportedLocale(value) {
  return Boolean(value && LOCALE_BY_CODE[value]);
}

export function getPathLocale(pathname = window.location.pathname) {
  return pathname.match(LOCALE_PATH_PATTERN)?.[1] || null;
}

export function getStoredLocale() {
  try {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isSupportedLocale(storedLocale) ? storedLocale : null;
  } catch {
    return null;
  }
}

export function storeLocale(locale) {
  if (!isSupportedLocale(locale)) return;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Storage can be unavailable in privacy modes; navigation still works.
  }
}

export function getCurrentLocale(pageType = 'home') {
  const pathLocale = getPathLocale();
  const locale = pathLocale || getStoredLocale() || DEFAULT_LOCALE;

  if ((pageType === 'eye-health' || pageType === 'finance' || pageType === 'legal') && pathLocale) {
    storeLocale(pathLocale);
    applyDocumentDirection(pathLocale);
    return pathLocale;
  }

  if (!pathLocale) {
    const target = pageType === 'service'
      ? serviceUrlForLocale(new URLSearchParams(window.location.search).get('slug'), locale)
      : pageType === 'eye-health'
        ? eyeHealthPathForLocale(locale)
        : pageType === 'finance'
          ? financePathForLocale(locale)
          : pageType === 'legal'
            ? legalPathForLocale(locale)
            : pageType === 'privacy'
            ? `/${locale}/privacy.html`
            : homeUrlFor(locale, window.location.hash);

    window.history.replaceState(window.history.state, '', target);
  }

  storeLocale(locale);
  applyDocumentDirection(locale);
  return locale;
}

export function localeConfig(locale) {
  return LOCALE_BY_CODE[locale] || LOCALE_BY_CODE[DEFAULT_LOCALE];
}

export function getIntlLocale(locale) {
  return localeConfig(locale).intl;
}

export function applyDocumentDirection(locale) {
  const config = localeConfig(locale);
  document.documentElement.lang = config.code;
  document.documentElement.dir = config.dir;
  document.body?.classList.toggle('is-rtl', config.dir === 'rtl');
}

export function homeUrlFor(locale, hash = '') {
  const safeLocale = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
  return `/${safeLocale}/${hash || ''}`;
}

export function serviceUrlForLocale(slug, locale, hash = '') {
  const safeLocale = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
  const params = new URLSearchParams();
  if (slug) params.set('slug', slug);
  const query = params.toString();
  return `/${safeLocale}/service.html${query ? `?${query}` : ''}${hash || ''}`;
}

export function currentPageUrlForLocale(locale, pageType = 'home') {
  if (pageType === 'service') {
    return serviceUrlForLocale(
      new URLSearchParams(window.location.search).get('slug'),
      locale,
      window.location.hash,
    );
  }

  if (pageType === 'eye-health') {
    return eyeHealthPathForLocale(locale);
  }

  if (pageType === 'finance') {
    return financePathForLocale(locale);
  }

  if (pageType === 'legal') {
    return legalPathForLocale(locale);
  }

  if (pageType === 'privacy') {
    return `/${locale}/privacy.html`;
  }

  return homeUrlFor(locale, window.location.hash);
}

export async function loadUiDictionary(locale) {
  if (locale === DEFAULT_LOCALE) return { text: {}, html: {} };
  return UI_LOADERS[locale]?.() || { text: {}, html: {} };
}

export async function loadContentCatalog(locale) {
  if (locale === DEFAULT_LOCALE) {
    const base = await import('./subpages-data.js');
    return {
      categoryConfig: base.CATEGORY_CONFIG,
      categoryOrder: base.CATEGORY_ORDER,
      pages: base.SUBPAGES,
    };
  }

  return CONTENT_LOADERS[locale]?.();
}

export function translate(dictionary, source) {
  return dictionary?.text?.[source] || source;
}

export function translateHtml(dictionary, source) {
  return dictionary?.html?.[source] || source;
}

function replaceTextNode(node, dictionary) {
  const parent = node.parentElement;
  if (!parent || parent.closest('[data-i18n-html], [data-i18n-skip]')) return;
  if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) return;

  const source = node.nodeValue;
  const trimmed = source?.trim();
  if (!trimmed) return;

  const translated = translate(dictionary, trimmed);
  if (translated === trimmed) return;

  const leading = source.match(/^\s*/)?.[0] || '';
  const trailing = source.match(/\s*$/)?.[0] || '';
  node.nodeValue = `${leading}${translated}${trailing}`;
}

export function applyStaticTranslations(dictionary, root = document) {
  root.querySelectorAll('[data-i18n-html]').forEach((element) => {
    const source = element.innerHTML.trim();
    element.innerHTML = translateHtml(dictionary, source);
  });

  const walker = document.createTreeWalker(
    root.documentElement || root,
    NodeFilter.SHOW_TEXT,
  );
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => replaceTextNode(node, dictionary));

  root.querySelectorAll('[aria-label], [placeholder], [alt], [title]').forEach((element) => {
    ['aria-label', 'placeholder', 'alt', 'title'].forEach((attribute) => {
      if (!element.hasAttribute(attribute)) return;
      const source = element.getAttribute(attribute);
      element.setAttribute(attribute, translate(dictionary, source));
    });
  });

  const description = root.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute('content', translate(dictionary, description.getAttribute('content')));
  }

  const title = root.querySelector('title');
  if (title) {
    const sourceTitle = title.textContent.trim();
    const translatedTitle = translate(dictionary, sourceTitle);
    if (translatedTitle !== sourceTitle) {
      title.textContent = translatedTitle;
      document.title = translatedTitle;
    }
  }
}

function upsertSeoLink(rel, hreflang, href) {
  const selector = hreflang
    ? `link[data-i18n-seo][rel="${rel}"][hreflang="${hreflang}"]`
    : `link[data-i18n-seo][rel="${rel}"]:not([hreflang])`;
  let link = document.head.querySelector(selector);
  if (!link) {
    link = document.createElement('link');
    link.dataset.i18nSeo = 'true';
    link.rel = rel;
    if (hreflang) link.hreflang = hreflang;
    document.head.appendChild(link);
  }
  link.href = new URL(href, window.location.origin).href;
}

export function applySeoLinks(locale, pageType = 'home', slug = null) {
  if (pageType === 'eye-health') {
    upsertSeoLink('canonical', null, eyeHealthPathForLocale(locale));
    LOCALES.forEach(({ code }) => {
      upsertSeoLink('alternate', code, eyeHealthPathForLocale(code));
    });
    upsertSeoLink('alternate', 'x-default', eyeHealthPathForLocale('en'));
    return;
  }

  const canonical = pageType === 'service'
    ? serviceUrlForLocale(slug, locale)
    : pageType === 'privacy'
      ? `/${locale}/privacy.html`
      : homeUrlFor(locale);
  upsertSeoLink('canonical', null, canonical);

  LOCALES.forEach(({ code }) => {
    const href = pageType === 'service'
      ? serviceUrlForLocale(slug, code)
      : pageType === 'privacy'
        ? `/${code}/privacy.html`
        : homeUrlFor(code);
    upsertSeoLink('alternate', code, href);
  });

  const defaultHref = pageType === 'service'
    ? serviceUrlForLocale(slug, DEFAULT_LOCALE)
    : pageType === 'privacy'
      ? `/${DEFAULT_LOCALE}/privacy.html`
      : homeUrlFor(DEFAULT_LOCALE);
  upsertSeoLink('alternate', 'x-default', defaultHref);
}

export const RU_HEADER_NAV_LABELS = {
  corporate: 'О клинике',
  hair: 'Волосы',
  dental: 'Стоматология',
  plastic: 'Пластика',
  medical: 'Медэстетика',
  longevity: 'Функциональная медицина',
};

export const CATEGORY_NAV_UI_KEYS = {
  corporate: 'Kurumsal',
  hair: 'Saç Ekimi',
  dental: 'Diş Estetiği',
  plastic: 'Estetik Cerrahi',
  medical: 'Medikal Estetik',
  longevity: 'Fonksiyonel Sağlık',
};

function categoryNavLabel(categoryKey, catalog, uiDictionary, locale) {
  if (locale === 'ru' && RU_HEADER_NAV_LABELS[categoryKey]) {
    return RU_HEADER_NAV_LABELS[categoryKey];
  }
  const uiKey = CATEGORY_NAV_UI_KEYS[categoryKey];
  if (uiKey && uiDictionary) {
    return translate(uiDictionary, uiKey);
  }
  return catalog.categoryConfig[categoryKey]?.label || categoryKey;
}

export function buildCategoryGroups(catalog, uiDictionary = null, locale = null) {
  return catalog.categoryOrder
    .map((categoryKey) => ({
      key: categoryKey,
      label: catalog.categoryConfig[categoryKey]?.label || categoryKey,
      navLabel: categoryNavLabel(categoryKey, catalog, uiDictionary, locale),
      items: catalog.pages
        .filter((page) => page.category === categoryKey)
        .map(({ slug, navLabel, title }) => ({ slug, navLabel, title })),
    }))
    .filter((group) => group.items.length);
}

export function defaultRelatedPages(catalog, page, limit = 4) {
  if (!page) return [];
  const related = catalog.pages.filter(
    (candidate) => candidate.category === page.category && candidate.slug !== page.slug,
  );
  if (related.length >= limit) return related.slice(0, limit);

  const existing = new Set(related.map(({ slug }) => slug));
  existing.add(page.slug);
  return [
    ...related,
    ...catalog.pages.filter((candidate) => !existing.has(candidate.slug)),
  ].slice(0, limit);
}

const PRIVACY_LOADERS = {
  tr: () => import('./i18n/privacy/tr.json').then((module) => module.default),
  en: () => import('./i18n/privacy/en.json').then((module) => module.default),
  ar: () => import('./i18n/privacy/ar.json').then((module) => module.default),
  es: () => import('./i18n/privacy/es.json').then((module) => module.default),
  fr: () => import('./i18n/privacy/fr.json').then((module) => module.default),
  it: () => import('./i18n/privacy/it.json').then((module) => module.default),
  ru: () => import('./i18n/privacy/ru.json').then((module) => module.default),
  de: () => import('./i18n/privacy/de.json').then((module) => module.default),
};

export async function loadPrivacyContent(locale) {
  return PRIVACY_LOADERS[locale]?.() || PRIVACY_LOADERS.tr();
}

export function applyPrivacyUi(locale, privacyContent, root = document) {
  const consentLabel = root.querySelector('label[for="form-privacy-consent"]');
  if (consentLabel && privacyContent?.consentLabelHtml) {
    consentLabel.innerHTML = privacyContent.consentLabelHtml;
  }

  root.querySelectorAll('[data-privacy-footer-link]').forEach((anchor) => {
    anchor.href = `/${locale}/privacy.html`;
    if (privacyContent?.footerLinkLabel) {
      anchor.textContent = privacyContent.footerLinkLabel;
    }
  });

  localizeInternalLinks(locale, root);
}

export function localizeInternalLinks(locale, root = document) {
  root.querySelectorAll('a[data-service-slug]').forEach((anchor) => {
    anchor.href = serviceUrlForLocale(anchor.dataset.serviceSlug, locale);
  });

  root.querySelectorAll('a[href]').forEach((anchor) => {
    const rawHref = anchor.getAttribute('href');
    if (!rawHref || rawHref.startsWith('#') || /^(?:https?:|tel:|mailto:|javascript:)/i.test(rawHref)) {
      return;
    }

    const parsed = new URL(rawHref, window.location.origin);
    const slug = parsed.searchParams.get('slug');
    if (parsed.pathname === '/service.html' && slug) {
      anchor.href = serviceUrlForLocale(slug, locale, parsed.hash);
      return;
    }

    if (parsed.pathname === '/privacy.html' || parsed.pathname.endsWith('/privacy.html')) {
      anchor.href = `/${locale}/privacy.html${parsed.hash}`;
      return;
    }

    if (parsed.pathname === '/index.html' || parsed.pathname === '/') {
      anchor.href = homeUrlFor(locale, parsed.hash);
    }
  });

  root.querySelectorAll('[data-privacy-link], [data-privacy-footer-link]').forEach((anchor) => {
    anchor.href = `/${locale}/privacy.html`;
  });
}
