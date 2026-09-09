Add-Type -AssemblyName System.Drawing

$path = "C:\Users\FaithClothing\Documents\JMP\JMP.Enterprises\frontend\public\logo.png"
$tmpPath = "C:\Users\FaithClothing\Documents\JMP\JMP.Enterprises\frontend\public\logo_transparent.png"

$orig = [System.Drawing.Bitmap]::FromFile($path)
$bmp = New-Object System.Drawing.Bitmap($orig.Width, $orig.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($orig, 0, 0, $orig.Width, $orig.Height)
$g.Dispose()
$orig.Dispose()

for ($x = 0; $x -lt $bmp.Width; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 220 -and $c.G -gt 220 -and $c.B -gt 220) {
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
        }
    }
}

$bmp.Save($tmpPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Remove-Item $path
Move-Item $tmpPath $path
Write-Host "Logo converted to transparent PNG successfully!"
