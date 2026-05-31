# GitHub Secrets Upload Script
# Reads from .env.secrets and uploads all secrets to GitHub repository

param(
    [switch]$DryRun = $false,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host @"
GitHub Secrets Upload Script
=============================

Usage:
  .\upload-github-secrets.ps1              # Upload all secrets to GitHub
  .\upload-github-secrets.ps1 -DryRun      # Show what would be uploaded (don't upload)
  .\upload-github-secrets.ps1 -Help        # Show this help message

Prerequisites:
  1. Fill in .env.secrets with your actual secret values
  2. Install GitHub CLI: https://cli.github.com/
  3. Authenticate: gh auth login

Example .env.secrets:
  CLOUDFLARE_ACCOUNT_ID=abc123def456
  CLOUDFLARE_API_TOKEN=v1.0_abc...
  DATABASE_URL=postgresql://user:pass@host/db
  ... etc
"@
    exit 0
}

# Stop on any error
$ErrorActionPreference = "Stop"

Write-Host "🔐 GitHub Secrets Upload Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.secrets exists
if (-not (Test-Path ".env.secrets")) {
    Write-Host "❌ Error: .env.secrets file not found!" -ForegroundColor Red
    Write-Host "   Please create .env.secrets with your secret values first." -ForegroundColor Yellow
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
    if ($line -match "^([A-Z_]+)=(.*)$") {
        $key = $matches[1]
        $value = $matches[2]

        # Only add non-empty values
        if (-not [string]::IsNullOrWhiteSpace($value)) {
            $secrets[$key] = $value
        }
    }
}

if ($secrets.Count -eq 0) {
    Write-Host "⚠️  Warning: No secrets found in .env.secrets!" -ForegroundColor Yellow
    Write-Host "   Please fill in the file with actual values." -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Secrets loaded from .env.secrets:" -ForegroundColor Yellow
Write-Host ""
foreach ($key in ($secrets.Keys | Sort-Object)) {
    $value = $secrets[$key]
    $preview = if ($value.Length -gt 20) {
        $value.Substring(0, 20) + "..."
    } else {
        $value
    }
    Write-Host "  ✓ $key = $preview" -ForegroundColor Green
}
Write-Host ""

# Check if gh CLI is installed
try {
    $ghVersion = gh --version 2>&1
    Write-Host "✅ GitHub CLI found: $ghVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ GitHub CLI (gh) is not installed or not in PATH" -ForegroundColor Red
    Write-Host "   Install it from: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

if ($DryRun) {
    Write-Host "🏃 DRY RUN MODE: No secrets will be uploaded" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "These commands would be executed:" -ForegroundColor Cyan
    Write-Host ""

    foreach ($key in ($secrets.Keys | Sort-Object)) {
        Write-Host "gh secret set $key --body '***'" -ForegroundColor Gray
    }

    Write-Host ""
    Write-Host "To actually upload secrets, run without -DryRun:" -ForegroundColor Yellow
    Write-Host "  .\upload-github-secrets.ps1" -ForegroundColor Gray
    exit 0
}

# Prompt for confirmation
Write-Host "⚠️  WARNING: You are about to upload $($secrets.Count) secrets to GitHub" -ForegroundColor Yellow
Write-Host "   This action CANNOT be undone easily." -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Type 'YES' to continue (or anything else to cancel)"

if ($confirm -ne "YES") {
    Write-Host "❌ Upload cancelled." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🚀 Uploading secrets to GitHub..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failureCount = 0

foreach ($key in ($secrets.Keys | Sort-Object)) {
    $value = $secrets[$key]

    try {
        gh secret set $key --body $value
        Write-Host "✅ Set: $key" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "❌ Failed: $key" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor DarkRed
        $failureCount++
    }
}

Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Success: $successCount" -ForegroundColor Green
Write-Host "  ❌ Failed:  $failureCount" -ForegroundColor Red
Write-Host ""

if ($failureCount -eq 0 -and $successCount -gt 0) {
    Write-Host "✨ All secrets uploaded successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 View secrets at:" -ForegroundColor Cyan
    Write-Host "   https://github.com/samikchattopadhyay/pratibha/settings/secrets/actions" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🧹 Cleaning up .env.secrets..." -ForegroundColor Yellow
    Remove-Item -Force ".env.secrets" -ErrorAction SilentlyContinue
    Write-Host "✅ File deleted to prevent accidental commits." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some secrets were not uploaded. Please check the errors above." -ForegroundColor Yellow
    Write-Host "   .env.secrets has been preserved for retry." -ForegroundColor Yellow
    exit 1
}
