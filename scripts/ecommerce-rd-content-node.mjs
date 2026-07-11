import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTrEcommerceRdContent } from '../src/ecommerce-rd-content.js';
import { ecommerceRdPathForLocale } from '../src/ecommerce-rd-routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

export function getEcommerceRdContentSync(locale) {
  if (locale === 'tr') return buildTrEcommerceRdContent();

  const path = resolve(ROOT, `src/i18n/ecommerce-rd/${locale}.json`);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  return {
    page: {
      ...data.page,
      canonicalPath: ecommerceRdPathForLocale(locale),
    },
  };
}
