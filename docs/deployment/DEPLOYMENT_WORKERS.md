# Cloudflare Workers Deployment Guide

This guide covers deploying **Pratibha Parishad** to Cloudflare Workers (the correct platform for this full-stack SSR application).

## Why Cloudflare Workers (Not Pages)?

Pratibha Parishad is a full-stack Next.js SSR application with:
- ✓ Database-backed pages (Neon Postgres)
- ✓ Stateful authentication (NextAuth.js)
- ✓ 95+ API endpoints
- ✓ Long-running operations (PDF generation, batch jobs)
- ✓ Real-time features (Server-Sent Events)
- ✓ File uploads to R2

**Cloudflare Workers** provides the necessary runtime support; **Pages** does not.

---

## Local Setup & Testing

### 1. **Install Dependencies**
```bash
npm install
```

All required dependencies are already in `package.json`:
- `@opennextjs/cloudflare` — Next.js adapter for Workers
- `wrangler` — Cloudflare CLI tool

### 2. **Create Environment Files**

Create `.env.local` for local development:
```env
# Database
DATABASE_URL=postgresql://user:password@your-neon-host/dbname?sslmode=require

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# AWS S3/R2 (File uploads)
AWS_ACCESS_KEY_ID=your-r2-access-key
AWS_SECRET_ACCESS_KEY=your-r2-secret-key
AWS_REGION=auto
AWS_ENDPOINT_URL_S3=https://your-account.r2.cloudflarestorage.com

# Email (Resend)
RESEND_API_KEY=your-resend-api-key

# Payments (Razorpay)
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Optional: Telegram notifications
TELEGRAM_BOT_TOKEN=optional
TELEGRAM_CHAT_ID=optional
```

### 3. **Local Database Setup**

For development, ensure your local `.env.local` points to a valid Postgres database:

```bash
# Run migrations
npx prisma migrate dev

# Seed database (if seed.ts exists)
npm run prisma seed
```

### 4. **Local Development Server**
```bash
npm run dev
```
Runs on `http://localhost:3000` with HMR enabled.

---

## Building for Workers

### Preview Build Locally
```bash
npm run build:workers
npm run preview:workers
```

This will:
1. Build the Next.js app
2. Transform it with `opennextjs-cloudflare build`
3. Generate `.open-next/` directory with Worker-compatible code
4. Start a local preview server (default: `localhost:8787`)

---

## Cloudflare Pages/Workers Setup

### Prerequisites
- Cloudflare account with a domain
- Wrangler CLI authenticated: `wrangler login`
- Neon Postgres database (free tier available)
- R2 bucket for file uploads (free tier: 10GB/month)

### 1. **Create Cloudflare Project**

In your Cloudflare dashboard:
1. Go to **Workers & Pages** → **Create**
2. Select **Pages** → **Connect to Git** → Select this repo
3. Set build settings:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build:workers`
   - **Build output directory**: `.open-next`

**OR** (Recommended for full control):
```bash
wrangler deploy
```

### 2. **Configure Environment Variables**

In **Cloudflare Pages/Workers** → **Settings** → **Environment variables**, add:

**Production Environment:**
```
DATABASE_URL=postgresql://user:password@host/dbname
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=auto
AWS_ENDPOINT_URL_S3=https://your-account.r2.cloudflarestorage.com
RESEND_API_KEY=xxx
RAZORPAY_KEY_ID=xxx
RAZORPAY_KEY_SECRET=xxx
```

**Preview Environment** (staging):
```
DATABASE_URL=postgresql://user:password@staging-host/dbname
NEXTAUTH_URL=https://preview-your-domain.com
NEXTAUTH_SECRET=staging-secret-key
(other variables...)
```

### 3. **Enable Node.js Compatibility**

In **Cloudflare Pages** → **Settings** → **Functions**:
- **Compatibility flags**: Add `nodejs_compat`
- **Compatibility date**: Set to `2024-09-23` or later

### 4. **Deploy**

Via Git (automatic):
- Push to your repo's main branch
- Cloudflare Pages auto-builds and deploys

Via CLI:
```bash
npm run deploy:workers
```

---

## Database Connection (Neon)

Neon Postgres works seamlessly with Workers via serverless drivers.

### Connection Pooling
Your `.env` DATABASE_URL should use Neon's pooled connection:
```
postgresql://user:password@POOL_HOST/dbname?sslmode=require
```

**Note**: Neon automatically handles connection pooling for serverless runtimes.

---

## File Uploads (R2)

Your R2 bucket is configured in the app. Ensure:

1. **R2 Bucket exists** in Cloudflare
2. **API credentials** are set in environment variables (above)
3. **CORS** is configured in R2 → **Settings** → **CORS Rules** if needed

---

## Cron Jobs & Background Tasks

The app includes cron tasks at:
- `/api/cron/telegram-retry`
- `/api/cron/scoring-reminders`

**Setup in Cloudflare:**
1. **Cloudflare Workflows** (recommended)
2. **External cron service** (e.g., EasyCron) pointing to your deployed app

Example external cron:
```
GET https://your-domain.com/api/cron/scoring-reminders
```

---

## Monitoring & Logs

### View Logs
```bash
wrangler tail --service pratibha-parishad
```

### Monitor Performance
- **Cloudflare Analytics** → **Workers** tab
- Check request latency, error rates, and CPU time

---

## Troubleshooting

### Build Fails: "opennextjs-cloudflare command not found"
**Cause**: npm install incomplete during CI/CD  
**Solution**: Ensure `.env` variables are set before building

### Build Hangs During Deploy
**Cause**: Missing `open-next.config.ts`  
**Solution**: Already present in repo (`.open-next/worker.js` exists)

### Database Connection Fails at Runtime
**Cause**: DATABASE_URL not in Cloudflare environment  
**Solution**:
1. Go to **Settings** → **Environment variables**
2. Add DATABASE_URL with full connection string
3. Redeploy

### "nodejs_compat not enabled"
**Solution**:
1. **Pages** → **Settings** → **Functions**
2. Add `nodejs_compat` to Compatibility flags
3. Set Compatibility date to `2024-09-23` or later

### NextAuth Sessions Not Persisting
**Cause**: Missing NEXTAUTH_SECRET or wrong URL  
**Solution**:
1. Set NEXTAUTH_URL to your actual deployed domain (e.g., `https://app.example.com`)
2. Ensure NEXTAUTH_SECRET is a strong, consistent value
3. Clear browser cookies and retry

### File Upload Fails (R2)
**Cause**: Missing AWS credentials or CORS misconfiguration  
**Solution**:
1. Verify AWS_* environment variables are set
2. Check R2 bucket CORS settings
3. Test R2 access with `wrangler r2 ls`

---

## Local vs. Production Differences

| Aspect | Local | Workers |
|--------|-------|---------|
| Database | Local Postgres | Neon serverless |
| File uploads | Local `/tmp` or R2 | R2 (automatic) |
| Auth secrets | .env.local | Cloudflare env vars |
| URLs | http://localhost:3000 | https://your-domain.com |
| Logs | Console output | wrangler tail |

---

## Rollback

If a deployment has issues:

```bash
# View deployment history
wrangler deployments list

# Rollback to previous version
wrangler rollback
```

Or use **Cloudflare Pages** → **Deployments** → click previous commit → **Rollback**

---

## Next Steps

1. ✓ Push this repo to GitHub
2. ✓ Connect to Cloudflare Pages (Git integration)
3. ✓ Set environment variables in Cloudflare UI
4. ✓ Enable nodejs_compat flag
5. ✓ Monitor first deployment in wrangler tail
6. ✓ Test all features (auth, API, file uploads, etc.)

---

## References

- [OpenNext Cloudflare Docs](https://opennext.js.org/cloudflare/)
- [Cloudflare Workers Node.js Compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)
- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
