# Accurate Environment Variables for Pratibha Parishad

Based on actual codebase analysis (not guessed).

---

## ✅ REQUIRED Variables (Will Break if Missing)

These MUST be set for the app to function:

```
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
NEXTAUTH_SECRET=your-secret-key-from-openssl-rand-hex-32
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
RESEND_API_KEY=re_xxxxxxxxxxxxxx
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
CRON_SECRET=your-secret-for-cron-endpoint-auth
```

**Why Required:**
- `DATABASE_URL` — Prisma connects directly, no fallback (src/lib/db.ts:6)
- `NEXTAUTH_SECRET` — NextAuth uses directly, no fallback (src/lib/auth.ts)
- `R2_*` — R2 client initialization checks these without fallback (src/lib/r2.ts)
- `RESEND_API_KEY` — Resend client uses directly (src/lib/notifications.ts:11)
- `RAZORPAY_*` — Razorpay initialization requires these (src/app/api/registrations/create/route.ts)
- `CRON_SECRET` — Bearer token validation in cron endpoints (src/app/api/cron/*/route.ts)

---

## 🔧 OPTIONAL Variables (Have Defaults)

These can be left empty or use defaults:

```
# NextAuth
NEXTAUTH_URL=https://your-actual-domain.com
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# R2 Configuration (Has Defaults)
R2_BUCKET_NAME=certificates
R2_PUBLIC_URL=https://pub-certificates.pratibhaparishad.org

# Email Configuration (Has Defaults)
RESEND_FROM_EMAIL=noreply@pratibhaparishad.in

# Notifications (Optional)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Front-end URLs (Has Defaults)
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=https://pratibha.org

# Token Configuration (Has Defaults)
OTP_CODE_LENGTH=6
SETUP_TOKEN_EXPIRY=3600
```

**Where Defaults are Set:**
- `R2_BUCKET_NAME` → Defaults to "certificates" (src/lib/r2.ts:26)
- `R2_PUBLIC_URL` → Defaults to "https://pub-certificates.pratibhaparishad.org" (src/lib/r2.ts:47)
- `RESEND_FROM_EMAIL` → Defaults to "noreply@pratibhaparishad.in" (src/lib/notifications.ts:16)
- `FACEBOOK_APP_*` → Defaults to "" (src/lib/auth.ts:77-78)
- `NEXT_PUBLIC_API_URL` → Defaults to "http://localhost:3000" (src/components/.../*)
- `NEXT_PUBLIC_SITE_URL` → Defaults to "https://pratibha.org" (src/app/profile/[id]/page.tsx)
- `OTP_CODE_LENGTH` → Defaults to 6 (src/lib/phone-verification.ts)
- `SETUP_TOKEN_EXPIRY` → Defaults to 3600 (src/lib/profile-setup-token.ts)

---

## 🚀 For Cloudflare Pages Deployment

Add **9 REQUIRED variables** only:

1. `DATABASE_URL`
2. `NEXTAUTH_SECRET`
3. `R2_ACCESS_KEY_ID`
4. `R2_SECRET_ACCESS_KEY`
5. `R2_ENDPOINT`
6. `RESEND_API_KEY`
7. `RAZORPAY_KEY_ID`
8. `RAZORPAY_KEY_SECRET`
9. `CRON_SECRET`

Optional ones can be added later if needed.

---

## Notes

- No `AWS_*` variables needed (app uses `aws4fetch` with `R2_*` variables instead)
- No `@aws-sdk/client-s3` dependency (already removed from package.json)
- Facebook OAuth is optional (has empty string defaults)
- Telegram notifications are optional (only used if token is set)
