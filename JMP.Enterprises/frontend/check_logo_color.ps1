Add-Type -AssemblyName System.Drawing
$path = "C:\Users\FaithClothing\Documents\JMP\JMP.Enterprises\frontend\public\logo.png"
$orig = [System.Drawing.Bitmap]::FromFile($path)

$totalR = 0; $totalG = 0; $totalB = 0; $count = 0

for ($y = 0; $y -lt $orig.Height; $y++) {
    for ($x = 0; $x -lt $orig.Width; $x++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.A -gt 100) {
            $totalR += $c.R
            $totalG += $c.G
            $totalB += $c.B
            $count++
        }
    }
}

if ($count -gt 0) {
    Write-Host "Avg R="$([int]($totalR/$count))" G="$([int]($totalG/$count))" B="$([int]($totalB/$count))
}

$orig.Dispose()
