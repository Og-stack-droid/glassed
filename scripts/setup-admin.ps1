param(
  [string]$AdminUsername = "admin",
  [string]$AdminPassword = $env:GRAYCIE_ADMIN_PASSWORD,
  [string]$DbHost = $env:DB_HOST,
  [string]$DbUser = $env:DB_USER,
  [string]$DbPassword = $env:DB_PASSWORD,
  [string]$DbName = $env:DB_NAME,
  [int]$DbPort = 3306
)

if (-not $AdminPassword) {
  Write-Error "Set GRAYCIE_ADMIN_PASSWORD before running this script."
  exit 1
}

if (-not $DbHost -or -not $DbUser -or -not $DbPassword -or -not $DbName) {
  Write-Error "Database environment variables are missing. Set DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME."
  exit 1
}

$mysqlCandidates = @(
  (Get-Command mysql -ErrorAction SilentlyContinue),
  (Get-ChildItem -Path "$env:ProgramFiles\MySQL\MySQL Server*\bin\mysql.exe" -ErrorAction SilentlyContinue | Select-Object -First 1),
  (Get-ChildItem -Path "$env:ProgramFiles(x86)\MySQL\MySQL Server*\bin\mysql.exe" -ErrorAction SilentlyContinue | Select-Object -First 1)
) | Where-Object { $_ }

$mysql = $mysqlCandidates | Select-Object -First 1
if (-not $mysql) {
  Write-Error "MySQL client not found. Install MySQL and ensure 'mysql.exe' is available."
  exit 1
}

$mysqlPath = if ($mysql -is [System.Management.Automation.CommandInfo]) { $mysql.Source } else { $mysql.FullName }

$escapedUser = $AdminUsername -replace "'", "''"
$escapedPassword = $AdminPassword -replace "'", "''"
$hash = node -e "const bcrypt=require('bcryptjs'); bcrypt.hash(process.argv[1], 10).then(h=>console.log(h)).catch(err=>{console.error(err); process.exit(1);})" $AdminPassword
if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to hash the admin password."
  exit 1
}

$hash = ($hash).Trim()
$escapedHash = $hash -replace "'", "''"

$sql = @"
CREATE DATABASE IF NOT EXISTS ${DbName};
USE ${DbName};
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
INSERT INTO admins (username, email, password)
VALUES ('$escapedUser', 'hello@graycieglasses.com', '$escapedHash')
ON DUPLICATE KEY UPDATE password = VALUES(password), email = VALUES(email);
"@

$env:MYSQL_PWD = $DbPassword
$command = @(
  "-h", $DbHost,
  "-P", $DbPort,
  "-u", $DbUser,
  "--execute", $sql
)

& $mysqlPath @command
if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to initialize the admin account."
  exit 1
}

Write-Host "Admin setup complete for $AdminUsername."
