import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CATEGORY_CONFIG,
  CATEGORY_ORDER,
  SUBPAGES,
} from '../src/subpages-data.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCALES = ['en', 'ar', 'es', 'fr', 'it', 'ru', 'de'];
const REQUIRED_UI = [
  'Dil seçin',
  'Gönderiliyor...',
  'Gönderildi',
  'Menü',
  'Randevu Al',
  'Ana Sayfa',
  'Genel Bakış',
  'Tedavi Süreci',
  'Kimler İçin Uygundur?',
  'Kısa Bilgiler',
  'Sık Sorulan Sorular',
  'İlgili Sayfalar',
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function collectLeafPaths(value, current = '', output = new Map()) {
  if (typeof value === 'string') {
    output.set(current, value);
    return output;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectLeafPaths(item, `${current}[${index}]`, output));
    return output;
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => {
      collectLeafPaths(item, current ? `${current}.${key}` : key, output);
    });
  }
  return output;
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

async function validateLocale(locale) {
  const ui = await readJson(path.join(ROOT, 'src', 'i18n', 'ui', `${locale}.json`));
  const content = await readJson(path.join(ROOT, 'src', 'i18n', 'content', `${locale}.json`));
  const source = {
    categoryConfig: CATEGORY_CONFIG,
    categoryOrder: CATEGORY_ORDER,
    pages: SUBPAGES,
  };

  assert(content.pages.length === SUBPAGES.length, `[${locale}] Expected ${SUBPAGES.length} pages`);
  assert(
    JSON.stringify(content.categoryOrder) === JSON.stringify(CATEGORY_ORDER),
    `[${locale}] Category order changed`,
  );
  assert(
    JSON.stringify(content.pages.map(({ slug }) => slug)) === JSON.stringify(SUBPAGES.map(({ slug }) => slug)),
    `[${locale}] Page slugs changed`,
  );
  assert(
    JSON.stringify(Object.keys(content.categoryConfig)) === JSON.stringify(Object.keys(CATEGORY_CONFIG)),
    `[${locale}] Category keys changed`,
  );

  const sourceLeaves = collectLeafPaths(source);
  const localeLeaves = collectLeafPaths(content);
  assert(sourceLeaves.size === localeLeaves.size, `[${locale}] Content shape differs from Turkish`);
  sourceLeaves.forEach((_value, leafPath) => {
    assert(localeLeaves.has(leafPath), `[${locale}] Missing ${leafPath}`);
    assert(
      typeof localeLeaves.get(leafPath) === 'string',
      `[${locale}] Invalid ${leafPath}`,
    );
  });

  assert(Object.keys(ui.text).length >= 100, `[${locale}] Homepage UI catalog is incomplete`);
  assert(Object.keys(ui.html).length >= 8, `[${locale}] Rich heading catalog is incomplete`);
  REQUIRED_UI.forEach((sourceText) => {
    assert(ui.text[sourceText]?.trim(), `[${locale}] Missing UI translation: ${sourceText}`);
  });

  const translatedValues = [...localeLeaves.values()].filter((value) => value.length > 20);
  if (locale === 'ar') {
    const arabicRatio = translatedValues.filter((value) => /[\u0600-\u06ff]/.test(value)).length / translatedValues.length;
    assert(arabicRatio > 0.8, `[ar] Arabic script coverage is too low (${arabicRatio.toFixed(2)})`);
  }
  if (locale === 'ru') {
    const cyrillicRatio = translatedValues.filter((value) => /[\u0400-\u04ff]/.test(value)).length / translatedValues.length;
    assert(cyrillicRatio > 0.8, `[ru] Cyrillic coverage is too low (${cyrillicRatio.toFixed(2)})`);
  }

  console.log(`[${locale}] ${content.pages.length} pages, ${localeLeaves.size} content leaves, ${Object.keys(ui.text).length} UI strings`);
}

for (const locale of LOCALES) {
  await validateLocale(locale);
}

console.log('All locale catalogs are structurally complete.');
