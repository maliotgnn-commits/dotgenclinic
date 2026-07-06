import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTrYazilimRdContent } from '../src/yazilim-rd-content.js';
import { yazilimRdPathForLocale } from '../src/yazilim-rd-routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

export function getYazilimRdContentSync(locale) {
  if (locale === 'tr') return buildTrYazilimRdContent();

  const path = resolve(ROOT, `src/i18n/yazilim-rd/${locale}.json`);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  return {
    page: {
      ...data.page,
      canonicalPath: yazilimRdPathForLocale(locale),
    },
  };
}
