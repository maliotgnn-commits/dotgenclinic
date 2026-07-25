import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolve(projectRoot, 'medical');
const outputRoot = resolve(projectRoot, 'dist', 'medical');

const files = {
  landing: resolve(sourceRoot, 'index.html'),
  verification: resolve(sourceRoot, 'professional-verification.html'),
  script: resolve(sourceRoot, 'verification.js'),
  styles: resolve(sourceRoot, 'styles.css'),
};

const failures = [];

function expect(content, pattern, message) {
  if (!pattern.test(content)) failures.push(message);
}

await Promise.all(Object.values(files).map((file) => access(file, constants.R_OK)));

const [landing, verification, script] = await Promise.all([
  readFile(files.landing, 'utf8'),
  readFile(files.verification, 'utf8'),
  readFile(files.script, 'utf8'),
]);

expect(landing, /DrOtgenMedical/, 'Ana sayfada DrOtgenMedical markası bulunamadı.');
expect(landing, /DIAMOND Crosslinked HA 20/, 'Ana sayfada DIAMOND ürünü bulunamadı.');
expect(
  landing,
  /meta name="robots" content="noindex, nofollow"/,
  'Ana sayfanın geçici noindex etiketi eksik.',
);
expect(
  landing,
  /\.\/professional-verification\.html/,
  'Ana sayfadan profesyonel doğrulama bağlantısı eksik.',
);

expect(
  verification,
  /id="verification-form"/,
  'Profesyonel doğrulama formu bulunamadı.',
);
expect(
  verification,
  /accept="\.pdf,\.jpg,\.jpeg,\.png"/,
  'Mesleki belge dosya türü kısıtı eksik.',
);
expect(
  verification,
  /meta name="robots" content="noindex, nofollow"/,
  'Doğrulama sayfasının geçici noindex etiketi eksik.',
);
expect(
  verification,
  /action="https:\/\/formsubmit\.co\/ajax\/drotgenclinic@gmail\.com"/,
  'Sipariş talebi gönderim adresi bulunamadı.',
);
expect(
  verification,
  /enctype="multipart\/form-data"/,
  'Mesleki belge yüklemesi için form kodlaması eksik.',
);
expect(script, /10 \* 1024 \* 1024/, '10 MB dosya sınırı bulunamadı.');
expect(script, /event\.preventDefault\(\)/, 'Form gönderim denetimi bulunamadı.');
expect(script, /await fetch\(form\.action/, 'Sipariş talebi gönderimi bulunamadı.');

const placeholderTerms = /konsept|örnek|ön izleme|demo/i;
if (placeholderTerms.test(`${landing}\n${verification}`)) {
  failures.push('Yayın metninde konsept veya ön izleme ifadesi bulundu.');
}

await Promise.all([
  access(resolve(outputRoot, 'index.html'), constants.R_OK),
  access(resolve(outputRoot, 'professional-verification.html'), constants.R_OK),
]);

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log('DrOtgenMedical sayfaları ve sipariş talebi akışı doğrulandı.');
}
