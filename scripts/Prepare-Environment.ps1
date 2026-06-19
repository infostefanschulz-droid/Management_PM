param(
  [string]$AppRoot = "D:\MediaPM",
  [string]$BackupRoot = "D:\MediaPM_Backup"
)

$directories = @(
  $AppRoot,
  (Join-Path $AppRoot "data"),
  (Join-Path $AppRoot "storage"),
  (Join-Path $AppRoot "logs"),
  $BackupRoot
)

foreach ($directory in $directories) {
  if (-not (Test-Path -Path $directory)) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
  }
}

Write-Host "Windows-Verzeichnisse vorbereitet:"
$directories | ForEach-Object { Write-Host " - $_" }
