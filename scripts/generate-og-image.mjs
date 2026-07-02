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
$gold = [System.Drawing.Color]::FromArgb(255,201,168,76)
$goldLight = [System.Drawing.Color]::FromArgb(255,223,192,110)
$goldPen = New-Object System.Drawing.Pen $gold, 1
$goldPenLight = New-Object System.Drawing.Pen $goldLight, 1
$graphics.DrawLine($goldPen, 120, 80, 1080, 80)
$graphics.DrawLine($goldPenLight, 120, 82, 1080, 82)
$graphics.DrawLine($goldPen, 120, 548, 1080, 548)
$graphics.DrawLine($goldPenLight, 120, 550, 1080, 550)
$cornerSize = 18
$graphics.DrawLine($goldPen, 80, 60, 80 + $cornerSize, 60)
$graphics.DrawLine($goldPen, 80, 60, 80, 60 + $cornerSize)
$graphics.DrawLine($goldPen, 1120 - $cornerSize, 60, 1120, 60)
$graphics.DrawLine($goldPen, 1120, 60, 1120, 60 + $cornerSize)
$graphics.DrawLine($goldPen, 80, 570 - $cornerSize, 80, 570)
$graphics.DrawLine($goldPen, 80, 570, 80 + $cornerSize, 570)
$graphics.DrawLine($goldPen, 1120 - $cornerSize, 570, 1120, 570)
$graphics.DrawLine($goldPen, 1120, 570 - $cornerSize, 1120, 570)
$logoPath = '${LOGO_FILE.replace(/\\/g, '\\\\')}'
$logo = [System.Drawing.Image]::FromFile($logoPath)
$logoMaxHeight = 260
$logoMaxWidth = 520
$scale = [Math]::Min($logoMaxHeight / $logo.Height, $logoMaxWidth / $logo.Width)
$logoHeight = [int]($logo.Height * $scale)
$logoWidth = [int]($logo.Width * $scale)
$logoX = [int](($width - $logoWidth) / 2)
$logoY = 120
$graphics.DrawImage($logo, $logoX, $logoY, $logoWidth, $logoHeight)
$titleFont = New-Object System.Drawing.Font ('Georgia', 36, [System.Drawing.FontStyle]::Regular)
$titleBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,245,240,230))
$title = 'Premium Aesthetic Clinic'
$titleSize = $graphics.MeasureString($title, $titleFont)
$titleX = [int](($width - $titleSize.Width) / 2)
$titleY = 420
$graphics.DrawString($title, $titleFont, $titleBrush, $titleX, $titleY)
$domainFont = New-Object System.Drawing.Font ('Segoe UI', 22, [System.Drawing.FontStyle]::Regular)
$domainBrush = New-Object System.Drawing.SolidBrush $goldLight
$domain = 'www.drotgenclinic.com'
$domainSize = $graphics.MeasureString($domain, $domainFont)
$domainX = [int](($width - $domainSize.Width) / 2)
$domainY = 480
$graphics.DrawString($domain, $domainFont, $domainBrush, $domainX, $domainY)
$output = '${OUTPUT_FILE.replace(/\\/g, '\\\\')}'
$dir = Split-Path $output -Parent
if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
$bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
$logo.Dispose(); $bitmap.Dispose(); $graphics.Dispose(); $background.Dispose()
$titleBrush.Dispose(); $titleFont.Dispose(); $domainBrush.Dispose(); $domainFont.Dispose()
$goldPen.Dispose(); $goldPenLight.Dispose()
`;

async function generateOgImageLocal() {
  if (process.platform !== 'win32') {
    console.error('[generate-og-image] Manual generation is Windows/PowerShell only. Commit public/images/og/dr-otgen-clinic-social-card.png instead.');
    process.exit(1);
  }

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

const isDirectRun = process.argv[1]?.endsWith('generate-og-image.mjs');
if (isDirectRun) {
  generateOgImageLocal().catch((error) => {
    console.error('[generate-og-image] Failed:', error);
    process.exit(1);
  });
}
