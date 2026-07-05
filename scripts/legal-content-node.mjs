import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTrLegalContent } from '../src/legal-content.js';
import { legalPathForLocale } from '../src/legal-routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

export function getLegalContentSync(locale) {
  if (locale === 'tr') return buildTrLegalContent();

  const path = resolve(ROOT, `src/i18n/legal/${locale}.json`);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  return {
    page: {
      ...data.page,
      canonicalPath: legalPathForLocale(locale),
    },
    nav: data.nav,
  };
}
