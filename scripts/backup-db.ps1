# Database Backup Script for Windows PowerShell
# Creates a timestamped SQL dump of the PostgreSQL database
# Scheduled to run daily via Windows Task Scheduler

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackupDir = Join-Path $ScriptDir "..\backups"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path $BackupDir "pratibha_backup_$Timestamp.sql"

# Ensure backups directory exists
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

# Log function
function Write-Log {
    param([string]$Message)
    $LogMessage = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message"
    Write-Host $LogMessage

    # Also write to backup log
    $LogFile = Join-Path $BackupDir "backup.log"
    Add-Content -Path $LogFile -Value $LogMessage
}

Write-Log "Starting database backup..."

try {
    # Create the backup using Docker
    Write-Log "Creating SQL dump..."
    docker exec pratibha_postgres pg_dump -U pratibha -d pratibhaparishad | Out-File -FilePath $BackupFile -Encoding UTF8

    if (Test-Path $BackupFile) {
        $FileSizeKB = [math]::Round((Get-Item $BackupFile).Length / 1KB)
        Write-Log "Backup created: $BackupFile ($FileSizeKB KB)"

        # Clean up old backups - keep only last 10
        Write-Log "Cleaning old backups (keeping last 10)..."
        $BackupFiles = Get-ChildItem -Path $BackupDir -Filter "pratibha_backup_*.sql" | Sort-Object -Property LastWriteTime -Descending

        if ($BackupFiles.Count -gt 10) {
            $FilesToDelete = $BackupFiles | Select-Object -Skip 10
            foreach ($File in $FilesToDelete) {
                Remove-Item -Path $File.FullName
                Write-Log "  Deleted: $($File.Name)"
            }
        }

        # Show current backups
        Write-Log "Current backups (latest 5):"
        $BackupFiles | Select-Object -First 5 | ForEach-Object {
            $Size = [math]::Round($_.Length / 1KB)
            $DateTime = Get-Date $_.LastWriteTime -Format "yyyy-MM-dd HH:mm:ss"
            Write-Log "  - $($_.Name) ($Size KB, $DateTime)"
        }

        Write-Log "Backup completed successfully"
        exit 0
    }
    else {
        Write-Log "ERROR: Backup file was not created"
        exit 1
    }
}
catch {
    Write-Log "ERROR: Backup failed: $_"
    exit 1
}
