import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CATEGORY_CONFIG,
  CATEGORY_ORDER,
  SUBPAGES,
} from '../src/subpages-data.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TARGETS = {
  en: 'en',
  ar: 'ar',
  es: 'es',
  fr: 'fr',
  it: 'it',
  ru: 'ru',
  de: 'de',
};
const MAX_BATCH_CHARACTERS = 3600;
const REQUEST_CONCURRENCY = 4;

const SERVICE_STRINGS = [
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
  'Sorularınız mı var?',
  'Tedavi planınız için uzman ekibimizle iletişime geçebilirsiniz.',
  'WhatsApp ile Bilgi Al',
  'Gezinti yolu',
  'İlgili Tedaviler',
  'İlgili Hizmetler',
  'İlgili Hekimler',
  'Görsel',
  'Önceki',
  'Sonraki',
  'Profil Bilgileri',
  'Profil bilgileri klinik tarafından doğrulandıkça güncellenir.',
  'Profil tamamlanmadan indexlenmez.',
  'GERÇEK VERİ GEREKİYOR',
  'Eğitim',
  'Deneyim',
  'İlgi Alanları',
  'Yayınlar',
  'Kongreler',
  'Mesleki Üyelikler',
  'Klinik Yaklaşım',
  'Göz Sağlığı',
  'Hata Oluştu',
];

function decodeHtml(value) {
  return value
    .replaceAll('&copy;', '©')
    .replaceAll('&nbsp;', '\u00a0')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_match, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function cleanText(value) {
  return decodeHtml(value.replace(/\s+/g, ' ').trim());
}

async function extractUiSources() {
  const html = await fs.readFile(path.join(ROOT, 'index.html'), 'utf8');
  const htmlStrings = [];
  const htmlElementPattern = /<(h[1-6])[^>]*data-i18n-html[^>]*>([\s\S]*?)<\/\1>/gi;

  for (const match of html.matchAll(htmlElementPattern)) {
    htmlStrings.push(cleanText(match[2]));
  }

  const withoutRichHeadings = html.replace(htmlElementPattern, '');
  const withoutNonText = withoutRichHeadings
    .replace(/<(script|style|noscript|svg)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const textStrings = [...SERVICE_STRINGS];

  for (const match of withoutNonText.matchAll(/>([^<>]+)</g)) {
    const value = cleanText(match[1]);
    if (value) textStrings.push(value);
  }

  for (const match of html.matchAll(/\b(?:aria-label|placeholder|alt|title)="([^"]+)"/gi)) {
    const value = cleanText(match[1]);
    if (value) textStrings.push(value);
  }

  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1];
  if (description) textStrings.push(cleanText(description));

  return {
    text: [...new Set(textStrings)],
    html: [...new Set(htmlStrings)],
  };
}

function shouldTranslate(pathParts, value) {
  if (!value.trim()) return false;
  const key = pathParts.at(-1);
  if (['slug', 'category', 'type'].includes(key)) return false;
  if (pathParts.includes('images')) return false;
  return true;
}

function collectContentStrings(value, pathParts = [], output = []) {
  if (typeof value === 'string') {
    if (shouldTranslate(pathParts, value)) output.push(value);
    return output;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectContentStrings(item, [...pathParts, '[]'], output));
    return output;
  }

  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => {
      collectContentStrings(item, [...pathParts, key], output);
    });
  }

  return output;
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

function createBatches(values) {
  const batches = [];
  let current = [];
  let length = 0;

  values.forEach((value) => {
    const estimated = value.length + 18;
    if (current.length && length + estimated > MAX_BATCH_CHARACTERS) {
      batches.push(current);
      current = [];
      length = 0;
    }
    current.push(value);
    length += estimated;
  });

  if (current.length) batches.push(current);
  return batches;
}

async function requestTranslation(text, targetLocale, attempt = 1) {
  const body = new URLSearchParams({
    client: 'gtx',
    sl: 'tr',
    tl: targetLocale,
    dt: 't',
    q: text,
  });

  try {
    const response = await fetch('https://translate.googleapis.com/translate_a/single', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    return payload[0].map((part) => part[0]).join('');
  } catch (error) {
    if (attempt >= 5) throw error;
    await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
    return requestTranslation(text, targetLocale, attempt + 1);
  }
}

function parseBatchTranslation(output, batch) {
  const markerPattern = /ZXQ(\d{4})ZXQ/g;
  const markers = [...output.matchAll(markerPattern)];
  if (markers.length !== batch.length) return null;

  const translated = {};
  markers.forEach((marker, index) => {
    const start = marker.index + marker[0].length;
    const end = markers[index + 1]?.index ?? output.length;
    translated[batch[Number(marker[1])]] = output.slice(start, end).trim();
  });
  return translated;
}

async function translateBatch(batch, targetLocale) {
  const source = batch
    .map((value, index) => `ZXQ${String(index).padStart(4, '0')}ZXQ\n${value}`)
    .join('\n');
  const output = await requestTranslation(source, targetLocale);
  const parsed = parseBatchTranslation(output, batch);
  if (parsed) return parsed;

  const translated = {};
  for (const value of batch) {
    translated[value] = (await requestTranslation(value, targetLocale)).trim();
  }
  return translated;
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function translateLocale(locale, uiSources, contentStrings) {
  const targetLocale = TARGETS[locale];
  const cacheFile = path.join(ROOT, '.translation-cache', `${locale}.json`);
  const cache = await readJson(cacheFile, {});
  const allStrings = [...new Set([
    ...uiSources.text,
    ...uiSources.html,
    ...contentStrings,
  ])];
  const pending = allStrings.filter((value) => !cache[value]);
  const batches = createBatches(pending);

  console.log(`[${locale}] ${allStrings.length} unique strings, ${pending.length} pending, ${batches.length} batches`);

  for (let index = 0; index < batches.length; index += REQUEST_CONCURRENCY) {
    const wave = batches.slice(index, index + REQUEST_CONCURRENCY);
    const results = await Promise.all(wave.map((batch) => translateBatch(batch, targetLocale)));
    results.forEach((result) => Object.assign(cache, result));
    await writeJson(cacheFile, cache);
    console.log(`[${locale}] ${Math.min(index + wave.length, batches.length)}/${batches.length} batches`);
  }

  const ui = {
    text: Object.fromEntries(uiSources.text.map((source) => [source, cache[source] || source])),
    html: Object.fromEntries(uiSources.html.map((source) => [source, cache[source] || source])),
  };
  const contentSource = {
    categoryConfig: CATEGORY_CONFIG,
    categoryOrder: CATEGORY_ORDER,
    pages: SUBPAGES,
  };
  const content = translateContentTree(contentSource, cache);

  await Promise.all([
    writeJson(path.join(ROOT, 'src', 'i18n', 'ui', `${locale}.json`), ui),
    writeJson(path.join(ROOT, 'src', 'i18n', 'content', `${locale}.json`), content),
  ]);
}

async function main() {
  const requestedLocale = process.argv.find((argument) => argument.startsWith('--locale='))
    ?.split('=')[1];
  const locales = requestedLocale ? [requestedLocale] : Object.keys(TARGETS);
  if (locales.some((locale) => !TARGETS[locale])) {
    throw new Error(`Unsupported locale: ${requestedLocale}`);
  }

  const uiSources = await extractUiSources();
  const contentStrings = [...new Set(collectContentStrings({
    categoryConfig: CATEGORY_CONFIG,
    pages: SUBPAGES,
  }))];

  for (const locale of locales) {
    await translateLocale(locale, uiSources, contentStrings);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
