import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUBPAGES } from '../src/subpages-data.js';
import { LOCALES, SITE_ORIGIN } from './seo-shared.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const eyeHealthPaths = [
  'tr/goz-hastaliklari.html',
  'en/eye-health.html',
  'ar/صحة-العين.html',
  'es/salud-ocular.html',
  'fr/sante-oculaire.html',
  'it/salute-oculare.html',
  'ru/здоровье-глаз.html',
  'de/augengesundheit.html',
];

const urls = [
  ...LOCALES.map((locale) => `${SITE_ORIGIN}/${locale}/`),
  ...LOCALES.map((locale) => `${SITE_ORIGIN}/${locale}/privacy.html`),
  ...eyeHealthPaths.map((path) => `${SITE_ORIGIN}/${path}`),
];

for (const locale of LOCALES) {
  for (const page of SUBPAGES) {
    urls.push(`${SITE_ORIGIN}/${locale}/service.html?slug=${page.slug}`);
  }
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((url) => `  <url><loc>${url}</loc></url>`),
  '</urlset>',
  '',
].join('\n');

writeFileSync(resolve(ROOT, 'public/sitemap.xml'), xml, 'utf8');
console.log(`[generate-sitemap] Wrote ${urls.length} URLs to public/sitemap.xml`);
