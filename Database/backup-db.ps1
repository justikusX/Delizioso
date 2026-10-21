# Saves the current Delizioso database (menu, customers, orders, reservations...) to Database\Delizioso.bak.
# Run from the project folder:  powershell -ExecutionPolicy Bypass -File Database\backup-db.ps1
param(
    [string]$Server = "(localdb)\MSSQLLocalDB",
    [string]$Database = "Delizioso"
)
$ErrorActionPreference = "Stop"
$file = Join-Path $PSScriptRoot "$Database.bak"

sqlcmd -S $Server -b -Q "BACKUP DATABASE [$Database] TO DISK = N'$file' WITH INIT, COPY_ONLY, FORMAT, NAME = N'$Database backup'"
if ($LASTEXITCODE -ne 0) { throw "Backup failed" }
Write-Host "Saved $file ($([math]::Round((Get-Item $file).Length / 1MB, 1)) MB)"
