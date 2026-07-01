import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SITE_ORIGIN,
  LOCALES,
  DEFAULT_LOCALE,
  escapeHtml,
  buildCanonicalAndHreflang,
  buildOgTwitterTags,
  buildPrivacySchema,
  injectSeoBundle,
} from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function loadPrivacyContent(locale) {
  const path = resolve(ROOT, `src/i18n/privacy/${locale}.json`);
  return JSON.parse(readFileSync(path, 'utf8'));
}

function privacyUrlFor(locale) {
  return `${SITE_ORIGIN}/${locale}/privacy.html`;
}

function buildPrivacyBody(content, locale) {
  const introHtml = content.intro.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n');
  const sectionsHtml = content.sections
    .map((section) => {
      const heading = `<h2>${escapeHtml(section.heading)}</h2>`;
      const paragraphs = section.paragraphs
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join('\n');
      const list = section.list?.length
        ? `<ul>${section.list.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
        : '';
      const afterList = section.paragraphsAfterList
        ?.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join('\n') || '';
      return `${heading}\n${paragraphs}\n${list}\n${afterList}`;
    })
    .join('\n');

  const webFormHtml = `
    <section class="privacy-section privacy-web-form">
      <h2>${escapeHtml(content.webFormSection.title)}</h2>
      <ul>
        ${content.webFormSection.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n        ')}
      </ul>
    </section>`;

  const locations = content.locationsSection;
  const locationsHtml = `
    <section class="privacy-section privacy-locations">
      <h2>${escapeHtml(locations.title)}</h2>
      ${locations.branches
        .map(
          (branch) =>
            `<div class="privacy-branch"><h3>${escapeHtml(branch.name)}</h3><p dir="ltr">${escapeHtml(branch.address)}</p></div>`,
        )
        .join('\n      ')}
      <p><strong>${escapeHtml(locations.sharedPhoneLabel)}:</strong> <span dir="ltr">${escapeHtml(locations.sharedPhone)}</span></p>
      <p><strong>${escapeHtml(locations.sharedWhatsappLabel)}:</strong> <a href="${escapeHtml(locations.sharedWhatsapp)}" dir="ltr">${escapeHtml(locations.sharedWhatsapp)}</a></p>
      <p><strong>${escapeHtml(locations.sharedEmailLabel)}:</strong> <a href="mailto:${escapeHtml(locations.sharedEmail)}" dir="ltr">${escapeHtml(locations.sharedEmail)}</a></p>
      <p><strong>${escapeHtml(locations.hoursLabel)}:</strong> ${escapeHtml(locations.hoursWeekdays)}<br>${escapeHtml(locations.hoursSunday)}</p>
    </section>`;

  return `
    <article class="privacy-document">
      <h1>${escapeHtml(content.documentTitle)}</h1>
      ${introHtml}
      ${sectionsHtml}
      ${webFormHtml}
      ${locationsHtml}
      <p class="privacy-signature">${escapeHtml(content.signature)}</p>
    </article>
    <p class="privacy-back"><a href="/${locale}/">${escapeHtml(content.backLinkLabel)}</a></p>
  `.trim();
}

function injectPrivacy(html, locale, content) {
  const title = content.meta.title;
  const description = content.meta.description;
  const canonical = privacyUrlFor(locale);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const seoBlock = buildCanonicalAndHreflang(canonical, (code) => privacyUrlFor(code));
  const ogTwitter = buildOgTwitterTags({ title, description, url: canonical });
  const jsonLd = buildPrivacySchema(locale, title, description);

  let result = html.replace(/<html lang="[^"]*">/, `<html lang="${locale}" dir="${dir}">`);
  result = injectSeoBundle(result, { title, description, seoBlock, ogTwitter, jsonLd });
  result = result.replace(
    /<main id="privacy-app"><\/main>/,
    `<main id="privacy-app">${buildPrivacyBody(content, locale)}</main>`,
  );
  return result;
}

export function prerenderPrivacySeo(outDir) {
  const privacyPath = resolve(outDir, 'privacy.html');
  if (!existsSync(privacyPath)) {
    console.warn('[prerender-privacy-seo] privacy.html not found, skipping');
    return;
  }

  const baseHtml = readFileSync(privacyPath, 'utf8');

  for (const locale of LOCALES) {
    const content = loadPrivacyContent(locale);
    const localeDir = resolve(outDir, locale);
    mkdirSync(localeDir, { recursive: true });
    writeFileSync(resolve(localeDir, 'privacy.html'), injectPrivacy(baseHtml, locale, content), 'utf8');
  }

  console.log(`[prerender-privacy-seo] Generated ${LOCALES.length} locale privacy pages in ${outDir}`);
}
