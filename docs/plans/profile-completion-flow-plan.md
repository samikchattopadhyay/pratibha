# Profile Completion Flow Implementation Plan

**Document Version:** 1.0  
**Status:** Approved for Implementation  
**Date:** 2026-05-28  
**Owner:** Pratibha Parishad Engineering Team

---

## Executive Summary

Implement a **progressive profiling** strategy to reduce registration friction while maintaining data completeness. Parents will register with minimal information (email, password, name, phone), then complete address details through a guided, non-blocking profile completion flow on their dashboard.

**Key Goals:**
- Reduce registration form friction (increase signup conversion)
- Implement industry-standard progressive profiling pattern
- Guide parents to complete profiles before competition registration
- Maintain data quality with behavioral triggering

---

## Industry Best Practices Analysis

### Progressive Profiling
[Progressive profiling](https://www.descope.com/learn/post/progressive-profiling) is the methodical collection of customer information over time rather than demanding extensive details upfront. Key metrics:

- **Reducing form fields from 11 to 4 increases conversion by 120%**
- Ask **1-3 questions at a time** after initial registration
- Collect data through **gradual engagement**, not all upfront

### Profile Completion Prompts
Research on [profile completion UI patterns](https://www.appcues.com/blog/user-onboarding-best-practices) shows:

- **Progress bars increase completion rates by 20-30%** (endowed progress effect—LinkedIn's model)
- Keep completion checklists to **3-5 items maximum**
- Use **behavioral triggering** (action-based) rather than time-based prompts
- Allow users to **skip steps** and complete later (25% higher completion rates)
- **Progress indicators make achievement visible**—users completing 50% are motivated to finish

### Time to Value (TTV)
- Ideal onboarding: **5-7 minutes for B2C, 10-15 minutes for B2B**
- Avoid mandatory profile completion before accessing core features
- Let users experience product value first, then fill in details

### Personalization vs. Simplicity
- **Every additional form question reduces completion by 10-15%**
- Keep personalization questions to **2-3 maximum**
- Collect what you need most first

**Sources:**
- [SaaS Onboarding Best Practices 2025 - ProductLed](https://productled.com/blog/5-best-practices-for-better-saas-user-onboarding)
- [Progressive Profiling 101 - Descope](https://www.descope.com/learn/post/progressive-profiling)
- [User Onboarding Best Practices - AppCues](https://www.appcues.com/blog/user-onboarding-best-practices)
- [Onboarding Flow Optimization - UserFlow](https://www.userflow.com/blog/saas-onboarding-flow-a-complete-guide)

---

## Current State Analysis

### Problem
When parents register via **email or OAuth (Facebook)**, their profiles are created with only:
- ✅ Name
- ✅ Phone

Missing address information:
- ❌ Address
- ❌ City
- ❌ State
- ❌ Postal Code
- ❌ Preferred State

This results in:
- Empty dashboard display (showing blank fields)
- Incomplete data for competition certificates
- Reduced data quality for analytics and communications

### Root Cause
Two registration endpoints bypass address collection:
1. `/src/app/api/auth/register/route.ts` (Email registration)
2. `/src/app/api/auth/setup/confirm-phone-otp/route.ts` (Facebook OAuth)

### Current Registration Flow
```
User enters email, password → Verify OTP/Email → Create Parent Profile (name, phone only) → Redirected to Dashboard
```

---

## Proposed Solution: Progressive Profile Completion

### Updated Registration Flow
```
User enters email, password → Verify OTP/Email → Create Minimal Parent Profile (name, phone) 
→ Redirect to Dashboard with Profile Completion Prompt
```

### Registration Form (Minimal)
**Required fields only:**
- Email
- Password
- Full Name
- Phone Number

**Remove from registration:**
- Address
- City
- State
- Postal Code
- Preferred State

### Dashboard Profile Completion Experience

#### 1. Profile Completion Progress Card (Always Visible)
**Location:** Top of dashboard (below header, above profile section)

**Component:** `ProfileCompletionCard`
```
┌─────────────────────────────────────────────────┐
│ 📝 Complete Your Profile                         │
│ Your profile is 40% complete                     │
│ ████░░░░░░ 40%                                  │
│                                                   │
│ Missing Information:                             │
│ ☐ Street Address                                │
│ ☐ City                                           │
│ ☐ State                                          │
│ ☐ PIN Code                                       │
│                                                   │
│ [Complete Now]  [Skip for Now]                  │
└─────────────────────────────────────────────────┘
```

**Behavior:**
- Shows percentage complete: `(2 filled / 6 total) × 100`
- Non-blocking (doesn't prevent dashboard access)
- Dismissible with "Skip for Now" (stored as `skipUntilDate`)
- Re-appears after 3 days or when user attempts to register for competition

#### 2. Profile Completion Modal
**Trigger:** "Complete Now" button on card OR when registering for competition with incomplete profile

**Component:** `ProfileCompletionModal`
- Multi-step form (one section at a time)
- Progress indicator at top
- Save & continue button
- Skip button (returns to dashboard)

**Steps:**
1. Street Address + City (Section 1/2)
2. State + PIN Code + Preferred State (Section 2/2)

#### 3. Behavioral Triggers

| Trigger | Action | Message |
|---------|--------|---------|
| User clicks "Register New Entry" | Check profile completion | "Complete your address to register for competitions" |
| Profile < 60% complete | Show banner once per session | "Add your address—it only takes 1 minute" |
| 3 days since skip | Re-show card | "Ready to complete your profile?" |
| User completes profile | Remove card & show celebration | "✅ Profile complete! Ready to compete?" |

---

## Implementation Strategy

### Phase 1: Remove Address from Registration
**Files to modify:**
1. `/src/app/api/auth/register/route.ts`
   - Remove address fields from parent creation
   - Only create with: userId, name, phone

2. `/src/app/api/auth/setup/confirm-phone-otp/route.ts`
   - Remove address fields from parent creation
   - Only create with: userId, name, phone

### Phase 2: Create Profile Completion Components & Logic
**New files:**
1. `/src/components/parent/ProfileCompletionCard.tsx`
   - Shows progress bar and missing fields
   - Handles "Complete Now" / "Skip for Now"

2. `/src/components/parent/ProfileCompletionModal.tsx`
   - Multi-step form for address details
   - Form validation (Zod)
   - API call to update parent profile

3. `/src/lib/utils/profile.ts`
   - Helper function: `calculateProfileCompletion(parent: Parent): number`
   - Helper function: `isProfileCompletionRequired(parent: Parent): boolean`

### Phase 3: Create API Endpoint for Profile Updates
**New endpoint:**
- `PUT /api/parent/profile` 
  - Updates parent: address, city, state, postalCode, preferredState
  - Returns updated parent object

### Phase 4: Update Dashboard Page
**File:** `/src/app/parent/dashboard/page.tsx`
- Import ProfileCompletionCard
- Pass parent data to card
- Handle profile update callback
- Add trigger checks for competition registration

### Phase 5: Add Trigger in Competition Registration
**File:** `/src/app/competitions/[id]/register/page.tsx`
- Check profile completion before allowing registration
- Show modal if profile < 60% complete
- Block submission with inline error message

---

## Database & Schema

### Parent Model (No schema changes required)
```prisma
model Parent {
  // Existing fields (all required)
  id                String      @id @default(cuid())
  userId            String      @unique
  name              String      // Required at signup
  phone             String      // Required at signup
  country           String      @default("India")
  
  // Progressive profiling fields (optional, filled later)
  address           String?     // Filled via profile completion
  city              String?     // Filled via profile completion
  state             String?     // Filled via profile completion
  postalCode        String?     // Filled via profile completion
  preferredState    String?     // Filled via profile completion
  
  // Tracking
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  profileCompletedAt DateTime?  // Set when all fields filled
  
  // Relations
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  students          Student[]
}
```

**Note:** No migrations needed—fields already exist as optional.

---

## User Journey & Experience

### Scenario 1: New Parent via Email Registration
```
1. Parent fills signup form (email, password, name, phone)
2. Verifies email OTP
3. Redirected to dashboard
4. Sees "Complete Your Profile" card (40% complete)
5. Can browse students tab OR click "Complete Now"
6. If clicks "Complete Now" → Modal opens, 2-step form
7. Fills address details → API call → Modal closes
8. Card updates to "100% complete" → Celebration message
```

### Scenario 2: New Parent via Facebook OAuth
```
1. Parent logs in with Facebook (pre-fills name from FB)
2. Verifies phone OTP
3. Redirected to dashboard
4. Sees "Complete Your Profile" card (40% complete)
5. Same flow as Scenario 1
```

### Scenario 3: Parent Tries to Register for Competition (Incomplete Profile)
```
1. Parent clicks "Register New Entry" from dashboard
2. System checks profile completion (< 60%)
3. Inline error: "Complete your address to register"
4. Parent clicks "Complete Profile" link
5. ProfileCompletionModal opens in context
6. Parent fills address, submits
7. Modal closes → Registration form ready
8. Parent continues with competition registration
```

### Scenario 4: Parent Skips Profile Completion
```
1. Parent clicks "Skip for Now"
2. Card dismissed
3. Skip tracked: `parentProfileSkipUntil = now + 3 days`
4. After 3 days or on next login, card re-appears
5. When trying to register competition, modal is mandatory (not skippable)
```

---

## API Changes

### 1. Modify: `POST /api/auth/register`
**Remove from parent creation:**
```typescript
// REMOVE these fields
address: registrationData.address,
city: registrationData.city,
state: registrationData.state,
postalCode: registrationData.postalCode,
preferredState: registrationData.preferredState,
```

### 2. Modify: `POST /api/auth/setup/confirm-phone-otp`
**Remove from parent creation:**
```typescript
// REMOVE these fields (only include userId, name, phone)
```

### 3. New: `PUT /api/parent/profile`
**Request:**
```json
{
  "address": "123 Main Street",
  "city": "Bangalore",
  "state": "Karnataka",
  "postalCode": "560001",
  "preferredState": "Karnataka"
}
```

**Response:**
```json
{
  "success": true,
  "parent": {
    "id": "...",
    "name": "...",
    "phone": "...",
    "address": "123 Main Street",
    "city": "Bangalore",
    "state": "Karnataka",
    "postalCode": "560001",
    "preferredState": "Karnataka",
    "profileCompletion": 100
  }
}
```

---

## Component Specifications

### ProfileCompletionCard
**Props:**
```typescript
interface ProfileCompletionCardProps {
  parent: ParentType;
  onComplete: () => void;
  onOpenModal: () => void;
}
```

**Behavior:**
- Calculate completion: `(filledFields / totalFields) × 100`
- Show progress bar with percentage
- List missing fields with checkboxes
- Buttons: "Complete Now", "Skip for Now"
- Dismissible with localStorage cache (`profileCompletionSkipUntil`)

### ProfileCompletionModal
**Props:**
```typescript
interface ProfileCompletionModalProps {
  isOpen: boolean;
  parent: ParentType;
  onClose: () => void;
  onSuccess: (updatedParent: ParentType) => void;
  isRequired?: boolean; // If true, remove "Skip" button
}
```

**Features:**
- Multi-step form (Section 1: Address + City | Section 2: State + PIN + Preferred)
- Save button labeled "Save & Continue"
- Skip button (hidden if `isRequired=true`)
- Form validation with Zod
- Loading state during API call
- Error display
- Success callback with celebration message

---

## Success Metrics

### Phase 1: Registration
- [ ] Signup form conversion rate (reduce from baseline)
- [ ] Number of parents completing profile within 24 hours
- [ ] Number of parents completing profile within 7 days
- [ ] Number of parents skipping (and later completing)

### Phase 2: Engagement
- [ ] Profile completion rate: Target **≥ 70% within 7 days**
- [ ] Time to profile completion: Target **< 3 minutes**
- [ ] Dashboard bounce rate (should decrease with card visibility)

### Phase 3: Behavioral
- [ ] % of parents with complete profile when registering for competition: Target **≥ 95%**
- [ ] Number of support requests about empty profile fields: Target **→ 0**

---

## Implementation Checklist

- [ ] **Phase 1: Registration cleanup**
  - [ ] Update `/api/auth/register`
  - [ ] Update `/api/auth/setup/confirm-phone-otp`
  - [ ] Test signup flow (email + OAuth)
  
- [ ] **Phase 2: Components**
  - [ ] Create ProfileCompletionCard.tsx
  - [ ] Create ProfileCompletionModal.tsx
  - [ ] Create profile utility functions
  - [ ] Add Zod schema for address form validation

- [ ] **Phase 3: API**
  - [ ] Create `PUT /api/parent/profile` endpoint
  - [ ] Add error handling
  - [ ] Test with Postman

- [ ] **Phase 4: Dashboard**
  - [ ] Import ProfileCompletionCard
  - [ ] Add modal state management
  - [ ] Integrate trigger logic
  - [ ] Test with incomplete parent profile

- [ ] **Phase 5: Competition Registration**
  - [ ] Add profile check before competition registration
  - [ ] Show inline error or modal
  - [ ] Test blocking behavior

- [ ] **Phase 6: Testing & QA**
  - [ ] Type check: `npx tsc --noEmit`
  - [ ] Lint: `npm run lint`
  - [ ] Manual testing (all scenarios)
  - [ ] Accessibility audit (WCAG)
  - [ ] Dark mode verification

---

## Rollout Strategy

### Week 1: Development & Internal Testing
- Implement all components
- Test signup flow with seed data
- QA sign-off

### Week 2: Soft Launch
- Deploy to staging environment
- Invite test parents to sign up
- Collect feedback on UX

### Week 3: Production Release
- Deploy to production
- Monitor metrics
- Support parent questions

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Parents skip profile → missing data | Show modal when registering for competition (mandatory) |
| 3-day skip window too short | Monitor data; adjust to 7 days if needed |
| Form abandonment | Keep to 2 sections max; show time estimate |
| Confusion about why address is needed | Add tooltip: "Needed for certificates and communications" |

---

## References & Sources

1. [SaaS Onboarding Best Practices 2026 - ProductLed](https://productled.com/blog/5-best-practices-for-better-saas-user-onboarding)
2. [Progressive Profiling 101 - Descope](https://www.descope.com/learn/post/progressive-profiling)
3. [User Onboarding Best Practices - AppCues](https://www.appcues.com/blog/user-onboarding-best-practices)
4. [Onboarding UX Guide - UserFlow](https://www.userflow.com/blog/saas-onboarding-flow-a-complete-guide)
5. [UX Onboarding Patterns - Toptal](https://www.toptal.com/designers/product-design/guide-to-onboarding-ux)

---

## Approval

**Document prepared by:** Claude Code  
**Approved by:** [Awaiting user approval]  
**Date approved:** [Pending]

