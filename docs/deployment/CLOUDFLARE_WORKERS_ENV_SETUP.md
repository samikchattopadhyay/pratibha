# Cloudflare Workers - Environment Variables Setup

Since you're deploying to **Cloudflare Workers** (not Pages), here's the **CORRECT** way to set environment variables:

---

## Method 1: Via CLI (Recommended for Secrets)

Use `wrangler secret put` for **sensitive values** (DATABASE_URL, API keys, secrets):

```bash
# Login to Cloudflare
wrangler login

# Add secrets (these are NOT visible in code)
wrangler secret put DATABASE_URL
# Paste: postgresql://user:password@host.neon.tech/dbname?sslmode=require

wrangler secret put NEXTAUTH_SECRET
# Paste: (output from: openssl rand -hex 32)

wrangler secret put RESEND_API_KEY
# Paste: re_xxxxxxxxxxxxx

wrangler secret put RAZORPAY_KEY_ID
# Paste: rzp_live_xxxxx

wrangler secret put RAZORPAY_KEY_SECRET
# Paste: your-secret

wrangler secret put R2_ACCESS_KEY_ID
# Paste: your-r2-key

wrangler secret put R2_SECRET_ACCESS_KEY
# Paste: your-r2-secret

wrangler secret put CRON_SECRET
# Paste: your-random-secret

wrangler secret put FACEBOOK_APP_ID
# Paste: your-facebook-id (or leave empty)

wrangler secret put FACEBOOK_APP_SECRET
# Paste: your-facebook-secret (or leave empty)

wrangler secret put TELEGRAM_BOT_TOKEN
# Paste: your-telegram-token (or leave empty)
```

---

## Method 2: Via Cloudflare Dashboard

1. Go to **Workers & Pages** → **Your Worker: pratibha-parishad**
2. Click **Settings** → **Secrets**
3. Click **Add secret** for each variable above
4. Paste the value
5. Deploy

---

## Method 3: Environment-Specific Secrets

For **production** vs **preview** environments:

```bash
# Production secrets
wrangler secret put DATABASE_URL --env production
wrangler secret put NEXTAUTH_SECRET --env production

# Preview/staging secrets (different database if needed)
wrangler secret put DATABASE_URL --env preview
wrangler secret put NEXTAUTH_SECRET --env preview
```

---

## ✅ What to Set

### **MUST SET (2 secrets):**
```
DATABASE_URL
NEXTAUTH_SECRET
```

### **SHOULD SET (1 secret):**
```
RESEND_API_KEY
```

### **OPTIONAL (only if using these features):**
```
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
FACEBOOK_APP_ID
FACEBOOK_APP_SECRET
TELEGRAM_BOT_TOKEN
CRON_SECRET
```

---

## Verify Secrets Were Added

```bash
# List all secrets (shows names only, not values)
wrangler secret list
```

Expected output:
```
name: DATABASE_URL
name: NEXTAUTH_SECRET
name: RESEND_API_KEY
...
```

---

## Access in Code

The app uses `process.env.VARIABLE_NAME` which works with `nodejs_compat` flag:

```typescript
// This works because of nodejs_compat in wrangler.toml
const dbUrl = process.env.DATABASE_URL;
const secret = process.env.NEXTAUTH_SECRET;
```

---

## Deploy After Setting Secrets

```bash
npm run deploy:workers
```

The Worker will now have access to all secrets you added.

---

## Troubleshooting

**"Error: Unauthorized"** when running `wrangler secret put`
- Run `wrangler logout` then `wrangler login` again

**Secrets not available at runtime**
- Ensure `nodejs_compat` flag is in wrangler.toml (it is)
- Ensure you deployed AFTER adding secrets: `npm run deploy:workers`

**Database connection fails**
- Verify DATABASE_URL is correct format for Neon
- Test connection locally: `npx prisma db push`

---

## Next Steps

1. ✅ Set **DATABASE_URL** first (required)
2. ✅ Set **NEXTAUTH_SECRET** (required)
3. ✅ Set **RESEND_API_KEY** (recommended)
4. Run: `npm run deploy:workers`
5. Monitor: `wrangler tail --service pratibha-parishad`
