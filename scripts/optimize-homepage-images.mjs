import { statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const IMAGES = resolve(ROOT, 'public/images');
const SERVICES = resolve(IMAGES, 'services');

const LOGO_SOURCE = join(IMAGES, 'logo-transparent.png');
const LOGO_WIDTHS = [180, 350, 360, 700];

const SERVICE_FILES = [
  'kurumsal-bilgiler.webp',
  'sac-ekimi.webp',
  'dis-estetigi.webp',
  'medikal-estetik.webp',
  'longevity.webp',
  'estetik-cerrahi.webp',
];
const SERVICE_WIDTHS = [240, 480];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function resizeLogo(width) {
  const output = join(IMAGES, `logo-transparent-${width}.webp`);
  await sharp(LOGO_SOURCE)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 88, effort: 4 })
    .toFile(output);
  return { path: output, size: statSync(output).size };
}

async function resizeService(baseName, width) {
  const stem = baseName.replace(/\.webp$/, '');
  const input = join(SERVICES, baseName);
  const output = join(SERVICES, `${stem}-${width}.webp`);
  await sharp(input)
    .resize({ width, height: width, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85, effort: 4 })
    .toFile(output);
  return { path: output, size: statSync(output).size };
}

async function main() {
  const logoMeta = await sharp(LOGO_SOURCE).metadata();
  console.log(`Logo source: ${logoMeta.width}x${logoMeta.height}`);

  const results = { created: [], sizes: {} };

  const logoSourceSize = statSync(LOGO_SOURCE).size;
  results.sizes[LOGO_SOURCE] = logoSourceSize;

  for (const width of LOGO_WIDTHS) {
    const result = await resizeLogo(width);
    results.created.push(result.path);
    results.sizes[result.path] = result.size;
    const meta = await sharp(result.path).metadata();
    console.log(`Logo ${width}px -> ${meta.width}x${meta.height} (${formatBytes(result.size)})`);
  }

  for (const file of SERVICE_FILES) {
    const sourcePath = join(SERVICES, file);
    results.sizes[sourcePath] = statSync(sourcePath).size;
    for (const width of SERVICE_WIDTHS) {
      const result = await resizeService(file, width);
      results.created.push(result.path);
      results.sizes[result.path] = result.size;
      const meta = await sharp(result.path).metadata();
      console.log(`${file} ${width}px -> ${meta.width}x${meta.height} (${formatBytes(result.size)})`);
    }
  }

  const oldTotal = Object.values(results.sizes)
    .filter((_, i, arr) => Object.keys(results.sizes).length > results.created.length || true);
  const sourceFiles = [LOGO_SOURCE, ...SERVICE_FILES.map((f) => join(SERVICES, f))];
  const oldSize = sourceFiles.reduce((sum, p) => sum + statSync(p).size, 0);
  const newSize = results.created.reduce((sum, p) => sum + statSync(p).size, 0);

  console.log('\n--- Summary ---');
  console.log(`Source files total: ${formatBytes(oldSize)}`);
  console.log(`New variants total: ${formatBytes(newSize)}`);
  console.log(`Created ${results.created.length} files`);

  const ratio = logoMeta.width / logoMeta.height;
  console.log(`Logo aspect ratio: ${ratio.toFixed(4)}`);
  console.log(JSON.stringify({
    logoWidth: logoMeta.width,
    logoHeight: logoMeta.height,
    logoRatio: ratio,
    heights: Object.fromEntries(
      LOGO_WIDTHS.map((w) => [w, Math.round(w / ratio)]),
    ),
  }));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
