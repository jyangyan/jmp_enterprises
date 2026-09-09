Add-Type -AssemblyName System.Drawing

$path = "C:\Users\FaithClothing\Documents\JMP\JMP.Enterprises\frontend\public\logo.png"
$whitePath = "C:\Users\FaithClothing\Documents\JMP\JMP.Enterprises\frontend\public\logo_white.png"
$blackPath = "C:\Users\FaithClothing\Documents\JMP\JMP.Enterprises\frontend\public\logo_black.png"

$orig = [System.Drawing.Bitmap]::FromFile($path)

# Create Bitmap for White version
$bmpWhite = New-Object System.Drawing.Bitmap($orig.Width, $orig.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
# Create Bitmap for Black version
$bmpBlack = New-Object System.Drawing.Bitmap($orig.Width, $orig.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $orig.Height; $y++) {
    for ($x = 0; $x -lt $orig.Width; $x++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.A -gt 20) {
            # Calculate brightness/intensity of the artwork pixel (0 to 1)
            $intensity = ($c.R * 0.299 + $c.G * 0.587 + $c.B * 0.114) / 255.0
            
            # Boost contrast so thin lines are vibrant & solid
            $boostedAlpha = [Math]::Min(255, [int]($c.A * [Math]::Min(2.0, ($intensity + 0.3) * 1.8)))
            
            if ($boostedAlpha -gt 30) {
                # Solid White for dark backgrounds
                $bmpWhite.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($boostedAlpha, 255, 255, 255))
                # Solid Black for light backgrounds
                $bmpBlack.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($boostedAlpha, 0, 0, 0))
            } else {
                $bmpWhite.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
                $bmpBlack.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
        } else {
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

Write-Host "Created logo_white.png and logo_black.png successfully!"
