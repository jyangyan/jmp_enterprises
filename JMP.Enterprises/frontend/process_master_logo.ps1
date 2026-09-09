Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\FaithClothing\.gemini\antigravity-ide\brain\0b1a02f0-3ff1-4dd0-9863-c706230c663a\media__1788984153196.png"
$whitePath = "C:\Users\FaithClothing\Documents\JMP\JMP.Enterprises\frontend\public\logo_white.png"
$blackPath = "C:\Users\FaithClothing\Documents\JMP\JMP.Enterprises\frontend\public\logo_black.png"
$masterCopy = "C:\Users\FaithClothing\Documents\JMP\JMP.Enterprises\frontend\public\logo.png"

# Copy original to logo.png
Copy-Item -Path $srcPath -Destination $masterCopy -Force

$orig = [System.Drawing.Bitmap]::FromFile($srcPath)
$width = $orig.Width
$height = $orig.Height

$bmpWhite = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$bmpBlack = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
        $c = $orig.GetPixel($x, $y)
        
        # Whiteness (0 = pure black, 255 = pure white)
        $whiteness = ($c.R * 0.299 + $c.G * 0.587 + $c.B * 0.114)
        
        # Check if it's the gold accent line or dot
        $isGold = ($c.R -gt 140) -and ($c.G -gt 90) -and ($c.B -lt 110) -and ($c.R -gt $c.B + 35)
        
        if ($isGold) {
            # Preserve full gold color and full opacity
            $bmpWhite.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
            $bmpBlack.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
        }
        elseif ($whiteness -lt 240) {
            # Text / Artwork pixels
            # Calculate alpha based on pixel darkness for anti-aliasing
            if ($whiteness -le 180) {
                $alpha = 255
            } else {
                # Smooth taper between 180 and 240
                $alpha = [int](255 * (1.0 - ($whiteness - 180) / 60.0))
            }
            if ($alpha -gt 255) { $alpha = 255 }
            if ($alpha -lt 0) { $alpha = 0 }
            
            if ($alpha -gt 10) {
                # Solid Black for light backgrounds
                $bmpBlack.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 15, 23, 42)) # Sleek dark slate black #0f172a
                # Solid White for dark backgrounds
                $bmpWhite.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 255, 255, 255))
            } else {
                $bmpWhite.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
                $bmpBlack.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
        } else {
            # Background transparent
            $bmpWhite.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            $bmpBlack.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}

$orig.Dispose()

$bmpWhite.Save($whitePath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmpBlack.Save($blackPath, [System.Drawing.Imaging.ImageFormat]::Png)

$bmpWhite.Dispose()
$bmpBlack.Dispose()

Write-Host "Vibrant logo_white.png and logo_black.png regenerated successfully!"
