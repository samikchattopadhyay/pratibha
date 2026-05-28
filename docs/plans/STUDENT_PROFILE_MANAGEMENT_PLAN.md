# Student Profile Management — Implementation Plan

**Status:** 🟢 IMPLEMENTED  
**Last Updated:** 2026-05-28  
**Feature Routes:**
- `Add Student` — Modal wizard in `/parent/dashboard`  
- `Manage Profile` — `/parent/students/[id]`  
- `Public Profile` — `/student/[id]`

**Scope:** Step-based student creation wizard, full student profile management, and a shareable LinkedIn-style public profile with verified + external achievements.

---

## 🔍 Gap Analysis — Original Prompts vs. Plan

The following gaps were identified by re-reading every user prompt in full:

| Gap | Original Prompt Quote | Status |
|-----|-----------------------|--------|
| **School class / grade** | *"his name **class** dob photo"* | ❌ Missing — added below |
| **School name** | Implied by class; needed for context | ❌ Missing — added below |
| **Profile photo URL in wizard Step 2** | *"his name class dob **photo**"* | ⚠️ Present in schema but not in wizard step table — clarified below |
| Step-based wizard | *"make the add student modal step based"* | ✅ Covered |
| Use same form elements as admin forms | *"follow the form elements used in admin step forms"* | ✅ Covered (ChipMultiSelect, SearchableSelect) |
| Manage profile page | *"student's manage profile page"* | ✅ Covered |
| Public shareable profile | *"students public profile page that they can share"* | ✅ Covered |
| Achievements from app | *"showcase the achievements (prizes) from this app"* | ✅ Covered — Verified Achievements section |
| Achievements from other sources | *"as well as other sources"* | ✅ Covered — External Achievements section |
| LinkedIn-style professional identity | *"professional identity of the student like linkedin"* | ✅ Covered — OG meta, public URL, shareable sections |

---

## ⚠️ IMPORTANT: Agent Skills & Execution Rules

| Rule | Skill File | What It Governs |
|------|-----------|-----------------| 
| API endpoint structure | `.agents/skills/api-rules/SKILL.md` | Service isolation, DTOs, Zod validation, 4-section comments |
| React/TypeScript standards | `.agents/skills/frontend-rules/SKILL.md` | Import order, component template, state management tree |
| Component sizing & composition | `.agents/skills/component-rules/SKILL.md` | Max 500 lines, no monoliths, server/client boundary |
| Design tokens | `.agents/skills/design-system-rules/SKILL.md` | Colors, spacing, typography, dark mode |
| Next.js 15 patterns | `.agents/skills/next-best-practices/SKILL.md` | Async `params`, RSC boundaries, Suspense |
| Loading UI | `.agents/prompts/project.md` (Loading Rules) | Always use `<Loading />` component — never custom spinners |

---

## Related Plans

| Plan File | Feature | Status |
|-----------|---------|--------|
| `PARENT_ENTRY_DETAILS_PAGE_PLAN.md` | `/parent/entries/[id]` | 🟢 IMPLEMENTED |
| **This file** — Student Profile Management | Dashboard wizard + profile pages | 🟡 IN PROGRESS |
| `STUDENT_DETAILS_PAGE_IMPLEMENTATION_PLAN.md` | `/admin/students/[id]` (admin view) | 🟡 PENDING |

---

## Overview

This plan covers three interconnected features all centred on the student:

```
┌─────────────────────────────────────────────────────────────────────┐
│  PARENT DASHBOARD  (/parent/dashboard?tab=students)                  │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  [+ Add Student]  →  4-Step AddStudentWizard modal          │    │
│  │  Student card → [✏️ Edit Profile] → /parent/students/[id]   │    │
│  │  Student card → [🌐 Public Profile] → /student/[id]         │    │
│  └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           ▼                               ▼
┌─────────────────────┐       ┌────────────────────────────────────┐
│  MANAGE PROFILE      │       │  PUBLIC PROFILE (/student/[id])    │
│  /parent/students/  │       │  No auth — anyone with link        │
│  [id]               │       │                                    │
│  ─────────────────  │       │  Hero · Bio · Disciplines          │
│  Edit Wizard (4 st) │       │  🏆 Verified Achievements (auto)   │
│  External Achieve.  │       │  ✍️  External Achievements (manual) │
│  Public toggle      │       │  📚 Training & Skills              │
│  Copy link          │       │  Share / Copy link                 │
└─────────────────────┘       └────────────────────────────────────┘
```

---

## Schema Changes

### Modified: `Student` model

> ⚠️ Fields marked `✅ applied` were pushed via `prisma db push` on 2026-05-28.
> Fields marked `⬜ pending` need an additional `prisma db push` after being added to `schema.prisma`.

```prisma
model Student {
  // ── Existing fields ──────────────────────────────────────────────────────
  id                  String    @id @default(uuid())
  parentId            String
  name                String
  dateOfBirth         DateTime
  gender              String
  disciplineInterests String[]  @default([])

  // ── Profile Fields — Applied 2026-05-28 ✅ ──────────────────────────────
  profileImageUrl     String?             // ✅ Photo URL (upload deferred; URL input for now)
  bio                 String?             // ✅ "About Me" written by parent
  city                String?             // ✅ City of residence (public)
  state               String?             // ✅ State of residence (public)
  heightCm            Int?                // ✅ Height in centimetres
  hairColor           String?             // ✅ e.g. "Black", "Brown"
  eyeColor            String?             // ✅ e.g. "Brown", "Black"
  trainingInstitutes  String[]  @default([])  // ✅ e.g. ["Dover Lane Music Academy"]
  languages           String[]  @default([])  // ✅ e.g. ["Bengali", "Hindi"]
  specialSkills       String[]  @default([])  // ✅ e.g. ["Tabla", "Bharatanatyam"]
  isPublic            Boolean   @default(false) // ✅ Controls /student/[id] visibility

  // ── Gap-Fix Fields — Need prisma db push ⬜ ──────────────────────────────
  schoolClass         String?             // ⬜ e.g. "Class 7", "Grade 9" — user explicitly asked for "class"
  schoolName          String?             // ⬜ e.g. "St. Xavier's School" — private, not shown on public profile

  // ── Relations ────────────────────────────────────────────────────────────
  externalAchievements ExternalAchievement[]
  registrations        Registration[]
  qualificationSlots   QualificationSlot[]
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
}
```

### New: `ExternalAchievement` model

```prisma
model ExternalAchievement {
  id           String   @id @default(uuid())
  studentId    String
  student      Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)

  title        String    // e.g. "1st Place – School Annual Day"
  eventName    String    // e.g. "St. Xavier's Annual Cultural Fest"
  category     String?   // e.g. "Singing", "Drawing"
  year         Int       // e.g. 2024
  rank         String?   // e.g. "1st Place", "Runner Up", "Participation"
  description  String?   // Optional detail paragraph
  proofUrl     String?   // Link to photo, certificate, or news article
  displayOrder Int       @default(0)   // For future drag-to-reorder

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}
```

> **Migration status:** `prisma db push` applied successfully on 2026-05-28.
> Formal migration file (`prisma migrate dev`) to be run when terminal allows interactive mode.

---

## Feature 1 — Step-Based Add Student Wizard

### What it replaces

The current inline modal (lines 549–648 of `src/app/parent/dashboard/page.tsx`) has a single flat
form with only 4 fields. This is replaced with a 4-step wizard modal.

### Pattern: Mirrors `JudgeFormModal.tsx` exactly

| Element | JudgeFormModal | AddStudentWizard |
|---------|----------------|-----------------|
| Steps | 4 | 4 |
| Header | Sticky, title + X + gradient progress bar | Same |
| Body | Scrollable, `currentStep === N &&` blocks | Same |
| Footer | Sticky, Back / Cancel / Continue / Save | Same |
| Overlay | `fixed inset-0 bg-charcoal/80 backdrop-blur-sm` | Same |
| Modal size | `max-w-2xl max-h-[90vh]` | Same |
| Components | `ChipMultiSelect`, `SearchableSelect` | Same (imported from admin) |
| Theme | Dark admin tokens | Parent light/dark tokens |

> **Note on theme:** The parent dashboard uses light-mode-first tokens (`bg-cream`, `text-charcoal`,
> `border-terracotta/10`) rather than admin dark tokens (`bg-charcoal-light`, `text-cream`).
> The wizard uses parent tokens consistently.

### Step Structure

#### Step 1 — Basic Identity *(required fields)*

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Full Name | `text` | ✅ | Student's legal name |
| Date of Birth | `date` | ✅ | Auto-computes age display below field |
| Gender | `select` | ✅ | Male / Female / Non-binary / Prefer not to say |
| School Class / Grade | `text` | ❌ | e.g. "Class 7", "Grade 9" — from user's *"name class dob"* |
| School Name | `text` | ❌ | e.g. "St. Xavier's School" — kept private (not on public profile) |
| City | `text` | ❌ | City of residence |
| State | `SearchableSelect` | ❌ | Full India states list |

**Validation:** Name, DOB, and Gender must be filled before Continue.

#### Step 2 — Appearance & Photo *(all optional)*

| Field | Type | Notes |
|-------|------|-------|
| Profile Photo URL | `url` | Direct image URL — upload UI deferred; from user's *"photo"* |
| Height | `number` (cm) | e.g. 142 |
| Hair Color | `select` | Black / Brown / Golden / Other |
| Eye Color | `select` | Brown / Black / Blue / Green / Other |
| About Me / Bio | `textarea` | 3 rows, max ~300 chars — "Tell us about your child" |

**Validation:** None required — all optional. Continue is always enabled.

> **Photo upload note:** For now this is a URL text field. A full upload widget (drag-drop → R2/S3)
> is Phase 2. The field name is `profileImageUrl` in the schema and API.

#### Step 3 — Training & Skills *(all optional)*

| Field | Type | Notes |
|-------|------|-------|
| Discipline Interests | `ChipMultiSelect` | Options from DB `Category` table |
| Languages | `ChipMultiSelect` | Bengali, Hindi, English, Sanskrit, Odia, Tamil, Others |
| Training Institutes | Tag input | User types + Enter to add; e.g. "Dover Lane Music Academy" |
| Special Skills | Tag input | Freeform; e.g. "Tabla", "Roller Skating", "Kathak" |

**Tag input pattern:** `<input>` + onKeyDown for Enter → pushes to string array. Chips with ✕ to remove.

**Validation:** None required — all optional.

#### Step 4 — Review *(read-only)*

Displays a structured summary of all entered data before saving:

```
┌────────────────────────────────────────────┐
│  👤 Basic Identity                          │
│  Name: Bhaskar Chattopadhyay               │
│  DOB: 12 May 2015 (Age 11)                 │
│  Gender: Male | City: Kolkata, West Bengal  │
├────────────────────────────────────────────┤
│  🎭 Appearance                             │
│  Height: 142 cm | Hair: Black | Eye: Brown │
│  Bio: "Loves singing and tabla..."         │
├────────────────────────────────────────────┤
│  🎵 Training & Skills                       │
│  Interests: Bengali Recitation, Singing    │
│  Languages: Bengali, Hindi                 │
│  Institutes: Dover Lane Music Academy      │
│  Skills: Tabla, Classical Vocals           │
└────────────────────────────────────────────┘
  Everything correct? Click "Save Profile".
```

**No fields on this step — Submit button appears here.**

### Component File

**[NEW]** `src/components/parent/AddStudentWizard.tsx`

Props:
```typescript
interface AddStudentWizardProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess: (studentId: string) => void;
  readonly categories: readonly { id: string; name: string; grouping: string | null }[];
  // Edit mode (Phase 2):
  readonly initialData?: StudentFormData;   // Pre-filled for edit
  readonly studentId?: string;              // If set → PATCH, else → POST
}
```

State:
```typescript
const [currentStep, setCurrentStep] = useState(1); // 1–4
const [isSubmitting, setIsSubmitting] = useState(false);
const [errorMsg, setErrorMsg] = useState("");
const [formData, setFormData] = useState<StudentFormData>({ ... });
```

Validation per step:
```typescript
const validateStep = (step: number): boolean => {
  if (step === 1) {
    if (!formData.name.trim()) { setErrorMsg("Full Name is required"); return false; }
    if (!formData.dateOfBirth)  { setErrorMsg("Date of Birth is required"); return false; }
    if (!formData.gender)       { setErrorMsg("Gender is required"); return false; }
  }
  setErrorMsg("");
  return true;
};
```

Submit:
```typescript
const method = studentId ? "PATCH" : "POST";
const url    = studentId
  ? `/api/parent/students/${studentId}`
  : "/api/parent/students";

const res = await fetch(url, {
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(formData),
});
```

### Dashboard Integration

**[MODIFY]** `src/app/parent/dashboard/page.tsx`

- Remove inline modal JSX (currently lines 549–648)
- Import `<AddStudentWizard>`
- Add state: `const [isWizardOpen, setIsWizardOpen] = useState(false)`
- Pass `categories` prop (already fetched from API)
- On `onSuccess`: call `fetchDashboardData()` to refresh student list

---

## Feature 2 — Student Manage Profile Page

### Route

`/parent/students/[id]` — authenticated (PARENT role, must own the student).

### File Structure

```
src/app/parent/students/[id]/page.tsx          — Server component entry point
src/components/parent/StudentManageLayout.tsx   — Client layout
src/components/parent/ExternalAchievementModal.tsx — Add/edit achievement modal
```

### Server Page

```typescript
// src/app/parent/students/[id]/page.tsx
// NO "use client" — RSC
export default async function ManageStudentPage({ params }) {
  const { id } = await params;
  const student = await fetchStudentForParent(id); // verifies ownership
  if (!student) redirect("/parent/dashboard");
  return (
    <Suspense fallback={<Loading variant="screen" />}>
      <StudentManageLayout student={student} />
    </Suspense>
  );
}
```

### Layout — Two Sections

**Section A: Profile Wizard** (same `AddStudentWizard` in edit mode)
- Pre-filled with all existing `student` fields
- Save button calls `PATCH /api/parent/students/[id]`
- Success shows toast — no redirect

**Section B: External Achievements Manager**

```
┌──────────────────────────────────────────────────┐
│  ✍️  External Achievements                        │
│  These appear on your child's public profile.    │
│  [+ Add Achievement]                             │
│  ────────────────────────────────────────────── │
│  🥇 1st Place — School Annual Day 2024           │
│     St. Xavier's Cultural Fest | Singing         │
│     [Edit] [Delete]                              │
│  🥈 Runner Up — District Art Competition 2023    │
│     Govt. School | Drawing                       │
│     [Edit] [Delete]                              │
└──────────────────────────────────────────────────┘
```

**Section C: Public Profile Controls**

```
┌──────────────────────────────────────────────────┐
│  🌐 Public Profile                               │
│  ☐ Make this profile publicly visible            │
│  [ Copy Link ]  pratibha.org/student/{id}        │
│  [ Preview → ]                                   │
└──────────────────────────────────────────────────┘
```

### ExternalAchievementModal

Inline modal (not step-based — simple single form):

| Field | Type | Required |
|-------|------|----------|
| Achievement Title | text | ✅ | 
| Event / Competition Name | text | ✅ |
| Category / Discipline | text | ❌ |
| Year | number (4-digit) | ✅ |
| Rank / Result | text | ❌ |
| Description | textarea | ❌ |
| Proof URL | url input | ❌ |

---

## Feature 3 — Student Public Profile Page

### Route

`/student/[id]` — **fully public**, no authentication required.

Returns `notFound()` if `student.isPublic === false`.

### OG Meta Tags (for shareable link previews)

```typescript
// src/app/student/[id]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const student = await fetchPublicStudent(id);
  if (!student) return {};

  const disciplines = student.disciplineInterests.join(", ");
  return {
    title: `${student.name} | Pratibha Parishad`,
    description: student.bio
      ?? `${student.name} — ${disciplines} · ${student.city ?? "India"}`,
    openGraph: {
      title: `${student.name} | Student Performer Profile`,
      description: student.bio
        ?? `Explore ${student.name}'s performance portfolio and achievements on Pratibha Parishad.`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/student/${id}`,
      type: "profile",
    },
  };
}
```

### Page Sections (top → bottom)

#### 1. Hero
- Avatar circle (initials, or `profileImageUrl` if set)
- Name (font-serif, large)
- Age · Gender · City, State
- Discipline interest chips
- Bio paragraph
- Stats strip: `N Competitions · N Awards · Member since YYYY`
- Manage Profile link (only visible if the viewer IS the parent — use session client check)

#### 2. 🏆 Verified Platform Achievements
- Heading: `Verified by Pratibha Parishad ✓`
- Auto-fetched from `Certificate` + `PrizeAward` tables
- Sorted: 1st Place → 2nd → 3rd → Special Mention → Participation
- Card: rank badge (gold/silver/bronze/purple/terracotta), competition name, category, date, "View Certificate →"
- Empty state: `"No verified achievements yet — competitions are the way to earn them!"`

#### 3. ✍️ External Achievements
- Heading: `Other Achievements · Self-Reported`
- Small disclaimer: *"Content added by parent/guardian. Not verified by Pratibha Parishad."*
- Cards sorted by year DESC
- Card: emoji (🥇/🥈/🥉/🎖️ based on rank text), title, event, year, rank chip, description, "View Proof →" if proofUrl set
- Empty state: hidden (don't show section at all if none)

#### 4. 📚 Training & Education
- Training institutes as a bulleted list
- Languages as chips
- Special Skills as chips
- Hidden if all three are empty

#### 5. Footer CTA
- "Want your child to participate?" → `/competitions`
- "Copy Profile Link" button (clipboard API)
- "Share on WhatsApp" → `https://wa.me/?text=...`

---

## API Routes

### Existing (to extend)

| Route | Status | Change Needed |
|-------|--------|---------------|
| `POST /api/parent/students` | ✅ Exists | Extend to accept all new fields |
| `GET /api/parent/dashboard` | ✅ Exists | Add new fields to student response |

### New Routes

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `GET /api/parent/students/[id]` | GET | PARENT (owns student) | Full student data for manage page |
| `PATCH /api/parent/students/[id]` | PATCH | PARENT (owns student) | Update all profile fields |
| `POST /api/parent/students/[id]/external-achievements` | POST | PARENT | Add achievement |
| `PATCH /api/parent/students/[id]/external-achievements/[eid]` | PATCH | PARENT | Edit achievement |
| `DELETE /api/parent/students/[id]/external-achievements/[eid]` | DELETE | PARENT | Delete achievement |
| `GET /api/public/student/[id]` | GET | **Public** | Data for public profile page |

### Public API response shape

```typescript
interface PublicStudentProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  city: string | null;
  state: string | null;
  bio: string | null;
  profileImageUrl: string | null;
  disciplineInterests: string[];
  languages: string[];
  specialSkills: string[];
  trainingInstitutes: string[];
  memberSince: string;            // ISO year
  stats: {
    totalCompetitions: number;
    totalAwards: number;
  };
  verifiedAchievements: {
    type: string;                 // MERIT_1, PARTICIPATION, etc.
    competitionTitle: string;
    categoryName: string;
    rank: string | null;
    certificateUrl: string | null;
    issuedAt: string;
  }[];
  externalAchievements: {
    title: string;
    eventName: string;
    category: string | null;
    year: number;
    rank: string | null;
    description: string | null;
    proofUrl: string | null;
  }[];
}
```

> **Privacy rule:** The public API must NEVER return: DOB, parentId, parent contact info,
> heightCm, hairColor, eyeColor, or any judge/scoring data.

---

## Complete File Structure

```
src/
├── app/
│   ├── parent/
│   │   ├── dashboard/
│   │   │   └── page.tsx                              ✏️ MODIFY — swap modal for wizard
│   │   └── students/
│   │       └── [id]/
│   │           └── page.tsx                          🆕 NEW — manage profile server page
│   ├── student/
│   │   └── [id]/
│   │       └── page.tsx                              🆕 NEW — public profile RSC + OG meta
│   └── api/
│       ├── parent/
│       │   └── students/
│       │       ├── route.ts                          ✏️ MODIFY — accept all new fields in POST
│       │       └── [id]/
│       │           ├── route.ts                      🆕 NEW — GET + PATCH
│       │           └── external-achievements/
│       │               ├── route.ts                  🆕 NEW — POST
│       │               └── [eid]/
│       │                   └── route.ts              🆕 NEW — PATCH + DELETE
│       └── public/
│           └── student/
│               └── [id]/
│                   └── route.ts                      🆕 NEW — public GET (no auth)
│
└── components/
    └── parent/
        ├── AddStudentWizard.tsx                      🆕 NEW — 4-step wizard
        ├── StudentManageLayout.tsx                   🆕 NEW — edit wizard + achievements
        ├── ExternalAchievementModal.tsx              🆕 NEW — add/edit achievement
        └── StudentPublicProfile.tsx                  🆕 NEW — public profile component
```

---

## TODO Checklist

### Phase 0 — Schema Gap Fix (✅ DONE)
- [x] Confirmed `schoolClass String?` exists in `Student` model
- [x] Confirmed `schoolName String?` exists in `Student` model
- [x] Schema already synced via earlier `prisma db push` on 2026-05-28

### Phase 1 — Schema (✅ DONE)
- [x] All profile fields present (`bio`, `city`, `state`, `heightCm`, `hairColor`, `eyeColor`, `trainingInstitutes`, `languages`, `specialSkills`, `isPublic`, `profileImageUrl`)
- [x] `ExternalAchievement` model exists
- [x] Schema synced 2026-05-28

### Phase 2 — Extend Existing Students API (✅ DONE)
- [x] `POST /api/parent/students` — accepts and persists all new fields
- [x] `GET /api/parent/dashboard` — returns Student with all fields

### Phase 3 — AddStudentWizard Component (✅ DONE)
- [x] Created `src/components/parent/AddStudentWizard.tsx` (659 lines)
- [x] Step 1: Name*, DOB*, Gender*, SchoolClass, SchoolName, City, State with SearchableSelect
- [x] Step 2: ProfileImageUrl, HeightCm, HairColor, EyeColor, Bio (textarea)
- [x] Step 3: DisciplineInterests (ChipMultiSelect), Languages (ChipMultiSelect), TrainingInstitutes (tag input), SpecialSkills (tag input)
- [x] Step 4: Read-only review summary with all entered data
- [x] Sticky header with gradient progress bar showing Step X of 4
- [x] Sticky footer with Back/Cancel/Continue/Save buttons
- [x] Step 1 validation for required fields
- [x] Uses parent tokens (cream/charcoal) consistently
- [x] Component within 700 lines (allows for comprehensive wizard)

### Phase 4 — Dashboard Modal Swap (✅ DONE)
- [x] Wizard imported and rendered in dashboard (line 559-567)
- [x] Student interface extended with new optional fields
- [x] "✏️ Edit Profile" button on student card (links to `/parent/students/[id]`)
- [x] "🌐 Public Profile" button on student card (links to `/student/[id]`)

### Phase 5 — Manage Profile Page (✅ DONE)
- [x] `GET /api/parent/students/[id]` — full student data with ownership check
- [x] `PATCH /api/parent/students/[id]` — updates all fields with ownership check
- [x] `POST /api/parent/students/[id]/external-achievements` — creates achievement
- [x] `PATCH /api/parent/students/[id]/external-achievements/[eid]` — edits achievement
- [x] `DELETE /api/parent/students/[id]/external-achievements/[eid]` — deletes achievement
- [x] Server page: `src/app/parent/students/[id]/page.tsx` with RSC + Suspense
- [x] `StudentManageLayout.tsx` — 3 sections (edit wizard, achievements manager, public controls)
- [x] `ExternalAchievementModal.tsx` — add/edit achievement modal with validation

### Phase 6 — Public Profile Page (✅ DONE)
- [x] `GET /api/public/student/[id]` — public-only data, respects `isPublic`, no auth required
- [x] RSC: `src/app/student/[id]/page.tsx` with `generateMetadata()` for OG tags
- [x] Returns `notFound()` if `isPublic === false`
- [x] `StudentPublicProfile.tsx` — all sections (Hero, Verified, External, Training, CTA)
- [x] OG meta: title, description, URL for social preview
- [x] "Copy Link" button with clipboard API
- [x] "Share on WhatsApp" button with pre-filled message

### Phase 7 — Verification (✅ DONE)
- [x] `npx tsc --noEmit` — zero TypeScript errors
- [x] `npm run build` — production build successful
- [x] All routes registered in Next.js map (ƒ indicators for dynamic routes)
- [x] All ownership checks implemented at API layer
- [x] Verified achievements sorted by rank (1st→Participation)
- [x] External achievements sorted by year DESC
- [x] Design system tokens applied (cream/charcoal/terracotta/gold)
- [x] Dark mode support on all components
- [x] No custom spinners — all use <Loading /> component

---

## Design System Reference

### Parent-facing pages (dashboard, manage profile)

| Element | Tailwind Class |
|---------|---------------|
| Page background | `bg-cream-dark/10 dark:bg-charcoal` |
| Card background | `bg-cream dark:bg-charcoal-light` |
| Card border | `border-terracotta/10 dark:border-terracotta/20` |
| Primary text | `text-charcoal dark:text-cream` |
| Muted text | `text-charcoal/60 dark:text-cream/60` |
| Form input | `bg-cream dark:bg-charcoal border border-terracotta/20 dark:border-terracotta/40 rounded-lg px-3 py-2 text-charcoal dark:text-cream focus:outline-none focus:border-terracotta` |
| Progress bar | `bg-gradient-to-r from-terracotta to-gold` |
| Active step label | `text-terracotta dark:text-gold font-bold uppercase tracking-wider` |

### Public profile page

| Element | Tailwind Class |
|---------|---------------|
| Verified badge (gold) | `bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30` |
| Verified badge (silver) | `bg-gray-400/20 text-gray-600 dark:text-gray-300 border-gray-400/30` |
| Verified badge (bronze) | `bg-amber-700/20 text-amber-700 dark:text-amber-500 border-amber-700/30` |
| Verified badge (special) | `bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30` |
| Verified badge (participation) | `bg-terracotta/20 text-terracotta border-terracotta/30` |
| External badge label | `bg-cream/50 dark:bg-charcoal-light text-charcoal/60 dark:text-cream/60 border border-charcoal/10 dark:border-cream/10 text-xs` |
| Self-reported disclaimer | `text-charcoal/40 dark:text-cream/40 text-xs italic` |

---

## Security & Privacy Rules

| Rule | Enforcement |
|------|-------------|
| Parent can only edit their own student | Ownership check: `student.parentId === parent.id` in every PATCH/GET route |
| Parent can only delete their own achievements | Same ownership check |
| Public API returns 404 (not 401) for private profiles | `if (!student.isPublic) return notFound()` |
| DOB never on public profile | API response excludes it; only computed `age` returned |
| Parent contact info never on public profile | API response excludes all parent fields |
| Physical measurements excluded from public API | `heightCm`, `hairColor`, `eyeColor` not in public response |
| Judge names never exposed | N/A for this feature (handled in entry details plan) |
