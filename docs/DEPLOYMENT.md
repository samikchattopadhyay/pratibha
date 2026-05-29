# Deployment Guide — Cloudflare Pages

This project uses **GitHub Actions CI/CD** for production deployments to Cloudflare Pages.

## How It Works

1. **Push to `main` branch** → GitHub Actions automatically triggers
2. **Build runs on Linux** → Type check, lint, build Next.js app
3. **Deploy to Cloudflare Pages** → Wrangler deploys `.vercel/output/static`

## One-Time Setup

### 1. Generate Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Account Settings → API Tokens**
3. Click **Create Token**
4. Select **Edit Cloudflare Workers** template (or create custom with `Account.Workers Routes:Edit`)
5. Copy the token

### 2. Get Cloudflare Account ID

1. In [Cloudflare Dashboard](https://dash.cloudflare.com/), click your profile
2. Look for **Account ID** on the right side
3. Copy it

### 3. Add GitHub Secrets

1. Go to your GitHub repo → **Settings → Secrets and variables → Actions**
2. Create 3 new repository secrets:
   - `CLOUDFLARE_API_TOKEN` = (token from step 1)
   - `CLOUDFLARE_ACCOUNT_ID` = (account ID from step 2)
   - `DATABASE_URL` = (your production database URL)

### 4. Verify Secrets Are Set

```bash
# Run this to check (no output = good, it means GitHub has them)
git push  # This will trigger the workflow
```

Then check **Actions** tab in GitHub to see the deployment progress.

## Deployment Status

- **Push to main** → Auto-deploys (green ✅ = live)
- **Open PR** → Build check only (no deployment until merged)
- **Failed build** → Check **Actions** tab for error details

## Rolling Back

If deployment breaks:

```bash
git revert <commit-hash>
git push origin main
```

GitHub Actions will automatically re-deploy the previous working version.

## Local Development

For local testing before pushing:

```bash
npm run dev              # Start dev server
npm run build           # Test production build
npx tsc --noEmit        # Type check
npm run lint            # Lint check
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **"API Token is invalid"** | Regenerate token in Cloudflare Dashboard, update `CLOUDFLARE_API_TOKEN` secret |
| **"Account ID not found"** | Verify `CLOUDFLARE_ACCOUNT_ID` secret is correct account ID (not project name) |
| **"Build failed: TypeScript errors"** | Run `npx tsc --noEmit` locally, fix errors, push again |
| **"Deployment failed: size limit"** | Reduce bundle size, optimize imports, check `.vercel/output/static` size |

## Manual Deployment (Fallback)

If you need to deploy locally (not recommended):

```bash
# Build locally (requires WSL2 on Windows due to tool compatibility)
npm run build
npx @cloudflare/next-on-pages

# Deploy with Wrangler
wrangler pages deploy .vercel/output/static
```

Requires Wrangler CLI authenticated: `wrangler login`
