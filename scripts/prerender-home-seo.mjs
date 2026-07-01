import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SITE_ORIGIN,
  LOCALES,
  DEFAULT_LOCALE,
  buildCanonicalAndHreflang,
  buildOgTwitterTags,
  buildHomeSchema,
  injectSeoBundle,
} from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SOURCE_TITLE = 'Dr Otgen Clinic Aesthetic | Estetik ve Sağlık Merkezi';
const SOURCE_DESCRIPTION =
  'Dr Otgen Clinic Aesthetic; estetik cerrahi, saç ekimi, diş estetiği, medikal estetik ve fonksiyonel sağlık alanlarında kişiye özel tedavi planlaması sunar.';

function loadUiDictionary(locale) {
  if (locale === DEFAULT_LOCALE) return { text: {}, html: {} };
  const path = resolve(ROOT, `src/i18n/ui/${locale}.json`);
  return JSON.parse(readFileSync(path, 'utf8'));
}

function translate(dictionary, source) {
  return dictionary?.text?.[source] || source;
}

function homeUrlFor(locale) {
  return `${SITE_ORIGIN}/${locale}/`;
}

function buildSeoHead(locale) {
  const dictionary = loadUiDictionary(locale);
  const title = translate(dictionary, SOURCE_TITLE);
  const description = translate(dictionary, SOURCE_DESCRIPTION);
  const canonical = homeUrlFor(locale);
  const seoBlock = buildCanonicalAndHreflang(canonical, homeUrlFor);
  const ogTwitter = buildOgTwitterTags({ title, description, url: canonical });
  const jsonLd = buildHomeSchema(locale, title);
  return { title, description, seoBlock, ogTwitter, jsonLd };
}

function injectSeo(html, locale) {
  const { title, description, seoBlock, ogTwitter, jsonLd } = buildSeoHead(locale);
  let result = html.replace(/<html lang="[^"]*">/, `<html lang="${locale}">`);
  return injectSeoBundle(result, { title, description, seoBlock, ogTwitter, jsonLd });
}

export function prerenderHomeSeo(outDir) {
  const indexPath = resolve(outDir, 'index.html');
  if (!existsSync(indexPath)) {
    console.warn('[prerender-home-seo] index.html not found, skipping');
    return;
  }

  const baseHtml = readFileSync(indexPath, 'utf8');

  for (const locale of LOCALES) {
    const localeDir = resolve(outDir, locale);
    mkdirSync(localeDir, { recursive: true });
    writeFileSync(resolve(localeDir, 'index.html'), injectSeo(baseHtml, locale), 'utf8');
  }

  console.log(`[prerender-home-seo] Generated ${LOCALES.length} locale home pages in ${outDir}`);
}
