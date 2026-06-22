# Clona esquema + datos de ENGLISH_PROD → ENGLISH_PRE (solo lectura en PROD).
# Uso:
#   $env:PROD_DB_PASSWORD = '...'
#   $env:PRE_DB_PASSWORD = '...'
#   powershell -ExecutionPolicy Bypass -File scripts/clone-supabase-prod-to-pre.ps1
#
# Opcional: $env:BACKUP_DIR = 'C:\temp\supabase-backup-YYYYMMDD'

$ErrorActionPreference = 'Stop'

$ProdRef = 'qnazrzvwvkwhkfbqsbmr'
$PreRef = 'ieprzxzrtfneuzsnzoes'

if (-not $env:PROD_DB_PASSWORD) { throw 'Falta PROD_DB_PASSWORD' }
if (-not $env:PRE_DB_PASSWORD) { throw 'Falta PRE_DB_PASSWORD' }

$PgBin = 'C:\Program Files\PostgreSQL\17\bin'
$PgDump = Join-Path $PgBin 'pg_dump.exe'
$Psql = Join-Path $PgBin 'psql.exe'

if (-not (Test-Path $PgDump)) { throw "No se encontró pg_dump en $PgDump" }
if (-not (Test-Path $Psql)) { throw "No se encontró psql en $Psql" }

$BackupDir = if ($env:BACKUP_DIR) { $env:BACKUP_DIR } else {
  Join-Path $PSScriptRoot "..\backups\prod-to-pre-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
}
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

function Encode-Password([string]$pwd) {
  [uri]::EscapeDataString($pwd)
}

$ProdPass = Encode-Password $env:PROD_DB_PASSWORD
$PrePass = Encode-Password $env:PRE_DB_PASSWORD

# Conexión directa (recomendada por Supabase para pg_dump / psql)
$ProdUrl = "postgresql://postgres:${ProdPass}@db.${ProdRef}.supabase.co:5432/postgres"
$PreUrl = "postgresql://postgres:${PrePass}@db.${PreRef}.supabase.co:5432/postgres"

$rolesFile = Join-Path $BackupDir 'roles.sql'
$schemaFile = Join-Path $BackupDir 'schema.sql'
$dataFile = Join-Path $BackupDir 'data.sql'
$historySchemaFile = Join-Path $BackupDir 'history_schema.sql'
$historyDataFile = Join-Path $BackupDir 'history_data.sql'

Write-Host "==> Backup dir: $BackupDir"
Write-Host "==> 1/5 Dump roles (PROD, read-only)..."
& $PgDump --dbname $ProdUrl -f $rolesFile --role-only

Write-Host "==> 2/5 Dump schema (PROD)..."
& $PgDump --dbname $ProdUrl -f $schemaFile

Write-Host "==> 3/5 Dump data (PROD)..."
& $PgDump --dbname $ProdUrl -f $dataFile --use-copy --data-only `
  -x 'storage.buckets_vectors' `
  -x 'storage.vector_indexes'

Write-Host "==> 4/5 Dump migration history (PROD)..."
& $PgDump --dbname $ProdUrl -f $historySchemaFile --schema supabase_migrations
& $PgDump --dbname $ProdUrl -f $historyDataFile --use-copy --data-only --schema supabase_migrations

Write-Host "==> 5/5 Restore into PRE (no changes to PROD)..."
& $Psql --single-transaction --variable ON_ERROR_STOP=1 `
  --file $rolesFile `
  --file $schemaFile `
  --command "SET session_replication_role = replica" `
  --file $dataFile `
  --dbname $PreUrl

& $Psql --single-transaction --variable ON_ERROR_STOP=1 `
  --file $historySchemaFile `
  --file $historyDataFile `
  --dbname $PreUrl

Write-Host ""
Write-Host "OK: backup en $BackupDir"
Write-Host "OK: datos restaurados en ENGLISH_PRE ($PreRef)"
Write-Host "Nota: archivos de Storage (bucket) no se copian con pg_dump; solo metadatos en storage.objects."
