import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_LOCALE } from './seo-shared.mjs';
import { injectEyeHealthNavForLocale } from '../src/tr-eye-health-nav.js';
import { injectFinanceNavForLocale, stripFinanceNavLink } from '../src/tr-finance-nav.js';
import { injectLegalNavForLocale, stripLegalNavLink } from '../src/tr-legal-nav.js';
import { injectProductionNavForLocale, stripProductionNavLink } from '../src/tr-production-nav.js';
import {
  injectInternationalHealthInsuranceNavForLocale,
  stripInternationalHealthInsuranceNavLink,
} from '../src/tr-international-health-insurance-nav.js';
import { injectArgeNavForLocale } from '../src/tr-arge-nav.js';
import { applyRuCompactHeaderNavHtml, serviceUrlForLocale } from '../src/i18n.js';
import { doctorUrlForLocale } from '../src/doctor-routes.js';
import { NAV_LINK_MAP } from '../src/subpages-nav-links.js';
import { getEyeHealthContentSync } from './eye-health-content-node.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const SKIP_TAGS = new Set(['script', 'style', 'noscript']);
const TRANSLATABLE_ATTRIBUTES = ['aria-label', 'placeholder', 'alt', 'title'];

export function translate(dictionary, source) {
  return dictionary?.text?.[source] || source;
}

export function translateHtml(dictionary, source) {
  return dictionary?.html?.[source] || source;
}

export function loadUiDictionary(locale) {
  if (locale === DEFAULT_LOCALE) return { text: {}, html: {} };
  const path = resolve(ROOT, `src/i18n/ui/${locale}.json`);
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function loadPrivacyContent(locale) {
  const path = resolve(ROOT, `src/i18n/privacy/${locale}.json`);
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return JSON.parse(readFileSync(resolve(ROOT, 'src/i18n/privacy/tr.json'), 'utf8'));
  }
}

function translateTextSegment(text, dictionary) {
  if (!text || !text.trim()) return text;
  const leading = text.match(/^\s*/)?.[0] || '';
  const trailing = text.match(/\s*$/)?.[0] || '';
  const trimmed = text.trim();
  const translated = translate(dictionary, trimmed);
  if (translated === trimmed) return text;
  return `${leading}${translated}${trailing}`;
}

function translateAttributesInTag(tag, dictionary) {
  return tag.replace(
    /(aria-label|placeholder|alt|title)="([^"]*)"/g,
    (match, attribute, value) => {
      if (!TRANSLATABLE_ATTRIBUTES.includes(attribute)) return match;
      const translated = translate(dictionary, value);
      return translated === value ? match : `${attribute}="${translated}"`;
    },
  );
}

function processDataI18nHtml(html, dictionary) {
  return html.replace(
    /<(h[1-6])([^>]*\bdata-i18n-html\b[^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tag, attrs, inner) => {
      const trimmed = inner.trim();
      const translated = translateHtml(dictionary, trimmed);
      if (translated === trimmed) return match;
      return `<${tag}${attrs}>${translated}</${tag}>`;
    },
  );
}

function applyPrivacyMarkup(html, locale, privacyContent) {
  let result = html;

  if (privacyContent?.consentLabelHtml) {
    result = result.replace(
      /(<label\b[^>]*\bfor="form-privacy-consent"[^>]*>)([\s\S]*?)(<\/label>)/i,
      `$1${privacyContent.consentLabelHtml}$3`,
    );
  }

  if (privacyContent?.footerLinkLabel) {
    result = result.replace(
      /(<a\b[^>]*\bdata-privacy-footer-link\b[^>]*>)([\s\S]*?)(<\/a>)/i,
      (match, open, _inner, close) => {
        const href = `/${locale}/privacy.html`;
        const withHref = open.replace(/href="[^"]*"/, `href="${href}"`);
        return `${withHref}${privacyContent.footerLinkLabel}${close}`;
      },
    );
  }

  result = result.replace(
    /(<a\b[^>]*\bdata-privacy-link\b[^>]*)(>)/gi,
    (match, open, close) => {
      const href = `/${locale}/privacy.html`;
      if (/href="[^"]*"/.test(open)) {
        return `${open.replace(/href="[^"]*"/, `href="${href}"`)}${close}`;
      }
      return `${open} href="${href}"${close}`;
    },
  );

  return result;
}

function applyStaticTranslationsToHtml(html, dictionary) {
  if (localeIsSourceOnly(dictionary)) return html;

  let result = processDataI18nHtml(html, dictionary);
  const parts = result.split(/(<[^>]+>)/g);
  const skipStack = [];

  result = parts
    .map((part) => {
      if (part.startsWith('<')) {
        const isClosing = /^<\//.test(part);
        const tagMatch = part.match(/^<\/?([a-zA-Z0-9]+)/);
        const tagName = tagMatch?.[1]?.toLowerCase();

        if (isClosing && tagName && skipStack.length && skipStack[skipStack.length - 1] === tagName) {
          skipStack.pop();
        } else if (!isClosing && tagName && !/^<!/.test(part)) {
          const shouldSkip =
            SKIP_TAGS.has(tagName) ||
            /\bdata-i18n-skip\b/.test(part) ||
            /\bdata-i18n-html\b/.test(part);
          if (shouldSkip) skipStack.push(tagName);
        }

        if (skipStack.length === 0 && !isClosing && !/^<!/.test(part)) {
          return translateAttributesInTag(part, dictionary);
        }
        return part;
      }

      if (skipStack.length > 0) return part;
      return translateTextSegment(part, dictionary);
    })
    .join('');

  return result;
}

function localeIsSourceOnly(dictionary) {
  return !dictionary?.text || Object.keys(dictionary.text).length === 0;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Bake real service/doctor URLs into prerendered home HTML for crawlers (before label translation). */
export function applyStaticHomeNavLinks(html, locale) {
  let result = html;

  result = result.replace(
    /<a\b([^>]*\bdata-service-slug="([^"]+)"[^>]*)>/gi,
    (match, attrs, slug) => {
      const cleaned = attrs.replace(/\bhref="[^"]*"/i, '').trim();
      return `<a ${cleaned} href="${serviceUrlForLocale(slug, locale)}">`;
    },
  );

  result = result.replace(
    /<a\b([^>]*\bdata-doctor-slug="([^"]+)"[^>]*)>/gi,
    (match, attrs, slug) => {
      const cleaned = attrs.replace(/\bhref="[^"]*"/i, '').trim();
      return `<a ${cleaned} href="${doctorUrlForLocale(slug, locale)}">`;
    },
  );

  for (const [label, slug] of Object.entries(NAV_LINK_MAP)) {
    const pattern = new RegExp(
      `<a\\s+href="#"([^>]*)>\\s*${escapeRegExp(label)}\\s*</a>`,
      'g',
    );
    result = result.replace(
      pattern,
      `<a href="${serviceUrlForLocale(slug, locale)}"$1>${label}</a>`,
    );
  }

  return result;
}

export function localizeHomeBodyHtml(html, locale) {
  const dictionary = loadUiDictionary(locale);
  const privacyContent = loadPrivacyContent(locale);
  let result = applyStaticHomeNavLinks(html, locale);

  if (locale !== DEFAULT_LOCALE) {
    result = stripFinanceNavLink(result);
    result = stripLegalNavLink(result);
    result = stripProductionNavLink(result);
    result = stripInternationalHealthInsuranceNavLink(result);
    result = applyStaticTranslationsToHtml(result, dictionary);
    result = injectEyeHealthNavForLocale(result, locale, getEyeHealthContentSync(locale));
    result = injectFinanceNavForLocale(result, locale);
    result = injectLegalNavForLocale(result, locale);
    result = injectProductionNavForLocale(result, locale);
    result = injectInternationalHealthInsuranceNavForLocale(result, locale);
    result = injectArgeNavForLocale(result, locale);
    if (locale === 'ru') {
      result = applyRuCompactHeaderNavHtml(result, dictionary);
    }
  }

  result = applyPrivacyMarkup(result, locale, privacyContent);
  return result;
}

export const SOURCE_TITLE = 'Dr Otgen Clinic Aesthetic | Estetik ve Sağlık Merkezi';
export const SOURCE_DESCRIPTION =
  'Dr Otgen Clinic Aesthetic; estetik cerrahi, saç ekimi, diş estetiği, medikal estetik ve fonksiyonel sağlık alanlarında kişiye özel tedavi planlaması sunar.';

export const CRITICAL_TR_TEXT_MARKERS = [
  'Ana içeriğe atla',
  'Randevu Al',
  'Ad Soyad',
  'Hizmet Seçin',
  'Ücretsiz Danışma',
  'Mesajınızı yazın...',
  'Randevu Talebi Gönder',
  'Ana Sayfa',
];

export const CRITICAL_TR_HTML_MARKERS = [
  'Güzelliğinize <span class="gold-text">Değer</span> Katıyoruz',
];

export const CRITICAL_TR_PRIVACY_MARKERS = [
  "Kişisel Verilerin İşlenmesine İlişkin",
  'Aydınlatma Metni',
  'kişisel verilerimin işlenmesini kabul ediyorum',
];

export function markerIsTranslated(marker, dictionary, kind = 'text') {
  const bucket = kind === 'html' ? dictionary?.html : dictionary?.text;
  const translated = bucket?.[marker];
  return Boolean(translated && translated !== marker);
}

export function expectedHeroHtmlForLocale(locale) {
  const dictionary = loadUiDictionary(locale);
  const source = 'Güzelliğinize <span class="gold-text">Değer</span> Katıyoruz';
  if (locale === DEFAULT_LOCALE) return source;
  return translateHtml(dictionary, source);
}

export function expectedTitleForLocale(locale) {
  const dictionary = loadUiDictionary(locale);
  return translate(dictionary, SOURCE_TITLE);
}

export function expectedDescriptionForLocale(locale) {
  const dictionary = loadUiDictionary(locale);
  return translate(dictionary, SOURCE_DESCRIPTION);
}
