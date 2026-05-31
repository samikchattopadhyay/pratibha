# Setup Secrets File Script
# Creates .env.secrets from template and provides guidance

param(
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "Setup Secrets File Script"
    Write-Host "========================="
    Write-Host ""
    Write-Host "Usage:"
    Write-Host "  .\setup-secrets.ps1        # Create .env.secrets from template"
    Write-Host "  .\setup-secrets.ps1 -Help  # Show this help message"
    Write-Host ""
    exit 0
}

$ErrorActionPreference = "Stop"

Write-Host "[SECRETS SETUP]" -ForegroundColor Cyan
Write-Host ""

# Check if .env.secrets already exists
if (Test-Path ".env.secrets") {
    Write-Host "[ERROR] .env.secrets already exists!" -ForegroundColor Red
    Write-Host "[INFO] If you want to reset it, delete the file first:" -ForegroundColor Yellow
    Write-Host "  Remove-Item .env.secrets" -ForegroundColor Gray
    exit 1
}

# Check if template exists
if (-not (Test-Path ".env.secrets.template")) {
    Write-Host "[ERROR] .env.secrets.template not found!" -ForegroundColor Red
    exit 1
}

# Copy template to .env.secrets
try {
    Copy-Item ".env.secrets.template" ".env.secrets"
    Write-Host "[OK] Created .env.secrets from template" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to create .env.secrets" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor DarkRed
    exit 1
}

Write-Host ""
Write-Host "[INSTRUCTIONS]" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Edit .env.secrets with your actual secret values:"
Write-Host "   - code .env.secrets" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Fill in the following REQUIRED secrets:" -ForegroundColor Yellow
Write-Host "   - CLOUDFLARE_ACCOUNT_ID" -ForegroundColor Gray
Write-Host "   - CLOUDFLARE_API_TOKEN" -ForegroundColor Gray
Write-Host "   - DATABASE_URL" -ForegroundColor Gray
Write-Host "   - NEXTAUTH_SECRET (generate new or use provided)" -ForegroundColor Gray
Write-Host "   - NEXTAUTH_URL" -ForegroundColor Gray
Write-Host "   - BREVO_API_KEY" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Optional secrets (leave blank if not needed):" -ForegroundColor Yellow
Write-Host "   - TELEGRAM_BOT_TOKEN" -ForegroundColor Gray
Write-Host "   - RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Once filled, upload secrets to GitHub:"
Write-Host "   Repository-level (shared):" -ForegroundColor Yellow
Write-Host "     .\upload-repo-secrets.ps1 -DryRun" -ForegroundColor Gray
Write-Host "     .\upload-repo-secrets.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "   Environment-level (production-critical):" -ForegroundColor Yellow
Write-Host "     .\upload-env-secrets.ps1 -DryRun" -ForegroundColor Gray
Write-Host "     .\upload-env-secrets.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "[INFO] See docs/github-secrets-setup.md for detailed instructions on each secret." -ForegroundColor Cyan
Write-Host ""
