import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTrFinanceContent } from '../src/finance-content.js';
import { financePathForLocale } from '../src/finance-routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

export function getFinanceContentSync(locale) {
  if (locale === 'tr') return buildTrFinanceContent();

  const path = resolve(ROOT, `src/i18n/finance/${locale}.json`);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  return {
    page: {
      ...data.page,
      canonicalPath: financePathForLocale(locale),
    },
    nav: data.nav,
  };
}
