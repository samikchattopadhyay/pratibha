# Parent Entry Details Page — Implementation Plan

**Status:** 🟢 IMPLEMENTED  
**Last Updated:** 2026-05-28  
**Feature Route:** `/parent/entries/[id]`  
**Scope:** Complete parent entry details page with judge feedback, ranking, certificates, and prize tracking.

---

## ⚠️ IMPORTANT: Agent Skills & Execution Rules

This plan follows the mandatory agent execution rules from the `.agents/` directory.
Developers and AI agents **MUST** adhere to all of the following:

| Rule | Skill File | What It Governs |
|------|-----------|-----------------| 
| API endpoint structure | `.agents/skills/api-rules/SKILL.md` | Service isolation, DTOs, Zod validation, 4-section comments |
| React/TypeScript standards | `.agents/skills/frontend-rules/SKILL.md` | Import order, component template, state management tree |
| Component sizing & composition | `.agents/skills/component-rules/SKILL.md` | Max 500 lines, no monoliths, server/client boundary |
| Design tokens | `.agents/skills/design-system-rules/SKILL.md` | Colors, spacing, typography, dark mode |
| Next.js 15 patterns | `.agents/skills/next-best-practices/SKILL.md` | Async `params`, RSC boundaries, Suspense |
| Loading UI | `.agents/prompts/project.md` (Loading Rules) | Always use `<Loading />` component — never custom spinners |
| AJAX Pagination | `.agents/prompts/project.md` (Pagination Rules) | Server-side skip/take — no client-side slicing |

---

## Related Plans

This plan sits within a larger set of parent-facing student features:

| Plan File | Route | Status |
|-----------|-------|--------|
| **This file** — Entry Details | `/parent/entries/[id]` | 🟢 IMPLEMENTED |
| `STUDENT_PROFILE_MANAGEMENT_PLAN.md` | Dashboard wizard + `/parent/students/[id]` + `/student/[id]` | 🟡 IN PROGRESS |
| `STUDENT_DETAILS_PAGE_IMPLEMENTATION_PLAN.md` | `/admin/students/[id]` (admin view) | 🟡 PENDING |

---

## Overview

Build a comprehensive **Entry Details** page for the parent portal at `/parent/entries/[id]`.

This page gives parents a **360° view** of their child's single competition entry: submission details,
judge scores and feedback (anonymized), performance ranking, earned certificates and awards, and prize
dispatch tracking. Parents see only their own entries; ownership is enforced at the API layer.

### Architecture Pattern

Follows the **RSC + client layout** pattern used in the admin Student Details page:

```
Server Page (RSC — no "use client")
  └─ Fetches ParentEntryDetails server-side via internal fetch
  └─ Redirects to /parent/dashboard?tab=entries if not found
  └─ Wraps in <Suspense> with <Loading variant="screen" />
       └─ ParentEntryDetailsLayout (Client Component — "use client")
            ├─ Header: competition title, category, student name, status badges
            ├─ CompetitionSection: scope, dates, video link
            ├─ EvaluationSection: conditional judge scores + rank (only if finalized)
            ├─ CertificateSection: certificate type badge, download link, QR code (conditional)
            └─ PrizeSection: award rank, dispatch/shipping tracking (conditional)
```

**Reference implementation:** `src/components/admin/StudentDetailsLayout.tsx` and its
sub-tab components inside `src/components/admin/student-details/`.

---

## Data Model Analysis

Understanding what data is available in Prisma before writing any code:

### Registration (core entity)

```
Registration {
  id                  String     — UUID, used as route param
  registrationId      String     — Human-readable ID (e.g. "PP-2026-REC-0021")
  studentId           String     — FK to Student
  competitionCategoryId String   — FK to CompetitionCategory
  status              EntryStatus — PENDING_VERIFICATION | VERIFIED | REJECTED | DISQUALIFIED
  paymentStatus       PaymentStatus — PENDING | SUCCESS | FAILED
  fbPostUrl           String     — Facebook video submission link
  scoringFinalized    Boolean    — Indicates whether all judges have submitted scores
  finalRank           Int?       — Set after ranking is published (e.g. #3)
  finalScore          Decimal?   — Aggregate score (sum or average of judge scores)
  createdAt           DateTime
  
  Relations:
    student           Student
    competitionCategory CompetitionCategory
    judgeAssignments  JudgeAssignment[]  — one per judge
    certificate       Certificate?      — null until issued
    prizeAward        PrizeAward?       — null until awarded
}
```

### Student (for denormalization in response)

```
Student {
  id              String
  parentId        String
  name            String
  dateOfBirth     DateTime
  gender          String
  disciplineInterests String[]

  // ── NEW Profile Fields (added 2026-05-28) ────────────────────────────────
  profileImageUrl String?
  bio             String?
  city            String?
  state           String?
  heightCm        Int?
  hairColor       String?
  eyeColor        String?
  trainingInstitutes String[]
  languages       String[]
  specialSkills   String[]
  isPublic        Boolean          // Controls /student/[id] visibility
  // ─────────────────────────────────────────────────────────────────────────

  externalAchievements ExternalAchievement[]  // NEW — manually-added achievements
}
```

> **Note:** The new profile fields and `ExternalAchievement` model are used by the **Student Public
> Profile** feature (`/student/[id]`), not the entry details page. They are listed here for schema
> awareness. The entry details API only reads `student.name` and `student.dateOfBirth`.

### CompetitionCategory & Competition (joined via registration)

```
CompetitionCategory {
  id              String
  competitionId   String
  categoryId      String
  minAge          Int?
  maxAge          Int?
  
  competition     Competition {
    title         String
    scope         "STATE" | "NATIONAL"
    startDate     DateTime
    endDate       DateTime
    resultDate    DateTime?
  }
  
  category        Category {
    name          String
  }
}
```

### JudgeAssignment & Score (scoring data)

```
JudgeAssignment {
  id                String
  registrationId    String
  judgeId           String
  isSubmitted       Boolean
  assignedAt        DateTime  — used for stable "Judge 1", "Judge 2" ordering
  
  judge             Judge { id, name }  — ← NEVER expose name to parent, only to admin
  score             Score? {
    criteria1       Int?  (Technique/Skill, max 40)
    criteria2       Int?  (Expression/Presentation, max 30)
    criteria3       Int?  (Rhythm/Composition, max 30)
    criteria4       Int?  (Originality, max 10 — National only)
    totalScore      Int?
    remarks         String?
  }
}
```

### Certificate & PrizeAward

```
Certificate {
  id              String
  registrationId  String (unique)
  certificateId   String (unique)
  certificateUrl  String
  qrCodeUrl       String
  type            CertificateType — PARTICIPATION | MERIT_1 | MERIT_2 | MERIT_3 | SPECIAL_MENTION
  status          CertificateStatus — PENDING | GENERATED | SHARED | REVOKED
  issuedAt        DateTime
}

PrizeAward {
  id              String
  registrationId  String (unique)
  prizeItemId     String
  rank            PrizeRank enum (FIRST_PLACE, SECOND_PLACE, …, PARTICIPATION)
  awardedAt       DateTime
  isDispatched    Boolean
  
  prizeItem       PrizeItem {
    title         String
    type          String  (e.g. "PHYSICAL_MEDAL", "CERTIFICATE", …)
  }
  
  physicalOrder   PhysicalPrizeOrder? {
    courierName   String?
    awbNumber     String?
    estimatedDelivery DateTime?
    deliveredAt   DateTime?
  }
}
```

---

## Implementation Status

### ✅ Phase 1 — TypeScript Types
- [x] `src/types/parent-entry-details.ts` — **DONE**
- [x] `ParentJudgeScore` interface — anonymized judge labels
- [x] `ParentCertificate` interface
- [x] `ParentPrizeAward` interface
- [x] `ParentEntryDetails` interface

### ✅ Phase 2 — API Route
- [x] `src/app/api/parent/entries/[id]/route.ts` — **DONE**
- [x] Auth check: `getServerSession(authOptions)`
- [x] Ownership check: `registration.student.parentId === parent.id` (returns 404)
- [x] Judge labels anonymized: `"Judge 1"`, `"Judge 2"` based on `assignedAt` order
- [x] `totalInCategory` computed via count query
- [x] All Prisma models mapped to DTOs (Decimal → number, DateTime → ISO string)

### ✅ Phase 3 — Server Page
- [x] `src/app/parent/entries/[id]/page.tsx` — **DONE**
- [x] Async RSC, no `"use client"`
- [x] `await params` before accessing `id`
- [x] Redirect to `/parent/dashboard?tab=entries` on 404
- [x] Wrapped in `<Suspense fallback={<Loading variant="screen" />}>`

### ✅ Phase 4 — Layout Component
- [x] `src/components/parent/entry-details/ParentEntryDetailsLayout.tsx` — **DONE**
- [x] Back link: `← Back to Entries` → `/parent/dashboard?tab=entries&student={studentId}`
- [x] Sections rendered conditionally
- [x] Single-column layout (`max-w-3xl mx-auto`)

### ✅ Phase 5 — Section Components
- [x] `EntryHeader.tsx` — **DONE** — Competition title, category, roll no, student name + age, status badges
- [x] `CompetitionSection.tsx` — **DONE** — Scope, dates, video link grid
- [x] `EvaluationSection.tsx` — **DONE** — Judge scores (conditional on `scoringFinalized`)
- [x] `CertificateSection.tsx` — **DONE** — Certificate badge, download/QR links
- [x] `PrizeSection.tsx` — **DONE** — Rank, prize title, dispatch tracking

### ⚠️ Phase 6 — Dashboard Link (Partially Done)
- [x] "View Details" link already on the dashboard entry card
- [ ] **TODO:** Dashboard student card needs "Edit Profile" and "Public Profile" buttons once student profile pages are built

---

## Complete File Structure

```
src/
├── types/
│   └── parent-entry-details.ts                     ✅ DONE
│
├── app/
│   ├── parent/
│   │   └── entries/
│   │       └── [id]/
│   │           └── page.tsx                        ✅ DONE
│   └── api/
│       └── parent/
│           └── entries/
│               └── [id]/
│                   └── route.ts                    ✅ DONE
│
├── components/
│   └── parent/
│       └── entry-details/
│           ├── ParentEntryDetailsLayout.tsx        ✅ DONE
│           ├── EntryHeader.tsx                     ✅ DONE
│           ├── CompetitionSection.tsx              ✅ DONE
│           ├── EvaluationSection.tsx               ✅ DONE
│           ├── CertificateSection.tsx              ✅ DONE
│           └── PrizeSection.tsx                    ✅ DONE
│
└── app/parent/dashboard/page.tsx                   ⚠️ PARTIAL — needs student profile buttons
```

---

## Upcoming: Student Profile Integration

The following items are **not part of this plan** but are being built as a follow-on feature.
They will require minor changes to this page's dashboard view:

### Dashboard Student Cards — Pending Additions

Once `src/app/parent/students/[id]/page.tsx` (Manage Profile) and `src/app/student/[id]/page.tsx`
(Public Profile) are built, the student card in the "Students" tab of `/parent/dashboard` should
gain two additional action buttons:

```tsx
// In the student card footer — to be added after student profile pages are live:
<Link href={`/parent/students/${student.id}`}>
  <Button variant="ghost" size="sm">✏️ Edit Profile</Button>
</Link>
<Link href={`/student/${student.id}`} target="_blank">
  <Button variant="ghost" size="sm">🌐 Public Profile</Button>
</Link>
```

### New Component Files (Planned — not in this scope)

| File | Route | Purpose |
|------|-------|---------|
| `src/app/parent/students/[id]/page.tsx` | `/parent/students/[id]/edit` | Manage profile server page |
| `src/components/parent/StudentManageLayout.tsx` | — | Edit wizard + external achievements manager |
| `src/components/parent/AddStudentWizard.tsx` | — | 4-step step-based add/edit wizard |
| `src/components/parent/ExternalAchievementModal.tsx` | — | Add/edit external achievement inline modal |
| `src/app/student/[id]/page.tsx` | `/student/[id]` | Public profile RSC with OG meta |
| `src/components/parent/StudentPublicProfile.tsx` | — | LinkedIn-style public profile component |

### New Schema Additions (Already Applied — 2026-05-28)

```prisma
// Added to Student model:
profileImageUrl     String?
bio                 String?
city                String?
state               String?
heightCm            Int?
hairColor           String?
eyeColor            String?
trainingInstitutes  String[]  @default([])
languages           String[]  @default([])
specialSkills       String[]  @default([])
isPublic            Boolean   @default(false)

// New model:
model ExternalAchievement {
  id           String   @id @default(uuid())
  studentId    String
  student      Student  @relation(...)
  title        String
  eventName    String
  category     String?
  year         Int
  rank         String?
  description  String?
  proofUrl     String?
  displayOrder Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

---

## Phase 1 — TypeScript Types

**File:** `src/types/parent-entry-details.ts`

```typescript
// ─── Judge score visible to parent (anonymised) ────────────────────────────

/** Per-judge score breakdown for a single registration, visible to parent only when finalized */
export interface ParentJudgeScore {
  readonly label: string;           // "Judge 1", "Judge 2" — never a real name
  readonly isSubmitted: boolean;
  readonly criteria1: number | null; // Technique / Skill (max 40)
  readonly criteria2: number | null; // Expression / Presentation (max 30)
  readonly criteria3: number | null; // Rhythm / Composition (max 30)
  readonly criteria4: number | null; // Originality — National only (max 10)
  readonly totalScore: number | null;
  readonly remarks: string | null;
}

// ─── Certificate visible to parent ────────────────────────────────────────

export interface ParentCertificate {
  readonly certificateId: string;
  readonly certificateUrl: string;
  readonly qrCodeUrl: string;
  readonly type: "PARTICIPATION" | "MERIT_1" | "MERIT_2" | "MERIT_3" | "SPECIAL_MENTION";
  readonly status: "PENDING" | "GENERATED" | "SHARED" | "REVOKED";
  readonly issuedAt: string;   // ISO 8601
}

// ─── Prize / physical award visible to parent ──────────────────────────────

export interface ParentPrizeAward {
  readonly rank: string;          // e.g. "FIRST_PLACE"
  readonly prizeTitle: string;
  readonly prizeType: string;
  readonly isPhysical: boolean;
  readonly isDispatched: boolean;
  readonly dispatchedAt: string | null;
  readonly shipping: {
    readonly courierName: string | null;
    readonly awbNumber: string | null;
    readonly estimatedDelivery: string | null;
    readonly deliveredAt: string | null;
  } | null;
}

// ─── Full entry details returned by API ───────────────────────────────────

/** Complete entry details for parent portal, computed server-side, all dates as ISO strings */
export interface ParentEntryDetails {
  // Identity
  readonly id: string;
  readonly studentId: string;           // FK to Student — for back-link filtering
  readonly registrationId: string;      // e.g. "PP-2026-REC-0021"
  
  // Competition
  readonly competitionTitle: string;
  readonly competitionScope: "STATE" | "NATIONAL";
  readonly categoryName: string;
  readonly minAge: number | null;
  readonly maxAge: number | null;
  readonly startDate: string;           // ISO 8601
  readonly endDate: string;
  readonly resultDate: string | null;
  
  // Submission
  readonly fbPostUrl: string;
  readonly createdAt: string;           // ISO 8601 — submitted date
  
  // Status
  readonly paymentStatus: "PENDING" | "SUCCESS" | "FAILED";
  readonly status: "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "DISQUALIFIED";
  
  // Scoring & Ranking
  readonly scoringFinalized: boolean;
  readonly finalScore: number | null;      // Computed aggregate score
  readonly finalRank: number | null;       // Rank in category (e.g. 3)
  readonly totalInCategory: number | null; // Total entries in same category
  
  // Student (denormalised for display)
  readonly studentName: string;
  readonly studentAge: number;   // Computed server-side
  
  // Conditionals
  readonly judgeScores: readonly ParentJudgeScore[] | null; // null if not scoringFinalized
  readonly certificate: ParentCertificate | null;
  readonly prizeAward: ParentPrizeAward | null;
}
```

**Rules applied:**
- ✅ All dates as ISO 8601 strings — RSC boundary safe (Date objects not serializable)
- ✅ All props `readonly` — prevents accidental mutation
- ✅ Judge labels computed server-side; real names never leave the API
- ✅ `null` explicit on optional nullable fields — no accidental `undefined`
- ✅ Nested objects typed inline — no ambiguity

---

## Design System Reference

All tokens from `CLAUDE.md`:

| Element | Tailwind Class | Usage |
|---------|---------------|-------|
| Page background | `bg-cream-dark/10 dark:bg-charcoal` | Main page wrapper |
| Card background | `bg-cream dark:bg-charcoal-light` | Card, panel backgrounds |
| Card border | `border-terracotta/10 dark:border-terracotta/20` | Card borders |
| Card radius | `rounded-2xl` | All card containers |
| Primary text | `text-charcoal dark:text-cream` | Body text, headings |
| Muted text | `text-charcoal/50 dark:text-cream/50` | Labels, captions |
| Subtle text | `text-charcoal/40 dark:text-cream/40` | Section labels (uppercase) |
| Gold metric | `text-terracotta dark:text-gold` | Scores, highlights |
| Back link | `text-terracotta dark:text-gold hover:underline font-semibold` | Navigation |
| Page max-width | `max-w-3xl mx-auto` | Content container |
| Spacing scale | `p-6`, `gap-6`, `space-y-6` | 24px / 32px consistent scale |

---

## Verification Checklist

Run these checks before marking the feature complete:

### Automated
```bash
npx tsc --noEmit       # Zero TypeScript errors — no `any` types
npm run lint           # Zero ESLint warnings
npm run build          # Production build succeeds
```

### Manual UX Tests
- [x] Navigate to `/parent/dashboard?tab=entries` — "View Details" link visible on each card
- [x] Click "View Details" — loads `/parent/entries/[id]`
- [x] Back link returns to `/parent/dashboard?tab=entries&student=[studentId]`
- [ ] `scoringFinalized = false` → "Evaluation in Progress" card visible
- [ ] `scoringFinalized = true` → judge scores shown as "Judge 1", "Judge 2" (never real names)
- [ ] `finalRank` shown as "#X of Y participants" when available
- [ ] Certificate section appears only when `certificate != null`
- [ ] Download and QR links open in new tab
- [ ] Prize section appears only when `prizeAward != null`
- [ ] Physical dispatch info shown when `isPhysical = true`
- [ ] Mobile at 375px — single column layout, no horizontal overflow
- [ ] No custom spinners — only `<Loading />` component

### Security Tests
- [ ] Unauthenticated visit → redirected to login (session check at API)
- [ ] Accessing another parent's entry by UUID → returns 404 (not 403, ownership check)
- [ ] Judge names never exposed in API response (anonymized at API layer)

### Code Quality Rules
- [ ] Zero `any` types — use `unknown` if truly unknown
- [ ] All dates are strings in DTOs (ISO 8601) — no Date objects across RSC boundary
- [ ] All `readonly` on immutable DTO props
- [ ] Every section component has explicit prop interface
- [ ] `Decimal` fields from Prisma converted with `.toNumber()` before returning
- [ ] All components under line limits: Layout ≤80, sections ≤70–120, route ≤180
- [ ] No hardcoded colors — all design system Tailwind tokens
- [ ] Back link uses `<Link>` component (not `<a>`)
- [ ] External links (cert, QR, video) have `target="_blank" rel="noopener noreferrer"`

---

## Phase 2 Scope / Follow-on Work

| Item | Plan | Status |
|------|------|--------|
| Step-based Add Student wizard | Modal in `/parent/dashboard` | 🟡 IN PROGRESS |
| Student Manage Profile page | `/parent/students/[id]/edit` | 🔵 PLANNED |
| Student Public Profile page | `/student/[id]` | 🔵 PLANNED |
| "Edit Profile" button on student cards | Dashboard modification | 🔵 PENDING student pages |
| "Public Profile" button on student cards | Dashboard modification | 🔵 PENDING student pages |
| `ExternalAchievement` CRUD | API + UI on manage profile page | 🔵 PLANNED |
