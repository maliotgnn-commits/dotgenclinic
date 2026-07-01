import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SITE_ORIGIN = 'https://www.drotgenclinic.com';
const LOCALES = ['tr', 'en', 'ar', 'es', 'fr', 'it', 'ru', 'de'];
const DEFAULT_LOCALE = 'tr';
const SOURCE_TITLE = 'Dr Otgen Clinic Aesthetic | Estetik ve Sağlık Merkezi';
const SOURCE_DESCRIPTION =
  'Dr Otgen Clinic Aesthetic; estetik cerrahi, saç ekimi, diş estetiği, medikal estetik ve fonksiyonel sağlık alanlarında kişiye özel tedavi planlaması sunar.';

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

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

  const hreflangLinks = LOCALES.map(
    (code) =>
      `    <link data-i18n-seo="true" rel="alternate" hreflang="${code}" href="${homeUrlFor(code)}" />`,
  ).join('\n');
  const xDefault = `    <link data-i18n-seo="true" rel="alternate" hreflang="x-default" href="${homeUrlFor(DEFAULT_LOCALE)}" />`;
  const canonicalLink = `    <link data-i18n-seo="true" rel="canonical" href="${canonical}" />`;

  return { title, description, seoBlock: `${canonicalLink}\n${hreflangLinks}\n${xDefault}` };
}

function injectSeo(html, locale) {
  const { title, description, seoBlock } = buildSeoHead(locale);
  let result = html;

  result = result.replace(/<html lang="[^"]*">/, `<html lang="${locale}">`);
  result = result.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  result = result.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  );
  result = result.replace(
    /(<meta name="description" content="[^"]*" \/>)/,
    `$1\n${seoBlock}`,
  );

  return result;
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
