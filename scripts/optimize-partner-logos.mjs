import { statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PARTNERS = resolve(__dirname, '../public/images/site/partners');

const PARTNER_SIZES = {
  'acibadem-health-point.png': { width: 160, height: 48 },
  'whatclinic.png': { width: 140, height: 48 },
  'denipol-hastanesi.png': { width: 160, height: 48 },
  'medical-departures.png': { width: 160, height: 48 },
  'medicana.png': { width: 240, height: 56 },
  'medigo.png': { width: 120, height: 48 },
  'flymedi.png': { width: 130, height: 48 },
  'liv-hospital.png': { width: 120, height: 48 },
  'memorial.png': { width: 140, height: 48 },
};

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function optimizePartner(fileName, { width, height }) {
  const input = join(PARTNERS, fileName);
  const output = join(PARTNERS, fileName.replace(/\.png$/, '.webp'));
  const before = statSync(input).size;

  await sharp(input)
    .resize({ width, height, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85, effort: 4, alphaQuality: 90 })
    .toFile(output);

  const after = statSync(output).size;
  console.log(`${fileName} -> ${fileName.replace(/\.png$/, '.webp')} (${formatBytes(before)} -> ${formatBytes(after)})`);
}

async function main() {
  for (const [fileName, size] of Object.entries(PARTNER_SIZES)) {
    await optimizePartner(fileName, size);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
