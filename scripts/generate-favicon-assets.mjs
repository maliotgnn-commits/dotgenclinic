import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC = resolve(ROOT, 'public');
const SYMBOL_FILE = resolve(PUBLIC, 'favicon-symbol.png');
const BACKGROUND = { r: 15, g: 20, b: 25 };

const OUTPUTS = [
  { name: 'favicon-48.png', size: 48 },
  { name: 'favicon-96.png', size: 96 },
  { name: 'favicon-192.png', size: 192 },
  { name: 'apple-touch-icon.png', size: 180 },
];
const WORK_DIR = resolve(ROOT, '.vite-local');

function buildPngIco(pngBuffers) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngBuffers.length, 4);

  let offset = 6 + pngBuffers.length * 16;
  const entries = [];
  const chunks = [header];

  for (const { size, png } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry[0] = size >= 256 ? 0 : size;
    entry[1] = size >= 256 ? 0 : size;
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += png.length;
  }

  chunks.push(...entries, ...pngBuffers.map(({ png }) => png));
  return Buffer.concat(chunks);
}

function readPngMeta(filePath) {
  const png = readFileSync(filePath);
  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
    colorType: png[25],
    hasAlpha: png[25] === 4 || png[25] === 6,
    bytes: png.length,
  };
}

function buildPowerShellScript() {
  const outputLines = OUTPUTS.map(
    ({ name, size }) =>
      `$outputs += [PSCustomObject]@{ Path = '${resolve(WORK_DIR, name).replace(/\\/g, '\\\\')}'; Size = ${size} }`,
  ).join('\n');

  const icoOutputs = [16, 32, 48]
    .map(
      (size) =>
        `$icoOutputs += [PSCustomObject]@{ Path = '${resolve(WORK_DIR, `favicon-${size}.png`).replace(/\\/g, '\\\\')}'; Size = ${size} }`,
    )
    .join('\n');

  return String.raw`
Add-Type -AssemblyName System.Drawing
$symbolPath = '${SYMBOL_FILE.replace(/\\/g, '\\\\')}'
$symbol = [System.Drawing.Image]::FromFile($symbolPath)
$background = [System.Drawing.Color]::FromArgb(255, ${BACKGROUND.r}, ${BACKGROUND.g}, ${BACKGROUND.b})
$outputs = @()
${outputLines}
$icoOutputs = @()
${icoOutputs}

function New-FaviconBitmap([int]$size) {
  $pixelFormat = [System.Drawing.Imaging.PixelFormat]::Format24bppRgb
  $bitmap = New-Object System.Drawing.Bitmap $size, $size, $pixelFormat
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear($background)
  $padding = [Math]::Max(4, [int][Math]::Round($size * 0.12))
  $inner = $size - (2 * $padding)
  $graphics.DrawImage($symbol, $padding, $padding, $inner, $inner)
  $graphics.Dispose()
  return $bitmap
}

foreach ($item in ($outputs + $icoOutputs)) {
  $dir = Split-Path $item.Path -Parent
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $bitmap = New-FaviconBitmap $item.Size
  $bitmap.Save($item.Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
}

$symbol.Dispose()
`;
}

export function generateFaviconAssets() {
  if (process.platform !== 'win32') {
    console.error('[generate-favicon-assets] Windows/PowerShell is required to regenerate favicon assets.');
    process.exit(1);
  }

  const currentSymbol = resolve(PUBLIC, 'favicon-48.png');
  if (!existsSync(currentSymbol)) {
    console.error('[generate-favicon-assets] Missing source symbol at public/favicon-48.png');
    process.exit(1);
  }

  const symbolSource = existsSync(SYMBOL_FILE) ? SYMBOL_FILE : currentSymbol;
  writeFileSync(SYMBOL_FILE, readFileSync(symbolSource));

  mkdirSync(WORK_DIR, { recursive: true });
  const scriptPath = resolve(WORK_DIR, 'generate-favicon-assets.ps1');
  writeFileSync(scriptPath, buildPowerShellScript(), 'utf8');

  const result = spawnSync(
    'powershell',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath],
    { stdio: 'inherit', shell: false },
  );

  if (result.status !== 0) {
    console.error('[generate-favicon-assets] PowerShell generation failed');
    process.exit(result.status || 1);
  }

  const icoEntries = [16, 32, 48].map((size) => {
    const path = resolve(WORK_DIR, `favicon-${size}.png`);
    if (!existsSync(path)) {
      console.error(`[generate-favicon-assets] Missing intermediate PNG: ${path}`);
      process.exit(1);
    }
    return { size, png: readFileSync(path) };
  });

  writeFileSync(resolve(PUBLIC, 'favicon.ico'), buildPngIco(icoEntries));

  for (const { name, size } of OUTPUTS) {
    const sourcePath = resolve(WORK_DIR, name);
    const filePath = resolve(PUBLIC, name);
    if (!existsSync(sourcePath)) {
      console.error(`[generate-favicon-assets] Missing generated asset: ${sourcePath}`);
      process.exit(1);
    }
    copyFileSync(sourcePath, filePath);
    const meta = readPngMeta(filePath);
    if (meta.width !== size || meta.height !== size) {
      console.error(`[generate-favicon-assets] Expected ${name} to be ${size}x${size}, got ${meta.width}x${meta.height}`);
      process.exit(1);
    }
    if (meta.hasAlpha) {
      console.error(`[generate-favicon-assets] ${name} must use an opaque background for Google SERP visibility`);
      process.exit(1);
    }
  }

  console.log('[generate-favicon-assets] Generated favicon.ico, favicon-48.png, favicon-96.png, favicon-192.png, apple-touch-icon.png');
}

if (import.meta.url.endsWith('generate-favicon-assets.mjs') && process.argv[1]?.endsWith('generate-favicon-assets.mjs')) {
  generateFaviconAssets();
}
