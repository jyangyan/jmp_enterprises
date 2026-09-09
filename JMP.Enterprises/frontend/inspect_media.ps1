Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\FaithClothing\.gemini\antigravity-ide\brain\0b1a02f0-3ff1-4dd0-9863-c706230c663a\media__1788984153196.png"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

Write-Host "Dimensions: $($bmp.Width) x $($bmp.Height)"
$sampleX = [int]($bmp.Width / 2)
$sampleY = [int]($bmp.Height / 2)
$c = $bmp.GetPixel($sampleX, $sampleY)
Write-Host "Center pixel: R=$($c.R) G=$($c.G) B=$($c.B) A=$($c.A)"

$bmp.Dispose()
