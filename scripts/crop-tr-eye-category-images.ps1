# One-time crop utility: extracts 6 category eye images from approved source collage.
# Requires: approved source at $SourcePath (3x2 grid, 1536x1024).
param(
  [string]$SourcePath = "$env:USERPROFILE\OneDrive\Desktop\goz-kategori-kaynak.png",
  [string]$OutputDir = "$PSScriptRoot\..\public\images\goz-hastaliklari\category-eyes"
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $SourcePath)) {
  Write-Error "Source collage not found: $SourcePath"
  exit 1
}

$source = [System.Drawing.Image]::FromFile($SourcePath)
if ($source.Width -ne 1536 -or $source.Height -ne 1024) {
  Write-Error "Unexpected source dimensions: $($source.Width)x$($source.Height), expected 1536x1024"
  $source.Dispose()
  exit 1
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

# 3x2 grid: each cell 512x512; inset past gold frame to center on eye (4:3 crop).
$cellW = 512
$cellH = 512
$cropW = 400
$cropH = 300
$insetX = [math]::Floor(($cellW - $cropW) / 2) + 12
$insetY = [math]::Floor(($cellH - $cropH) / 2) + 18

$crops = @(
  @{ Name = 'category-eye-general-health';     Col = 0; Row = 0 },
  @{ Name = 'category-eye-laser';              Col = 1; Row = 0 },
  @{ Name = 'category-eye-cataract';           Col = 2; Row = 0 },
  @{ Name = 'category-eye-retina';             Col = 0; Row = 1 },
  @{ Name = 'category-eye-eyelid-orbita';      Col = 1; Row = 1 },
  @{ Name = 'category-eye-other-treatments';   Col = 2; Row = 1 }
)

$outW = 640
$outH = 480

foreach ($crop in $crops) {
  $srcX = ($crop.Col * $cellW) + $insetX
  $srcY = ($crop.Row * $cellH) + $insetY
  $srcRect = New-Object System.Drawing.Rectangle($srcX, $srcY, $cropW, $cropH)
  $destRect = New-Object System.Drawing.Rectangle(0, 0, $outW, $outH)
  $bitmap = New-Object System.Drawing.Bitmap($outW, $outH)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.DrawImage($source, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  $graphics.Dispose()
  $outPath = Join-Path $OutputDir "$($crop.Name).png"
  $bitmap.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
  Write-Output "Wrote $outPath"
}

$source.Dispose()
Write-Output "Done: 6 category eye images exported to $OutputDir"
