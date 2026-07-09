import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTrBlockchainRdContent } from '../src/blockchain-rd-content.js';
import { blockchainRdPathForLocale } from '../src/blockchain-rd-routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

export function getBlockchainRdContentSync(locale) {
  if (locale === 'tr') return buildTrBlockchainRdContent();

  const path = resolve(ROOT, `src/i18n/blockchain-rd/${locale}.json`);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  return {
    page: {
      ...data.page,
      canonicalPath: blockchainRdPathForLocale(locale),
    },
  };
}
