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
import {
  localizeHomeBodyHtml,
  expectedTitleForLocale,
  expectedDescriptionForLocale,
} from './home-static-i18n.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function homeUrlFor(locale) {
  return `${SITE_ORIGIN}/${locale}/`;
}

function buildSeoHead(locale) {
  const title = expectedTitleForLocale(locale);
  const description = expectedDescriptionForLocale(locale);
  const canonical = homeUrlFor(locale);
  const seoBlock = buildCanonicalAndHreflang(canonical, homeUrlFor);
  const ogTwitter = buildOgTwitterTags({ title, description, url: canonical });
  const jsonLd = buildHomeSchema(locale, title);
  return { title, description, seoBlock, ogTwitter, jsonLd };
}

function injectSeo(html, locale) {
  const { title, description, seoBlock, ogTwitter, jsonLd } = buildSeoHead(locale);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  let result = html.replace(/<html lang="[^"]*">/, `<html lang="${locale}" dir="${dir}">`);
  result = injectSeoBundle(result, { title, description, seoBlock, ogTwitter, jsonLd });
  return result;
}

function buildLocalizedHomeHtml(baseHtml, locale) {
  const localizedBody = localizeHomeBodyHtml(baseHtml, locale);
  return injectSeo(localizedBody, locale);
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
    writeFileSync(resolve(localeDir, 'index.html'), buildLocalizedHomeHtml(baseHtml, locale), 'utf8');
  }

  console.log(`[prerender-home-seo] Generated ${LOCALES.length} locale home pages in ${outDir}`);
}
