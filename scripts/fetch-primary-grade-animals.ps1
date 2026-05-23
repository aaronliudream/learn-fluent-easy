$dir = Join-Path $PSScriptRoot "..\public\images\primary"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

$files = @{
  "grade3-fox.jpg"   = "https://images.pexels.com/photos/2295745/pexels-photo-2295745.jpeg?auto=compress&cs=tinysrgb&w=800"
  "grade4-panda.jpg" = "https://images.pexels.com/photos/145939/pexels-photo-145939.jpeg?auto=compress&cs=tinysrgb&w=800"
  "grade5-lion.jpg"  = "https://images.pexels.com/photos/288621/pexels-photo-288621.jpeg?auto=compress&cs=tinysrgb&w=800"
  "grade6-owl.jpg"   = "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg?auto=compress&cs=tinysrgb&w=800"
}

$headers = @{ "User-Agent" = "Mozilla/5.0 (compatible; learn-fluent-easy/1.0)" }

foreach ($name in $files.Keys) {
  $out = Join-Path $dir $name
  Write-Host "Downloading $name ..."
  Invoke-WebRequest -Uri $files[$name] -OutFile $out -UseBasicParsing -Headers $headers
  Write-Host "  -> $((Get-Item $out).Length) bytes"
}
