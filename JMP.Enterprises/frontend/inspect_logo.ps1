Add-Type -AssemblyName System.Drawing
$path = "C:\Users\FaithClothing\Documents\JMP\JMP.Enterprises\frontend\public\logo.png"
$orig = [System.Drawing.Bitmap]::FromFile($path)
Write-Host "Width: "$orig.Width" Height: "$orig.Height
$c1 = $orig.GetPixel(0, 0)
Write-Host "Pixel (0,0): R="$c1.R" G="$c1.G" B="$c1.B" A="$c1.A
$c2 = $orig.GetPixel([int]($orig.Width/2), [int]($orig.Height/2))
Write-Host "Center Pixel: R="$c2.R" G="$c2.G" B="$c2.B" A="$c2.A
$orig.Dispose()
