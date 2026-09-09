Add-Type -AssemblyName System.Drawing
$path = "C:\Users\FaithClothing\Documents\JMP\JMP.Enterprises\frontend\public\logo.png"
$orig = [System.Drawing.Bitmap]::FromFile($path)

$minR = 255; $maxR = 0; $minG = 255; $maxG = 0; $minB = 255; $maxB = 0
$nonDarkCount = 0

for ($x = 0; $x -lt $orig.Width; $x++) {
    for ($y = 0; $y -lt $orig.Height; $y++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.A -gt 50) {
            # check if not near black
            if ($c.R -gt 35 -or $c.G -gt 35 -or $c.B -gt 35) {
                $nonDarkCount++
                if ($c.R -lt $minR) { $minR = $c.R }
                if ($c.R -gt $maxR) { $maxR = $c.R }
                if ($c.G -lt $minG) { $minG = $c.G }
                if ($c.G -gt $maxG) { $maxG = $c.G }
                if ($c.B -lt $minB) { $minB = $c.B }
                if ($c.B -gt $maxB) { $maxB = $c.B }
            }
        }
    }
}

Write-Host "Non-dark pixels count: "$nonDarkCount
Write-Host "R range: "$minR" to "$maxR
Write-Host "G range: "$minG" to "$maxG
Write-Host "B range: "$minB" to "$maxB

$orig.Dispose()
