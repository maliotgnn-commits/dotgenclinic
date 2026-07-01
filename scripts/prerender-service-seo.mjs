import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUBPAGES } from '../src/subpages-data.js';
import {
  SITE_ORIGIN,
  LOCALES,
  DEFAULT_LOCALE,
  escapeHtml,
  buildCanonicalAndHreflang,
  buildOgTwitterTags,
  buildServiceSchema,
  injectSeoBundle,
} from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

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

function buildServiceAppFallback(page) {
  return `
    <h1>${escapeHtml(page.title)}</h1>
    <p>${escapeHtml(page.summary)}</p>
  `.trim();
}

function injectSeo(html, page, locale, slug) {
  const title = `${page.title} | Dr Otgen Clinic`;
  const description = `${page.title}: ${page.summary}`;
  const canonical = serviceUrlForLocale(slug, locale);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const seoBlock = buildCanonicalAndHreflang(canonical, (code) => serviceUrlForLocale(slug, code));
  const ogTwitter = buildOgTwitterTags({ title, description, url: canonical });
  const jsonLd = buildServiceSchema(page, locale, slug);

  let result = html.replace(/<html lang="[^"]*">/, `<html lang="${locale}" dir="${dir}">`);
  result = injectSeoBundle(result, { title, description, seoBlock, ogTwitter, jsonLd });
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
