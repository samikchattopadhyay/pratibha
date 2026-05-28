# Email Verification: Current Implementation vs Industry Best Practices

**Analysis Date**: 2026-05-28  
**Status**: ⚠️ **Email verification after registration is NOT implemented**

---

## Executive Summary

Your current registration flow (`/api/auth/register`) **sends a welcome email but does NOT require email verification** before account activation. This is a critical security gap that needs to be addressed immediately.

### Current Flow
```
User Registration → Create User & Parent → Send Welcome Email → Account ACTIVE ✅
```

### Recommended Flow
```
User Registration → Create User & Parent (status: UNVERIFIED) → Send Verification Email → 
User Clicks Link → Verify Email → Account ACTIVE ✅
```

---

## Current Implementation Analysis

### ✅ What's Good
1. **Email Infrastructure**: You have Resend integrated for reliable email delivery
2. **Token Pattern Exists**: Your `PasswordResetToken` and `PasswordSetupToken` models show you understand secure token handling
3. **Async Email Sending**: Fire-and-forget notifications pattern prevents blocking user responses
4. **Email Templates**: Properly templated emails with branding

### ❌ What's Missing

#### 1. **No Email Verification Token Model**
Your `User` model lacks:
- `emailVerified: DateTime?` — tracks verification status and time
- `emailVerificationToken` relationship — one-to-many tokens per user

**Current User Model** (lines 183-197 in schema.prisma):
```prisma
model User {
  id                      String  @id @default(uuid())
  email                   String  @unique
  passwordHash            String
  role                    Role    @default(PARENT)
  // ... NO emailVerified or emailVerificationToken fields
}
```

#### 2. **No Verification Endpoint**
Missing `/api/auth/verify-email` route to:
- Accept verification token
- Validate token expiry
- Mark email as verified
- Prevent simultaneous multiple tokens

#### 3. **Account Activation Not Gated**
Users can log in immediately after registration without email verification:
```typescript
// auth.ts - authorize() callback (line 23-25)
const user = await prisma.user.findUnique({
  where: { email: credentials.email },
});
// No check for emailVerified status
```

#### 4. **No Resend Token Option**
Users who don't receive the verification email have no way to request a new token.

---

## Industry Best Practices Comparison

### 1. **Token Security & Expiry**

| Practice | Recommended | Your Implementation | Status |
|----------|-------------|-------------------|--------|
| **Token Format** | 128 char random string (64-128) | N/A | ❌ Missing |
| **Token Storage** | Hashed in database | N/A | ❌ Missing |
| **Expiry Time** | 24 hours (reasonable for email) | N/A | ❌ Missing |
| **Token Rotation** | Single-use, expires after verification | N/A | ❌ Missing |

**Sources**: [Email Verification Link Expiration Guide](https://emaillistvalidation.com/blog/email-verification-link-expiration-ensuring-security-and-user-experience-2/), [Token Expiry Best Practices](https://zuplo.com/blog/2025/03/01/token-expiry-best-practices)

### 2. **OWASP Security Requirements**

From [OWASP Email Validation and Verification Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Email_Validation_and_Verification_Cheat_Sheet.html):

| Requirement | Your Implementation | Status |
|-------------|-------------------|--------|
| **Email ownership verified before activation** | ❌ No verification step | ❌ CRITICAL ISSUE |
| **Time-limited tokens** | ❌ No tokens generated | ❌ Missing |
| **Prevent user enumeration** | ⚠️ Consistent error messages exist | ⚠️ Partial |
| **Log masking** | ⚠️ Unclear from code | ⚠️ Check logging |
| **Two-factor approach for email change** | ❌ Not applicable yet | ⚠️ Future consideration |

### 3. **Account Takeover Prevention**

| Risk | Your Gap | Impact |
|------|----------|--------|
| **Email Spoofing** | No verification that user owns email | Attacker can register with victim's email |
| **Typo Exploitation** | No validation that email is intentional | User registers typo, loses access to real email |
| **Temporary Email** | No temporary email detection | Accounts created with throwaway emails vanish |
| **Account Locking** | No rate limiting on verification attempts | Brute force verification tokens possible |

**Source**: [OWASP Account Takeover Prevention](https://www.praetorian.com/blog/account-takeover-via-broken-authentication-workflow-free-lifetime-streaming/)

---

## Data Model Changes Required

### 1. Add Email Verification Model

```prisma
model EmailVerificationToken {
  id        String    @id @default(uuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String    @unique
  expiresAt DateTime
  verifiedAt DateTime?
  createdAt DateTime  @default(now())

  @@index([token])
  @@index([userId])
  @@index([expiresAt])
}
```

### 2. Extend User Model

```prisma
model User {
  // ... existing fields
  emailVerified      DateTime?                 // NULL = not verified, DateTime = verified at this time
  emailVerificationTokens EmailVerificationToken[]
}
```

### 3. Create Migration

```bash
npx prisma migrate dev --name add_email_verification
```

---

## Implementation Roadmap

### Phase 1: Database & Token Generation (2-3 hours)

**Files to modify**:
- `prisma/schema.prisma` — Add `EmailVerificationToken` model and `emailVerified` field to `User`
- `src/lib/email-verification.ts` (NEW) — Token generation utilities
- `src/lib/notifications.ts` — Add `sendEmailVerification()` function

**Key Functions**:
```typescript
// src/lib/email-verification.ts
export async function generateVerificationToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      token: crypto.createHash('sha256').update(token).digest('hex'),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });
  
  return token; // Return unhashed for URL
}

export async function verifyEmailToken(token: string, userId: string): Promise<boolean> {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  const record = await prisma.emailVerificationToken.findFirst({
    where: {
      token: hashedToken,
      userId,
      expiresAt: { gt: new Date() },
      verifiedAt: null,
    },
  });
  
  if (!record) return false;
  
  // Mark as used and update user
  await prisma.$transaction(async (tx) => {
    await tx.emailVerificationToken.update({
      where: { id: record.id },
      data: { verifiedAt: new Date() },
    });
    
    await tx.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
    });
  });
  
  return true;
}
```

### Phase 2: Registration Flow Update (1-2 hours)

**Modify**: `src/app/api/auth/register/route.ts`

```typescript
// After creating user
const user = await tx.user.create({
  data: {
    email,
    passwordHash,
    role: "PARENT",
    emailVerified: null, // Not verified yet
  },
});

// Generate and send verification email
const verificationToken = await generateVerificationToken(user.id);
const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

await sendEmailVerificationLink(email, parentName, verificationUrl);
```

### Phase 3: Verification Endpoint (1 hour)

**Create**: `src/app/api/auth/verify-email/route.ts`

```typescript
export async function POST(req: Request) {
  const { token, email } = await req.json();
  
  // 1. Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }
  
  // 2. Verify token
  const isValid = await verifyEmailToken(token, user.id);
  
  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }
  
  // 3. Send confirmation email
  await sendEmailVerificationSuccessful(email);
  
  return NextResponse.json({ message: "Email verified successfully" });
}
```

### Phase 4: UI/UX Updates (2-3 hours)

**Files to create**:
- `src/app/auth/verify-email/page.tsx` — Verification confirmation page
- `src/components/EmailVerificationPending.tsx` — Post-registration message

**Key Features**:
- Show verification status after registration
- "Resend verification email" button (rate-limited to 3/hour)
- Success page with redirect to login
- Expired token handling with resend option

### Phase 5: Authentication Guard (1 hour)

**Modify**: `src/lib/auth.ts` (credentials provider)

```typescript
async authorize(credentials) {
  // ... existing validation
  
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });
  
  // CRITICAL: Check if email is verified
  if (!user.emailVerified) {
    console.warn(`Login attempt with unverified email: ${credentials.email}`);
    return null; // Deny login
  }
  
  // ... continue with password check
}
```

---

## Resend Verification Email Endpoint

**Create**: `src/app/api/auth/resend-verification/route.ts`

```typescript
export async function POST(req: Request) {
  const { email } = await req.json();
  
  // 1. Rate limiting (3 requests per hour per email)
  const recentTokens = await prisma.emailVerificationToken.count({
    where: {
      user: { email },
      createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  
  if (recentTokens >= 3) {
    return NextResponse.json(
      { error: "Too many verification requests. Try again in 1 hour." },
      { status: 429 }
    );
  }
  
  // 2. Find user and check if already verified
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }
  
  if (user.emailVerified) {
    return NextResponse.json(
      { message: "Email already verified" },
      { status: 200 }
    );
  }
  
  // 3. Generate new token and send email
  const token = await generateVerificationToken(user.id);
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  
  await sendEmailVerificationLink(email, user.name, verificationUrl);
  
  return NextResponse.json({
    message: "Verification email sent",
  });
}
```

---

## Email Template

**Create**: `src/lib/email/templates/emailVerificationTemplate.ts`

```typescript
export function buildEmailVerificationTemplate(
  name: string,
  verificationUrl: string,
  appUrl: string
) {
  return {
    subject: "Verify Your Email Address - Pratibha Parishad",
    body: `
      <h2>Welcome, ${name}!</h2>
      <p>Thank you for registering. Please verify your email address to activate your account.</p>
      <p>
        <a href="${verificationUrl}" style="...">
          Verify Email Address
        </a>
      </p>
      <p>This link expires in <strong>24 hours</strong>.</p>
      <p>Didn't receive this email? <a href="${appUrl}/auth/resend-verification">Request another</a></p>
    `,
  };
}
```

---

## Security Checklist

Before deploying, verify:

- [ ] Token is cryptographically random (32+ bytes)
- [ ] Token is hashed before storage in database
- [ ] Token has 24-hour expiry
- [ ] Expired tokens are cleaned up (optional cron job)
- [ ] Rate limiting on resend (3/hour per email)
- [ ] Rate limiting on verification attempts (10/hour per token)
- [ ] Login blocked for unverified emails
- [ ] No email leakage in error messages (consistent responses)
- [ ] Verification URL includes token + email for context
- [ ] One-time token use (mark `verifiedAt` after use)
- [ ] TypeScript compilation succeeds (`npx tsc --noEmit`)
- [ ] ESLint passes (`npm run lint`)

---

## Risks of NOT Implementing

1. **Spam Account Creation** — Automated systems can register with fake emails
2. **Account Takeover** — Attacker registers with victim's email, victim can't recover
3. **Bouncing Emails** — Invalid emails never discovered, notifications fail silently
4. **User Enumeration** — Attackers discover registered emails via signup
5. **Compliance** — CAN-SPAM & GDPR expect verified email ownership before marketing

---

## Timeline Estimate

| Phase | Duration | Priority |
|-------|----------|----------|
| Database setup | 30 min | 🔴 CRITICAL |
| Registration flow update | 60 min | 🔴 CRITICAL |
| Verification endpoint | 60 min | 🔴 CRITICAL |
| UI/UX (verification page) | 90 min | 🟡 HIGH |
| Resend functionality | 45 min | 🟡 HIGH |
| Testing & security review | 120 min | 🔴 CRITICAL |
| **Total** | **~6 hours** | |

---

## References

- [OWASP Email Validation & Verification Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Email_Validation_and_Verification_Cheat_Sheet.html)
- [Email Verification Link Expiration Best Practices](https://emaillistvalidation.com/blog/email-verification-link-expiration-ensuring-security-and-user-experience-2/)
- [Token Expiry Best Practices - Zuplo](https://zuplo.com/blog/2025/03/01/token-expiry-best-practices)
- [Implementing Email Verification Flow - SuperTokens](https://supertokens.medium.com/implementing-the-right-email-verification-flow-bba9283e1d63)
- [Account Takeover via Broken Authentication - Praetorian](https://www.praetorian.com/blog/account-takeover-via-broken-authentication-workflow-free-lifetime-streaming/)

---

---

# Step-by-Step Implementation Plan

## Step 1: Update Database Schema (30 minutes)

### 1.1 Modify `prisma/schema.prisma`

Add the new `EmailVerificationToken` model after the existing token models (around line 196):

```prisma
model EmailVerificationToken {
  id        String    @id @default(uuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String    @unique
  expiresAt DateTime
  verifiedAt DateTime?
  createdAt DateTime  @default(now())

  @@index([token])
  @@index([userId])
  @@index([expiresAt])
}
```

### 1.2 Extend User Model

Find the `model User` (line 183) and add these fields:

```prisma
model User {
  id                      String                    @id @default(uuid())
  email                   String                    @unique
  passwordHash            String
  role                    Role                      @default(PARENT)
  profileImageUrl         String?
  emailVerified           DateTime?                 // NEW: NULL = unverified
  createdAt               DateTime                  @default(now())
  updatedAt               DateTime                  @updatedAt
  parentProfile           Parent?
  judgeProfile            Judge?
  notifications           Notification[]
  notificationPreferences NotificationPreference[]
  passwordSetupTokens     PasswordSetupToken[]
  passwordResetTokens     PasswordResetToken[]
  emailVerificationTokens EmailVerificationToken[]  // NEW: relationship
}
```

### 1.3 Run Migration

```bash
cd c:\Development\pratibha
npx prisma migrate dev --name add_email_verification
```

**Expected output:**
```
✔ Your database has been successfully migrated to `20260528XXXXXX_add_email_verification`
```

---

## Step 2: Create Email Verification Utilities (45 minutes)

### 2.1 Create `src/lib/email-verification.ts`

```typescript
import crypto from "crypto";
import prisma from "@/lib/db";

const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a verification token for a user.
 * Token is cryptographically random, hashed in DB for security.
 * Returns unhashed token for inclusion in verification URL.
 */
export async function generateVerificationToken(userId: string): Promise<string> {
  // 1. Generate random token (64 hex = 32 bytes)
  const randomToken = crypto.randomBytes(32).toString("hex");

  // 2. Hash token for secure storage
  const hashedToken = crypto
    .createHash("sha256")
    .update(randomToken)
    .digest("hex");

  // 3. Store in database
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      token: hashedToken,
      expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS),
    },
  });

  // 4. Return unhashed token for URL
  return randomToken;
}

/**
 * Verify an email token and mark user as verified.
 * Returns true if verification successful, false otherwise.
 */
export async function verifyEmailToken(
  token: string,
  userId: string
): Promise<boolean> {
  // 1. Hash the provided token for comparison
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // 2. Find the token record
  const record = await prisma.emailVerificationToken.findFirst({
    where: {
      token: hashedToken,
      userId,
      expiresAt: { gt: new Date() }, // Not expired
      verifiedAt: null, // Not already used
    },
  });

  if (!record) {
    return false;
  }

  // 3. Mark token as used and user as verified in transaction
  try {
    await prisma.$transaction(async (tx) => {
      // Mark token as verified
      await tx.emailVerificationToken.update({
        where: { id: record.id },
        data: { verifiedAt: new Date() },
      });

      // Mark user email as verified
      await tx.user.update({
        where: { id: userId },
        data: { emailVerified: new Date() },
      });
    });

    return true;
  } catch (error) {
    console.error("Error verifying email token:", error);
    return false;
  }
}

/**
 * Check if a token has expired
 */
export async function isTokenExpired(token: string): Promise<boolean> {
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const record = await prisma.emailVerificationToken.findUnique({
    where: { token: hashedToken },
  });

  if (!record) return true;

  return record.expiresAt < new Date();
}

/**
 * Count recent verification requests to implement rate limiting
 */
export async function countRecentVerificationRequests(
  email: string,
  windowMs: number = 60 * 60 * 1000 // 1 hour default
): Promise<number> {
  return prisma.emailVerificationToken.count({
    where: {
      user: { email },
      createdAt: { gt: new Date(Date.now() - windowMs) },
    },
  });
}

/**
 * Clean up expired tokens (optional - run via cron job)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.emailVerificationToken.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
      verifiedAt: null, // Only delete unverified tokens
    },
  });

  return result.count;
}
```

### 2.2 Add Email Template

Create `src/lib/email/templates/emailVerificationTemplate.ts`:

```typescript
import type { EmailTemplate } from "@/lib/email/emailTemplateEngine";

export function buildEmailVerificationTemplate(
  name: string,
  verificationUrl: string,
  appUrl: string
): EmailTemplate {
  return {
    subject: "Verify Your Email Address - Pratibha Parishad",
    headerTitle: "Email Verification Required",
    body: `
      <p>Hi ${escapeHtml(name)},</p>
      <p>Thank you for registering with Pratibha Parishad! To complete your registration and access your account, please verify your email address.</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${verificationUrl}" style="background-color: #d97706; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">This verification link expires in <strong>24 hours</strong>.</p>
      <p style="color: #666; font-size: 14px;">Didn't receive this email or the link expired? <a href="${appUrl}/auth/resend-verification">Request a new verification link</a>.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
      <p style="color: #999; font-size: 12px;">If you didn't create this account, please ignore this email or <a href="${appUrl}/contact">contact us</a>.</p>
    `,
  };
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
```

### 2.3 Add to Email Notifications

Append to `src/lib/notifications.ts` (after the existing email functions):

```typescript
/**
 * Email for email verification after registration.
 */
export async function sendEmailVerificationLink(
  to: string,
  parentName: string,
  verificationUrl: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
  const template = emailTemplates.buildEmailVerificationTemplate(
    parentName,
    verificationUrl,
    appUrl
  );
  const html = renderEmailTemplate(template);
  await sendEmailViaResend(to, template.subject, html);
}

/**
 * Confirmation email after successful verification.
 */
export async function sendEmailVerificationSuccess(
  to: string,
  parentName: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
  const template = {
    subject: "Email Verified - Welcome to Pratibha Parishad",
    body: `
      <p>Hi ${parentName},</p>
      <p>Great news! Your email address has been verified successfully.</p>
      <p>You can now log in to your account and start registering your students for competitions.</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${appUrl}/login" style="background-color: #059669; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Go to Login
        </a>
      </div>
      <p>Welcome to Pratibha Parishad!</p>
    `,
  };
  const html = renderEmailTemplate(template);
  await sendEmailViaResend(to, template.subject, html);
}
```

---

## Step 3: Update Registration Endpoint (30 minutes)

### 3.1 Modify `src/app/api/auth/register/route.ts`

Replace the entire file with:

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "@/lib/email-verification";
import { sendEmailVerificationLink } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, phone } = body;

    // Validate fields
    if (!email || !password || !name || !phone) {
      return NextResponse.json(
        { error: "Please fill in all required registration fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Account already exists with this email address" },
        { status: 400 }
      );
    }

    // Check if phone number already registered
    const existingParent = await prisma.parent.findUnique({
      where: { phone },
    });

    if (existingParent) {
      return NextResponse.json(
        { error: "Account already exists with this phone number" },
        { status: 400 }
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create User & Parent in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: "PARENT",
          emailVerified: null, // Not verified yet
        },
      });

      const parent = await tx.parent.create({
        data: {
          userId: user.id,
          name,
          phone,
        },
      });

      return { user, parent };
    });

    // Generate verification token
    let verificationUrl = "";
    try {
      const verificationToken = await generateVerificationToken(result.user.id);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
      verificationUrl = `${appUrl}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

      // Send verification email
      await sendEmailVerificationLink(email, name, verificationUrl);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email fails, but log it
    }

    return NextResponse.json(
      {
        message: "Registration successful. Please check your email to verify your account.",
        userId: result.user.id,
        email: result.user.email,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred during registration" },
      { status: 500 }
    );
  }
}
```

---

## Step 4: Create Verification Endpoint (45 minutes)

### 4.1 Create `src/app/api/auth/verify-email/route.ts`

```typescript
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  verifyEmailToken,
  isTokenExpired,
} from "@/lib/email-verification";
import { sendEmailVerificationSuccess } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, email } = body;

    if (!token || !email) {
      return NextResponse.json(
        { error: "Missing token or email" },
        { status: 400 }
      );
    }

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 2. Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email already verified. You can now log in." },
        { status: 200 }
      );
    }

    // 3. Check if token is expired
    const expired = await isTokenExpired(token);
    if (expired) {
      return NextResponse.json(
        {
          error: "Verification link has expired",
          code: "TOKEN_EXPIRED",
        },
        { status: 400 }
      );
    }

    // 4. Verify the token
    const isValid = await verifyEmailToken(token, user.id);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }

    // 5. Send confirmation email
    try {
      const parent = await prisma.parent.findUnique({
        where: { userId: user.id },
      });
      await sendEmailVerificationSuccess(
        email,
        parent?.name || "User"
      );
    } catch (emailError) {
      console.error("Failed to send verification confirmation email:", emailError);
      // Don't fail the verification if confirmation email fails
    }

    return NextResponse.json(
      {
        message: "Email verified successfully. You can now log in.",
        email: user.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for email verification via link click
 * Redirects to verify-email page with token and email
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.json(
      { error: "Missing token or email" },
      { status: 400 }
    );
  }

  // Verify the token
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/verification-success?already=true`
      );
    }

    // Verify token
    const isValid = await verifyEmailToken(token, user.id);

    if (!isValid) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/verification-failed`
      );
    }

    // Send confirmation email
    try {
      const parent = await prisma.parent.findUnique({
        where: { userId: user.id },
      });
      await sendEmailVerificationSuccess(
        email,
        parent?.name || "User"
      );
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/verification-success`
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/verification-failed`
    );
  }
}
```

### 4.2 Create Resend Endpoint

Create `src/app/api/auth/resend-verification/route.ts`:

```typescript
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  generateVerificationToken,
  countRecentVerificationRequests,
} from "@/lib/email-verification";
import { sendEmailVerificationLink } from "@/lib/notifications";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_HOUR = 3;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 2. Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email already verified. You can now log in." },
        { status: 200 }
      );
    }

    // 3. Check rate limiting
    const recentRequests = await countRecentVerificationRequests(
      email,
      RATE_LIMIT_WINDOW_MS
    );

    if (recentRequests >= MAX_REQUESTS_PER_HOUR) {
      return NextResponse.json(
        {
          error: `Too many verification requests. Please try again after ${Math.ceil((RATE_LIMIT_WINDOW_MS - 60000) / 60000)} minutes.`,
          code: "RATE_LIMITED",
          retryAfterMinutes: Math.ceil(
            (RATE_LIMIT_WINDOW_MS - 60000) / 60000
          ),
        },
        { status: 429 }
      );
    }

    // 4. Generate new token and send email
    const verificationToken = await generateVerificationToken(user.id);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pratibhaparishad.in";
    const verificationUrl = `${appUrl}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    // Get parent name for email
    const parent = await prisma.parent.findUnique({
      where: { userId: user.id },
    });

    await sendEmailVerificationLink(
      email,
      parent?.name || "User",
      verificationUrl
    );

    return NextResponse.json(
      {
        message: "Verification email sent. Please check your inbox.",
        email: email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend verification email error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}
```

---

## Step 5: Update Authentication Guard (15 minutes)

### 5.1 Modify `src/lib/auth.ts`

Replace the authorize function in the CredentialsProvider:

```typescript
async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user) {
      return null;
    }

    // CRITICAL: Check if email is verified
    if (!user.emailVerified) {
      console.warn(
        `Login attempt with unverified email: ${credentials.email}`
      );
      throw new Error("UNVERIFIED_EMAIL");
    }

    const isValid = await bcrypt.compare(
      credentials.password,
      user.passwordHash
    );

    if (!isValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.email.split("@")[0],
      role: user.role,
    };
  } catch (error: any) {
    if (error.message === "UNVERIFIED_EMAIL") {
      // Re-throw to handle in login page
      throw error;
    }
    console.error("Auth error:", error);
    return null;
  }
}
```

---

## Step 6: Create Verification UI Pages (90 minutes)

### 6.1 Create `src/app/auth/verify-email/page.tsx`

```typescript
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Loading } from "@/components/Loading";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<
    "verifying" | "success" | "expired" | "error"
  >("verifying");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setError("Invalid verification link");
      return;
    }

    verifyEmail();
  }, [token, email]);

  const verifyEmail = async () => {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "TOKEN_EXPIRED") {
          setStatus("expired");
        } else {
          setError(data.error || "Verification failed");
          setStatus("error");
        }
        return;
      }

      setStatus("success");
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError("An unexpected error occurred");
      setStatus("error");
    }
  };

  const handleResend = async () => {
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setError("Verification email sent! Check your inbox.");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to resend email");
      }
    } catch (err) {
      setError("An error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-charcoal dark:bg-charcoal-light flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30 rounded-lg p-8">
        {status === "verifying" && (
          <div className="text-center">
            <Loading variant="overlay" text="Verifying email..." />
          </div>
        )}

        {status === "success" && (
          <div className="text-center space-y-4">
            <div className="text-5xl">✅</div>
            <h2 className="text-2xl font-bold text-charcoal dark:text-white">
              Email Verified!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your email has been verified successfully.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting to login...
            </p>
          </div>
        )}

        {status === "expired" && (
          <div className="text-center space-y-4">
            <div className="text-5xl">⏰</div>
            <h2 className="text-2xl font-bold text-charcoal dark:text-white">
              Link Expired
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your verification link has expired. Please request a new one.
            </p>
            <button
              onClick={handleResend}
              className="w-full bg-terracotta text-white py-2 px-4 rounded-lg font-semibold hover:bg-terracotta/90 transition"
            >
              Resend Verification Email
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="text-center space-y-4">
            <div className="text-5xl">❌</div>
            <h2 className="text-2xl font-bold text-charcoal dark:text-white">
              Verification Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-300">{error}</p>
            <div className="space-y-2">
              <button
                onClick={handleResend}
                className="w-full bg-terracotta text-white py-2 px-4 rounded-lg font-semibold hover:bg-terracotta/90 transition"
              >
                Resend Verification Email
              </button>
              <Link
                href="/login"
                className="block w-full border border-terracotta text-terracotta py-2 px-4 rounded-lg font-semibold hover:bg-terracotta/5 transition text-center"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 6.2 Create Success Page `src/app/auth/verification-success/page.tsx`

```typescript
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function VerificationSuccessPage() {
  const searchParams = useSearchParams();
  const alreadyVerified = searchParams.get("already") === "true";

  return (
    <div className="min-h-screen bg-charcoal dark:bg-charcoal-light flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30 rounded-lg p-8 text-center space-y-4">
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-bold text-charcoal dark:text-white">
          {alreadyVerified ? "Already Verified" : "Email Verified!"}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {alreadyVerified
            ? "Your email was already verified. You can now log in."
            : "Your email has been verified successfully. You can now log in to your account."}
        </p>
        <Link
          href="/login"
          className="block w-full bg-gold text-charcoal py-3 px-4 rounded-lg font-semibold hover:bg-gold/90 transition"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
```

### 6.3 Create Error Page `src/app/auth/verification-failed/page.tsx`

```typescript
"use client";

import Link from "next/link";
import { useState } from "react";

export default function VerificationFailedPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleResend = async () => {
    if (!email) {
      setMessage("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setMessage(
        response.ok
          ? "Verification email sent! Check your inbox."
          : data.error || "Failed to resend email"
      );
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal dark:bg-charcoal-light flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30 rounded-lg p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="text-5xl">❌</div>
          <h2 className="text-2xl font-bold text-charcoal dark:text-white">
            Verification Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            The verification link is invalid or has expired.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-charcoal dark:text-white mb-2">
              Enter your email to get a new link:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-charcoal-light text-charcoal dark:text-white"
            />
          </div>

          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full bg-terracotta text-white py-2 px-4 rounded-lg font-semibold hover:bg-terracotta/90 transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Resend Verification Email"}
          </button>

          {message && (
            <p
              className={`text-sm text-center ${
                message.includes("sent")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>

        <Link
          href="/login"
          className="block w-full border border-terracotta text-terracotta py-2 px-4 rounded-lg font-semibold hover:bg-terracotta/5 transition text-center"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
```

---

## Step 7: Update Login Page (Optional but Recommended - 15 minutes)

### 7.1 Improve Login Error Handling

If you have a login page, handle the `UNVERIFIED_EMAIL` error:

```typescript
try {
  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  if (!result?.ok) {
    if (result?.error === "UNVERIFIED_EMAIL") {
      setError(
        "Please verify your email address before logging in. Check your inbox for the verification link."
      );
      setShowResendOption(true);
    } else {
      setError("Invalid email or password");
    }
    return;
  }

  router.push("/parent/dashboard");
} catch (error: any) {
  if (error.message === "UNVERIFIED_EMAIL") {
    setError(
      "Please verify your email address before logging in."
    );
    setShowResendOption(true);
  }
}
```

---

## Step 8: Testing Checklist (120 minutes)

### 8.1 Database Testing

```bash
# Run migrations
npx prisma migrate dev

# Check schema
npx prisma db execute --stdin < test-email-verification.sql

# Inspect database
npx prisma studio
```

### 8.2 Unit Testing

Create `src/__tests__/email-verification.test.ts`:

```typescript
import { generateVerificationToken, verifyEmailToken, isTokenExpired } from "@/lib/email-verification";
import prisma from "@/lib/db";

describe("Email Verification", () => {
  it("should generate a valid token", async () => {
    const userId = "test-user-id";
    const token = await generateVerificationToken(userId);
    
    expect(token).toBeDefined();
    expect(token.length).toBeGreaterThan(50);
  });

  it("should verify a valid token", async () => {
    const userId = "test-user-id-2";
    const token = await generateVerificationToken(userId);
    
    const result = await verifyEmailToken(token, userId);
    
    expect(result).toBe(true);
  });

  it("should reject an invalid token", async () => {
    const userId = "test-user-id-3";
    const result = await verifyEmailToken("invalid-token", userId);
    
    expect(result).toBe(false);
  });

  it("should detect expired tokens", async () => {
    // Implementation depends on your test setup
  });
});
```

### 8.3 Manual Integration Testing

**Test Case 1: Registration with Email Verification**
1. Navigate to `/register`
2. Fill form with valid data
3. Submit registration
4. Verify success message appears
5. Check email inbox for verification link
6. Click verification link
7. Verify success page displays
8. Try to login - should succeed

**Test Case 2: Expired Token**
1. Register new account
2. Wait 24+ hours (or manipulate database to expire token)
3. Click verification link
4. Should show "Link Expired" message
5. Request new verification email
6. Verify new email arrives

**Test Case 3: Rate Limiting**
1. Register account
2. Request resend 3+ times within 1 hour
3. Should receive "Too many requests" error on 4th attempt
4. Wait 1 hour
5. Should be able to resend again

**Test Case 4: Already Verified Email**
1. Verify an email successfully
2. Try to click the same link again
3. Should show "Already verified" message

**Test Case 5: Unverified Email Login**
1. Register account
2. Try to login without verifying email
3. Should receive "Please verify email" error

### 8.4 Type Safety

```bash
npx tsc --noEmit
```

Expected output: `0 errors`

### 8.5 Linting

```bash
npm run lint
```

---

## Step 9: Deployment Checklist

Before deploying to production:

- [ ] Database migration ran successfully on staging
- [ ] All API endpoints tested with valid/invalid inputs
- [ ] Email delivery tested (check Resend logs)
- [ ] Verification links work end-to-end
- [ ] Rate limiting working as expected
- [ ] TypeScript compilation: `npx tsc --noEmit` passes
- [ ] ESLint: `npm run lint` passes
- [ ] All pages load without errors
- [ ] Mobile responsive (verify on phone)
- [ ] Error messages are user-friendly
- [ ] Security checklist items verified (see below)

### Security Verification

- [ ] Tokens are 64+ hex characters (32 bytes)
- [ ] Tokens hashed before DB storage
- [ ] Token expiry is 24 hours
- [ ] One-time token use enforced
- [ ] Rate limiting: 3 resends/hour
- [ ] No unverified email logins possible
- [ ] Error messages don't leak user information
- [ ] HTTPS enforced in verification URLs
- [ ] No secrets in verification URLs

---

## Step 10: Post-Deployment Monitoring

### Monitor Email Delivery

```typescript
// Add to your monitoring dashboard
async function getEmailVerificationMetrics() {
  const totalTokens = await prisma.emailVerificationToken.count();
  const verifiedTokens = await prisma.emailVerificationToken.count({
    where: { verifiedAt: { not: null } },
  });
  const expiredTokens = await prisma.emailVerificationToken.count({
    where: { expiresAt: { lt: new Date() }, verifiedAt: null },
  });

  return {
    total: totalTokens,
    verified: verifiedTokens,
    expired: expiredTokens,
    verificationRate: `${((verifiedTokens / totalTokens) * 100).toFixed(2)}%`,
  };
}
```

### Key Metrics to Track

- Email delivery rate (% of verification emails delivered)
- Verification completion rate (% of emails that lead to verification)
- Time to verification (average hours between registration and verification)
- Failed verification attempts (rate-limited, expired, invalid)
- Support tickets related to email verification

---

## File Summary

### Files to Create
- `src/lib/email-verification.ts` — Token utilities
- `src/lib/email/templates/emailVerificationTemplate.ts` — Email template
- `src/app/api/auth/verify-email/route.ts` — Verification endpoint
- `src/app/api/auth/resend-verification/route.ts` — Resend endpoint
- `src/app/auth/verify-email/page.tsx` — Verification form page
- `src/app/auth/verification-success/page.tsx` — Success page
- `src/app/auth/verification-failed/page.tsx` — Error page

### Files to Modify
- `prisma/schema.prisma` — Add EmailVerificationToken & emailVerified field
- `src/app/api/auth/register/route.ts` — Update to send verification email
- `src/lib/notifications.ts` — Add email verification functions
- `src/lib/auth.ts` — Block login for unverified emails

### Total Implementation Time: 6-8 hours

---

## Next Steps

1. **Start with Step 1** (database schema changes)
2. **Test migrations** locally
3. **Implement Step 2-4** (backend logic)
4. **Test API endpoints** with Postman or Thunder Client
5. **Build UI in Step 6**
6. **Manual testing in Step 8**
7. **Deploy to staging** and verify end-to-end
8. **Deploy to production** with monitoring enabled

