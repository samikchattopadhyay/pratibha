# REAL Environment Variables (Based on Actual Code Analysis)

After thoroughly analyzing the codebase, here's what's ACTUALLY required vs optional:

---

## 🔴 ABSOLUTELY REQUIRED (App Won't Start)

These will cause immediate failure with no fallback:

```
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
NEXTAUTH_SECRET=your-secret-key
```

**Why:**
- `DATABASE_URL` → Used directly in `src/lib/db.ts:6` without fallback. App needs DB connection to start.
- `NEXTAUTH_SECRET` → Used directly in `src/lib/auth.ts:117` for session signing. NextAuth won't work without it.

---

## 🟡 HIGHLY RECOMMENDED (Features Won't Work)

These are used but have fallbacks or error handling:

```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**Why:** 
- Email sending will fail silently and log errors (src/lib/notifications.ts:11, 129-139)
- All email features (registration, password reset, verification) won't work
- But app won't crash - notifications are caught with `.catch()`

---

## 🟢 OPTIONAL (Nice to Have)

These all have built-in fallbacks or defaults:

| Variable | Default/Fallback | What Happens if Missing |
|----------|-----------------|----------------------|
| `R2_ACCESS_KEY_ID` | None | Uses local `/uploads/` folder |
| `R2_SECRET_ACCESS_KEY` | None | Uses local `/uploads/` folder |
| `R2_ENDPOINT` | None | Uses local `/uploads/` folder |
| `R2_BUCKET_NAME` | `"certificates"` | Explicit default in code (line 26) |
| `R2_PUBLIC_URL` | `"https://pub-certificates.pratibhaparishad.org"` | Explicit default in code (line 47) |
| `RAZORPAY_KEY_ID` | None | Uses simulated order ID (line 75) |
| `RAZORPAY_KEY_SECRET` | None | Uses simulated order ID (line 75) |
| `CRON_SECRET` | None | Cron endpoints will fail auth, but app works |
| `FACEBOOK_APP_ID` | `""` | OAuth disabled (auth.ts:77) |
| `FACEBOOK_APP_SECRET` | `""` | OAuth disabled (auth.ts:78) |
| `TELEGRAM_BOT_TOKEN` | `undefined` | Telegram notifications disabled |
| `NEXT_PUBLIC_API_URL` | `"http://localhost:3000"` | Multiple files |
| `NEXT_PUBLIC_APP_URL` | `"https://pratibhaparishad.in"` | Multiple files |
| `NEXT_PUBLIC_SITE_URL` | `"https://pratibha.org"` | Page metadata |
| `RESEND_FROM_EMAIL` | `"noreply@pratibhaparishad.in"` | notifications.ts:16 |
| `OTP_CODE_LENGTH` | `6` | phone-verification.ts:1 |
| `OTP_TOKEN_EXPIRY` | `600` | auth/setup/verify-phone:16 |
| `SETUP_TOKEN_EXPIRY` | `3600` | profile-setup-token.ts:5 |
| `NODE_ENV` | `undefined` | Only affects logging (db.ts:19) |

---

## 📋 For Cloudflare Pages: Minimum Setup

**MUST ADD (2 variables):**
```
DATABASE_URL
NEXTAUTH_SECRET
```

**SHOULD ADD (1 variable):**
```
RESEND_API_KEY
```

**OPTIONAL (add if you need these features):**
```
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_ENDPOINT
CRON_SECRET
FACEBOOK_APP_ID
FACEBOOK_APP_SECRET
TELEGRAM_BOT_TOKEN
```

---

## How App Behaves with Missing Variables

| Variable | If Missing |
|----------|-----------|
| `DATABASE_URL` | ❌ App crashes on startup |
| `NEXTAUTH_SECRET` | ❌ App crashes on startup |
| `RESEND_API_KEY` | ⚠️ Email fails silently, logged to console |
| `R2_*` | ✅ Files saved to local `/uploads/` folder |
| `RAZORPAY_*` | ✅ Payment orders use simulated IDs |
| `CRON_SECRET` | ✅ Cron endpoints return 401, app works |
| `FACEBOOK_*` | ✅ Facebook OAuth disabled |
| `TELEGRAM_TOKEN` | ✅ Telegram notifications skip |
| `NEXT_PUBLIC_*` | ✅ Uses hardcoded fallbacks |

---

## Real World Example

You could deploy with just these 3 and everything works (except email):
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=abc123...
RESEND_API_KEY=re_...
```

All other features have graceful fallbacks.
