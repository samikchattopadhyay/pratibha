# GitHub Environment Secrets Upload Script
# Reads from .env.secrets and uploads ENVIRONMENT-LEVEL secrets (production)
# These are production-critical and require approval before deployment

param(
    [string]$Environment = "production",
    [switch]$DryRun = $false,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "GitHub Environment Secrets Upload Script"
    Write-Host "========================================="
    Write-Host ""
    Write-Host "Usage:"
    Write-Host "  .\upload-env-secrets.ps1                           # Upload to production environment"
    Write-Host "  .\upload-env-secrets.ps1 -Environment preview      # Upload to preview environment"
    Write-Host "  .\upload-env-secrets.ps1 -DryRun                   # Show what would be uploaded"
    Write-Host "  .\upload-env-secrets.ps1 -Help                     # Show this help message"
    Write-Host ""
    Write-Host "This script uploads PRODUCTION-CRITICAL secrets to a specific environment."
    Write-Host "These secrets require approval before deployment workflows can access them."
    Write-Host ""
    exit 0
}

$ErrorActionPreference = "Stop"

Write-Host "[GITHUB ENVIRONMENT SECRETS UPLOAD]" -ForegroundColor Cyan
Write-Host ""
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Scope: Environment-level (requires approval)" -ForegroundColor Yellow
Write-Host ""

# Check if .env.secrets exists
if (-not (Test-Path ".env.secrets")) {
    Write-Host "[ERROR] .env.secrets file not found!" -ForegroundColor Red
    Write-Host "[INFO] Please create .env.secrets with your secret values first." -ForegroundColor Yellow
    exit 1
}

# Read .env.secrets file and parse key=value@LEVEL pairs
$secretsToUpload = @{}
Get-Content ".env.secrets" | ForEach-Object {
    $line = $_.Trim()

    # Skip empty lines and comments
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
        return
    }

    # Parse KEY=value@LEVEL
    if ($line.Contains("=")) {
        $parts = $line -split "=", 2
        $key = $parts[0].Trim()
        $fullValue = $parts[1].Trim()

        # Extract level marker (@REPO, @ENV, @LOCAL)
        if ($fullValue -match "@(REPO|ENV|LOCAL)$") {
            $level = $matches[1]
            $value = $fullValue -replace "@(REPO|ENV|LOCAL)$", ""

            # Only include @ENV level secrets for this script
            if ($level -eq "ENV" -and -not [string]::IsNullOrWhiteSpace($value)) {
                $secretsToUpload[$key] = $value
            }
        }
    }
}

if ($secretsToUpload.Count -eq 0) {
    Write-Host "[WARN] No environment-level secrets found in .env.secrets!" -ForegroundColor Yellow
    Write-Host "[INFO] Make sure secrets are marked with @ENV suffix (e.g., KEY=value@ENV)" -ForegroundColor Yellow
    exit 1
}

Write-Host "[SECRETS LOADED] Found $($secretsToUpload.Count) environment secrets" -ForegroundColor Green
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
    Write-Host "These environment secrets would be uploaded to '$Environment':" -ForegroundColor Cyan
    Write-Host ""

    foreach ($key in ($secretsToUpload.Keys | Sort-Object)) {
        Write-Host "gh secret set $key --body '***' --env $Environment" -ForegroundColor Gray
    }

    Write-Host ""
    Write-Host "[INFO] To actually upload secrets, run without -DryRun:" -ForegroundColor Yellow
    Write-Host "  .\upload-env-secrets.ps1 -Environment $Environment" -ForegroundColor Gray
    exit 0
}

Write-Host "[INFO] Environment: $Environment" -ForegroundColor Yellow
Write-Host "[INFO] These secrets REQUIRE APPROVAL before deployment!" -ForegroundColor Yellow
Write-Host ""
Write-Host "[UPLOADING] Uploading environment secrets to '$Environment'..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failureCount = 0

foreach ($key in ($secretsToUpload.Keys | Sort-Object)) {
    $value = $secretsToUpload[$key]

    try {
        gh secret set $key --body $value --env $Environment
        Write-Host "[OK] Set: $key in $Environment" -ForegroundColor Green
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
    Write-Host "[SUCCESS] All environment secrets uploaded successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "[LINK] View secrets at:" -ForegroundColor Cyan
    Write-Host "https://github.com/samikchattopadhyay/pratibha/settings/environments" -ForegroundColor Gray
} else {
    Write-Host "[WARN] Some secrets were not uploaded. Please check the errors above." -ForegroundColor Yellow
    exit 1
}
