# Facebook OAuth Registration Implementation Plan

**Date**: 2026-05-28  
**Status**: Draft  
**Priority**: High  
**Complexity**: Medium-High

---

## 1. Executive Summary

Implement parallel **Facebook OAuth registration workflow** alongside existing email/password registration. Users can sign up with Facebook, then complete a progressive profiling flow to set password and phone number (required for Parent profile).

**Key Challenge**: Facebook doesn't provide phone numbers via Graph API. Phone must be collected, verified with OTP, and is mandatory for the Parent profile.

**Key Benefit**: Reduce registration friction while maintaining data completeness and account security.

---

## 2. Architecture Overview

### 2.1 Current State
- **Auth System**: NextAuth.js with CredentialsProvider (email/password only)
- **User Identity**: Dual - Email (User) + Phone (Parent)
- **Both fields are MANDATORY** for registration

### 2.2 Proposed Changes

#### Authentication Flow (NextAuth.js)
```
┌─────────────────────────────────────────────────────┐
│  NextAuth.js Providers                              │
├─────────────────────────────────────────────────────┤
│  1. CredentialsProvider  (Email/Password)           │
│  2. FacebookProvider     (NEW - OAuth)               │
└─────────────────────────────────────────────────────┘
```

#### User Account Creation Flow
```
Facebook OAuth Path:
User → Facebook Login → Extract (name, email?) → 
Check/Create User → Send to "Complete Profile" → 
Set Password → Collect Phone → Verify Phone → 
Verify Email → Account Ready

Email/Password Path (Existing):
User → Email/Password Form → Create User+Parent → 
Send Email Verification → Verify Email → Account Ready
```

### 2.3 Data Model Changes

#### User Model (Schema Update)
```prisma
model User {
  id                  String    @id @default(uuid())
  email               String    @unique
  passwordHash        String?                    // NEW: Make nullable for OAuth users
  facebookId          String?   @unique          // NEW: Facebook user ID
  role                Role      @default(PARENT)
  emailVerified       DateTime?
  profileImageUrl     String?
  // ... rest of fields
}
```

#### New Token Model
```prisma
model ProfileSetupToken {
  id        String    @id @default(uuid())
  userId    String    @unique
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String    @unique
  expiresAt DateTime
  stage     String    // "password" | "phone" | "email_verify"
  data      Json?     // Temporary data: { tempPhone: "...", tempPassword: "..." }
  usedAt    DateTime?
  createdAt DateTime  @default(now())
  
  @@index([token])
}
```

---

## 3. Implementation Phases

### Phase 1: Backend Infrastructure (API Endpoints)

#### 3.1.1 NextAuth.js Configuration Updates
**File**: `src/lib/auth.ts`

**Changes**:
```typescript
// Add FacebookProvider import
import FacebookProvider from "next-auth/providers/facebook";

// Update authOptions.providers array
providers: [
  CredentialsProvider({ /* existing */ }),
  FacebookProvider({
    clientId: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    allowDangerousEmailAccountLinking: true, // Handle existing email accounts
  }),
],

// Update callbacks to handle OAuth flow
callbacks: {
  async jwt({ token, user, account }) {
    if (account?.type === "oauth") {
      // Flag user as needing profile completion
      token.needsProfileSetup = true;
    }
    return token;
  },
  async signIn({ user, account, profile }) {
    if (account?.provider === "facebook") {
      // Check if user exists; if new, mark for setup
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });
      
      if (!existingUser) {
        // Redirect to profile setup flow
        return `/auth/setup-facebook-profile?token=${setupToken}`;
      }
      return true;
    }
    return true;
  },
}
```

#### 3.1.2 API: Create User (Facebook OAuth)
**Endpoint**: `POST /api/auth/facebook/create-user`

**Request Body**:
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "facebookId": "123456789",
  "profileImageUrl": "https://facebook.com/..."
}
```

**Response**:
```json
{
  "success": true,
  "userId": "uuid",
  "setupToken": "token",
  "requiresEmail": false,
  "message": "Account created. Complete your profile."
}
```

**Logic**:
- Check email uniqueness
- Check Facebook ID uniqueness
- Create User with:
  - `passwordHash: null`
  - `facebookId: <id>`
  - `emailVerified: null` (even if Facebook provided email)
- Create ProfileSetupToken (stage: "password")
- Return setupToken for client redirect

---

#### 3.1.3 API: Set Password
**Endpoint**: `POST /api/auth/setup/set-password`

**Request Body**:
```json
{
  "setupToken": "token",
  "password": "secure_password_123"
}
```

**Response**:
```json
{
  "success": true,
  "nextStage": "phone",
  "setupToken": "updated_token"
}
```

**Logic**:
- Validate setupToken
- Hash password with bcrypt
- Update User.passwordHash
- Update ProfileSetupToken stage → "phone"
- Return new token for phone collection stage

---

#### 3.1.4 API: Verify Phone (Request OTP)
**Endpoint**: `POST /api/auth/setup/verify-phone`

**Request Body**:
```json
{
  "setupToken": "token",
  "phone": "+91-9876543210"
}
```

**Response**:
```json
{
  "success": true,
  "message": "OTP sent to phone",
  "otpToken": "otp_token_123"
}
```

**Logic**:
- Validate setupToken and extract userId
- Check phone uniqueness (Parent.phone)
- Send OTP to phone via SMS service (Twilio, AWS SNS, etc.)
- Store temp phone + OTP in ProfileSetupToken.data
- Generate OTP token (short-lived: 10 minutes)
- Return otpToken for OTP verification

---

#### 3.1.5 API: Confirm Phone OTP
**Endpoint**: `POST /api/auth/setup/confirm-phone-otp`

**Request Body**:
```json
{
  "setupToken": "token",
  "otpToken": "otp_token_123",
  "otp": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "nextStage": "email_verify",
  "setupToken": "updated_token"
}
```

**Logic**:
- Validate otpToken and OTP code
- Retrieve phone from ProfileSetupToken.data
- Create Parent profile with phone
- Update ProfileSetupToken stage → "email_verify"
- Generate EmailVerificationToken
- Send email verification link
- Return setupToken

---

#### 3.1.6 API: Resend Email Verification
**Endpoint**: `POST /api/auth/setup/resend-verification-email`

**Request Body**:
```json
{
  "setupToken": "token"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

---

#### 3.1.7 API: Complete Setup (Verify Email)
**Endpoint**: `POST /api/auth/setup/verify-email`

**Request Body**:
```json
{
  "token": "email_verification_token",
  "setupToken": "setup_token"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Profile setup complete",
  "redirectUrl": "/parent/dashboard"
}
```

**Logic**:
- Validate both tokens
- Mark User.emailVerified = now()
- Mark ProfileSetupToken.usedAt = now()
- Create Notification for successful registration
- Return redirect URL

---

### Phase 2: Frontend UI Components

#### 3.2.1 Facebook Login Button
**File**: `src/components/auth/FacebookLoginButton.tsx` (NEW)

```tsx
"use client";
import { signIn } from "next-auth/react";

export function FacebookLoginButton() {
  return (
    <button
      onClick={() => signIn("facebook", { redirect: false })}
      className="w-full px-4 py-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
    >
      {/* Facebook Icon */}
      Continue with Facebook
    </button>
  );
}
```

#### 3.2.2 Complete Profile Flow Pages
**Files** (NEW):
- `src/app/auth/setup/page.tsx` — Entry point
- `src/app/auth/setup/set-password/page.tsx` — Password setup
- `src/app/auth/setup/phone/page.tsx` — Phone collection + OTP
- `src/app/auth/setup/verify-email/page.tsx` — Email verification

**State Management**: Use URL params for setupToken + React state for form data

---

#### 3.2.3 Updated Registration Page
**File**: `src/app/auth/register/page.tsx` (MODIFY)

Add Facebook button above or beside email/password form:

```tsx
<div className="space-y-4">
  {/* New Facebook Option */}
  <FacebookLoginButton />
  
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-terracotta/20"></div>
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="px-2 bg-white text-charcoal">Or register with email</span>
    </div>
  </div>
  
  {/* Existing Email/Password Form */}
</div>
```

---

### Phase 3: Database Schema & Migrations

#### 3.3.1 Migration 1: Make passwordHash Nullable
**File**: `prisma/migrations/{timestamp}_make_password_hash_optional/migration.sql`

```sql
ALTER TABLE "User" 
ALTER COLUMN "passwordHash" DROP NOT NULL;
```

**Prisma Schema Update**:
```prisma
passwordHash String?  // Was: String (required)
```

#### 3.3.2 Migration 2: Add Facebook ID + Setup Token Model
**File**: `prisma/migrations/{timestamp}_add_facebook_oauth/migration.sql`

```sql
ALTER TABLE "User" 
ADD COLUMN "facebookId" TEXT UNIQUE;

CREATE TABLE "ProfileSetupToken" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "stage" TEXT NOT NULL,
  "data" JSONB,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProfileSetupToken_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "ProfileSetupToken_token_idx" ON "ProfileSetupToken"("token");
CREATE INDEX "ProfileSetupToken_userId_idx" ON "ProfileSetupToken"("userId");
```

---

### Phase 4: Environment Configuration

#### 3.4.1 New Environment Variables
**File**: `.env.local` (example)

```bash
# Facebook OAuth
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here

# Phone Verification (Choose one)
# TWILIO_ACCOUNT_SID=...
# TWILIO_AUTH_TOKEN=...
# TWILIO_PHONE_NUMBER=...

# OR AWS SNS
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...

# Token expiry (seconds)
SETUP_TOKEN_EXPIRY=3600    # 1 hour
OTP_TOKEN_EXPIRY=600       # 10 minutes
OTP_CODE_LENGTH=6
```

---

## 4. Data Flow Diagrams

### 4.1 Facebook OAuth Registration
```
┌─────────────────────────────────────────────────────────┐
│ 1. User clicks "Continue with Facebook"                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. NextAuth redirects to Facebook Login                  │
│    (Requests: public_profile, email scopes)             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Facebook returns: id, name, email?, picture.data.url │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. NextAuth signIn callback triggers                    │
│    POST /api/auth/facebook/create-user                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 5. User created with:                                   │
│    - email (from Facebook or requested from user)       │
│    - passwordHash: NULL                                 │
│    - facebookId: facebook_id                            │
│    - emailVerified: NULL                                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 6. ProfileSetupToken created (stage: "password")        │
│    Redirect to: /auth/setup/set-password?token=...     │
└─────────────────────────────────────────────────────────┘
                          ↓
        [USER ENTERS PASSWORD]
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 7. POST /api/auth/setup/set-password                    │
│    User.passwordHash = bcrypt(password)                 │
│    Token stage: "password" → "phone"                    │
│    Redirect to: /auth/setup/phone?token=...            │
└─────────────────────────────────────────────────────────┘
                          ↓
        [USER ENTERS PHONE]
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 8. POST /api/auth/setup/verify-phone                    │
│    Generate OTP → Send via SMS                          │
│    Store temp phone in ProfileSetupToken.data           │
│    Return otpToken                                      │
│    Redirect to: /auth/setup/phone/verify-otp?token=... │
└─────────────────────────────────────────────────────────┘
                          ↓
        [USER ENTERS OTP]
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 9. POST /api/auth/setup/confirm-phone-otp              │
│    Validate OTP                                         │
│    Create Parent profile with phone                     │
│    Generate EmailVerificationToken                      │
│    Send verification email                              │
│    Token stage: "phone" → "email_verify"                │
└─────────────────────────────────────────────────────────┘
                          ↓
        [USER CLICKS EMAIL LINK]
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 10. POST /api/auth/setup/verify-email                   │
│     User.emailVerified = now()                          │
│     ProfileSetupToken.usedAt = now()                    │
│     Redirect to: /parent/dashboard                      │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Parallel Flows: Email/Password vs Facebook
```
EMAIL/PASSWORD REGISTRATION          FACEBOOK REGISTRATION
├─ Email/Password Form                ├─ Facebook Button
├─ Validate & Create User             ├─ OAuth Callback
├─ Create Parent Profile              ├─ Partial User Creation
├─ Send Email Verification            ├─ Collect Password
├─ Email Verified = Account Ready     ├─ Collect Phone (OTP)
│                                     ├─ Create Parent Profile
│                                     ├─ Send Email Verification
│                                     └─ Email Verified = Ready
```

---

## 5. Security Considerations

### 5.1 Critical Points
1. **Password Hash NULL for OAuth Users**
   - Ensure login flow checks if user has facebookId
   - If Facebook login attempted with no Facebook ID, prevent fallback to password login
   
2. **Email Verification Still Required**
   - Even though Facebook provides email, mark as unverified initially
   - User must verify via email link (defense against account takeover)

3. **Phone Verification with OTP**
   - Protects against fake phone number entries
   - Ensures Parent can receive SMS notifications later

4. **Token Expiry**
   - Setup tokens: 1 hour (user must complete flow in time)
   - OTP tokens: 10 minutes (standard practice)
   - EmailVerificationToken: 24 hours (existing)

5. **Prevent Email Takeover**
   - If email exists, allow user to link Facebook to existing account
   - Use `allowDangerousEmailAccountLinking: true` carefully
   - Add account linking confirmation step

### 5.2 Rate Limiting
- OTP generation: Max 3 attempts per phone per 10 minutes
- Password attempts: Max 5 attempts per token
- Add Prisma query to track failed attempts

### 5.3 Data Validation
- Phone number format validation (Indian format: +91-XXXXXXXXXX)
- Password strength requirements (min 8 chars, mix of case/numbers/symbols)
- Email already verified check (prevent re-verification)

---

## 6. Error Handling

### 6.1 Common Error Scenarios

| Scenario | Response | Action |
|----------|----------|--------|
| Email exists in system | 409 Conflict | Suggest login or account linking |
| Token expired | 401 Unauthorized | Request restart of setup flow |
| Phone already registered | 400 Bad Request | Suggest using different phone |
| OTP invalid | 400 Bad Request | Allow retry (max 3 times) |
| Password weak | 400 Bad Request | Show requirements |
| Email verification fails | 400 Bad Request | Allow resend link |

### 6.2 Error API Responses
```json
{
  "success": false,
  "error": "error_code",
  "message": "User-friendly message",
  "details": {} // Additional context
}
```

---

## 7. Testing Strategy

### 7.1 Unit Tests
- **Token generation** (`generateProfileSetupToken`, `generateOTP`)
- **Password hashing** (bcrypt integration)
- **Email/phone uniqueness checks**
- **OTP validation logic**

### 7.2 Integration Tests
- **Complete OAuth flow** (mock Facebook API)
- **Password + phone setup**
- **OTP verification**
- **Email verification**
- **Existing user linking** (if email exists)

### 7.3 Manual Testing Checklist
- [ ] Facebook login button visible on register page
- [ ] OAuth redirects correctly to Facebook
- [ ] User data captured from Facebook (name, email, profile pic)
- [ ] Setup flow shows correct steps
- [ ] Password validation works
- [ ] OTP generation and verification works
- [ ] Phone uniqueness validated
- [ ] Email verification link works
- [ ] Parent profile created with phone
- [ ] User can login with email/password after setup
- [ ] Session created correctly
- [ ] Redirect to dashboard after completion

### 7.4 Edge Cases
- [ ] User registers with Facebook email, then tries to register with same email via email/password
- [ ] User cancels setup flow midway, tries again
- [ ] OTP expires during verification
- [ ] Setup token expires
- [ ] User enters wrong OTP 3 times
- [ ] User tries to register with phone that already exists

---

## 8. Implementation Timeline

| Phase | Task | Duration | Dependencies |
|-------|------|----------|--------------|
| **Prep** | Set up Facebook App, get credentials | 1 day | - |
| **Phase 1** | NextAuth config + 7 APIs | 3 days | - |
| **Phase 2** | Frontend UI components (5 pages) | 2 days | Phase 1 |
| **Phase 3** | Database migrations + schema update | 1 day | Phase 1 |
| **Phase 4** | Environment setup | 0.5 days | - |
| **Testing** | Integration + manual testing | 2 days | Phase 1-4 |
| **Deployment** | Code review + merge + deploy | 1 day | Testing |
| **Total** | | **10.5 days** | |

---

## 9. Success Metrics

- [ ] 30+ users register via Facebook in first week
- [ ] Zero errors in auth logs related to new flow
- [ ] Setup completion rate > 95% (users who start complete flow)
- [ ] Phone verification success rate > 98%
- [ ] Email verification success rate > 90%
- [ ] Average setup time < 3 minutes
- [ ] No duplicate accounts or email conflicts

---

## 10. Rollback Plan

If issues arise:

1. **Disable Facebook button** (remove from registration page)
2. **Keep API endpoints** (might still have incomplete profiles)
3. **Migrate incomplete profiles** (send completion reminder emails)
4. **Revert schema changes** if necessary (passwordHash still nullable)

---

## 11. Future Enhancements

1. **Google OAuth** (similar implementation)
2. **Account Linking** (connect multiple OAuth providers)
3. **Passwordless Login** (FIDO2/WebAuthn)
4. **SMS 2FA** (using existing phone verification infrastructure)
5. **Social Login Fallback** (if user loses Facebook access)

---

## 12. Files to Create/Modify

### Create (NEW)
- `src/lib/facebook-oauth.ts` — Facebook helper functions
- `src/lib/phone-verification.ts` — OTP generation/verification
- `src/lib/profile-setup-token.ts` — Token management
- `src/app/api/auth/facebook/create-user/route.ts`
- `src/app/api/auth/setup/set-password/route.ts`
- `src/app/api/auth/setup/verify-phone/route.ts`
- `src/app/api/auth/setup/confirm-phone-otp/route.ts`
- `src/app/api/auth/setup/resend-verification-email/route.ts`
- `src/app/api/auth/setup/verify-email/route.ts`
- `src/components/auth/FacebookLoginButton.tsx`
- `src/app/auth/setup/page.tsx`
- `src/app/auth/setup/set-password/page.tsx`
- `src/app/auth/setup/phone/page.tsx`
- `src/app/auth/setup/verify-email/page.tsx`

### Modify (EXISTING)
- `src/lib/auth.ts` — Add FacebookProvider
- `prisma/schema.prisma` — passwordHash nullable, facebookId field, ProfileSetupToken model
- `src/app/auth/register/page.tsx` — Add Facebook button

### Database
- `prisma/migrations/{timestamp}_make_password_hash_optional/migration.sql`
- `prisma/migrations/{timestamp}_add_facebook_oauth/migration.sql`

---

## 13. References & Resources

### Facebook OAuth Setup
- [Facebook App Setup](https://developers.facebook.com/apps/)
- [NextAuth.js Facebook Provider](https://next-auth.js.org/providers/facebook)
- [Facebook Permissions Reference](https://developers.facebook.com/docs/permissions/)

### Phone Verification Services
- [Twilio SMS API](https://www.twilio.com/docs/sms)
- [AWS SNS](https://docs.aws.amazon.com/sns/)

### Security
- [OWASP: Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NextAuth.js Security Best Practices](https://next-auth.js.org/getting-started/example)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-28 | Claude Code | Initial plan document |

