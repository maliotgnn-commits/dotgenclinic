import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getEyeHealthContentSync } from './eye-health-content-node.mjs';
import { eyeHealthBreadcrumbLabels } from '../src/eye-health-content.js';
import {
  EYE_HEALTH_LOCALES,
  EYE_HEALTH_ROUTES,
  eyeHealthCanonicalUrl,
} from '../src/eye-health-routes.js';
import {
  SITE_ORIGIN,
  LOCALES,
  escapeHtml,
  buildCanonicalAndHreflang,
  buildOgTwitterTags,
  buildEyeHealthSchema,
  injectSeoBundle,
} from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const CATEGORY_EYE_IMAGES = {
  exam: '/images/goz-hastaliklari/category-eyes/category-eye-general-health.webp',
  laser: '/images/goz-hastaliklari/category-eyes/category-eye-laser.webp',
  lens: '/images/goz-hastaliklari/category-eyes/category-eye-cataract.webp',
  retina: '/images/goz-hastaliklari/category-eyes/category-eye-retina.webp',
  eyelid: '/images/goz-hastaliklari/category-eyes/category-eye-eyelid-orbita.webp',
  care: '/images/goz-hastaliklari/category-eyes/category-eye-other-treatments.webp',
};

function renderCategoryEyeImage(iconKey) {
  const src = CATEGORY_EYE_IMAGES[iconKey];
  if (!src) return '';
  return `<span class="eh-category-eye-frame"><img class="eh-category-eye" src="${src}" alt="" width="96" height="60" loading="lazy" decoding="async" aria-hidden="true" /></span>`;
}

function buildStaticFallback(content) {
  const { page, categories, nav } = content;
  const { hero, doctor, closingCta, categoriesIntro } = page;
  const processHtml = page.process
    .map(
      (step) => `
        <article>
          <h3>${escapeHtml(step.title)}</h3>
          <p>${escapeHtml(step.description)}</p>
        </article>
      `,
    )
    .join('');

  const categoriesHtml = categories
    .map(
      (category) => `
      <article class="eh-category-card" id="${escapeHtml(category.id)}">
        ${renderCategoryEyeImage(category.icon)}
        <h3>${escapeHtml(category.title)}</h3>
        <div class="eh-topic-list">
          ${category.topics
            .map(
              (topic) => `
            <article>
              <h4>${escapeHtml(topic.title)}</h4>
              <p>${escapeHtml(topic.description)}</p>
            </article>
          `,
            )
            .join('')}
        </div>
      </article>
    `,
    )
    .join('');

  return `
    <div class="eh-page">
      <section class="eh-hero">
        <img src="${hero.image}" alt="${escapeHtml(hero.imageAlt)}" width="1536" height="1024" />
        <div>
          <p>${escapeHtml(hero.tag)}</p>
          <h1>${escapeHtml(hero.title)}</h1>
          <p>${escapeHtml(hero.description)}</p>
        </div>
      </section>
      <section>
        <h2>${escapeHtml(nav.processTitle)}</h2>
        ${processHtml}
      </section>
      <section>
        <h2>${escapeHtml(doctor.sectionTitle)}</h2>
        <img src="${doctor.image}" alt="${escapeHtml(doctor.imageAlt)}" width="1086" height="1448" />
        <h3>${escapeHtml(doctor.name)}</h3>
        <p>${escapeHtml(doctor.role)}</p>
        <p>${escapeHtml(doctor.description)}</p>
      </section>
      <section>
        <h2>${escapeHtml(categoriesIntro.title)}</h2>
        <p>${escapeHtml(categoriesIntro.description)}</p>
        ${categoriesHtml}
      </section>
      <section>
        <h2>${escapeHtml(closingCta.title)}</h2>
        <p>${escapeHtml(closingCta.description)}</p>
      </section>
    </div>
  `.trim();
}

function eyeHealthUrlForLocale(code) {
  return eyeHealthCanonicalUrl(SITE_ORIGIN, code);
}

function buildEyeHealthHreflangBlock() {
  const hreflangLinks = LOCALES.map(
    (code) =>
      `    <link data-i18n-seo="true" rel="alternate" hreflang="${code}" href="${eyeHealthUrlForLocale(code)}" />`,
  ).join('\n');
  const xDefault = `    <link data-i18n-seo="true" rel="alternate" hreflang="x-default" href="${eyeHealthUrlForLocale('en')}" />`;
  return `${hreflangLinks}\n${xDefault}`;
}

function injectEyeHealthSeo(html, locale) {
  const content = getEyeHealthContentSync(locale);
  const { page } = content;
  const canonical = eyeHealthUrlForLocale(locale);
  const title = page.title;
  const description = page.description;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const seoBlock = `    <link data-i18n-seo="true" rel="canonical" href="${canonical}" />\n${buildEyeHealthHreflangBlock()}`;
  const ogTwitter = buildOgTwitterTags({ title, description, url: canonical });
  const jsonLd = buildEyeHealthSchema(locale, page, eyeHealthBreadcrumbLabels(content, locale));

  let result = html.replace(/<html lang="[^"]*">/, `<html lang="${locale}" dir="${dir}">`);
  result = injectSeoBundle(result, {
    title,
    description,
    seoBlock,
    ogTwitter,
    jsonLd,
  });
  result = result.replace(
    /<main id="eye-health-app"><\/main>/,
    `<main id="eye-health-app">${buildStaticFallback(content)}</main>`,
  );
  return result;
}

export function prerenderEyeHealthSeo(outDir) {
  const sourcePath = resolve(outDir, 'goz-hastaliklari.html');
  if (!existsSync(sourcePath)) {
    console.warn('[prerender-eye-health-seo] goz-hastaliklari.html not found, skipping');
    return;
  }

  const baseHtml = readFileSync(sourcePath, 'utf8');

  for (const locale of EYE_HEALTH_LOCALES) {
    const route = EYE_HEALTH_ROUTES[locale];
    const localeDir = resolve(outDir, locale);
    mkdirSync(localeDir, { recursive: true });
    writeFileSync(
      resolve(localeDir, route.file),
      injectEyeHealthSeo(baseHtml, locale),
      'utf8',
    );
  }

  console.log(`[prerender-eye-health-seo] Generated ${EYE_HEALTH_LOCALES.length} locale eye health pages in ${outDir}`);
}
