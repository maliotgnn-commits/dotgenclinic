import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolve(projectRoot, 'medical');
const outputRoot = resolve(projectRoot, 'dist', 'medical');

const pageFiles = [
  'index.html',
  'product.html',
  'cart.html',
  'checkout.html',
  'account.html',
  'inventory.html',
  'privacy.html',
];

const files = {
  ...Object.fromEntries(pageFiles.map((name) => [name, resolve(sourceRoot, name)])),
  store: resolve(sourceRoot, 'store.js'),
  styles: resolve(sourceRoot, 'styles.css'),
};

const failures = [];

function expect(content, pattern, message) {
  if (!pattern.test(content)) failures.push(message);
}

await Promise.all(Object.values(files).map((file) => access(file, constants.R_OK)));

const contents = Object.fromEntries(
  await Promise.all(
    Object.entries(files).map(async ([key, path]) => [key, await readFile(path, 'utf8')]),
  ),
);

for (const name of pageFiles) {
  expect(contents[name], /DrOtgen ?Medical/, `${name} sayfasında DrOtgen Medical markası bulunamadı.`);
  expect(
    contents[name],
    /<div id="site-header">/,
    `${name} sayfasında paylaşılan site başlığı (site-header) bulunamadı.`,
  );
  expect(
    contents[name],
    /<div id="site-footer">/,
    `${name} sayfasında paylaşılan site alt bilgisi (site-footer) bulunamadı.`,
  );
  expect(
    contents[name],
    /<script type="module" src="\.\/store\.js">/,
    `${name} sayfası mağaza betiğini (store.js) yüklemiyor.`,
  );
}

expect(contents['index.html'], /id="product-grid"/, 'Ana sayfada ürün ızgarası bulunamadı.');
expect(contents['index.html'], /id="category-tabs"/, 'Ana sayfada kategori sekmeleri bulunamadı.');

expect(contents.store, /const PRODUCTS = \[/, 'store.js içinde ürün kataloğu (PRODUCTS) bulunamadı.');
expect(contents.store, /DIAMOND Crosslinked HA 20/, 'Ürün kataloğunda DIAMOND ürünü bulunamadı.');
expect(contents.store, /category:\s*'Kanül'/, 'Ürün kataloğunda Kanül kategorisi bulunamadı.');
expect(contents.store, /category:\s*'Anestezik Krem'/, 'Ürün kataloğunda Anestezik Krem kategorisi bulunamadı.');
expect(contents.store, /category:\s*'Sarf Malzemesi'/, 'Ürün kataloğunda Sarf Malzemesi kategorisi bulunamadı.');
expect(contents.store, /function escapeHtml/, 'store.js içinde HTML kaçış (XSS koruması) fonksiyonu bulunamadı.');
expect(contents.store, /data-add-cart="\$\{product\.id\}"/, 'Sepete ekleme kontrolü bulunamadı.');

const placeholderTerms = /konsept|örnek ürün|ön izleme|demo ürün/i;
const combined = pageFiles.map((name) => contents[name]).join('\n');
if (placeholderTerms.test(combined)) {
  failures.push('Yayın metninde konsept veya ön izleme ifadesi bulundu.');
}

await Promise.all(
  pageFiles.map((name) => access(resolve(outputRoot, name), constants.R_OK)),
);

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log('DrOtgen Medical mağaza sayfaları ve ürün kataloğu doğrulandı.');
}
