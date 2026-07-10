import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_ORIGIN, LOCALES, DEFAULT_LOCALE } from './seo-shared.mjs';
import {
  loadUiDictionary,
  loadPrivacyContent,
  markerIsTranslated,
  expectedHeroHtmlForLocale,
  expectedTitleForLocale,
  expectedDescriptionForLocale,
  translate,
  SOURCE_TITLE,
  CRITICAL_TR_TEXT_MARKERS,
  CRITICAL_TR_HTML_MARKERS,
  CRITICAL_TR_PRIVACY_MARKERS,
} from './home-static-i18n.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function extractTagContent(html, pattern) {
  const match = html.match(pattern);
  return match?.[1] ?? null;
}

function extractBody(html) {
  const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return match?.[1] ?? '';
}

function countVisibleH1(html) {
  const body = extractBody(html);
  const h1Matches = body.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi) || [];
  return h1Matches.length;
}

function collectDuplicateIds(html) {
  const body = extractBody(html);
  const ids = [...body.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const seen = new Set();
  const duplicates = new Set();
  ids.forEach((id) => {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  });
  return [...duplicates];
}

function homeUrlFor(locale) {
  return `${SITE_ORIGIN}/${locale}/`;
}

function checkTrLeakage(locale, html, dictionary) {
  if (locale === DEFAULT_LOCALE) return;

  for (const marker of CRITICAL_TR_TEXT_MARKERS) {
    if (!markerIsTranslated(marker, dictionary, 'text')) continue;
    if (html.includes(marker)) {
      failures.push(`[${locale}] Turkish UI marker leaked in body: "${marker}"`);
    }
  }

  for (const marker of CRITICAL_TR_HTML_MARKERS) {
    if (!markerIsTranslated(marker, dictionary, 'html')) continue;
    if (html.includes(marker)) {
      failures.push(`[${locale}] Turkish HTML marker leaked in body: "${marker}"`);
    }
  }

  for (const marker of CRITICAL_TR_PRIVACY_MARKERS) {
    if (html.includes(marker)) {
      failures.push(`[${locale}] Turkish privacy marker leaked in body: "${marker}"`);
    }
  }

  if (html.includes('Uluslararası Sağlık Sigortası')) {
    failures.push(`[${locale}] Turkish international health insurance nav label leaked on home page`);
  }
}

for (const locale of LOCALES) {
  const filePath = resolve(DIST, locale, 'index.html');
  assert(existsSync(filePath), `[${locale}] Missing dist/${locale}/index.html`);
  if (!existsSync(filePath)) continue;

  const html = readFileSync(filePath, 'utf8');
  const body = extractBody(html);
  const dictionary = loadUiDictionary(locale);
  const privacyContent = loadPrivacyContent(locale);
  const expectedTitle = expectedTitleForLocale(locale);
  const expectedDescription = expectedDescriptionForLocale(locale);
  const expectedHero = expectedHeroHtmlForLocale(locale);

  const htmlLang = extractTagContent(html, /<html lang="([^"]*)"/);
  const htmlDir = extractTagContent(html, /<html lang="[^"]*" dir="([^"]*)"/);
  const title = extractTagContent(html, /<title>([^<]*)<\/title>/);
  const description = extractTagContent(html, /<meta name="description" content="([^"]*)" \/>/);
  const canonical = extractTagContent(html, /<link data-i18n-seo="true" rel="canonical" href="([^"]*)" \/>/);
  const hreflangCount = (html.match(/<link data-i18n-seo="true" rel="alternate" hreflang="/g) || []).length;
  const hasXDefault = html.includes('hreflang="x-default"');

  assert(htmlLang === locale, `[${locale}] html lang mismatch (${htmlLang})`);
  assert(
    htmlDir === (locale === 'ar' ? 'rtl' : 'ltr'),
    `[${locale}] html dir mismatch (${htmlDir ?? 'missing'})`,
  );
  assert(title === expectedTitle, `[${locale}] title mismatch`);
  assert(description === expectedDescription, `[${locale}] meta description mismatch`);
  assert(canonical === homeUrlFor(locale), `[${locale}] canonical mismatch (${canonical})`);
  assert(hreflangCount === 9, `[${locale}] expected 9 hreflang links, found ${hreflangCount}`);
  assert(hasXDefault, `[${locale}] missing x-default hreflang`);
  assert(
    canonical?.startsWith(`${SITE_ORIGIN}/`),
    `[${locale}] canonical host must use ${SITE_ORIGIN}`,
  );

  assert(body.includes(`<h1`), `[${locale}] missing visible hero H1 in body`);
  assert(body.includes(expectedHero), `[${locale}] hero H1 content mismatch`);
  assert(body.includes('id="appointment-form"'), `[${locale}] appointment form missing`);
  assert(body.includes('for="form-name"'), `[${locale}] form name label missing`);
  assert(body.includes('id="form-privacy-consent"'), `[${locale}] privacy checkbox missing`);

  if (locale !== DEFAULT_LOCALE) {
    const formNameLabel = translate(loadUiDictionary(locale), 'Ad Soyad');
    assert(body.includes(formNameLabel), `[${locale}] localized form name label missing`);
    assert(body.includes(privacyContent.consentLabelHtml), `[${locale}] localized privacy consent missing`);
  } else {
    assert(body.includes('Ad Soyad'), `[tr] Turkish form name label missing`);
  }

  const duplicateIds = collectDuplicateIds(html);
  assert(duplicateIds.length === 0, `[${locale}] duplicate ids found: ${duplicateIds.join(', ')}`);

  const visibleH1Count = countVisibleH1(html);
  assert(visibleH1Count >= 1, `[${locale}] no H1 elements in body`);
  assert(visibleH1Count <= 3, `[${locale}] unexpected duplicate H1 count (${visibleH1Count})`);

  assert(!body.includes('data-i18n-html></'), `[${locale}] empty data-i18n-html shell detected`);
  assert(title !== SOURCE_TITLE || locale === DEFAULT_LOCALE, `[${locale}] generic TR title leaked`);

  checkTrLeakage(locale, body, dictionary);
}

if (failures.length) {
  console.error('[verify-home-static-i18n] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log(`[verify-home-static-i18n] Verified ${LOCALES.length} locale home pages`);
