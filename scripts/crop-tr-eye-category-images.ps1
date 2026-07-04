# One-time crop utility: extracts 6 category eye images from approved source collage.
# Requires: approved source at $SourcePath (3x2 grid, 1536x1024).
param(
  [string]$SourcePath = "$env:USERPROFILE\OneDrive\Desktop\goz-kategori-kaynak-v2.png",
  [string]$OutputDir = "$PSScriptRoot\..\public\images\goz-hastaliklari\category-eyes"
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $SourcePath)) {
  Write-Error "Source collage not found: $SourcePath"
  exit 1
}

$source = [System.Drawing.Image]::FromFile($SourcePath)
$gridCols = 3
$gridRows = 2
$cellW = [math]::Floor($source.Width / $gridCols)
$cellH = [math]::Floor($source.Height / $gridRows)

if ($cellW -lt 320 -or $cellH -lt 240) {
  Write-Error "Source too small for category eye crops: $($source.Width)x$($source.Height)"
  $source.Dispose()
  exit 1
}

Write-Output "Source dimensions: $($source.Width)x$($source.Height); cell: ${cellW}x${cellH}"

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

# 3x2 grid; include dark navy margins for card blend (4:3 crop).
$cropW = [math]::Min($cellW - 24, [math]::Floor($cellW * 0.92))
$cropH = [math]::Floor($cropW * 0.75)
$insetX = [math]::Floor(($cellW - $cropW) / 2) + 4
$insetY = [math]::Floor(($cellH - $cropH) / 2) + 6

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
