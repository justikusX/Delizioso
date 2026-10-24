param(
    [string]$HostName = "localhost",
    [string]$Port = "5432",
    [string]$User = "postgres",
    [string]$Database = "delizioso"
)
$ErrorActionPreference = "Stop"
$file = Join-Path $PSScriptRoot "$Database.backup"
if (-not (Test-Path $file)) { throw "Backup file not found: $file" }

dropdb -h $HostName -p $Port -U $User --if-exists $Database
createdb -h $HostName -p $Port -U $User $Database
pg_restore -h $HostName -p $Port -U $User -d $Database $file
if ($LASTEXITCODE -ne 0) { throw "Restore failed" }
Write-Host "Database $Database restored from $file"
