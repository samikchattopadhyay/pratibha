# 🔐 GitHub Secrets Setup Guide

This guide walks you through filling in and uploading secrets to GitHub for the Pratibha Parishad CI/CD pipeline.

## Files

- **`.env.secrets`** — Template file for all required secrets (KEY=VALUE format)
- **`secrets.json.template`** — Alternative JSON format for reference
- **`upload-github-secrets.ps1`** — PowerShell script to upload secrets to GitHub
- **`docs/github-secrets-setup.md`** — Complete documentation

## Quick Start (3 Steps)

### Step 1: Fill in `.env.secrets`

Open `.env.secrets` and replace empty values with your actual secrets:

```bash
CLOUDFLARE_ACCOUNT_ID=your-account-id-here
CLOUDFLARE_API_TOKEN=your-token-here
DATABASE_URL=postgresql://user:pass@host/dbname
NEXTAUTH_URL=https://pratibha-parishad.pages.dev
BREVO_API_KEY=xkeysib_your_key_here
# ... etc
```

**Don't commit this file!** It's in `.gitignore` for security.

### Step 2: Verify GitHub CLI is installed

```powershell
gh --version
```

If not installed, download from: https://cli.github.com/

### Step 3: Run the upload script

```powershell
# Preview what would be uploaded (safe)
.\upload-github-secrets.ps1 -DryRun

# Actually upload (requires confirmation)
.\upload-github-secrets.ps1
```

Script will:
- ✅ Read values from `.env.secrets`
- ✅ Show preview of what will be uploaded
- ✅ Ask for confirmation
- ✅ Upload all secrets to GitHub
- ✅ Delete `.env.secrets` after successful upload (cleanup)

---

## What Each Secret Is For

See **`docs/github-secrets-setup.md`** for detailed instructions on how to get each value.

| Secret | Where to get it |
|--------|-----------------|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard (right sidebar) |
| `CLOUDFLARE_API_TOKEN` | Cloudflare → API Tokens → Create Token |
| `DATABASE_URL` | Neon PostgreSQL console |
| `NEXTAUTH_SECRET` | ✅ Already filled (you can keep or generate new) |
| `NEXTAUTH_URL` | Your app URL (e.g., `https://pratibha-parishad.pages.dev`) |
| `BREVO_API_KEY` | Brevo → Settings → API Keys |
| `RESEND_FROM_EMAIL` | ✅ Already filled (your sender email) |
| `TELEGRAM_BOT_TOKEN` | Telegram BotFather (optional) |
| `RAZORPAY_KEY_ID` | Razorpay Dashboard (optional) |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard (optional) |

---

## Verification

After uploading, verify secrets are in GitHub:

```powershell
# List all secret names (values are hidden)
gh secret list --repo samikchattopadhyay/pratibha
```

Or view in GitHub UI:
👉 https://github.com/samikchattopadhyay/pratibha/settings/secrets/actions

---

## Troubleshooting

**Script says "gh CLI not found"**
- Install GitHub CLI: https://cli.github.com/
- Run `gh auth login` to authenticate

**Script says ".env.secrets not found"**
- Create the file by copying `secrets.json.template`
- Fill in the values

**Upload fails with "401 Unauthorized"**
- Check that `CLOUDFLARE_API_TOKEN` has correct permissions
- Verify token hasn't expired

---

## Security Notes

⚠️ **Never:**
- Commit `.env.secrets` to Git
- Share secrets via email or Slack
- Paste secrets in pull request descriptions
- Hardcode secrets in application code

✅ **Always:**
- Use GitHub Secrets for sensitive values
- Rotate tokens periodically
- Use environment-specific secrets
- Review what the CI pipeline does with secrets

---

## Next Steps

1. Fill in `.env.secrets` with your actual values
2. Run `.\upload-github-secrets.ps1 -DryRun` to preview
3. Run `.\upload-github-secrets.ps1` to upload
4. Verify secrets appeared in GitHub UI
5. Delete this local copy if desired (script deletes `.env.secrets` automatically)

---

**Need help?** See `docs/github-secrets-setup.md` for complete documentation.
