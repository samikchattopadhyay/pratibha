# Onboarding Flow Redesign — Change Requirement & Implementation Plan

## Context

Currently the onboarding system is split across two disconnected experiences:

1. **SetupOnboarding wizard** (`/onboarding`, `/auth/setup`) — covers password, phone, and email verification for Facebook OAuth users only
2. **ProfileCompletionCard** on the dashboard — a dismissible banner prompting users to fill in address details

This creates several problems:
- Standard-registration users (email/password) reach the dashboard with address fields completely empty
- Address is treated as optional — users can dismiss the card and permanently skip it
- The ProfileCompletionCard adds noise and complexity to the dashboard
- The two flows are architecturally inconsistent (token-gated wizard vs. in-dashboard card)

**Goal:** Redesign into a single, sequential, pre-dashboard onboarding wizard. All mandatory steps block dashboard access until complete. The wizard detects each user's state and presents only the relevant/remaining steps. After every step is done, the user lands on the dashboard — clean, first time.

---

## Step Inventory & Optionality

| # | Step | Mandatory | Who Sees It | Notes |
|---|---|---|---|---|
| 1 | Set Password | Yes | Facebook OAuth users only | Standard-reg users set password during registration |
| 2 | Add Phone Number | Yes | Facebook OAuth users only | Standard-reg users set phone during registration |
| 3 | Verify Email | Yes | All PARENT users | FB users via 6-digit code; standard users via email link |
| 4 | Complete Address | Yes | All PARENT users | Street, City, State, PIN Code — all mandatory |
| 4a | Preferred State | Optional | All PARENT users | Within step 4; user may skip; settable later from Profile |

**Roles JUDGE and SUPER_ADMIN/MODERATOR never enter the onboarding wizard.**

### How Step Visibility Works

The wizard determines which steps to show based on database state, not token state:

| Condition | Steps shown |
|---|---|
| `user.passwordHash === null` | 1 → 2 → 3 → 4 |
| `parent === null OR parent.phone === null` | 2 → 3 → 4 |
| `user.emailVerified === null` | 3 → 4 |
| `address fields missing` | 4 only |

Completed steps are rendered in the sidebar with a checkmark (✓). The active step is highlighted. Already-completed steps are non-interactive (greyed sidebar item, no back-navigation to them).

---

## User Journey After This Change

### Standard Registration User
```
/register → email link → /auth/verify-email → email verified
→ /login → onboarding check → steps 1,2,3 all done → address missing
→ /onboarding (shows step 4 only, 3 checked steps in sidebar)
→ fills address → /parent/dashboard
```

### Facebook OAuth User (new)
```
Facebook login → /onboarding (all 4 steps)
→ password → phone → verify email → address
→ /parent/dashboard
```

### Returning User (all steps done)
```
/login → onboarding check → all complete → /parent/dashboard
```

---

## What "Onboarding Complete" Means (Updated Gate)

Currently in `src/app/api/parent/dashboard/route.ts` (line 38):
```typescript
// CURRENT
const isOnboardingComplete = user.emailVerified && parent && parent.phone;
```

**New definition:**
```typescript
const isOnboardingComplete =
  user.emailVerified &&
  parent !== null &&
  parent.phone &&
  parent.address &&
  parent.city &&
  parent.state &&
  parent.postalCode;
// preferredState is optional — NOT in gate condition
```

---

## Architecture Changes

### New API Endpoint

**`GET /api/parent/onboarding-status`**

Returns the completion status of all onboarding steps for the authenticated PARENT user. Used by:
- Login page (to decide where to redirect)
- Onboarding wizard page (to determine starting step and sidebar state)

Response shape:
```typescript
{
  passwordSet: boolean;        // user.passwordHash !== null
  phoneSet: boolean;           // parent exists AND parent.phone !== null
  emailVerified: boolean;      // user.emailVerified !== null
  addressSet: boolean;         // address + city + state + postalCode all non-null
  setupToken?: string;         // only included if passwordSet=false or phoneSet=false
}
```

The `setupToken` is generated on-demand here (replaces the separate `generate-setup-token` call). If a valid unexpired token already exists for the user, it is returned; otherwise a new one is created at stage `"password"` or `"phone"` as appropriate.

---

**`POST /api/auth/setup/save-address`**

Authenticated endpoint (session required, PARENT role). Saves address fields to the Parent record. Called from the wizard's step 4.

Request body:
```typescript
{
  address: string;      // required
  city: string;         // required
  state: string;        // required
  postalCode: string;   // required, must match /^\d{6}$/
  preferredState?: string; // optional
}
```

Response:
```typescript
{ success: true }
```

Validation:
- Session must exist and role must be `PARENT`
- Parent record must exist (phone step must be complete)
- `address`, `city`, `state`, `postalCode` — all required, non-empty strings
- `postalCode` — must match `/^\d{6}$/` (Indian PIN code format)
- `preferredState` — optional, can be empty string or omitted

---

### Modified API Endpoints

**`src/app/api/parent/dashboard/route.ts`**
- Update `isOnboardingComplete` to include `address`, `city`, `state`, `postalCode`
- Remove the `SETUP_REQUIRED` error response (this check is now handled at login, not dashboard-load)

**`src/app/login/page.tsx`**
- Replace the two-step check (`/api/parent/dashboard` → generate-setup-token) with a single call to `GET /api/parent/onboarding-status`
- If `!data.addressSet || !data.emailVerified || !data.phoneSet || !data.passwordSet`:
  - Redirect to `/onboarding?token=<setupToken>` (token only included in URL when password/phone steps are needed)
  - Else redirect to `/parent/dashboard`

---

### Component Changes

**`src/components/auth/SetupOnboarding.tsx` — Full Rewrite**

The current component is hardcoded to 3 steps (password, phone, email) and requires a `?token` query param for all steps. The new version must:

- Accept optional `setupToken` prop (may be null for users who only need the address step)
- On mount: call `GET /api/parent/onboarding-status` to load which steps are complete
- Derive the visible step list from status (only show steps the user still needs, plus already-completed ones in sidebar)
- Sidebar shows ALL steps (1–4) with ✓ / active / locked icons
- Only the current active step's form is shown in the content panel
- Step 4 (address) calls `POST /api/auth/setup/save-address` — no token needed
- On final step completion → `router.push("/parent/dashboard")`

Step definitions:
```typescript
const STEPS = [
  { id: "password", label: "Set Password", icon: Lock, optional: false },
  { id: "phone",    label: "Phone Number", icon: Phone, optional: false },
  { id: "email",    label: "Verify Email",  icon: Mail,  optional: false },
  { id: "address",  label: "Your Address",  icon: MapPin, optional: false },
];
```

Address step form fields:
- Street Address (required)
- City (required)
- State — dropdown of Indian states (required)
- PIN Code (required, 6-digit validation)
- Preferred State — dropdown with "Skip for now" option (optional)

**`src/app/onboarding/page.tsx`**
- Remove token reading from URL (now handled inside the wizard component)
- Wrap `<SetupOnboarding />` in `<Suspense>` (uses `useSearchParams` internally)
- Keep role-based redirect guard (JUDGE → `/judge/dashboard`, ADMIN → `/admin/dashboard`)

**`src/app/parent/dashboard/page.tsx`**
- Remove `ProfileCompletionCard` component and its import
- Remove `ProfileCompletionModal` component and its import
- Remove `calculateProfileCompletion`, `isProfileIncomplete`, `profileCompletion` state and calculations
- Remove `isProfileCompletionModalOpen` state and handler
- Remove `handleProfileCompletionSuccess` handler

**`src/lib/utils/profile.ts`**
- Keep `calculateProfileCompletion`, `getMissingProfileFields`, `isProfileCompletionRequired`
- These may be reused in the Profile page (`/parent/profile`) as informational completeness display — they are not removed

---

### Files to Delete / Deprecate

- `src/app/api/parent/generate-setup-token/route.ts` — replaced by onboarding-status endpoint
- `src/app/auth/setup/set-password/page.tsx` — standalone step pages are redundant with unified wizard
- `src/app/auth/setup/phone/page.tsx` — same
- `src/app/auth/setup/verify-email/page.tsx` — same
- `src/app/auth/setup/page.tsx` — `/auth/setup` entry point no longer needed

> **Check before deleting**: Confirm none of the above pages are linked from emails or other entry points. The `/auth/setup/verify-email` page may still be reached from verification emails — if so, keep it and ensure it redirects to `/onboarding` after completion instead of `/parent/dashboard`.

---

## Validation Rules Reference

| Field | Rule |
|---|---|
| Password | min 8 characters |
| Phone | Indian format, normalized to `91XXXXXXXXXX`, unique across Parent table |
| Email code | 6-digit, matched against EmailVerificationToken |
| Street Address | non-empty string |
| City | non-empty string |
| State | non-empty string (Indian state name) |
| PIN Code | matches `/^\d{6}$/` |
| Preferred State | optional |

---

## Implementation Todo List

### Phase 1 — API Layer
- [ ] Create `src/app/api/parent/onboarding-status/route.ts`
  - GET, authenticated, PARENT only
  - Returns `{ passwordSet, phoneSet, emailVerified, addressSet, setupToken? }`
  - Generates setup token inline if needed (reuses `generateProfileSetupToken` from `src/lib/profile-setup-token.ts`)
- [ ] Create `src/app/api/auth/setup/save-address/route.ts`
  - POST, authenticated, PARENT only
  - Validates and updates Parent address fields
- [ ] Update `src/app/api/parent/dashboard/route.ts`
  - Expand `isOnboardingComplete` check to include `address`, `city`, `state`, `postalCode`
  - Keep `SETUP_REQUIRED` response for safety (dashboard accessed directly)

### Phase 2 — Onboarding Wizard Rewrite
- [ ] Rewrite `src/components/auth/SetupOnboarding.tsx`
  - On mount: fetch `/api/parent/onboarding-status`
  - Derive step list (show needed steps + already-done in sidebar)
  - Add address step (step 4) with form fields and save-address API call
  - Preferred State field is optional with "skip" affordance
  - Progress bar and sidebar respect real DB state, not local component state
  - Loading state on mount while status is fetched (`<Loading variant="screen" />`)
- [ ] Update `src/app/onboarding/page.tsx`
  - Remove URL token reading
  - Keep role-guard, add `<Suspense>` wrapper

### Phase 3 — Login Flow Update
- [ ] Update `src/app/login/page.tsx`
  - Replace two-step check with single call to `/api/parent/onboarding-status`
  - Simplify redirect logic

### Phase 4 — Dashboard Cleanup
- [ ] Update `src/app/parent/dashboard/page.tsx`
  - Remove `ProfileCompletionCard` render, import, state, and handlers
  - Remove `ProfileCompletionModal` render, import, state, and handlers
  - Remove `calculateProfileCompletion` usage

### Phase 5 — Deprecate Old Pages
- [ ] Delete `src/app/api/parent/generate-setup-token/route.ts`
- [ ] Delete `src/app/auth/setup/set-password/page.tsx`
- [ ] Delete `src/app/auth/setup/phone/page.tsx`
- [ ] Delete `src/app/auth/setup/page.tsx`
- [ ] Review `src/app/auth/setup/verify-email/page.tsx` — decide delete vs. redirect-to-onboarding

### Phase 6 — Verification
- [ ] `npx tsc --noEmit` — zero new type errors
- [ ] `npm run lint` — zero new errors
- [ ] `npm run build` — clean build
- [ ] Manual test: standard registration user → email verify → login → address wizard → dashboard
- [ ] Manual test: Facebook OAuth user → all 4 steps → dashboard
- [ ] Manual test: Returning user (all done) → direct to dashboard
- [ ] Manual test: JUDGE login → no onboarding → judge dashboard
- [ ] Manual test: ADMIN login → no onboarding → admin dashboard
- [ ] Manual test: Direct navigation to `/onboarding` as JUDGE → redirected to judge dashboard

---

## Key Existing Utilities to Reuse

| Utility | File | Used in |
|---|---|---|
| `generateProfileSetupToken` | `src/lib/profile-setup-token.ts` | onboarding-status endpoint |
| `getProfileSetupToken` | `src/lib/profile-setup-token.ts` | set-password and add-phone API routes |
| `validatePhoneFormat` | `src/lib/phone-verification.ts` | add-phone route (unchanged) |
| `getMissingProfileFields` | `src/lib/utils/profile.ts` | May be reused in Profile page |
| `<Loading />` | `src/components/Loading.tsx` | Wizard mount loading state |

---

## Design Constraints (from CLAUDE.md)

- No inline loading spinners — use `<Loading variant="screen" />` for full-page, `<Loading variant="inline" />` for buttons
- No client-side data slicing — all state reads go through API endpoints
- Max ~500 lines per component — split address step into sub-component if needed
- No `any` — all API response shapes must be typed explicitly
- Color system: Charcoal, Terracotta, Gold — consistent with existing wizard styles
