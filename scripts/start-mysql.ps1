$serviceName = $env:MYSQL_SERVICE_NAME
if (-not $serviceName) {
  $serviceName = "MySQL80"
}

$service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
if (-not $service) {
  Write-Error "MySQL service '$serviceName' was not found. Install MySQL Server or set MYSQL_SERVICE_NAME to the correct service name."
  exit 1
}

if ($service.Status -ne 'Running') {
  Start-Service -Name $serviceName
}

Write-Host "MySQL service '$serviceName' is running."
