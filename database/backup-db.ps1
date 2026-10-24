param(
    [string]$HostName = "localhost",
    [string]$Port = "5432",
    [string]$User = "postgres",
    [string]$Database = "delizioso"
)
$ErrorActionPreference = "Stop"
$file = Join-Path $PSScriptRoot "$Database.backup"

pg_dump -h $HostName -p $Port -U $User -F c -f $file $Database
if ($LASTEXITCODE -ne 0) { throw "Backup failed" }
Write-Host "Saved $file ($([math]::Round((Get-Item $file).Length / 1KB, 1)) KB)"
