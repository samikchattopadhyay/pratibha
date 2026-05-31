# GitHub Secrets Setup & Deployment

This document outlines how to configure GitHub repository secrets for the Pratibha Parishad deployment pipeline.

## Overview

The CI/CD workflow (`.github/workflows/deploy.yml`) requires several encrypted secrets to:
- Authenticate with Cloudflare Pages for deployment
- Access the PostgreSQL database during migrations
- Send emails via Brevo
- Manage other third-party integrations (Telegram, Razorpay, etc.)

GitHub secrets are **encrypted at rest** and **only exposed to workflows**—they are never logged or displayed in the UI.

---

## Required Secrets

| Secret | Source | Purpose | Required |
|--------|--------|---------|----------|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard | Identify your Cloudflare account for Pages deployment | ✅ Yes |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Tokens | Authenticate with Cloudflare API for deployments | ✅ Yes |
| `DATABASE_URL` | Neon PostgreSQL | Connect to production database during migrations and builds | ✅ Yes |
| `NEXTAUTH_SECRET` | Generated | Session encryption key for NextAuth.js | ✅ Yes |
| `NEXTAUTH_URL` | Your app URL | Canonical URL for NextAuth redirect URLs | ✅ Yes |
| `BREVO_API_KEY` | Brevo Settings → API Keys | Send transactional emails via Brevo SMTP | ✅ Yes |
| `RESEND_FROM_EMAIL` | Your domain | Sender email address for email notifications | ✅ Yes |
| `TELEGRAM_BOT_TOKEN` | Telegram BotFather | Send Telegram notifications (optional) | ❌ No |
| `RAZORPAY_KEY_ID` | Razorpay Dashboard | Payment processing (optional) | ❌ No |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard | Payment processing (optional) | ❌ No |

---

## How to Add Secrets to GitHub

### Option 1: GitHub UI (Simple, One-by-One)

1. Go to: `https://github.com/samikchattopadhyay/pratibha/settings/secrets/actions`
2. Click **"New repository secret"**
3. Enter secret name (e.g., `CLOUDFLARE_ACCOUNT_ID`)
4. Paste the value
5. Click **"Add secret"**
6. Repeat for all secrets

### Option 2: GitHub CLI (Batch Upload)

First, ensure you have the `gh` CLI installed: https://cli.github.com/

Then run these commands in PowerShell:

```powershell
# Cloudflare
gh secret set CLOUDFLARE_ACCOUNT_ID -b "your-account-id"
gh secret set CLOUDFLARE_API_TOKEN -b "your-api-token"

# Database
gh secret set DATABASE_URL -b "postgresql://user:pass@host/dbname"

# Authentication
gh secret set NEXTAUTH_SECRET -b "9E7k2L5qP8vR3tN6xB1mC4wJ9fD7sA2g+H8jK6lM3n"
gh secret set NEXTAUTH_URL -b "https://pratibha-parishad.pages.dev"

# Email
gh secret set BREVO_API_KEY -b "xkeysib_..."
gh secret set RESEND_FROM_EMAIL -b "noreply@pratibhaparishad.in"

# Optional: Telegram
gh secret set TELEGRAM_BOT_TOKEN -b "123456:ABC..."

# Optional: Razorpay
gh secret set RAZORPAY_KEY_ID -b "rzp_live_..."
gh secret set RAZORPAY_KEY_SECRET -b "your-secret"
```

---

## How to Get Each Secret

### Cloudflare Account ID
1. Log in to https://dash.cloudflare.com
2. Look at the right sidebar → **Account ID**
3. Copy the 32-character ID

### Cloudflare API Token
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Choose template: **"Edit Cloudflare Pages"**
4. Grant permissions:
   - Account → Cloudflare Pages → Edit
   - Account → Workers R2 → Edit (if using R2)
5. Create and copy the token

### Database URL
From Neon PostgreSQL:
1. Log in to https://console.neon.tech
2. Select your project
3. Copy the connection string (starts with `postgresql://`)
4. Example: `postgresql://user:password@host.neon.tech/dbname`

### NEXTAUTH_SECRET
Generate a cryptographically secure random string. You can use:

```powershell
# PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Or use the pre-generated value:
# 9E7k2L5qP8vR3tN6xB1mC4wJ9fD7sA2g+H8jK6lM3n
```

### NEXTAUTH_URL
Your app's canonical URL:
- **Production:** `https://pratibha-parishad.pages.dev`
- **Preview:** `https://[branch-name].pratibha-parishad.pages.dev`

### Brevo API Key
1. Log in to https://app.brevo.com
2. Go to **Settings → API Keys**
3. Click **"Create API Key"** if needed
4. Copy the key (starts with `xkeysib_`)

### Telegram Bot Token (Optional)
1. Message **@BotFather** on Telegram
2. Create a new bot with `/newbot`
3. Copy the bot token provided

### Razorpay Credentials (Optional)
1. Log in to https://dashboard.razorpay.com
2. Go to **Settings → API Keys**
3. Copy Key ID and Secret

---

## Workflow Execution

Once secrets are configured, the deployment workflow automatically:

1. **CI Check** — Lints and type-checks code
2. **Terraform** — Provisions Cloudflare infrastructure (if infra changes)
3. **Migrations** — Runs database migrations using `DATABASE_URL`
4. **Build** — Compiles Next.js app with all env vars
5. **Push Secrets to Cloudflare** — Uploads secrets to Cloudflare Workers environment (lines 486–540 in `deploy.yml`)
6. **Deploy to Cloudflare Pages** — Pushes built app to Cloudflare Pages

### Secrets in Cloudflare Workers

Secrets are uploaded to Cloudflare Workers via `wrangler pages secret bulk` command. They're available as environment variables at runtime:

```typescript
// In your API routes or server actions
const brevoApiKey = process.env.BREVO_API_KEY;
const databaseUrl = process.env.DATABASE_URL;
```

---

## Security Best Practices

✅ **DO:**
- Store all sensitive values in GitHub Secrets, never in code
- Rotate API tokens periodically
- Use environment-specific secrets (production vs. preview)
- Review secret usage in `.github/workflows/deploy.yml`

❌ **DON'T:**
- Commit `.env` files with real secrets
- Paste secrets in pull request descriptions or comments
- Share secrets via email or chat
- Use the same secret across multiple environments

---

## Troubleshooting

### Deployment fails with "401 Unauthorized" on Cloudflare step
- Verify `CLOUDFLARE_API_TOKEN` is valid and has correct permissions
- Check that `CLOUDFLARE_ACCOUNT_ID` matches your account

### Database migration fails
- Verify `DATABASE_URL` is correct and the database is reachable
- Check that your IP/environment has network access to the database host

### Secrets appear empty in logs
- GitHub automatically masks secret values in logs (correct behavior)
- If a step silently fails, check the step's error message carefully

### How to verify secrets are set
```bash
# List all secrets (names only, not values)
gh secret list --repo samikchattopadhyay/pratibha
```

---

## Rotating Secrets

To rotate a secret (e.g., when a token expires):

1. Generate a new value from the source (Cloudflare, Brevo, etc.)
2. Update the GitHub secret:
   ```bash
   gh secret set SECRET_NAME -b "new-value"
   ```
3. Verify the new value works by re-running the workflow

---

## References

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [Cloudflare Pages Environment Variables](https://developers.cloudflare.com/pages/functions/bindings/environment-variables/)
- [Brevo SMTP Setup](https://developers.brevo.com/docs/getting-started)
- [Wrangler Pages Secret Bulk Upload](https://developers.cloudflare.com/workers/wrangler/commands/#secret)

---

**Last Updated:** 2026-05-31  
**Maintained By:** Pratibha Parishad DevOps Team
