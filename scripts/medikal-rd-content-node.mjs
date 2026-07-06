import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTrMedikalRdContent } from '../src/medikal-rd-content.js';
import { medikalRdPathForLocale } from '../src/medikal-rd-routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

export function getMedikalRdContentSync(locale) {
  if (locale === 'tr') return buildTrMedikalRdContent();

  const path = resolve(ROOT, `src/i18n/medikal-rd/${locale}.json`);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  return {
    page: {
      ...data.page,
      canonicalPath: medikalRdPathForLocale(locale),
    },
  };
}
