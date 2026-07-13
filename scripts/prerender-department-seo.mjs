import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEPARTMENT_SEO_PAGES,
  departmentBreadcrumbs,
  departmentUrlForLocale,
} from './department-seo-config.mjs';
import {
  escapeHtml,
  buildCanonicalAndHreflang,
  buildOgTwitterTags,
  buildDepartmentSchema,
  injectSeoBundle,
} from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function buildDepartmentStaticFallback(content) {
  const { page } = content;
  const heading = page.hero?.title ?? page.title;
  const summary = page.hero?.description ?? page.hero?.lead ?? page.description;
  return `
    <h1>${escapeHtml(heading)}</h1>
    <p>${escapeHtml(summary)}</p>
  `.trim();
}

function injectDepartmentSeo(html, content, locale, department) {
  const { page } = content;
  const title = page.title;
  const description = page.description;
  const canonical = departmentUrlForLocale(department.routes, locale);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const seoBlock = buildCanonicalAndHreflang(canonical, (code) =>
    departmentUrlForLocale(department.routes, code),
  );
  const ogTwitter = buildOgTwitterTags({ title, description, url: canonical });
  const jsonLd = buildDepartmentSchema(
    locale,
    page,
    canonical,
    departmentBreadcrumbs(content, locale),
  );
  const mountPattern = new RegExp(`<main id="${department.appMountId}">\\s*</main>`);

  let result = html.replace(/<html lang="[^"]*">/, `<html lang="${locale}" dir="${dir}">`);
  result = injectSeoBundle(result, { title, description, seoBlock, ogTwitter, jsonLd });
  result = result.replace(
    mountPattern,
    `<main id="${department.appMountId}">${buildDepartmentStaticFallback(content)}</main>`,
  );
  return result;
}

export function prerenderDepartmentSeo(outDir = resolve(ROOT, 'dist')) {
  let generatedCount = 0;

  for (const department of DEPARTMENT_SEO_PAGES) {
    for (const locale of department.locales) {
      const route = department.routes[locale];
      const sourcePath = resolve(outDir, locale, route.file);

      if (!existsSync(sourcePath)) {
        console.warn(
          `[prerender-department-seo] Missing dist/${locale}/${route.file}, skipping ${department.key}`,
        );
        continue;
      }

      const baseHtml = readFileSync(sourcePath, 'utf8');
      const content = department.getContent(locale);
      const outputPath = resolve(outDir, '_seo', locale, route.file);
      mkdirSync(dirname(outputPath), { recursive: true });
      writeFileSync(outputPath, injectDepartmentSeo(baseHtml, content, locale, department), 'utf8');
      generatedCount += 1;
    }
  }

  console.log(
    `[prerender-department-seo] Generated ${generatedCount} static department pages in ${outDir}/_seo`,
  );
}
