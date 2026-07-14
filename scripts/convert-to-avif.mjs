import { statSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const IMAGES = resolve(ROOT, 'public/images');

const TARGETS = [
  join(IMAGES, 'hero-world-map.webp'),
  join(IMAGES, 'mobil.webp'),
  join(IMAGES, 'logo-transparent-180.webp'),
  join(IMAGES, 'logo-transparent-350.webp'),
  join(IMAGES, 'logo-transparent-360.webp'),
  join(IMAGES, 'logo-transparent-700.webp'),
  join(IMAGES, 'site/home/doctor-mubin-hosnuter.webp'),
  join(IMAGES, 'site/home/doctor-ayca-koku.webp'),
  ...['kurumsal-bilgiler', 'sac-ekimi', 'dis-estetigi', 'medikal-estetik', 'longevity', 'estetik-cerrahi'].flatMap(
    (stem) => [240, 480].map((w) => join(IMAGES, 'services', `${stem}-${w}.webp`)),
  ),
];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function convertFile(inputPath) {
  if (!existsSync(inputPath)) {
    console.warn(`[convert-to-avif] Skip missing: ${inputPath}`);
    return null;
  }

  const outputPath = inputPath.replace(/\.webp$/i, '.avif');
  const before = statSync(inputPath).size;

  await sharp(inputPath)
    .avif({ quality: 62, effort: 4 })
    .toFile(outputPath);

  const after = statSync(outputPath).size;
  const savings = before > 0 ? ((1 - after / before) * 100).toFixed(1) : '0.0';

  return {
    input: inputPath.replace(`${ROOT}\\`, '').replace(`${ROOT}/`, ''),
    output: outputPath.replace(`${ROOT}\\`, '').replace(`${ROOT}/`, ''),
    before,
    after,
    savings,
  };
}

async function main() {
  const results = [];
  for (const target of TARGETS) {
    const result = await convertFile(target);
    if (result) results.push(result);
  }

  console.log('\n--- AVIF Conversion Report ---');
  let totalBefore = 0;
  let totalAfter = 0;
  for (const row of results) {
    totalBefore += row.before;
    totalAfter += row.after;
    console.log(
      `${row.input}: ${formatBytes(row.before)} -> ${formatBytes(row.after)} (${row.savings}% saved)`,
    );
  }
  const totalSavings = totalBefore > 0 ? ((1 - totalAfter / totalBefore) * 100).toFixed(1) : '0.0';
  console.log(`\nTotal: ${formatBytes(totalBefore)} -> ${formatBytes(totalAfter)} (${totalSavings}% saved)`);
  console.log(`Converted ${results.length} files`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
