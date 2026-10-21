# Restores Database\Delizioso.bak into SQL Server on this computer (replaces the existing Delizioso database!).
# Run from the project folder:  powershell -ExecutionPolicy Bypass -File Database\restore-db.ps1
param(
    [string]$Server = "(localdb)\MSSQLLocalDB",
    [string]$Database = "Delizioso"
)
$ErrorActionPreference = "Stop"
$file = Join-Path $PSScriptRoot "$Database.bak"
if (-not (Test-Path $file)) { throw "Backup file not found: $file" }

# Data files go to the user profile (LocalDB's usual place)
$dataDir = $env:USERPROFILE
$files = sqlcmd -S $Server -b -h -1 -W -s "|" -Q "SET NOCOUNT ON; RESTORE FILELISTONLY FROM DISK = N'$file'" |
    Where-Object { $_ -match '\|' } | ForEach-Object { ($_ -split '\|')[0..1] -join '|' }
$moves = foreach ($f in $files) {
    $logical, $physical = $f -split '\|'
    $ext = [IO.Path]::GetExtension($physical)
    "MOVE N'$logical' TO N'$(Join-Path $dataDir "$Database$(if ($ext -eq '.ldf') { '_log' })$ext")'"
}

$sql = @"
IF DB_ID(N'$Database') IS NOT NULL ALTER DATABASE [$Database] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
RESTORE DATABASE [$Database] FROM DISK = N'$file' WITH REPLACE, $($moves -join ', ');
ALTER DATABASE [$Database] SET MULTI_USER;
"@
sqlcmd -S $Server -b -Q $sql
if ($LASTEXITCODE -ne 0) { throw "Restore failed" }
Write-Host "Database $Database restored from $file"
