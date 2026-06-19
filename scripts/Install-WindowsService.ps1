param(
  [string]$ServiceName = "MediaPM",
  [string]$NodeExe = "C:\Program Files\nodejs\node.exe",
  [string]$AppRoot = "D:\MediaPM"
)

$backendEntry = Join-Path $AppRoot "backend\dist\server.js"
$binPath = "`"$NodeExe`" `"$backendEntry`""

sc.exe create $ServiceName binPath= $binPath start= auto
sc.exe description $ServiceName "Management_PM Fastify backend service"

Write-Host "Dienst $ServiceName wurde angelegt. Bitte prüfen Sie danach die Umgebungsdatei unter $AppRoot\\backend\\.env."
