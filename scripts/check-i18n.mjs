import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUBPAGES } from '../src/subpages-data.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCALES = ['tr', 'en', 'ar', 'es', 'fr', 'it', 'ru', 'de'];
const NON_TR_LOCALES = LOCALES.filter((locale) => locale !== 'tr');
const UI_LOCALES = NON_TR_LOCALES;

const TURKISH_REGRESSION_PHRASES = [
  'Sorularınız mı var?',
  'Tedavi planınız için',
  'uzman ekibimizle',
  'WhatsApp ile Bilgi Al',
  'Randevu Al',
  'İlgili Tedaviler',
  'Hakkımızda',
  'İletişim',
  'Bize Ulaşın',
  'Devamını Gör',
  'Detaylı Bilgi',
  'Gönder',
  'Zorunlu alan',
  'Başarıyla gönderildi',
  'Bir hata oluştu',
  'GERÇEK VERİ GEREKİYOR',
];

const ALLOWLIST_PATTERNS = [
  /whatsapp/i,
  /instagram/i,
  /bookimed/i,
  /dr\.?\s*otgen/i,
  /bupa/i,
  /cigna/i,
  /maxx\s*royal/i,
  /fue|dhi|prp|mri|fda|iso|gtm|ga4/i,
];

const IDENTITY_UI_KEYS = new Set([
  'WhatsApp',
  'Instagram',
  'Bookimed',
  'WhatClinic',
  'PlacidWay',
  'Qunomedical',
  'Longevity',
  'Liposuction',
  'Botoks',
  'Ortodonti',
  'Denizli',
  'Menü',
  '*',
  '0',
  '20+',
  '+49 1575 253 940',
  '+44 7831 129 241',
  '+33 758 433 011',
  '+90 5XX XXX XX XX',
  '#AestheticConsultancy',
]);

const SOURCE_SCAN_DIRS = ['src'];
const SOURCE_IGNORE = new Set([
  'node_modules',
  'dist',
  '.git',
]);

const DYNAMIC_PAGE_SOURCES = [
  'src/service.js',
  'src/doctor.js',
  'src/main.js',
  'src/privacy.js',
  'src/eye-health.js',
  'src/finance-department.js',
  'src/legal-department.js',
  'src/pharma-rd-department.js',
  'src/medikal-rd-department.js',
  'src/yazilim-rd-department.js',
  'src/blockchain-rd-department.js',
  'src/ecommerce-rd-department.js',
];

const failures = [];
let checksRun = 0;

function report(issue) {
  failures.push(issue);
}

function assertCheck(condition, issue) {
  checksRun += 1;
  if (!condition) report(issue);
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

async function walkFiles(dir, output = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SOURCE_IGNORE.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkFiles(fullPath, output);
      continue;
    }
    if (/\.(js|mjs|html)$/.test(entry.name)) output.push(fullPath);
  }
  return output;
}

function extractTranslationKeys(source) {
  const keys = new Set();
  const patterns = [
    /\bt\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\btranslate\(\s*[^,]+,\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      keys.add(match[1]);
    }
  }
  return keys;
}

function containsTurkishCharacters(value) {
  return /[çğıöşüÇĞİÖŞÜ]/.test(value);
}

function isAllowlisted(text) {
  return ALLOWLIST_PATTERNS.some((pattern) => pattern.test(text));
}

async function collectSourceFiles() {
  const files = [];
  for (const dir of SOURCE_SCAN_DIRS) {
    await walkFiles(path.join(ROOT, dir), files);
  }
  return files;
}

async function validateUiDictionaryParity() {
  const requiredKeys = new Set();
  for (const relativePath of DYNAMIC_PAGE_SOURCES) {
    const source = await fs.readFile(path.join(ROOT, relativePath), 'utf8');
    extractTranslationKeys(source).forEach((key) => requiredKeys.add(key));
  }

  for (const locale of UI_LOCALES) {
    const ui = await readJson(path.join(ROOT, 'src', 'i18n', 'ui', `${locale}.json`));
    for (const key of requiredKeys) {
      const value = ui.text?.[key]?.trim();
      assertCheck(Boolean(value), {
        type: 'missing_ui_translation',
        locale,
        translationKey: key,
        probableSourceFile: 'src/i18n/ui/' + locale + '.json',
        message: `Missing UI translation for "${key}"`,
      });
      assertCheck(value !== key || IDENTITY_UI_KEYS.has(key), {
        type: 'untranslated_ui_value',
        locale,
        translationKey: key,
        detectedText: value || key,
        expectedLanguage: locale,
        suspectedDetectedLanguage: 'tr',
        probableSourceFile: 'src/i18n/ui/' + locale + '.json',
        message: `UI key "${key}" still resolves to Turkish source in ${locale}`,
      });
    }
  }

  return requiredKeys.size;
}

async function validateTurkishRegressionInDictionaries() {
  for (const locale of UI_LOCALES) {
    const ui = await readJson(path.join(ROOT, 'src', 'i18n', 'ui', `${locale}.json`));
    for (const phrase of TURKISH_REGRESSION_PHRASES) {
      const translated = ui.text?.[phrase];
      if (!translated) continue;
      assertCheck(translated !== phrase, {
        type: 'turkish_regression_dictionary',
        locale,
        detectedText: translated,
        expectedLanguage: locale,
        suspectedDetectedLanguage: 'tr',
        translationKey: phrase,
        probableSourceFile: 'src/i18n/ui/' + locale + '.json',
        message: `Regression phrase "${phrase}" is untranslated in ${locale} dictionary`,
      });
    }
  }
}

async function scanHardcodedTurkishInSources() {
  const files = await collectSourceFiles();
  for (const file of files) {
    const relative = path.relative(ROOT, file).replaceAll('\\', '/');
    if (relative.startsWith('src/i18n/')) continue;
    if (relative === 'index.html') continue;
    if (relative === 'src/cookie-consent-i18n.js') continue;
    if (relative === 'src/subpages-data.js') continue;
    if (relative.endsWith('-data.js')) continue;
    if (relative === 'src/seo-content-clusters.js') continue;
    if (relative === 'src/doctors-data.js') continue;
    if (relative.includes('admin-')) continue;

    const source = await fs.readFile(file, 'utf8');
    const stripped = source
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');

    for (const phrase of TURKISH_REGRESSION_PHRASES) {
      if (!stripped.includes(phrase)) continue;
      const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wrappedInT = new RegExp(`\\bt\\(\\s*['"][^'"]*${escaped}[^'"]*['"]\\s*\\)`).test(stripped);
      const wrappedInTranslate = new RegExp(`translate\\([^,]+,\\s*['"][^'"]*${escaped}[^'"]*['"]\\s*\\)`).test(stripped);
      if (wrappedInT || wrappedInTranslate) continue;
      if (isAllowlisted(phrase)) continue;
      if (phrase.length < 12 && !['Gönder', 'İletişim'].includes(phrase)) continue;

      assertCheck(false, {
        type: 'hardcoded_turkish_source',
        locale: 'unknown',
        detectedText: phrase,
        expectedLanguage: 'non-tr',
        suspectedDetectedLanguage: 'tr',
        probableSourceFile: relative,
        message: `Hardcoded Turkish phrase "${phrase}" found outside translation system`,
      });
    }
  }
}

async function validateContentCatalogCoverage() {
  for (const locale of UI_LOCALES) {
    const content = await readJson(path.join(ROOT, 'src', 'i18n', 'content', `${locale}.json`));
    assertCheck(content.pages.length === SUBPAGES.length, {
      type: 'content_catalog_count',
      locale,
      probableSourceFile: `src/i18n/content/${locale}.json`,
      message: `Expected ${SUBPAGES.length} service pages, found ${content.pages.length}`,
    });

    for (const page of content.pages) {
      for (const field of ['title', 'summary']) {
        const value = page[field];
        assertCheck(typeof value === 'string' && value.trim(), {
          type: 'empty_content_field',
          locale,
          serviceSlug: page.slug,
          translationKey: field,
          probableSourceFile: `src/i18n/content/${locale}.json`,
          message: `Empty ${field} for slug ${page.slug}`,
        });
      }
    }
  }
}

function printReport(requiredKeyCount) {
  if (failures.length) {
    console.error(`\ni18n check failed with ${failures.length} issue(s):\n`);
    failures.forEach((issue, index) => {
      console.error(`--- Issue ${index + 1} ---`);
      console.error(`Type: ${issue.type}`);
      console.error(`Locale: ${issue.locale ?? 'unknown'}`);
      if (issue.serviceSlug) console.error(`Service slug: ${issue.serviceSlug}`);
      if (issue.detectedText) console.error(`Detected text: ${issue.detectedText}`);
      if (issue.expectedLanguage) console.error(`Expected language: ${issue.expectedLanguage}`);
      if (issue.suspectedDetectedLanguage) console.error(`Suspected detected language: ${issue.suspectedDetectedLanguage}`);
      if (issue.translationKey) console.error(`Translation key: ${issue.translationKey}`);
      if (issue.probableSourceFile) console.error(`Probable source file: ${issue.probableSourceFile}`);
      console.error(`Message: ${issue.message}`);
      console.error('');
    });
    process.exitCode = 1;
    return;
  }

  console.log('i18n static check passed.');
  console.log(`Locales checked: ${LOCALES.length}`);
  console.log(`Service slugs in catalog: ${SUBPAGES.length}`);
  console.log(`Required dynamic UI keys: ${requiredKeyCount}`);
  console.log(`Checks executed: ${checksRun}`);
}

const requiredKeyCount = await validateUiDictionaryParity();
await validateTurkishRegressionInDictionaries();
await scanHardcodedTurkishInSources();
await validateContentCatalogCoverage();
printReport(requiredKeyCount);
