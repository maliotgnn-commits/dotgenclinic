import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OG_IMAGE_PATH, CLINIC } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC_OG = resolve(ROOT, 'public', OG_IMAGE_PATH.replace(/^\//, ''));

export function verifyOgSocialImage() {
  if (!existsSync(PUBLIC_OG)) {
    console.error(`[verify-og-social-image] Missing committed OG image: ${PUBLIC_OG}`);
    process.exit(1);
  }

  const png = readFileSync(PUBLIC_OG);
  const signature = png.subarray(0, 8).toString('hex');
  if (signature !== '89504e470d0a1a0a') {
    console.error(`[verify-og-social-image] Expected PNG file at ${PUBLIC_OG}`);
    process.exit(1);
  }

  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  if (width !== 1200 || height !== 630) {
    console.error(`[verify-og-social-image] Expected 1200x630 PNG, got ${width}x${height}`);
    process.exit(1);
  }

  if (png.length < 1000 || png.length > 2_000_000) {
    console.error(`[verify-og-social-image] Unexpected file size: ${png.length} bytes`);
    process.exit(1);
  }

  console.log(`[verify-og-social-image] Verified ${PUBLIC_OG} (${width}x${height}, ${png.length} bytes)`);
}

if (import.meta.url.endsWith('verify-og-social-image.mjs') && process.argv[1]?.endsWith('verify-og-social-image.mjs')) {
  verifyOgSocialImage();
}
