# SMS/TRAI Removal & Setup Flow Simplification Plan

**Date:** 2026-05-28  
**Status:** Implemented  
**Impact:** High — Affects user onboarding and profile creation flow

---

## Executive Summary

Without TRAI (Telecom Regulatory Authority of India) registration, SMS-based OTP verification cannot be used. This plan removes the OTP-based phone verification step from the parent setup flow, simplifying it from 4 steps to 3 steps while maintaining security and data validation.

---

## Problem Statement

### Current Issue
- **Blocker:** SMS OTP verification requires TRAI compliance registration, which is not currently in place
- **Impact:** Users cannot complete the setup flow → cannot create Parent profile → cannot access parent dashboard
- **UX Problem:** Error message "Parent profile not found" appears instead of guiding users through setup

### Root Causes
1. Setup flow architecture assumes SMS OTP availability
2. Parent profile is created only after phone OTP verification completes
3. No fallback path for non-SMS phone collection

---

## Solution Approach

### Key Changes
1. **Remove OTP verification step** — Collect phone directly without SMS
2. **Move Parent profile creation** — Now happens during phone step (not after OTP)
3. **Simplify setup flow** — Password → Phone → Email (from Password → Phone OTP → Email)
4. **Maintain validation** — Phone format + uniqueness check still enforced

### Architecture

**Before (4 steps):**
```
Facebook OAuth → Set Password → Verify Phone (SMS OTP) → Verify Email → Dashboard
```

**After (3 steps):**
```
Facebook OAuth → Set Password → Add Phone → Verify Email → Dashboard
```

---

## Implementation Details

### Files Changed

#### 1. Frontend: Phone Entry Form
**File:** `src/app/auth/setup/phone/page.tsx`
- **Change:** Removed OTP two-step flow (phone → OTP entry)
- **New:** Single form that collects phone and submits directly
- **Validation:** Client-side format validation + server-side uniqueness check
- **Next Step:** Auto-redirects to email verification after success

#### 2. Backend: New Phone Submission Endpoint
**File:** `src/app/api/auth/setup/add-phone/route.ts` (NEW)
- **Purpose:** Replaces both `verify-phone` and `confirm-phone-otp` endpoints
- **Logic:**
  ```typescript
  1. Validate setup token (must be "password" stage)
  2. Validate phone format (regex + normalization)
  3. Check for duplicate phone in Parent table
  4. CREATE Parent profile with userId, name, phone
  5. Advance token stage to "email_verify"
  6. Return success
  ```
- **Error Handling:**
  - `phone_exists` (409) — Phone already registered
  - `invalid_phone` (400) — Format validation failed
  - `invalid_token` (401) — Token missing/expired/wrong stage

#### 3. Existing Endpoints (No Changes Required)
- **`/api/auth/setup/set-password`** — Already sets stage to "phone"
- **`/api/auth/setup/verify-email`** — Already marks setup complete

### Database Schema Impact
- **No schema changes** — Parent profile still created with same fields
- **Timing change** — Now created during phone step, not after OTP

### Token Stage Flow
```
INITIAL (password) → AFTER PASSWORD SET (phone) → AFTER PHONE (email_verify) → AFTER EMAIL (marked used)
```

---

## Testing Checklist

### Unit Tests
- [ ] Phone format validation (valid: +91-9876543210, 9876543210)
- [ ] Duplicate phone rejection
- [ ] Parent profile creation on valid phone submission
- [ ] Token stage progression

### Integration Tests
- [ ] Full setup flow: Password → Phone → Email verification
- [ ] Facebook OAuth → Setup → Dashboard
- [ ] Email login (credentials) → Setup → Dashboard
- [ ] Error cases: duplicate phone, invalid format, expired token

### User Experience Tests
- [ ] Single phone form page loads correctly
- [ ] Error messages display properly
- [ ] Redirect to email verification works
- [ ] Dashboard accessible after email verification
- [ ] Parent profile has correct phone number

---

## Deprecated Endpoints

These endpoints are **no longer used** but can be kept for backwards compatibility:

1. **`/api/auth/setup/verify-phone`**
   - Was: Send SMS OTP to phone
   - Status: Deprecated (SMS not available)
   - Action: Can be safely deleted or kept as deprecated

2. **`/api/auth/setup/confirm-phone-otp`**
   - Was: Verify OTP code and create Parent profile
   - Status: Deprecated (replaced by `/api/auth/setup/add-phone`)
   - Action: Can be safely deleted or kept as deprecated

---

## Related Features

### Parent Dashboard Error Handling
**File:** `src/app/parent/dashboard/page.tsx`
- **Added:** Detection of "SETUP_REQUIRED" error code
- **Behavior:** Auto-generates setup token and redirects to password setup
- **Benefit:** Users who reach dashboard without setup are guided through flow instead of seeing error

**File:** `src/api/parent/dashboard/route.ts`
- **Changed:** Returns `{ code: "SETUP_REQUIRED" }` when Parent profile not found
- **Purpose:** Allows frontend to distinguish setup-needed from other errors

**File:** `src/api/parent/generate-setup-token/route.ts` (NEW)
- **Purpose:** Generates setup token for users reaching dashboard without profile
- **Used by:** Dashboard page when setup is required

---

## Migration & Deployment

### Zero Downtime
- ✅ No database migration needed
- ✅ New endpoint added alongside old ones
- ✅ Old endpoints can be retired gradually

### Rollout Steps
1. Deploy changes (includes new endpoint + updated phone page)
2. Monitor setup flow completion rates
3. Verify no increase in "Parent profile not found" errors
4. Optional: Delete deprecated endpoints after 2 weeks

### Monitoring Points
- Setup flow completion rate (target: >95%)
- Phone validation rejection rate (should be <5%)
- Error rates on `/api/auth/setup/add-phone`
- Dashboard access success rate for new users

---

## Security Considerations

### Phone Validation
- **Format:** Regex validation (`/^\+?91?[-\s]?\d{10}$/)
- **Normalization:** Converts to standard format (+91-XXXXXXXXXX)
- **Uniqueness:** Enforced at database level (Parent.phone UNIQUE)

### No Regression
- ✅ Phone is still verified (format + uniqueness)
- ✅ User authentication flow unchanged
- ✅ Email verification still required
- ✅ Password still required for credentials-based users
- ✅ No sensitive data exposure changes

---

## Future Considerations

### If SMS Becomes Available Later
If TRAI registration is completed in the future:
1. OTP endpoints can be re-enabled
2. Phone page can be updated to include optional OTP verification
3. No database schema changes needed (phone already stored)

### Potential Enhancements
- Phone verification via email link (alternative to SMS)
- Whitelist trusted phone numbers for repeat users
- Social login providers that provide phone numbers

---

## Rollback Plan

If this needs to be reverted:
1. Restore old phone page with OTP UI
2. Re-enable `verify-phone` and `confirm-phone-otp` endpoints
3. Update dashboard to check for Parent profile (current behavior)
4. Re-run email verification to create Parent profiles for users stuck in old flow

**Note:** No data loss risk since Parent profiles are created either way.

---

## Documentation Updates

- [ ] Update `CLAUDE.md` auth section with new setup flow
- [ ] Add comments to deprecated endpoints
- [ ] Update API documentation if available
- [ ] Add troubleshooting guide for setup flow issues

---

## Questions & Decisions

| Question | Decision | Rationale |
|----------|----------|-----------|
| Keep old OTP endpoints? | Yes, for now (soft deprecation) | Allows gradual transition, can monitor old flow usage |
| Require phone verification? | No, just format + uniqueness | Sufficient for current business needs |
| Store phone as-is or normalize? | Normalize on storage | Ensures consistent format in database |
| Send confirmation email with phone? | Not required | Setup flow is quick enough |

