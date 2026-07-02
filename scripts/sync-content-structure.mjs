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

function shouldTranslate(pathParts, value) {
  if (!value.trim()) return false;
  const key = pathParts.at(-1);
  if (['slug', 'category', 'type'].includes(key)) return false;
  if (pathParts.includes('images')) return false;
  return true;
}

function translateContentTree(value, translations, pathParts = []) {
  if (typeof value === 'string') {
    return shouldTranslate(pathParts, value) ? translations[value] || value : value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => translateContentTree(item, translations, [...pathParts, '[]']));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        translateContentTree(item, translations, [...pathParts, key]),
      ]),
    );
  }
  return value;
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

async function writeJson(file, value) {
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

for (const locale of LOCALES) {
  const cacheFile = path.join(ROOT, '.translation-cache', `${locale}.json`);
  const cache = await readJson(cacheFile);
  const content = translateContentTree(
    {
      categoryConfig: CATEGORY_CONFIG,
      categoryOrder: CATEGORY_ORDER,
      pages: SUBPAGES,
    },
    cache,
  );
  await writeJson(path.join(ROOT, 'src', 'i18n', 'content', `${locale}.json`), content);
  console.log(`[${locale}] synced ${content.pages.length} pages using cache (${Object.keys(cache).length} entries)`);
}
