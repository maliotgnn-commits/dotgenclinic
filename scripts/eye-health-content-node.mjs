import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTrEyeHealthContent } from '../src/eye-health-content.js';
import { eyeHealthPathForLocale } from '../src/eye-health-routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

export function getEyeHealthContentSync(locale) {
  if (locale === 'tr') return buildTrEyeHealthContent();

  const path = resolve(ROOT, `src/i18n/eye-health/${locale}.json`);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  return {
    page: {
      ...data.page,
      canonicalPath: eyeHealthPathForLocale(locale),
    },
    categories: data.categories,
    nav: data.nav,
  };
}
