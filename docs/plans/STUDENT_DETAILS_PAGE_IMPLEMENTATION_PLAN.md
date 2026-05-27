# Student Details Page — Implementation Plan

**Status:** 🟡 PENDING IMPLEMENTATION  
**Last Updated:** 2026-05-28  
**Feature Route:** `/admin/students/[id]`  
**Scope:** Phase 1 — No schema migration required. Notes tab deferred (Phase 2).

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

## Overview

Build a comprehensive **Student Details** page for the admin portal at `/admin/students/[id]`.

This page gives administrators a **360° view** of a student: personal profile, parent contact, all competition history with judge scores/feedback, earned certificates and achievements, and quick performance analytics.

### Architecture Pattern

This module mirrors the **existing Judge Details pattern** exactly:

```
Server Page (RSC — no "use client")
  └─ Fetches StudentMetadata server-side via internal fetch
  └─ Redirects to /admin/dashboard?tab=participants if not found
  └─ Wraps in <Suspense> with <Loading variant="screen" />
       └─ StudentDetailsLayout (Client Component — "use client")
            ├─ useSearchParams() → ?subtab= URL sync
            ├─ useState for activeSubTab
            ├─ Left sidebar (desktop) / Horizontal scroll (mobile)
            └─ Sub-tab content area
                 ├─ OverviewSubTab (static props, no client fetch)
                 ├─ CompetitionsSubTab (AJAX paginated)
                 ├─ AchievementsSubTab (AJAX list)
                 └─ NotesSubTab (placeholder — Phase 2)
```

**Reference implementation:** `src/components/admin/JudgesDetailsLayout.tsx` and `src/app/admin/judges/[id]/page.tsx`

---

## Data Model Analysis

Understanding what data is available in Prisma before writing any code:

### Student (core entity)
```
Student {
  id                  String     — UUID, used as route param
  parentId            String     — FK to Parent
  name                String     — Display name
  dateOfBirth         DateTime   — For age calculation
  gender              String     — "Male" | "Female" | "Other"
  disciplineInterests String[]   — Category slug tags (e.g. ["music-vocal", "dance"])
  registrations       Registration[]
  qualificationSlots  QualificationSlot[]
  createdAt           DateTime
}
```

### Parent + User (contact info — fetched via join)
```
Parent {
  name    String    — Parent's full name
  phone   String    — Contact number
  city    String
  state   String
  user    User {
    email String    — Login email
  }
}
```

### Registration (competition entry — one per category per competition)
```
Registration {
  id                    String
  registrationId        String     — Human-readable ID (e.g. PP-2024-001)
  status                EntryStatus — PENDING_VERIFICATION | VERIFIED | REJECTED | DISQUALIFIED
  paymentStatus         PaymentStatus — PENDING | SUCCESS | FAILED
  fbPostUrl             String     — Submission video link
  finalRank             Int?       — Set after results published
  finalScore            Decimal?   — Aggregate score
  scoringFinalized      Boolean
  competitionCategory   CompetitionCategory {
    competition { title, startDate, endDate, scope }
    category    { name, slug }
    minAge, maxAge
  }
  judgeAssignments      JudgeAssignment[] {
    judge { name }
    isSubmitted
    score { criteria1, criteria2, criteria3, criteria4?, totalScore, remarks }
  }
  certificate           Certificate? {
    certificateId, certificateUrl, qrCodeUrl, type, status, issuedAt
  }
  prizeAward            PrizeAward? {
    rank, prizeItem { title, type }
  }
  createdAt             DateTime
}
```

### Key computed values (derive in API, not client):
- **Age**: `Math.floor((now - dateOfBirth) / (365.25 * 24 * 3600 * 1000))`
- **Success Rate**: `(VERIFIED registrations / total registrations) × 100`
- **Average Score**: `mean of all Score.totalScore where isSubmitted = true`
- **Best Rank**: `MIN(finalRank) WHERE finalRank IS NOT NULL`

---

## Complete File Structure

```
src/
├── types/
│   └── student-details.ts                              [NEW] All DTO interfaces
│
├── app/
│   ├── admin/
│   │   └── students/
│   │       └── [id]/
│   │           └── page.tsx                            [NEW] Server component entry point
│   └── api/
│       └── admin/
│           └── students/
│               ├── route.ts                            [NEW] GET students list (paginated)
│               └── [id]/
│                   ├── route.ts                        [NEW] GET student metadata
│                   ├── stats/
│                   │   └── route.ts                    [NEW] GET computed stats
│                   ├── competitions/
│                   │   └── route.ts                    [NEW] GET paginated competition history
│                   └── certificates/
│                       └── route.ts                    [NEW] GET certificates/achievements
│
├── components/
│   └── admin/
│       ├── StudentDetailsLayout.tsx                    [NEW] Client layout + subtab nav
│       ├── student-details/
│       │   ├── OverviewSubTab.tsx                      [NEW] Profile + stats + recent activity
│       │   ├── CompetitionsSubTab.tsx                  [NEW] AJAX-paginated competition table
│       │   ├── AchievementsSubTab.tsx                  [NEW] Certificates & awards grid
│       │   └── NotesSubTab.tsx                         [NEW] Placeholder (Phase 2)
│       └── ParticipantsTab.tsx                         [MODIFY] Add "View Profile" button
│
└── app/api/admin/
    └── registrations/
        └── route.ts                                    [MODIFY] Expose studentId in response
```

---

## TODO Checklist

### Phase 1 — TypeScript Types (15 min)
- [ ] Create `src/types/student-details.ts`
- [ ] Define `StudentMetadata` interface
- [ ] Define `StudentStats` interface
- [ ] Define `StudentRegistrationEntry` interface (with nested `JudgeScoreBreakdown[]`)
- [ ] Define `StudentCertificate` interface
- [ ] Define `StudentSummary` interface (for list view)
- [ ] Define `SubTab` type union
- [ ] Define `PaginatedResponse<T>` wrapper
- [ ] Run `npx tsc --noEmit` — verify zero errors

### Phase 2 — API Routes (60 min)
- [ ] Create `src/app/api/admin/students/route.ts` (GET paginated list)
- [ ] Create `src/app/api/admin/students/[id]/route.ts` (GET metadata)
- [ ] Create `src/app/api/admin/students/[id]/stats/route.ts` (GET computed stats)
- [ ] Create `src/app/api/admin/students/[id]/competitions/route.ts` (GET paginated history)
- [ ] Create `src/app/api/admin/students/[id]/certificates/route.ts` (GET all certs)
- [ ] Add Zod validation schemas to each route
- [ ] Use `getServerSession(authOptions)` for SUPER_ADMIN | MODERATOR auth on all routes
- [ ] Use `prisma.$transaction([count, findMany])` pattern for paginated routes
- [ ] Return typed DTOs — never raw Prisma models
- [ ] Verify error codes: `VALIDATION_ERROR` 422, `NOT_FOUND` 404, `UNAUTHORIZED` 401, `INTERNAL_ERROR` 500

### Phase 3 — Server Page (20 min)
- [ ] Create `src/app/admin/students/[id]/page.tsx`
- [ ] Mark as async server component (NO `"use client"`)
- [ ] `await params` before accessing `id` (Next.js 15+ pattern)
- [ ] Fetch `StudentMetadata` via internal HTTP fetch with `cache: "no-store"`
- [ ] Redirect to `/admin/dashboard?tab=participants` if student not found
- [ ] Wrap `<StudentDetailsLayout>` in `<Suspense fallback={<Loading variant="screen" />}>`
- [ ] Pass only serializable props (no Date objects — use ISO strings)

### Phase 4 — Layout Component (30 min)
- [ ] Create `src/components/admin/StudentDetailsLayout.tsx`
- [ ] Add `"use client"` directive
- [ ] Use `useSearchParams()` to read `?subtab=` from URL
- [ ] `useState<SubTab>` for active tab, default `"overview"`
- [ ] `useEffect` to sync URL → state on mount + URL changes
- [ ] `handleTabChange` updates both state AND URL (`window.history.replaceState`)
- [ ] Render header: student name, age badge, gender badge, discipline tags
- [ ] Left sidebar nav (desktop): 4 tab buttons
- [ ] Horizontal scroll nav (mobile): `overflow-x-auto` row
- [ ] Right content area: conditional render by `activeSubTab`
- [ ] Each non-overview tab wrapped in `<Suspense fallback={<Loading variant="overlay" />}>`
- [ ] Verify component ≤ 500 lines; decompose if needed
- [ ] No hardcoded colors — all design system tokens

### Phase 5 — Subtab Components (90 min)

#### OverviewSubTab (30 min)
- [ ] Create `src/components/admin/student-details/OverviewSubTab.tsx`
- [ ] Accept `student: StudentMetadata` and `stats: StudentStats` as props (no internal fetch)
- [ ] Student profile card: name, DOB formatted, computed age, gender, disciplines as chips
- [ ] Parent contact card: parent name, phone, email, city/state
- [ ] Quick stats strip: 4 metric cards (competitions, medals, success rate, avg score)
- [ ] Recent activity list: last 3 registrations with competition name + status badge
- [ ] Verify ≤ 250 lines

#### CompetitionsSubTab (35 min)
- [ ] Create `src/components/admin/student-details/CompetitionsSubTab.tsx`
- [ ] `useState` for page, limit (default 10), filter, search
- [ ] `useEffect` fetch from `/api/admin/students/[id]/competitions?page=&limit=&filter=&search=`
- [ ] Show `<Loading variant="overlay" />` during fetch
- [ ] Filter buttons: ALL | VERIFIED | PENDING | AWARDED
- [ ] Search input for competition title
- [ ] Table: Competition | Category | Date | Payment | Status | Score | Rank | Certificate
- [ ] Per-row expandable section showing individual judge score breakdown + remarks
- [ ] Certificate download link (opens in new tab) when available
- [ ] AJAX pagination controls (Previous/Next with page numbers)
- [ ] Empty state when no competitions
- [ ] Verify ≤ 400 lines; extract sub-components if needed

#### AchievementsSubTab (20 min)
- [ ] Create `src/components/admin/student-details/AchievementsSubTab.tsx`
- [ ] `useEffect` fetch from `/api/admin/students/[id]/certificates`
- [ ] Show `<Loading variant="overlay" />` during fetch
- [ ] Summary row: total count per certificate type (PARTICIPATION | MERIT_1 | MERIT_2 | MERIT_3 | SPECIAL_MENTION)
- [ ] Achievement cards grid (2 or 3 columns): type badge (gold/silver/bronze/teal), competition name, category, date issued, download button, QR code link
- [ ] Empty state: "No achievements yet — keep competing! 🏆"
- [ ] Verify ≤ 200 lines

#### NotesSubTab (5 min — placeholder only)
- [ ] Create `src/components/admin/student-details/NotesSubTab.tsx`
- [ ] Render a single placeholder card: "Admin notes coming in Phase 2"
- [ ] No API call, no state

### Phase 6 — Enhancements (20 min)
- [ ] Modify `src/app/api/admin/registrations/route.ts` — add `studentId: reg.studentId` to formatted response
- [ ] Modify `src/components/admin/ParticipantsTab.tsx` — add `<a href={/admin/students/${reg.studentId}}>` icon button in the Actions column
- [ ] Verify `studentId` is now present in `Registration` interface in `ParticipantsTab.tsx`

### Phase 7 — Verification (20 min)
- [ ] `npx tsc --noEmit` — zero TypeScript errors, zero `any` types
- [ ] `npm run lint` — zero ESLint warnings
- [ ] `npm run build` — production build succeeds
- [ ] Manual: navigate to `/admin/dashboard?tab=participants`, click "View Profile"
- [ ] Manual: verify Overview tab shows correct student + parent data
- [ ] Manual: verify Competitions tab paginates correctly (check network tab)
- [ ] Manual: verify Achievements tab shows certificate badges
- [ ] Manual: verify `?subtab=competitions` in URL is preserved on browser refresh
- [ ] Manual: verify browser back/forward restores correct tab
- [ ] Manual: verify mobile layout (tabs collapse to horizontal scroll)
- [ ] Manual: verify empty states render (test with student with 0 registrations)
- [ ] Manual: verify no custom spinners — only `<Loading />` component used

---

## Phase 1 — TypeScript Types

**File:** `src/types/student-details.ts`

```typescript
// src/types/student-details.ts

// ─── Core Entity DTOs ──────────────────────────────────────────────────────

/** Lightweight summary shown in list views (ParticipantsTab, search results) */
export interface StudentSummary {
  readonly id: string;
  readonly name: string;
  readonly age: number;
  readonly gender: string;
  readonly parentName: string;
  readonly parentPhone: string;
  readonly totalCompetitions: number;
  readonly totalAwards: number;
  readonly createdAt: string; // ISO 8601
}

/** Full metadata fetched by the server page for the details layout header */
export interface StudentMetadata {
  readonly id: string;
  readonly name: string;
  readonly dateOfBirth: string;   // ISO 8601
  readonly age: number;           // Computed server-side
  readonly gender: string;
  readonly disciplineInterests: readonly string[];
  readonly createdAt: string;     // ISO 8601
  // Parent contact (joined from Parent + User)
  readonly parentId: string;
  readonly parentName: string;
  readonly parentPhone: string;
  readonly parentEmail: string;
  readonly parentCity: string;
  readonly parentState: string;
}

/** Aggregated performance statistics */
export interface StudentStats {
  readonly totalCompetitions: number;
  readonly totalAwards: number;           // Count of PrizeAwards
  readonly successRate: number;           // 0–100 (VERIFIED / total * 100)
  readonly averageScore: number | null;   // Mean of Score.totalScore, null if no scores
  readonly bestRank: number | null;       // Lowest finalRank achieved, null if none
  readonly uniqueCategories: number;      // Count of distinct categories entered
}

// ─── Competition History DTOs ──────────────────────────────────────────────

/** Per-judge score breakdown for a single registration */
export interface JudgeScoreBreakdown {
  readonly judgeId: string;
  readonly judgeName: string;
  readonly isSubmitted: boolean;
  readonly criteria1: number | null;  // Technique/Skill (max 40)
  readonly criteria2: number | null;  // Expression/Presentation (max 30)
  readonly criteria3: number | null;  // Rhythm/Composition (max 30)
  readonly criteria4: number | null;  // Originality — National only (max 10)
  readonly totalScore: number | null;
  readonly remarks: string | null;
}

/** A single competition entry in the student's history */
export interface StudentRegistrationEntry {
  readonly id: string;
  readonly registrationId: string;       // e.g. "PP-2024-001"
  readonly competitionTitle: string;
  readonly competitionScope: "STATE" | "NATIONAL";
  readonly categoryName: string;
  readonly startDate: string;            // ISO 8601
  readonly endDate: string;              // ISO 8601
  readonly fbPostUrl: string;
  readonly paymentStatus: "PENDING" | "SUCCESS" | "FAILED";
  readonly status: "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "DISQUALIFIED";
  readonly scoringFinalized: boolean;
  readonly finalRank: number | null;
  readonly finalScore: number | null;
  readonly judgeBreakdowns: readonly JudgeScoreBreakdown[];
  readonly certificate: {
    readonly certificateId: string;
    readonly certificateUrl: string;
    readonly qrCodeUrl: string;
    readonly type: "PARTICIPATION" | "MERIT_1" | "MERIT_2" | "MERIT_3" | "SPECIAL_MENTION";
    readonly status: "PENDING" | "GENERATED" | "SHARED" | "REVOKED";
    readonly issuedAt: string;           // ISO 8601
  } | null;
  readonly prizeAward: {
    readonly rank: string;               // PrizeRank enum value
    readonly prizeTitle: string;
    readonly prizeType: string;
  } | null;
  readonly createdAt: string;            // ISO 8601
}

// ─── Certificate / Achievement DTOs ───────────────────────────────────────

export interface StudentCertificate {
  readonly id: string;
  readonly certificateId: string;
  readonly certificateUrl: string;
  readonly qrCodeUrl: string;
  readonly type: "PARTICIPATION" | "MERIT_1" | "MERIT_2" | "MERIT_3" | "SPECIAL_MENTION";
  readonly status: "PENDING" | "GENERATED" | "SHARED" | "REVOKED";
  readonly issuedAt: string;             // ISO 8601
  readonly competitionTitle: string;
  readonly categoryName: string;
  readonly registrationId: string;
}

// ─── Navigation ────────────────────────────────────────────────────────────

export type SubTab = "overview" | "competitions" | "achievements" | "notes";

// ─── Shared Pagination ─────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  readonly data: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}
```

**Rules applied:**
- ✅ All dates as ISO 8601 strings — RSC boundary safe (Date objects not serializable)
- ✅ All props `readonly` — prevents accidental mutation
- ✅ Discriminated union for status fields — type-safe conditionals
- ✅ `null` explicit on optional nullable fields — no accidental `undefined`
- ✅ Nested `certificate` and `prizeAward` typed inline — no ambiguity

---

## Phase 2 — API Routes

### Auth Pattern (used on every route)

This project uses **inline NextAuth session checks** (not HOF wrappers):

```typescript
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const session = await getServerSession(authOptions);
if (!session || !session.user) {
  return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
}

const role = (session.user as { role?: string }).role;
if (role !== "SUPER_ADMIN" && role !== "MODERATOR") {
  return NextResponse.json({ error: "Forbidden access: Admins only" }, { status: 403 });
}
```

### Route 1: `GET /api/admin/students`

**File:** `src/app/api/admin/students/route.ts`

**Purpose:** Paginated list of all students for future admin directory use.

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 10 | Items per page (max 100) |
| `search` | string | — | Filter by student or parent name |
| `filter` | string | `ALL` | `ALL \| HAS_AWARDS \| PENDING_PAYMENT` |

**Prisma query pattern:**
```typescript
const [total, students] = await prisma.$transaction([
  prisma.student.count({ where }),
  prisma.student.findMany({
    where,
    include: {
      parent: { include: { user: true } },
      _count: { select: { registrations: true } },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  }),
]);
```

**Response shape:**
```typescript
{
  students: StudentSummary[];  // mapped DTOs
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}
```

---

### Route 2: `GET /api/admin/students/[id]`

**File:** `src/app/api/admin/students/[id]/route.ts`

**Purpose:** Fetch full `StudentMetadata` for one student. Called by the server page.

**Zod schema for param:**
```typescript
const StudentIdParamSchema = z.object({
  id: z.string().uuid("Invalid student ID"),
});
```

**Prisma query:**
```typescript
const student = await prisma.student.findUnique({
  where: { id: studentId },
  select: {
    id: true,
    name: true,
    dateOfBirth: true,
    gender: true,
    disciplineInterests: true,
    createdAt: true,
    parent: {
      select: {
        id: true,
        name: true,
        phone: true,
        city: true,
        state: true,
        user: { select: { email: true } },
      },
    },
  },
});
```

**DTO mapping (compute age server-side):**
```typescript
const ageMs = Date.now() - student.dateOfBirth.getTime();
const age = Math.floor(ageMs / (365.25 * 24 * 3600 * 1000));

return {
  id: student.id,
  name: student.name,
  dateOfBirth: student.dateOfBirth.toISOString(),
  age,                             // computed
  gender: student.gender,
  disciplineInterests: student.disciplineInterests,
  createdAt: student.createdAt.toISOString(),
  parentId: student.parent.id,
  parentName: student.parent.name,
  parentPhone: student.parent.phone,
  parentEmail: student.parent.user.email,
  parentCity: student.parent.city,
  parentState: student.parent.state,
} satisfies StudentMetadata;
```

**4-section comment structure (mandatory):**
```typescript
export async function GET(request: NextRequest, { params }) {
  try {
    // 1. Parse input
    const { id: studentId } = await params;

    // 2. Validate
    const validated = StudentIdParamSchema.safeParse({ id: studentId });
    if (!validated.success) { ... }

    // 3. Business logic
    const session = await getServerSession(authOptions);
    // auth check...
    const student = await prisma.student.findUnique(...);
    if (!student) return NOT_FOUND;

    // 4. Response
    return NextResponse.json(dto, { status: 200 });
  } catch (err) { ... }
}
```

---

### Route 3: `GET /api/admin/students/[id]/stats`

**File:** `src/app/api/admin/students/[id]/stats/route.ts`

**Purpose:** Compute aggregated performance stats for the Overview tab.

**Use `prisma.$transaction` for parallel queries:**
```typescript
const [
  totalCompetitions,
  verifiedCount,
  totalAwards,
  scores,
  ranks,
  categories,
] = await prisma.$transaction([
  prisma.registration.count({ where: { studentId } }),
  prisma.registration.count({ where: { studentId, status: "VERIFIED" } }),
  prisma.prizeAward.count({ where: { registration: { studentId } } }),
  prisma.score.findMany({
    where: { assignment: { registration: { studentId }, isSubmitted: true } },
    select: { totalScore: true },
  }),
  prisma.registration.findMany({
    where: { studentId, finalRank: { not: null } },
    select: { finalRank: true },
    orderBy: { finalRank: "asc" },
    take: 1,
  }),
  prisma.registration.findMany({
    where: { studentId },
    select: { competitionCategory: { select: { categoryId: true } } },
    distinct: ["competitionCategoryId"],
  }),
]);
```

**Computed values:**
```typescript
const successRate = totalCompetitions > 0
  ? Math.round((verifiedCount / totalCompetitions) * 100)
  : 0;

const averageScore = scores.length > 0
  ? scores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length
  : null;

const bestRank = ranks[0]?.finalRank ?? null;
const uniqueCategories = new Set(categories.map(c => c.competitionCategory.categoryId)).size;
```

---

### Route 4: `GET /api/admin/students/[id]/competitions`

**File:** `src/app/api/admin/students/[id]/competitions/route.ts`

**Purpose:** Paginated list of all competition registrations for the Competitions subtab.

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 10 | Items per page |
| `filter` | string | `ALL` | `ALL \| VERIFIED \| PENDING \| REJECTED \| AWARDED` |
| `search` | string | — | Filter by competition title |

**Prisma query (include all related data):**
```typescript
prisma.registration.findMany({
  where,
  include: {
    competitionCategory: {
      include: {
        competition: { select: { title: true, startDate: true, endDate: true, scope: true } },
        category: { select: { name: true } },
      },
    },
    judgeAssignments: {
      include: {
        judge: { select: { id: true, name: true } },
        score: true,
      },
    },
    certificate: true,
    prizeAward: {
      include: { prizeItem: { select: { title: true, type: true } } },
    },
  },
  orderBy: { createdAt: "desc" },
  skip: (page - 1) * limit,
  take: limit,
})
```

**Important:** Map Prisma `Decimal` fields to `number` via `.toNumber()` before returning. Never return raw Prisma models.

---

### Route 5: `GET /api/admin/students/[id]/certificates`

**File:** `src/app/api/admin/students/[id]/certificates/route.ts`

**Purpose:** All certificates earned by this student across all competitions.

**Prisma query:**
```typescript
prisma.certificate.findMany({
  where: {
    registration: { studentId },
    status: { not: "REVOKED" },   // Exclude revoked certs
  },
  include: {
    registration: {
      include: {
        competitionCategory: {
          include: {
            competition: { select: { title: true } },
            category: { select: { name: true } },
          },
        },
      },
    },
  },
  orderBy: { issuedAt: "desc" },
})
```

> **Note:** No pagination needed here — a student will rarely have more than 20 certificates. Return all at once.

---

## Phase 3 — Server Page

**File:** `src/app/admin/students/[id]/page.tsx`

```typescript
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Loading from "@/components/Loading";
import StudentDetailsLayout from "@/components/admin/StudentDetailsLayout";
import type { StudentMetadata } from "@/types/student-details";

async function fetchStudentMetadata(studentId: string): Promise<StudentMetadata | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const res = await fetch(
      `${baseUrl}/api/admin/students/${studentId}`,
      {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!res.ok) {
      console.error(`[StudentDetails] API error: ${res.status}`);
      return null;
    }

    return await res.json() as StudentMetadata;
  } catch (err) {
    console.error("[StudentDetails] Fetch failed:", err);
    return null;
  }
}

export default async function StudentDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  // ✅ Always await params first — Next.js 15+ requirement
  const { id: studentId } = await params;

  const student = await fetchStudentMetadata(studentId);

  // ✅ Redirect to participants list if student not found
  if (!student) {
    redirect("/admin/dashboard?tab=participants");
  }

  return (
    <Suspense fallback={<Loading variant="screen" text="Loading student profile..." />}>
      <StudentDetailsLayout
        student={student}
        studentId={studentId}
      />
    </Suspense>
  );
}
```

**Key rules applied:**
- ✅ NO `"use client"` — this is a server component
- ✅ `await params` before accessing `.id` (Next.js 15+ breaking change)
- ✅ Only serializable data passed to layout (`StudentMetadata` uses ISO strings, no Date objects)
- ✅ `cache: "no-store"` — fresh data on each navigation
- ✅ `<Loading variant="screen" />` as Suspense fallback — never a custom spinner

---

## Phase 4 — Layout Component

**File:** `src/components/admin/StudentDetailsLayout.tsx`

**Key patterns to follow (mirrors `JudgesDetailsLayout.tsx` exactly):**

```typescript
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { StudentMetadata, SubTab } from "@/types/student-details";
import Loading from "@/components/Loading";
import OverviewSubTab from "@/components/admin/student-details/OverviewSubTab";
import CompetitionsSubTab from "@/components/admin/student-details/CompetitionsSubTab";
import AchievementsSubTab from "@/components/admin/student-details/AchievementsSubTab";
import NotesSubTab from "@/components/admin/student-details/NotesSubTab";

const VALID_SUBTABS: SubTab[] = ["overview", "competitions", "achievements", "notes"];

interface StudentDetailsLayoutProps {
  readonly student: StudentMetadata;
  readonly studentId: string;
}

function StudentDetailsContent({ student, studentId }: StudentDetailsLayoutProps) {
  const searchParams = useSearchParams();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("overview");
  const [mounted, setMounted] = useState(false);

  // ✅ Sync URL → state on mount (supports browser back/forward)
  useEffect(() => {
    const subtab = searchParams.get("subtab") as SubTab | null;
    const initial: SubTab = subtab && VALID_SUBTABS.includes(subtab) ? subtab : "overview";
    Promise.resolve().then(() => {
      setActiveSubTab(initial);
      setMounted(true);
    });
  }, [searchParams]);

  // ✅ Tab change updates both state AND URL simultaneously
  const handleTabChange = (tab: SubTab) => {
    setActiveSubTab(tab);
    const params = new URLSearchParams(searchParams);
    params.set("subtab", tab);
    window.history.replaceState(null, "", `${window.location.pathname}?${params}`);
  };

  if (!mounted) return null;

  return (
    <div className="flex-1 bg-charcoal p-6 md:p-8 overflow-y-auto space-y-6">
      {/* Breadcrumb */}
      <p className="text-xs uppercase font-bold text-cream/40 tracking-wider">
        Admin Dashboard &gt; Students
      </p>

      {/* Header: Name + Badges */}
      <div className="flex justify-between items-start gap-4 pb-4 border-b border-terracotta/10">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl font-bold text-cream truncate">
            {student.name}
          </h1>
          <p className="text-sm text-cream/50 mt-1">
            Age {student.age} · {student.gender}
          </p>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
          {/* Discipline interest tags */}
          {student.disciplineInterests.slice(0, 2).map((d) => (
            <span key={d} className="px-3 py-1 rounded-lg text-xs font-bold uppercase
              bg-terracotta/20 text-terracotta border border-terracotta/30">
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* Sidebar + Content container */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* LEFT: Sub-tab navigation */}
        <div className="w-full md:w-48 shrink-0 flex flex-row md:flex-col gap-1
          border-b md:border-b-0 md:border-r border-terracotta/15
          pb-4 md:pb-0 md:pr-4 overflow-x-auto md:overflow-x-visible">
          {(["overview", "competitions", "achievements", "notes"] as const).map((tab) => {
            const labels = {
              overview: "👤 Overview",
              competitions: "🏅 Competitions",
              achievements: "🎖️ Achievements",
              notes: "📝 Notes",
            };
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`cursor-pointer px-4 py-2.5 rounded-lg text-left text-sm font-bold
                  transition-all whitespace-nowrap md:whitespace-normal shrink-0
                  ${activeSubTab === tab
                    ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal shadow-sm"
                    : "text-cream/60 hover:bg-cream/5 hover:text-cream"
                  }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* RIGHT: Content area */}
        <div className="flex-1 min-w-0">
          {activeSubTab === "overview" && (
            // Overview receives props directly — no client fetch
            <OverviewSubTab student={student} studentId={studentId} />
          )}
          {activeSubTab === "competitions" && (
            <Suspense fallback={<Loading variant="overlay" text="Loading competitions..." />}>
              <CompetitionsSubTab studentId={studentId} />
            </Suspense>
          )}
          {activeSubTab === "achievements" && (
            <Suspense fallback={<Loading variant="overlay" text="Loading achievements..." />}>
              <AchievementsSubTab studentId={studentId} />
            </Suspense>
          )}
          {activeSubTab === "notes" && (
            <NotesSubTab />
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentDetailsLayout(props: StudentDetailsLayoutProps) {
  return (
    <div className="min-h-screen bg-charcoal text-cream flex flex-col font-sans dark">
      <StudentDetailsContent {...props} />
    </div>
  );
}
```

**Design system tokens applied:**

| Element | Classes | Rule |
|---------|---------|------|
| Page background | `bg-charcoal` | Dark theme primary |
| Text | `text-cream` | Primary foreground |
| Sub-text | `text-cream/50`, `text-cream/40` | Muted foreground |
| Borders | `border-terracotta/10`, `border-terracotta/15` | Subtle accent borders |
| Active tab | `bg-terracotta text-cream dark:bg-gold dark:text-charcoal` | Visual hierarchy |
| Hover | `hover:bg-cream/5 hover:text-cream` | Interactive feedback |
| Discipline chips | `bg-terracotta/20 text-terracotta border-terracotta/30` | Accent tags |
| Spacing | `p-6 md:p-8`, `gap-6`, `space-y-6` | 24px / 32px consistent scale |

---

## Phase 5a — OverviewSubTab

**File:** `src/components/admin/student-details/OverviewSubTab.tsx`

**Props:** Receives `student: StudentMetadata` and `studentId: string`. Fetches its own stats via `useEffect` on mount.

**Layout structure:**
```
┌────────────────────────────────────────────┐
│  STUDENT PROFILE CARD                      │
│  Name · DOB · Age · Gender · Disciplines   │
├───────────────┬────────────────────────────┤
│  PARENT INFO  │  QUICK STATS               │
│  Name, phone, │  Competitions | Awards     │
│  email, city  │  Success Rate | Avg Score  │
├───────────────┴────────────────────────────┤
│  RECENT ACTIVITY (last 3 registrations)    │
│  [Competition] [Category] [Status Badge]   │
└────────────────────────────────────────────┘
```

**Stats fetch pattern:**
```typescript
const [stats, setStats] = useState<StudentStats | null>(null);
const [isLoadingStats, setIsLoadingStats] = useState(true);

useEffect(() => {
  fetch(`/api/admin/students/${studentId}/stats`, { cache: "no-store" })
    .then(r => r.json())
    .then((data: StudentStats) => setStats(data))
    .catch(() => setStats(null))
    .finally(() => setIsLoadingStats(false));
}, [studentId]);
```

**Stat card pattern (use for all 4 metric cards):**
```tsx
<div className="bg-charcoal-light border border-terracotta/20 rounded-xl p-4">
  <div className="text-cream/60 text-xs font-bold uppercase">Total Competitions</div>
  <div className="text-2xl font-bold text-gold mt-1">{stats?.totalCompetitions ?? "—"}</div>
  <div className="text-cream/40 text-xs mt-1">All time</div>
</div>
```

---

## Phase 5b — CompetitionsSubTab

**File:** `src/components/admin/student-details/CompetitionsSubTab.tsx`

**State:**
```typescript
const [entries, setEntries] = useState<StudentRegistrationEntry[]>([]);
const [total, setTotal] = useState(0);
const [currentPage, setCurrentPage] = useState(1);
const [limit] = useState(10);
const [filter, setFilter] = useState<"ALL" | "VERIFIED" | "PENDING" | "REJECTED" | "AWARDED">("ALL");
const [search, setSearch] = useState("");
const [isLoading, setIsLoading] = useState(true);
const [expandedId, setExpandedId] = useState<string | null>(null); // for per-row expand
```

**Fetch pattern:**
```typescript
useEffect(() => {
  const params = new URLSearchParams({
    page: String(currentPage),
    limit: String(limit),
    filter,
    ...(search && { search }),
  });
  fetch(`/api/admin/students/${studentId}/competitions?${params}`, { cache: "no-store" })
    .then(r => r.json())
    .then((data: PaginatedResponse<StudentRegistrationEntry>) => {
      setEntries(Array.from(data.data));
      setTotal(data.total);
    })
    .finally(() => setIsLoading(false));
}, [studentId, currentPage, limit, filter, search]);
```

**Status badge helper:**
```typescript
function statusBadge(status: string) {
  const map: Record<string, string> = {
    VERIFIED: "bg-green-500/10 text-green-400",
    PENDING_VERIFICATION: "bg-yellow-500/10 text-yellow-400",
    REJECTED: "bg-red-500/10 text-red-400",
    DISQUALIFIED: "bg-red-700/10 text-red-500",
  };
  return map[status] ?? "bg-cream/10 text-cream/60";
}
```

**Expandable row for judge scores:**
```tsx
<tr onClick={() => setExpandedId(id === expandedId ? null : id)}>
  {/* ... row cells ... */}
</tr>
{expandedId === entry.id && (
  <tr>
    <td colSpan={8} className="bg-charcoal/50 px-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {entry.judgeBreakdowns.map((j) => (
          <div key={j.judgeId} className="bg-charcoal-light rounded-lg p-3 space-y-1">
            <p className="text-sm font-bold text-cream">{j.judgeName}</p>
            {j.isSubmitted ? (
              <>
                <p className="text-xs text-cream/60">
                  Technique: {j.criteria1} | Expression: {j.criteria2} | Rhythm: {j.criteria3}
                  {j.criteria4 !== null && ` | Originality: ${j.criteria4}`}
                </p>
                <p className="text-sm font-bold text-gold">Total: {j.totalScore}</p>
                {j.remarks && <p className="text-xs text-cream/50 italic">"{j.remarks}"</p>}
              </>
            ) : (
              <p className="text-xs text-yellow-400">Pending evaluation</p>
            )}
          </div>
        ))}
      </div>
    </td>
  </tr>
)}
```

> **Component line limit:** If this component exceeds 400 lines, extract the table into `CompetitionEntriesTable.tsx` and the filter bar into `CompetitionFilterBar.tsx`.

---

## Phase 5c — AchievementsSubTab

**File:** `src/components/admin/student-details/AchievementsSubTab.tsx`

**Certificate type badge colors:**
```typescript
const certTypeConfig = {
  MERIT_1:        { label: "1st Place",       color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  MERIT_2:        { label: "2nd Place",       color: "bg-gray-400/20 text-gray-300 border-gray-400/30" },
  MERIT_3:        { label: "3rd Place",       color: "bg-amber-700/20 text-amber-600 border-amber-700/30" },
  SPECIAL_MENTION:{ label: "Special Mention", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  PARTICIPATION:  { label: "Participation",   color: "bg-terracotta/20 text-terracotta border-terracotta/30" },
};
```

**Achievement card:**
```tsx
<div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-5 space-y-3">
  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${config.color}`}>
    {config.label}
  </span>
  <div>
    <p className="font-semibold text-cream text-sm">{cert.competitionTitle}</p>
    <p className="text-cream/50 text-xs">{cert.categoryName}</p>
  </div>
  <p className="text-cream/40 text-xs">
    {new Date(cert.issuedAt).toLocaleDateString("en-IN")}
  </p>
  <div className="flex gap-2">
    <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer"
      className="text-xs text-gold hover:underline font-semibold">
      ↓ Download
    </a>
    <a href={cert.qrCodeUrl} target="_blank" rel="noopener noreferrer"
      className="text-xs text-cream/50 hover:underline">
      QR Code
    </a>
  </div>
</div>
```

**Empty state:**
```tsx
{certificates.length === 0 && (
  <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-12 text-center">
    <p className="text-4xl mb-3">🏆</p>
    <p className="text-cream font-semibold">No achievements yet</p>
    <p className="text-cream/50 text-sm mt-1">Keep competing — the first medal is on its way!</p>
  </div>
)}
```

---

## Phase 6 — ParticipantsTab Enhancement

### 6a. Expose `studentId` in registrations API

**File:** `src/app/api/admin/registrations/route.ts`

In the `formatted` mapping (around line 132), add `studentId`:

```typescript
// BEFORE:
const formatted = registrations.map((reg) => ({
  id: reg.id,
  registrationId: reg.registrationId,
  studentName: reg.student.name,
  // ...

// AFTER:
const formatted = registrations.map((reg) => ({
  id: reg.id,
  studentId: reg.studentId,          // ← ADD THIS
  registrationId: reg.registrationId,
  studentName: reg.student.name,
  // ...
}));
```

### 6b. Add `studentId` to the Registration interface

**File:** `src/components/admin/ParticipantsTab.tsx`

```typescript
// In the Registration interface (line 30):
export interface Registration {
  id: string;
  studentId: string;   // ← ADD THIS
  registrationId: string;
  // ...
}
```

### 6c. Add "View Profile" button to each row

In the Actions column `<td>` (around line 442), add a link button before the Approve button:

```tsx
<a
  href={`/admin/students/${reg.studentId}`}
  title="View Student Profile"
  className="text-cream/50 hover:text-gold transition-colors p-1 rounded"
>
  <User className="w-4 h-4" />
</a>
```

Also add `User` to the lucide-react import at the top.

---

## Design System Reference

All components must exclusively use these design tokens (no hardcoded colors):

| Token | Tailwind Class | Usage |
|-------|---------------|-------|
| Dark background | `bg-charcoal` | Page background |
| Card background | `bg-charcoal-light` | Card, panel backgrounds |
| Primary text | `text-cream` | Body text, headings |
| Muted text | `text-cream/60`, `text-cream/40` | Labels, captions |
| Accent border | `border-terracotta/15`, `border-terracotta/20` | Card borders |
| Active/Primary | `bg-terracotta`, `text-terracotta` | Active states, accents |
| Gold highlight | `text-gold`, `bg-gold` | Metrics, key numbers |
| Success | `text-green-400`, `bg-green-500/10` | Verified, paid |
| Warning | `text-yellow-400`, `bg-yellow-500/10` | Pending states |
| Error | `text-red-400`, `bg-red-500/10` | Rejected, failed |
| Card radius | `rounded-2xl` | All card containers |
| Button radius | `rounded-lg`, `rounded-xl` | Buttons, badges |
| Card shadow | `shadow-md`, `shadow-xl` | Card elevation |

---

## Loading Component Rules

**CRITICAL:** Always use the unified `<Loading />` component. Never use custom spinners.

```tsx
// Page-level loading (Suspense fallback in server page)
<Loading variant="screen" text="Loading student profile..." />

// Subtab loading (while client fetching)
<Loading variant="overlay" text="Loading competitions..." />

// Inline button loading
<Loading variant="inline" text="Saving..." />
```

**Never:**
```tsx
// ❌ WRONG — custom spinner
<div className="animate-spin">...</div>

// ❌ WRONG — lucide animate-spin
<Loader2 className="animate-spin" />
```

---

## Component Size Limits

| Component | Max Lines | Action If Exceeded |
|-----------|----------|-------------------|
| `StudentDetailsLayout.tsx` | 500 | Extract header + nav into sub-components |
| `OverviewSubTab.tsx` | 250 | Extract `StatCard`, `RecentActivityList` |
| `CompetitionsSubTab.tsx` | 400 | Extract `CompetitionEntriesTable`, `CompetitionFilterBar` |
| `AchievementsSubTab.tsx` | 200 | Extract `CertificateCard` |
| Any API route | 200 | Extract business logic into helper function |

---

## Verification Checklist

Run these checks before marking the feature complete:

### Automated
```bash
npx tsc --noEmit       # Zero TypeScript errors — no `any` types
npm run lint           # Zero ESLint warnings
npm run build          # Production build succeeds
```

### TypeScript Rules
- [ ] Zero `any` types — use `unknown` if truly unknown
- [ ] All dates are strings in DTOs (ISO 8601) — no Date objects across RSC boundary
- [ ] All `readonly` on immutable DTO props
- [ ] All subtab components have explicit prop interfaces
- [ ] No `as` type casts unless absolutely necessary
- [ ] `Decimal` fields from Prisma converted with `.toNumber()` before returning

### UI/UX Rules
- [ ] Only `<Loading />` component used — no custom spinners anywhere
- [ ] All 3 states handled per component: loading, empty, error
- [ ] No hardcoded colors — all design system Tailwind tokens
- [ ] `font-serif` for all page/section `<h1>` / `<h2>` headings
- [ ] `font-sans` for body text, table cells, labels
- [ ] Touch targets ≥ 44px for all interactive elements
- [ ] No horizontal scroll on mobile (test at 375px width)
- [ ] Sidebar collapses to horizontal scroll tabs on mobile

### Navigation Rules
- [ ] `?subtab=` URL param updated on every tab click
- [ ] Browser back/forward restores correct tab (test this manually)
- [ ] Page refresh on `/admin/students/[id]?subtab=competitions` loads Competitions tab
- [ ] Breadcrumb reads "Admin Dashboard > Students"
- [ ] "View Profile" link in ParticipantsTab navigates to correct student

### API Rules
- [ ] Every route has `getServerSession(authOptions)` auth check
- [ ] Only `SUPER_ADMIN` and `MODERATOR` roles can access
- [ ] Every route uses 4-section comment structure: `// 1. Parse`, `// 2. Validate`, `// 3. Business logic`, `// 4. Response`
- [ ] Pagination uses DB-level `skip` / `take` — no in-memory slicing
- [ ] `prisma.$transaction([count, findMany])` for all paginated routes
- [ ] DTOs returned — never raw Prisma models
- [ ] Zod validation on all query params
- [ ] Error codes: `VALIDATION_ERROR` 422, `NOT_FOUND` 404, `UNAUTHORIZED` 401, `FORBIDDEN` 403, `INTERNAL_ERROR` 500

---

## File Summary

| File | Status | Description |
|------|--------|-------------|
| `src/types/student-details.ts` | 🆕 NEW | All DTO types for student details |
| `src/app/api/admin/students/route.ts` | 🆕 NEW | Paginated students list API |
| `src/app/api/admin/students/[id]/route.ts` | 🆕 NEW | Student metadata API |
| `src/app/api/admin/students/[id]/stats/route.ts` | 🆕 NEW | Computed stats API |
| `src/app/api/admin/students/[id]/competitions/route.ts` | 🆕 NEW | Paginated competition history |
| `src/app/api/admin/students/[id]/certificates/route.ts` | 🆕 NEW | Certificates/achievements list |
| `src/app/admin/students/[id]/page.tsx` | 🆕 NEW | Server component entry point |
| `src/components/admin/StudentDetailsLayout.tsx` | 🆕 NEW | Client layout + subtab navigation |
| `src/components/admin/student-details/OverviewSubTab.tsx` | 🆕 NEW | Profile + stats + recent activity |
| `src/components/admin/student-details/CompetitionsSubTab.tsx` | 🆕 NEW | AJAX-paginated competition table |
| `src/components/admin/student-details/AchievementsSubTab.tsx` | 🆕 NEW | Certificates & awards grid |
| `src/components/admin/student-details/NotesSubTab.tsx` | 🆕 NEW | Placeholder (Phase 2) |
| `src/components/admin/ParticipantsTab.tsx` | ✏️ MODIFY | Add `studentId` field + "View Profile" button |
| `src/app/api/admin/registrations/route.ts` | ✏️ MODIFY | Expose `studentId` in formatted response |

---

## Phase 2 Scope (Deferred)

The following items are intentionally **out of scope** for Phase 1 and should be tracked separately:

| Item | Why Deferred | What's Needed |
|------|-------------|---------------|
| Admin Notes tab | Requires Prisma schema migration | New `StudentNote` model with `studentId`, `content`, `authorId`, `createdAt` |
| Portfolio file uploads | Requires storage infrastructure | S3/Cloudflare R2 + new `SubmissionFile` model |
| Qualification slot display | Complex logic — tracked separately | Show qual slot offers and status in Competitions tab |
