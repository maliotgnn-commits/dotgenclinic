import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUBPAGES_BY_SLUG } from '../src/subpages-data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SITE_ORIGIN = 'https://www.drotgenclinic.com';
const LOCALES = ['tr', 'en', 'ar', 'es', 'fr', 'it', 'ru', 'de'];
const DEFAULT_LOCALE = 'tr';
const POC_LOCALE = 'tr';
const POC_SLUG = 'botox';

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function serviceUrlForLocale(slug, locale) {
  const params = new URLSearchParams();
  if (slug) params.set('slug', slug);
  const query = params.toString();
  return `${SITE_ORIGIN}/${locale}/service.html${query ? `?${query}` : ''}`;
}

function buildSeoHead(page) {
  const title = `${page.title} | Dr Otgen Clinic`;
  const description = `${page.title}: ${page.summary}`;
  const canonical = serviceUrlForLocale(POC_SLUG, POC_LOCALE);

  const hreflangLinks = LOCALES.map(
    (code) =>
      `    <link data-i18n-seo="true" rel="alternate" hreflang="${code}" href="${serviceUrlForLocale(POC_SLUG, code)}" />`,
  ).join('\n');
  const xDefault = `    <link data-i18n-seo="true" rel="alternate" hreflang="x-default" href="${serviceUrlForLocale(POC_SLUG, DEFAULT_LOCALE)}" />`;
  const canonicalLink = `    <link data-i18n-seo="true" rel="canonical" href="${canonical}" />`;

  return { title, description, seoBlock: `${canonicalLink}\n${hreflangLinks}\n${xDefault}` };
}

function buildServiceAppFallback(page) {
  return `
    <h1>${escapeHtml(page.title)}</h1>
    <p>${escapeHtml(page.summary)}</p>
  `.trim();
}

function injectSeo(html, page) {
  const { title, description, seoBlock } = buildSeoHead(page);
  let result = html;

  result = result.replace(/<html lang="[^"]*">/, `<html lang="${POC_LOCALE}">`);
  result = result.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  result = result.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  );
  result = result.replace(
    /(<meta name="description" content="[^"]*" \/>)/,
    `$1\n${seoBlock}`,
  );
  result = result.replace(
    /<main id="service-app"><\/main>/,
    `<main id="service-app">${buildServiceAppFallback(page)}</main>`,
  );

  return result;
}

export function prerenderServiceSeoPoc(outDir) {
  const servicePath = resolve(outDir, 'service.html');
  if (!existsSync(servicePath)) {
    console.warn('[prerender-service-seo-poc] service.html not found, skipping');
    return;
  }

  const page = SUBPAGES_BY_SLUG[POC_SLUG];
  if (!page) {
    console.warn('[prerender-service-seo-poc] botox page not found in subpages-data, skipping');
    return;
  }

  const baseHtml = readFileSync(servicePath, 'utf8');
  const outputDir = resolve(outDir, '_seo', POC_LOCALE, 'service');
  mkdirSync(outputDir, { recursive: true });

  const outputPath = resolve(outputDir, `${POC_SLUG}.html`);
  writeFileSync(outputPath, injectSeo(baseHtml, page), 'utf8');

  console.log(`[prerender-service-seo-poc] Generated ${outputPath}`);
}
