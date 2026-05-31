# Quick Start Checklist - Cloudflare Workers Deployment

Copy this checklist and work through it step-by-step.

## Phase 1: Local Validation (5 min)

- [ ] Run validation script:
  ```bash
  npm run validate
  ```
  Expected output: "⚠️ Deployment validation passed with warnings"

- [ ] Review validation results (should show all "PASSED CHECKS")

- [ ] No critical failures?  
  ✓ Continue to Phase 2  
  ✗ Fix any failed checks before proceeding

---

## Phase 2: Environment Setup (10 min)

- [ ] Copy environment template:
  ```bash
  cp .env.example .env.local
  ```

- [ ] Open `.env.local` and fill in values:
  - [ ] `DATABASE_URL` — Neon Postgres connection string (https://neon.tech)
  - [ ] `NEXTAUTH_URL` — `http://localhost:3000` (for local dev)
  - [ ] `NEXTAUTH_SECRET` — Generate random: `openssl rand -hex 32`
  - [ ] `AWS_ACCESS_KEY_ID` — From Cloudflare R2 API token
  - [ ] `AWS_SECRET_ACCESS_KEY` — From Cloudflare R2 API token
  - [ ] `AWS_ENDPOINT_URL_S3` — Your R2 bucket URL
  - [ ] `RESEND_API_KEY` — From Resend dashboard (for emails)
  - [ ] `RAZORPAY_KEY_ID` — From Razorpay (if using payments)
  - [ ] `RAZORPAY_KEY_SECRET` — From Razorpay

- [ ] Save `.env.local`

- [ ] Verify database connection:
  ```bash
  npx prisma db push
  ```
  Expected: "✓ Database push successful"

---

## Phase 3: Local Testing (15 min)

- [ ] Start development server:
  ```bash
  npm run dev
  ```

- [ ] Open browser: `http://localhost:3000`

- [ ] Test core features:
  - [ ] Homepage loads
  - [ ] Login/Register page works
  - [ ] Can submit a form (e.g., register student)
  - [ ] API calls work (check Network tab in DevTools)

- [ ] Stop dev server: `Ctrl+C`

---

## Phase 4: Build & Preview (10 min)

- [ ] Build for Workers:
  ```bash
  npm run build:workers
  ```
  Expected: "✓ Generated .open-next/"

- [ ] Preview locally:
  ```bash
  npm run preview:workers
  ```

- [ ] Test in preview:
  - [ ] Visit `http://localhost:8787`
  - [ ] Test same features as Phase 3
  - [ ] Check console for any errors: `Ctrl+Shift+J`

- [ ] Stop preview: `Ctrl+C`

---

## Phase 5: Commit Changes (5 min)

- [ ] Add deployment config files:
  ```bash
  git add wrangler.toml open-next.config.ts DEPLOYMENT_WORKERS.md SETUP_SUMMARY.md QUICKSTART_CHECKLIST.md .env.example
  git add package.json scripts/validate-deployment.js
  ```

- [ ] Commit:
  ```bash
  git commit -m "setup: configure Cloudflare Workers deployment

- Added wrangler.toml with nodejs_compat flag
- Added deployment guide and validation script
- Updated build scripts for @opennextjs/cloudflare adapter
- Preserved all original code and Pages deployment config"
  ```

- [ ] Push to GitHub/GitLab:
  ```bash
  git push origin main
  ```

---

## Phase 6: Cloudflare Setup (20 min)

### 6A: Create Neon Database
- [ ] Go to https://neon.tech
- [ ] Create free account
- [ ] Create new project (PostgreSQL)
- [ ] Copy "Connection string" → Pooled
- [ ] Save as `DATABASE_URL` for next step

### 6B: Create R2 Bucket
- [ ] Log into Cloudflare Dashboard
- [ ] Go to **R2** → **Create bucket**
- [ ] Name: `pratibha-uploads`
- [ ] Create API token:
  - Go to **R2** → **Settings** → **API tokens**
  - Create new token (read & write)
  - Save `Access Key ID` and `Secret Access Key`

### 6C: Gather All Environment Variables
Collect these values:
- [ ] DATABASE_URL (from Neon)
- [ ] NEXTAUTH_SECRET (generate: `openssl rand -hex 32`)
- [ ] AWS_ACCESS_KEY_ID (from R2)
- [ ] AWS_SECRET_ACCESS_KEY (from R2)
- [ ] AWS_ENDPOINT_URL_S3 (your R2 endpoint)
- [ ] RESEND_API_KEY (sign up at https://resend.com)
- [ ] RAZORPAY_KEY_ID (sign up at https://razorpay.com, if needed)
- [ ] RAZORPAY_KEY_SECRET (from Razorpay)

---

## Phase 7: Deploy to Cloudflare (15 min)

### Option A: Git Integration (Recommended)
- [ ] Go to https://dash.cloudflare.com
- [ ] **Workers & Pages** → **Create** → **Pages**
- [ ] **Connect to Git** → Select your GitHub/GitLab repo
- [ ] Fill in:
  - **Build command**: `npm run build:workers`
  - **Build output directory**: `.open-next`
- [ ] Click **Save and Deploy**
- [ ] Wait for build to complete (~2-3 min)

### Option B: CLI Deploy
- [ ] Authenticate with Cloudflare:
  ```bash
  wrangler login
  ```
- [ ] Deploy:
  ```bash
  npm run deploy:workers
  ```
- [ ] Note the deployment URL

---

## Phase 8: Configure Cloudflare Pages (10 min)

After deploy is complete:

- [ ] Go to Cloudflare Dashboard → **Pages** → **Your Project**
- [ ] Click **Settings** → **Functions**
- [ ] **Compatibility flags**: Add `nodejs_compat`
- [ ] **Compatibility date**: Set to `2024-09-23` or later
- [ ] Click **Save**

- [ ] Go to **Settings** → **Environment variables**
- [ ] Add ALL variables from Phase 6C:
  - For **Production**: All variables
  - For **Preview**: Same (or different DB if staging)
- [ ] Click **Save**

- [ ] **Redeploy** to apply environment variables:
  - Either: Push a commit to trigger rebuild
  - Or: Go to **Deployments** → **Rollback** → **Rollback to this version**

---

## Phase 9: Test Production (15 min)

- [ ] Copy your deployment URL (from Pages dashboard)
- [ ] Visit the URL in browser

- [ ] Test core features:
  - [ ] Homepage loads ✓
  - [ ] Login works ✓
  - [ ] Create an entry/submission ✓
  - [ ] File uploads work ✓
  - [ ] Scorecard/dashboard queries ✓

- [ ] Monitor logs:
  ```bash
  wrangler tail --service pratibha-parishad
  ```

- [ ] Check for errors in logs (should be clean)

---

## Phase 10: Setup Monitoring (5 min)

- [ ] **In Cloudflare Dashboard:**
  - [ ] Go to **Analytics** → **Workers** tab
  - [ ] Monitor request latency, error rates, CPU time
  - [ ] Set up email alerts (if needed)

- [ ] **Bookmark for later:**
  - Log viewing: `wrangler tail --service pratibha-parishad`
  - Rollback: Cloudflare Pages → Deployments tab

---

## Success Criteria ✅

You're done when:
1. ✓ `npm run validate` passes
2. ✓ Local dev server works (`npm run dev`)
3. ✓ Local Workers preview works (`npm run preview:workers`)
4. ✓ Changes committed and pushed to GitHub
5. ✓ Cloudflare Pages shows successful deployment
6. ✓ nodejs_compat flag enabled in Cloudflare
7. ✓ All environment variables set in Cloudflare
8. ✓ Production URL works and features are operational

---

## Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| Build fails | See [DEPLOYMENT_WORKERS.md](./DEPLOYMENT_WORKERS.md#troubleshooting) |
| Database fails | Add DATABASE_URL to Cloudflare env vars |
| nodejs_compat error | Enable in Pages → Settings → Functions |
| File uploads fail | Check R2 credentials and bucket CORS |
| NextAuth fails | Verify NEXTAUTH_URL matches domain |

---

## Next Steps After Deployment

1. **Enable email notifications**
   - Update email templates if needed
   - Test email sending (check RESEND_API_KEY)

2. **Setup cron jobs** (for reminders & retries)
   - Option A: Cloudflare Workflows
   - Option B: External service (e.g., EasyCron)

3. **Configure domain**
   - Point your domain to Cloudflare
   - Update NEXTAUTH_URL to production domain

4. **Monitoring & alerts**
   - Set up Cloudflare email alerts
   - Monitor error rates in Analytics

5. **Regular backups**
   - Setup database backups via Neon
   - Document all environment variables

---

## Questions?

- **Deployment**: See [DEPLOYMENT_WORKERS.md](./DEPLOYMENT_WORKERS.md)
- **Errors**: Check [OpenNext Troubleshooting](https://opennext.js.org/cloudflare/troubleshooting)
- **Workers**: [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- **Neon**: [Neon Docs](https://neon.tech/docs/)

---

**Estimated Total Time: 90 minutes**

Good luck! 🚀
