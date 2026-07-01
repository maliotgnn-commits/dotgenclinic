import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OG_IMAGE_PATH, LOGO_PATH } from './seo-shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const LOGO_FILE = resolve(ROOT, 'public', LOGO_PATH.replace(/^\//, ''));
const OUTPUT_FILE = resolve(ROOT, 'public', OG_IMAGE_PATH.replace(/^\//, ''));

const psScript = String.raw`
Add-Type -AssemblyName System.Drawing
$width = 1200
$height = 630
$bitmap = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$background = New-Object System.Drawing.Drawing2D.LinearGradientBrush ([System.Drawing.Rectangle]::FromLTRB(0,0,$width,$height)), ([System.Drawing.Color]::FromArgb(255,15,20,25)), ([System.Drawing.Color]::FromArgb(255,26,35,50)), 45
$graphics.FillRectangle($background, 0, 0, $width, $height)
$logoPath = '${LOGO_FILE.replace(/\\/g, '\\\\')}'
$logo = [System.Drawing.Image]::FromFile($logoPath)
$logoHeight = 180
$logoWidth = [int]($logo.Width * ($logoHeight / $logo.Height))
$logoX = [int](($width - $logoWidth) / 2)
$logoY = 130
$graphics.DrawImage($logo, $logoX, $logoY, $logoWidth, $logoHeight)
$font = New-Object System.Drawing.Font ('Georgia', 48, [System.Drawing.FontStyle]::Regular)
$brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,245,240,230))
$text = 'Dr Otgen Clinic'
$textSize = $graphics.MeasureString($text, $font)
$textX = [int](($width - $textSize.Width) / 2)
$textY = 360
$graphics.DrawString($text, $font, $brush, $textX, $textY)
$output = '${OUTPUT_FILE.replace(/\\/g, '\\\\')}'
$dir = Split-Path $output -Parent
if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
$bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
$logo.Dispose(); $bitmap.Dispose(); $graphics.Dispose(); $background.Dispose(); $brush.Dispose(); $font.Dispose()
`;

export async function generateOgImage() {
  if (!existsSync(LOGO_FILE)) {
    console.error(`[generate-og-image] Missing logo asset: ${LOGO_FILE}`);
    process.exit(1);
  }

  mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
  const scriptPath = resolve(ROOT, '.vite-local', 'generate-og-image.ps1');
  mkdirSync(dirname(scriptPath), { recursive: true });
  writeFileSync(scriptPath, psScript, 'utf8');

  const result = spawnSync(
    'powershell',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath],
    { stdio: 'inherit', shell: false },
  );

  if (result.status !== 0 || !existsSync(OUTPUT_FILE)) {
    console.error('[generate-og-image] Failed to generate OG image via PowerShell');
    process.exit(result.status || 1);
  }

  const png = readFileSync(OUTPUT_FILE);
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  if (width !== 1200 || height !== 630) {
    console.error(`[generate-og-image] Unexpected dimensions ${width}x${height}`);
    process.exit(1);
  }

  console.log(`[generate-og-image] Wrote ${OUTPUT_FILE} (${png.length} bytes)`);
}
