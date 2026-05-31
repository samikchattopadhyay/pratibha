# GitHub Secrets Upload Script
# Reads from .env.secrets and uploads all secrets to GitHub repository

param(
    [switch]$DryRun = $false,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "GitHub Secrets Upload Script"
    Write-Host "============================="
    Write-Host ""
    Write-Host "Usage:"
    Write-Host "  .\upload-github-secrets.ps1              # Upload all secrets to GitHub"
    Write-Host "  .\upload-github-secrets.ps1 -DryRun      # Show what would be uploaded"
    Write-Host "  .\upload-github-secrets.ps1 -Help        # Show this help message"
    Write-Host ""
    exit 0
}

$ErrorActionPreference = "Stop"

Write-Host "[GITHUB SECRETS UPLOAD]" -ForegroundColor Cyan
Write-Host ""

# Check if .env.secrets exists
if (-not (Test-Path ".env.secrets")) {
    Write-Host "[ERROR] .env.secrets file not found!" -ForegroundColor Red
    Write-Host "[INFO] Please create .env.secrets with your secret values first." -ForegroundColor Yellow
    exit 1
}

# Read .env.secrets file and parse key=value pairs
$secrets = @{}
Get-Content ".env.secrets" | ForEach-Object {
    $line = $_.Trim()

    # Skip empty lines and comments
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
        return
    }

    # Parse KEY=VALUE
    if ($line.Contains("=")) {
        $parts = $line -split "=", 2
        $key = $parts[0].Trim()
        $value = $parts[1].Trim()

        # Only add non-empty values
        if (-not [string]::IsNullOrWhiteSpace($value)) {
            $secrets[$key] = $value
        }
    }
}

if ($secrets.Count -eq 0) {
    Write-Host "[WARN] No secrets found in .env.secrets!" -ForegroundColor Yellow
    Write-Host "[INFO] Please fill in the file with actual values." -ForegroundColor Yellow
    exit 1
}

Write-Host "[SECRETS LOADED] Found $($secrets.Count) secrets from .env.secrets" -ForegroundColor Yellow
Write-Host ""

# Check if gh CLI is installed
try {
    $ghVersion = gh --version 2>&1
    Write-Host "[OK] GitHub CLI found" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] GitHub CLI (gh) is not installed or not in PATH" -ForegroundColor Red
    Write-Host "[INFO] Install it from: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

if ($DryRun) {
    Write-Host "[DRY RUN] No secrets will be uploaded" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "These commands would be executed:" -ForegroundColor Cyan
    Write-Host ""

    foreach ($key in ($secrets.Keys | Sort-Object)) {
        Write-Host "gh secret set $key --body '***'" -ForegroundColor Gray
    }

    Write-Host ""
    Write-Host "[INFO] To actually upload secrets, run without -DryRun:" -ForegroundColor Yellow
    Write-Host "  .\upload-github-secrets.ps1" -ForegroundColor Gray
    exit 0
}

# Prompt for confirmation
Write-Host "[WARNING] You are about to upload $($secrets.Count) secrets to GitHub" -ForegroundColor Yellow
Write-Host "[INFO] This action CANNOT be undone easily." -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Type 'YES' to continue (or anything else to cancel)"

if ($confirm -ne "YES") {
    Write-Host "[CANCELLED] Upload cancelled." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "[UPLOADING] Uploading secrets to GitHub..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failureCount = 0

foreach ($key in ($secrets.Keys | Sort-Object)) {
    $value = $secrets[$key]

    try {
        gh secret set $key --body $value
        Write-Host "[OK] Set: $key" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "[FAILED] $key" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor DarkRed
        $failureCount++
    }
}

Write-Host ""
Write-Host "[SUMMARY]" -ForegroundColor Cyan
Write-Host "Success: $successCount" -ForegroundColor Green
Write-Host "Failed:  $failureCount" -ForegroundColor Red
Write-Host ""

if ($failureCount -eq 0 -and $successCount -gt 0) {
    Write-Host "[SUCCESS] All secrets uploaded successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "[LINK] View secrets at:" -ForegroundColor Cyan
    Write-Host "https://github.com/samikchattopadhyay/pratibha/settings/secrets/actions" -ForegroundColor Gray
    Write-Host ""
    Write-Host "[CLEANUP] Deleting .env.secrets..." -ForegroundColor Yellow
    Remove-Item -Force ".env.secrets" -ErrorAction SilentlyContinue
    Write-Host "[OK] File deleted to prevent accidental commits." -ForegroundColor Green
} else {
    Write-Host "[WARN] Some secrets were not uploaded. Please check the errors above." -ForegroundColor Yellow
    Write-Host "[INFO] .env.secrets has been preserved for retry." -ForegroundColor Yellow
    exit 1
}
