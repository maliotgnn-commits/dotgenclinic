import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EYE_HEALTH_CATEGORIES,
  EYE_HEALTH_PAGE,
} from '../src/eye-health-data.js';
import {
  SITE_ORIGIN,
  escapeHtml,
  buildOgTwitterTags,
  injectSeoBundle,
} from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CANONICAL = `${SITE_ORIGIN}/tr/goz-hastaliklari.html`;

function buildStaticFallback() {
  const { hero, doctor, closingCta, categoriesIntro } = EYE_HEALTH_PAGE;
  const processHtml = EYE_HEALTH_PAGE.process
    .map(
      (step) => `
        <article>
          <h3>${escapeHtml(step.title)}</h3>
          <p>${escapeHtml(step.description)}</p>
        </article>
      `,
    )
    .join('');

  const categoriesHtml = EYE_HEALTH_CATEGORIES.map(
    (category) => `
      <section id="${escapeHtml(category.id)}">
        <h3>${escapeHtml(category.title)}</h3>
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
      </section>
    `,
  ).join('');

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
        <h2>Değerlendirme Süreci</h2>
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

function injectEyeHealthSeo(html) {
  const title = EYE_HEALTH_PAGE.title;
  const description = EYE_HEALTH_PAGE.description;
  const seoBlock = `    <link data-i18n-seo="true" rel="canonical" href="${CANONICAL}" />`;
  const ogTwitter = buildOgTwitterTags({ title, description, url: CANONICAL });

  let result = html.replace(/<html lang="[^"]*">/, '<html lang="tr" dir="ltr">');
  result = injectSeoBundle(result, {
    title,
    description,
    seoBlock,
    ogTwitter,
    jsonLd: '',
  });
  result = result.replace(
    /<main id="eye-health-app"><\/main>/,
    `<main id="eye-health-app">${buildStaticFallback()}</main>`,
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
  const localeDir = resolve(outDir, 'tr');
  mkdirSync(localeDir, { recursive: true });
  writeFileSync(resolve(localeDir, 'goz-hastaliklari.html'), injectEyeHealthSeo(baseHtml), 'utf8');

  console.log('[prerender-eye-health-seo] Generated dist/tr/goz-hastaliklari.html');
}
