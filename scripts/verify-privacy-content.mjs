import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PRIVACY_DIR = resolve(ROOT, 'src/i18n/privacy');
const EXPECTED_SECTION_COUNT = 7;
const NON_EN_LOCALES = ['de', 'es', 'fr', 'it', 'ru', 'ar'];
const failures = [];

function load(locale) {
  return JSON.parse(readFileSync(resolve(PRIVACY_DIR, `${locale}.json`), 'utf8'));
}

function bodyFingerprint(content) {
  const parts = [
    content.documentTitle,
    ...(content.intro || []),
    ...(content.sections || []).flatMap((section) => [
      section.heading,
      ...(section.paragraphs || []),
      ...(section.list || []),
      ...(section.paragraphsAfterList || []),
    ]),
    content.webFormSection?.title,
    ...(content.webFormSection?.items || []),
    content.locationsSection?.title,
  ];
  return parts.join('\n');
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const en = load('en');
const tr = load('tr');
const enBody = bodyFingerprint(en);

for (const locale of ['tr', 'en', ...NON_EN_LOCALES]) {
  const content = load(locale);
  assert(Array.isArray(content.sections) && content.sections.length === EXPECTED_SECTION_COUNT, `[${locale}] expected ${EXPECTED_SECTION_COUNT} sections, found ${content.sections?.length ?? 0}`);
  assert(content.webFormSection?.items?.length === 5, `[${locale}] expected 5 web form items`);
  assert(content.locationsSection?.branches?.length === 3, `[${locale}] expected 3 clinic branches`);
  assert(content.intro?.length === 2, `[${locale}] expected 2 intro paragraphs`);
}

const englishBodyMarkers = [
  'As Dr Otgen Clinic A.Ş. (the "Clinic" or "Data Controller")',
  'Within the scope of the healthcare services provided by our Clinic',
  'Pursuant to Law No. 6698 on the Protection of Personal Data',
  'Your personal data and special categories of personal data are processed for the following purposes',
  'To learn whether your personal data are processed,',
  'Website Appointment Form',
  'Data collected: full name, phone, e-mail, message, selected service',
  'Clinic Locations',
  'Shared phone',
  'Opening hours',
  'Back to Home',
  'Privacy & KVKK',
];

for (const locale of NON_EN_LOCALES) {
  const content = load(locale);
  const localeBody = bodyFingerprint(content);

  assert(localeBody !== enBody, `[${locale}] privacy body matches English source exactly`);
  assert(content.intro[0] !== en.intro[0], `[${locale}] intro still uses English paragraph`);

  for (const marker of englishBodyMarkers) {
    assert(!localeBody.includes(marker), `[${locale}] English body leak detected: "${marker}"`);
  }

  assert(!localeBody.includes('Identity of the Data Controller'), `[${locale}] English section heading leak`);
  assert(!localeBody.includes('Transfer of Personal Data'), `[${locale}] English section heading leak`);
  assert(localeBody.includes('Dr Otgen Clinic A.Ş.'), `[${locale}] legal entity name missing`);
  assert(localeBody.includes('kvkk@drotgenclinic.com'), `[${locale}] KVKK email missing`);
  assert(localeBody.includes('FormSubmit'), `[${locale}] FormSubmit reference missing`);
  assert(localeBody.includes('drotgenclinic@gmail.com'), `[${locale}] appointment mailbox missing`);
}

const localeMarkers = {
  de: 'Als Dr Otgen Clinic A.Ş.',
  es: 'Como Dr Otgen Clinic A.Ş.',
  fr: 'En tant que Dr Otgen Clinic A.Ş.',
  it: 'In qualità di Dr Otgen Clinic A.Ş.',
  ru: 'Компания Dr Otgen Clinic A.Ş.',
  ar: 'بصفتنا Dr Otgen Clinic A.Ş.',
};

for (const [locale, marker] of Object.entries(localeMarkers)) {
  const content = load(locale);
  assert(bodyFingerprint(content).includes(marker), `[${locale}] expected locale body marker missing`);
  assert(!bodyFingerprint(tr).includes(marker) || locale === 'tr', `[${locale}] marker incorrectly matches Turkish-only text`);
}

if (failures.length) {
  console.error('[verify-privacy-content] Verification failed:');
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log('[verify-privacy-content] Verified localized privacy source content for 8 locales');
