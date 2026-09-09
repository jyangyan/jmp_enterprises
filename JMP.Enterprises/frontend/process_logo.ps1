Add-Type -AssemblyName System.Drawing

$path = "C:\Users\FaithClothing\Documents\JMP\JMP.Enterprises\frontend\public\logo.png"
$tmpPath = "C:\Users\FaithClothing\Documents\JMP\JMP.Enterprises\frontend\public\logo_clean.png"

$orig = [System.Drawing.Bitmap]::FromFile($path)
$bmp = New-Object System.Drawing.Bitmap($orig.Width, $orig.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($orig, 0, 0, $orig.Width, $orig.Height)
$g.Dispose()
$orig.Dispose()

$minX = $bmp.Width
$minY = $bmp.Height
$maxX = 0
$maxY = 0

for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $c = $bmp.GetPixel($x, $y)
        # If pixel is dark background (dark navy / black square box)
        if ($c.R -lt 32 -and $c.G -lt 32 -and $c.B -lt 32) {
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            # artwork pixel
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Artwork bounding box: X=$minX Y=$minY Width="$($maxX - $minX + 1)" Height="$($maxY - $minY + 1)

# Crop tight with margin
$margin = 15
$cropX = [Math]::Max(0, $minX - $margin)
$cropY = [Math]::Max(0, $minY - $margin)
$cropW = [Math]::Min($bmp.Width - $cropX, ($maxX - $minX + 1) + ($margin * 2))
$cropH = [Math]::Min($bmp.Height - $cropY, ($maxY - $minY + 1) + ($margin * 2))

$rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$cropped = $bmp.Clone($rect, $bmp.PixelFormat)

$cropped.Save($tmpPath, [System.Drawing.Imaging.ImageFormat]::Png)
$cropped.Dispose()
$bmp.Dispose()

Remove-Item $path
Move-Item $tmpPath $path
Write-Host "Logo successfully processed, background square removed and cropped!"
