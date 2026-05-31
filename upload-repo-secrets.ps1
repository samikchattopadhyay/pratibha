# GitHub Repository Secrets Upload Script
# Reads from .env.secrets and uploads REPOSITORY-LEVEL secrets only
# These are shared across all workflows in the repository

param(
    [switch]$DryRun = $false,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "GitHub Repository Secrets Upload Script"
    Write-Host "========================================"
    Write-Host ""
    Write-Host "Usage:"
    Write-Host "  .\upload-repo-secrets.ps1              # Upload repository secrets"
    Write-Host "  .\upload-repo-secrets.ps1 -DryRun      # Show what would be uploaded"
    Write-Host "  .\upload-repo-secrets.ps1 -Help        # Show this help message"
    Write-Host ""
    Write-Host "This script uploads NON-SENSITIVE secrets that are used across all workflows."
    Write-Host ""
    exit 0
}

$ErrorActionPreference = "Stop"

# Secrets that go to REPOSITORY level (shared, non-sensitive)
$repositorySecrets = @(
    'BREVO_API_KEY',
    'NEXTAUTH_URL',
    'RESEND_FROM_EMAIL',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'CRON_SECRET',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'FACEBOOK_APP_ID',
    'FACEBOOK_APP_SECRET',
    'TELEGRAM_BOT_TOKEN',
    'FROM_EMAIL'
)

Write-Host "[GITHUB REPOSITORY SECRETS UPLOAD]" -ForegroundColor Cyan
Write-Host ""
Write-Host "Scope: Repository-level (all workflows)" -ForegroundColor Yellow
Write-Host ""

# Check if .env.secrets exists
if (-not (Test-Path ".env.secrets")) {
    Write-Host "[ERROR] .env.secrets file not found!" -ForegroundColor Red
    Write-Host "[INFO] Please create .env.secrets with your secret values first." -ForegroundColor Yellow
    exit 1
}

# Read .env.secrets file and parse key=value pairs
$allSecrets = @{}
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
            $allSecrets[$key] = $value
        }
    }
}

# Filter only repository-level secrets
$secretsToUpload = @{}
foreach ($key in $repositorySecrets) {
    if ($allSecrets.ContainsKey($key)) {
        $secretsToUpload[$key] = $allSecrets[$key]
    }
}

if ($secretsToUpload.Count -eq 0) {
    Write-Host "[WARN] No repository secrets found in .env.secrets!" -ForegroundColor Yellow
    Write-Host "[INFO] Expected secrets: $($repositorySecrets -join ', ')" -ForegroundColor Yellow
    exit 1
}

Write-Host "[SECRETS LOADED] Found $($secretsToUpload.Count) repository secrets" -ForegroundColor Green
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
    Write-Host "These repository secrets would be uploaded:" -ForegroundColor Cyan
    Write-Host ""

    foreach ($key in ($secretsToUpload.Keys | Sort-Object)) {
        Write-Host "gh secret set $key --body '***'" -ForegroundColor Gray
    }

    Write-Host ""
    Write-Host "[INFO] To actually upload secrets, run without -DryRun:" -ForegroundColor Yellow
    Write-Host "  .\upload-repo-secrets.ps1" -ForegroundColor Gray
    exit 0
}

Write-Host ""
Write-Host "[UPLOADING] Uploading repository secrets..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failureCount = 0

foreach ($key in ($secretsToUpload.Keys | Sort-Object)) {
    $value = $secretsToUpload[$key]

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
    Write-Host "[SUCCESS] All repository secrets uploaded successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "[LINK] View secrets at:" -ForegroundColor Cyan
    Write-Host "https://github.com/samikchattopadhyay/pratibha/settings/secrets/actions" -ForegroundColor Gray
} else {
    Write-Host "[WARN] Some secrets were not uploaded. Please check the errors above." -ForegroundColor Yellow
    exit 1
}
