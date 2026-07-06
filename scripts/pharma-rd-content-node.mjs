import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTrPharmaRdContent } from '../src/pharma-rd-content.js';
import { pharmaRdPathForLocale } from '../src/pharma-rd-routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

export function getPharmaRdContentSync(locale) {
  if (locale === 'tr') return buildTrPharmaRdContent();

  const path = resolve(ROOT, `src/i18n/pharma-rd/${locale}.json`);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  return {
    page: {
      ...data.page,
      canonicalPath: pharmaRdPathForLocale(locale),
    },
    nav: data.nav,
  };
}
