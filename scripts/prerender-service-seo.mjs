import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUBPAGES } from '../src/subpages-data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SITE_ORIGIN = 'https://www.drotgenclinic.com';
const LOCALES = ['tr', 'en', 'ar', 'es', 'fr', 'it', 'ru', 'de'];
const DEFAULT_LOCALE = 'tr';

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function loadPagesForLocale(locale) {
  if (locale === DEFAULT_LOCALE) return SUBPAGES;
  const contentPath = resolve(ROOT, `src/i18n/content/${locale}.json`);
  const catalog = JSON.parse(readFileSync(contentPath, 'utf8'));
  return catalog.pages;
}

function validateCatalogs() {
  const trSlugs = SUBPAGES.map((page) => page.slug);
  const missing = [];

  for (const locale of LOCALES) {
    const pages = loadPagesForLocale(locale);
    const pagesBySlug = Object.fromEntries(pages.map((page) => [page.slug, page]));

    for (const slug of trSlugs) {
      const page = pagesBySlug[slug];
      if (!page) {
        missing.push(`${locale}/${slug} (page missing)`);
        continue;
      }
      if (!String(page.title ?? '').trim()) {
        missing.push(`${locale}/${slug} (missing title)`);
      }
      if (!String(page.summary ?? '').trim()) {
        missing.push(`${locale}/${slug} (missing summary)`);
      }
    }
  }

  if (missing.length) {
    console.error('[prerender-service-seo] Missing localized service SEO data:');
    missing.forEach((entry) => console.error(`  - ${entry}`));
    process.exit(1);
  }

  return trSlugs;
}

function serviceUrlForLocale(slug, locale) {
  const params = new URLSearchParams();
  if (slug) params.set('slug', slug);
  const query = params.toString();
  return `${SITE_ORIGIN}/${locale}/service.html${query ? `?${query}` : ''}`;
}

function buildSeoHead(page, locale, slug) {
  const title = `${page.title} | Dr Otgen Clinic`;
  const description = `${page.title}: ${page.summary}`;
  const canonical = serviceUrlForLocale(slug, locale);

  const hreflangLinks = LOCALES.map(
    (code) =>
      `    <link data-i18n-seo="true" rel="alternate" hreflang="${code}" href="${serviceUrlForLocale(slug, code)}" />`,
  ).join('\n');
  const xDefault = `    <link data-i18n-seo="true" rel="alternate" hreflang="x-default" href="${serviceUrlForLocale(slug, DEFAULT_LOCALE)}" />`;
  const canonicalLink = `    <link data-i18n-seo="true" rel="canonical" href="${canonical}" />`;

  return { title, description, seoBlock: `${canonicalLink}\n${hreflangLinks}\n${xDefault}` };
}

function buildServiceAppFallback(page) {
  return `
    <h1>${escapeHtml(page.title)}</h1>
    <p>${escapeHtml(page.summary)}</p>
  `.trim();
}

function injectSeo(html, page, locale, slug) {
  const { title, description, seoBlock } = buildSeoHead(page, locale, slug);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  let result = html;

  result = result.replace(/<html lang="[^"]*">/, `<html lang="${locale}" dir="${dir}">`);
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

export function prerenderServiceSeo(outDir) {
  const servicePath = resolve(outDir, 'service.html');
  if (!existsSync(servicePath)) {
    console.warn('[prerender-service-seo] service.html not found, skipping');
    return;
  }

  const trSlugs = validateCatalogs();
  const baseHtml = readFileSync(servicePath, 'utf8');
  let generatedCount = 0;

  for (const locale of LOCALES) {
    const pagesBySlug = Object.fromEntries(
      loadPagesForLocale(locale).map((page) => [page.slug, page]),
    );
    const outputDir = resolve(outDir, '_seo', locale, 'service');
    mkdirSync(outputDir, { recursive: true });

    for (const slug of trSlugs) {
      const page = pagesBySlug[slug];
      const outputPath = resolve(outputDir, `${slug}.html`);
      writeFileSync(outputPath, injectSeo(baseHtml, page, locale, slug), 'utf8');
      generatedCount += 1;
    }
  }

  console.log(`[prerender-service-seo] Generated ${generatedCount} static service pages in ${outDir}/_seo`);
}
