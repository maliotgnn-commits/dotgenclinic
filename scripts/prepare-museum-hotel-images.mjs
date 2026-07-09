import { mkdirSync, readdirSync, copyFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SOURCE_DIR = resolve('C:/Users/Mali_/OneDrive/Desktop/kapadokya');
const OUT_DIR = resolve(ROOT, 'public/images/site/pages');
const TEMP_DIR = resolve(ROOT, '.tmp/museum-hotel-sources');

const HERO_MATCH = (name) => name.startsWith('A morning at the Museum Hotel') && name.endsWith('kapad.webp');
const GALLERY_MATCHES = [
  (name) => name.startsWith('Not built.Carved.Tekeli Cave Suite'),
  (name) => name.startsWith('One of those wonderful moment') && name.includes('(1).webp'),
  (name) => name.startsWith('One of those wonderful moment') && name.endsWith('lilacappadoci.webp'),
  (name) => name.startsWith('Soft serenity') && !name.includes('(1)'),
  (name) => name.startsWith('A morning at the Museum Hotel') && name.includes('(2).webp'),
  (name) => name.startsWith('Soft serenity') && name.includes('(1).webp'),
  (name) => name.startsWith('One of those enchanting evenings') && name.includes('(2).webp'),
  (name) => name.startsWith('One of those wonderful moment') && name.includes('(2).webp'),
  (name) => name.startsWith('Line-caught Aegean sea bass') && name.includes('(2).webp'),
  (name) => name.startsWith('Line-caught Aegean sea bass') && name.endsWith('Emir.webp'),
  (name) => name.startsWith('One of those enchanting evenings') && name.endsWith('relais.webp'),
  (name) => name.startsWith('Line-caught Aegean sea bass') && name.includes('(1).webp'),
];

function runSharp(input, output, width, height) {
  const args = [
    '-i', input,
    '-o', output,
    '-f', 'webp',
    '-q', '82',
    'resize', String(width), String(height),
    '--fit', 'cover',
    '--position', 'centre',
  ];
  const result = spawnSync('npx', ['--yes', 'sharp-cli', ...args], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
  });
  if (result.status !== 0) {
    throw new Error(`sharp-cli failed for ${input}`);
  }
}

function findFile(matcher) {
  const files = readdirSync(SOURCE_DIR);
  const match = files.find(matcher);
  if (!match) {
    throw new Error(`No source image matched: ${matcher}`);
  }
  return join(SOURCE_DIR, match);
}

function stageFile(matcher, index) {
  const source = findFile(matcher);
  const staged = join(TEMP_DIR, `source-${index}.webp`);
  copyFileSync(source, staged);
  return staged;
}

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(TEMP_DIR, { recursive: true });

const heroIn = stageFile(HERO_MATCH, 'hero');
const heroOut = resolve(OUT_DIR, 'museum-hotel-wellness-hero.webp');
console.log('[prepare-museum-hotel-images] Hero 16:9', heroOut);
runSharp(heroIn, heroOut, 1920, 1080);

GALLERY_MATCHES.forEach((matcher, index) => {
  const out = resolve(OUT_DIR, `museum-hotel-wellness-${index + 1}.webp`);
  console.log(`[prepare-museum-hotel-images] Gallery ${index + 1}`, out);
  runSharp(stageFile(matcher, index + 1), out, 900, 1200);
});

rmSync(TEMP_DIR, { recursive: true, force: true });
console.log('[prepare-museum-hotel-images] Done');
