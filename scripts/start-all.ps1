param(
  [string]$AdminPassword = $env:GRAYCIE_ADMIN_PASSWORD,
  [string]$DbHost = $env:DB_HOST,
  [string]$DbUser = $env:DB_USER,
  [string]$DbPassword = $env:DB_PASSWORD,
  [string]$DbName = $env:DB_NAME,
  [string]$JwtSecret = $env:JWT_SECRET,
  [string]$ServiceName = $env:MYSQL_SERVICE_NAME
)

if (-not $DbHost) { $DbHost = "localhost" }
if (-not $DbUser) { $DbUser = "graycie_app" }
if (-not $DbPassword) { $DbPassword = "GraycieApp2026!" }
if (-not $DbName) { $DbName = "graycie_glasses" }
if (-not $ServiceName) { $ServiceName = "MySQL80" }
if (-not $JwtSecret) { $JwtSecret = "graycie-dev-secret" }
if (-not $AdminPassword) { $AdminPassword = "GraycieAdmin2026!" }

$env:DB_HOST = $DbHost
$env:DB_USER = $DbUser
$env:DB_PASSWORD = $DbPassword
$env:DB_NAME = $DbName
$env:JWT_SECRET = $JwtSecret
$env:GRAYCIE_ADMIN_PASSWORD = $AdminPassword
$env:MYSQL_SERVICE_NAME = $ServiceName

Write-Host "Starting MySQL service..."
& "$PSScriptRoot/start-mysql.ps1"

Write-Host "Setting up database admin account..."
& "$PSScriptRoot/setup-admin.ps1" -AdminPassword $AdminPassword -DbHost $DbHost -DbUser $DbUser -DbPassword $DbPassword -DbName $DbName

Write-Host "Starting backend server..."
Set-Location $PSScriptRoot/..
node server.js
