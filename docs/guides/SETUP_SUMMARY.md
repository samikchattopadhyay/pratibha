# Cloudflare Workers Setup Summary

## What Changed

This update configures **Pratibha Parishad** for deployment to **Cloudflare Workers** (the correct platform for this full-stack SSR application).

### Files Added:
1. **`wrangler.toml`** — Cloudflare Workers configuration
   - Enables `nodejs_compat` flag (required for Node.js APIs)
   - Sets compatibility date to 2024-09-23
   - Configures build process

2. **`DEPLOYMENT_WORKERS.md`** — Complete deployment guide
   - Local setup instructions
   - Environment variable reference
   - Cloudflare Pages/Workers setup steps
   - Troubleshooting guide

3. **`.env.example`** — Environment variable template
   - Quick reference for required variables
   - Examples for all services (Database, Auth, R2, Email, Payments)

4. **`scripts/validate-deployment.js`** — Pre-deployment validation
   - Checks all required files and configuration
   - Verifies dependencies are installed
   - Validates environment variables

### Files Modified:
1. **`package.json`** — Added Workers deployment scripts
   - `npm run build:workers` — Build for Workers
   - `npm run preview:workers` — Local preview
   - `npm run deploy:workers` — Deploy to Cloudflare
   - `npm run validate` — Pre-deployment checks

### Files NOT Changed (Preserved):
- ✓ `open-next.config.ts` (already existed)
- ✓ `next.config.ts` (no changes needed)
- ✓ All source code in `src/`
- ✓ `prisma/` schema and seed
- ✓ `public/` assets
- ✓ Original deployment scripts (`build:pages`, `deploy:pages`) kept for reference

---

## Next Steps

### Step 1: Validate Local Setup
```bash
npm run validate
```
This checks if all files and configuration are in place.

### Step 2: Set Up Environment Variables
```bash
cp .env.example .env.local
```
Then edit `.env.local` with your actual values:
- Database URL (Neon Postgres)
- NextAuth secret
- R2 credentials
- Email/SMS keys
- Payment gateway credentials

### Step 3: Test Locally
```bash
npm run dev
```
Ensure the app works with local environment variables.

### Step 4: Build & Preview for Workers
```bash
npm run build:workers
npm run preview:workers
```
This simulates the exact Workers environment and starts a local server on `localhost:8787`.

### Step 5: Prepare Cloudflare
1. **Create Neon Postgres database** (free tier: https://neon.tech)
2. **Create R2 bucket** for file uploads (Cloudflare dashboard)
3. **Generate API tokens** for:
   - Neon (connection string)
   - R2 (access key & secret)
   - Other services (Resend, Razorpay, etc.)

### Step 6: Deploy to Cloudflare
**Option A: Via Git (Recommended)**
1. Push repo to GitHub/GitLab
2. Connect to Cloudflare Pages (Git integration)
3. Set build command: `npm run build:workers`
4. Set build output: `.open-next`
5. Add environment variables in Cloudflare UI

**Option B: Via CLI**
```bash
wrangler login
npm run deploy:workers
```

### Step 7: Configure Cloudflare Pages/Workers
In **Cloudflare Dashboard**:
1. Go to **Pages** → **Settings** → **Functions**
2. Add `nodejs_compat` to **Compatibility flags**
3. Set **Compatibility date** to `2024-09-23` or later
4. Add all environment variables under **Environment variables**

### Step 8: Test Deployment
```bash
# Monitor logs in real-time
wrangler tail --service pratibha-parishad
```

Visit your deployed domain and test:
- ✓ Authentication (login, registration)
- ✓ API endpoints (fetch data, create entries)
- ✓ File uploads (profile photos)
- ✓ Database queries (competitions, scorecards)
- ✓ Email notifications

---

## Key Architecture Decisions

| Aspect | Choice | Reason |
|--------|--------|--------|
| **Platform** | Cloudflare Workers | Supports database-backed SSR pages, stateful auth, long-running operations |
| **Adapter** | @opennextjs/cloudflare | Official Next.js adapter for Workers (not Pages adapter) |
| **Database** | Neon Postgres (serverless) | Works seamlessly with serverless Workers, free tier available |
| **File Storage** | Cloudflare R2 | Native integration, free 10GB/month tier |
| **Compatibility Flags** | nodejs_compat | Enables Node.js APIs required by Prisma, NextAuth, bcryptjs |

---

## Why This Setup Works

**Old approach (Cloudflare Pages)** ❌
- Pages is for static sites + simple APIs
- Can't handle persistent database connections
- Cold starts kill SSR performance
- Timeout too short (10-30 sec) for complex queries

**New approach (Cloudflare Workers)** ✅
- Workers = full Node.js runtime
- Persistent connections to Postgres
- Supports stateful authentication
- Proper timeout for long operations (15 min on paid)
- Perfect for full-stack Next.js apps

---

## Troubleshooting

### "npm: opennextjs-cloudflare: command not found"
```bash
npm install  # Ensure dependencies are installed
npm run validate  # Check setup
```

### Build hangs during deployment
- Ensure `.env` is set before building
- Check that `DATABASE_URL` is available at build time
- Verify no interactive prompts in the build process

### Database connection fails after deployment
1. Add `DATABASE_URL` to Cloudflare environment variables
2. Ensure it's the **pooled** connection string from Neon
3. Redeploy after adding the variable

### "nodejs_compat not enabled" error
In Cloudflare Pages → Settings → Functions:
- Add `nodejs_compat` flag
- Set compatibility date to `2024-09-23` or later

See **DEPLOYMENT_WORKERS.md** for detailed troubleshooting.

---

## Support

All original code is preserved. If you need to revert or debug:
- Old deployment scripts still work: `npm run build:pages`, `npm run deploy:pages`
- Git history preserved for all changes
- `open-next.config.ts` is minimal and can be extended

For detailed info, see:
- [`DEPLOYMENT_WORKERS.md`](./DEPLOYMENT_WORKERS.md) — Full deployment guide
- [OpenNext Cloudflare Docs](https://opennext.js.org/cloudflare/)
- [Cloudflare Workers Node.js Guide](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)
