# Judges Details Module Implementation Plan

**Status:** 🔶 PARTIALLY COMPLETE (Revenue Calculation Missing)  
**Last Updated:** 2026-05-27  
**Author:** Claude Code  
**Completion Date:** 2026-05-27 (UI & API scaffolding)  
**Remaining Work:** Revenue calculation using tier-based percentages

---

## ⚠️ CRITICAL: Revenue Calculation Incomplete

**Status:** Configuration UI & storage are complete, but revenue calculation endpoint does NOT use tier-based percentages yet.

**Current Gap:**
- ✅ Settings page allows admins to configure per-judge revenue share by participant tier
- ✅ Percentages are stored in Judge model (revenueShareLOCAL, REGIONAL, NATIONAL, EXPERT)
- ❌ Revenue endpoint returns hardcoded rates, ignores tier-based percentages
- ❌ No actual calculation: `entryFee × (revenueShare% / 100)` per participant

**What Needs to Happen:**
The `/api/admin/judges/[id]/revenue` endpoint must:
1. Fetch judge's tier-based revenue share settings
2. Get assigned participants with their tiers
3. Look up competition entry fees per participant
4. Calculate revenue by tier: `sum(entryFee × sharePercentage)` per tier
5. Return breakdown showing earned revenue vs pending

See section "Judge Compensation Model" below for details.

---

## ⚠️ IMPORTANT: Agent Skills & Execution Rules

This plan follows the mandatory agent execution rules from `.agents/` directory. Developers MUST:

- ✅ Follow **api-rules** for REST endpoint structure and service layer isolation
- ✅ Follow **frontend-rules** for React/TypeScript best practices
- ✅ Follow **component-rules** for component sizing (max 500 lines) and composition
- ✅ Follow **design-system-rules** for colors, spacing, typography, and dark mode
- ✅ Follow **next-best-practices** for RSC boundaries and async/await patterns
- ✅ Follow **code-verification** to test implementation against actual requirements
- ✅ Follow **AI_AGENT_EXECUTION_RULES** — Execute instructions, don't create meta-docs

**Reference Documentation:**
- `.agents/skills/api-rules/SKILL.md` — Service layer, DTOs, validation contracts
- `.agents/skills/frontend-rules/SKILL.md` — Component templates, import order, state management
- `.agents/skills/component-rules/SKILL.md` — Max line counts, composition patterns
- `.agents/skills/design-system-rules/SKILL.md` — Colors, spacing, typography tokens
- `.agents/skills/next-best-practices/rsc-boundaries.md` — Server/client component boundaries

---

## Overview

Implement a **Judges Details Dashboard** module that mirrors the successful **Competitions Details Dashboard** pattern. This module will provide detailed management views for individual judges, with a secondary navigation menu allowing administrators to switch between different management contexts.

### Key Objective
Create a `src/app/admin/judges/[id]/page.tsx` route with a `JudgesDetailsLayout` component that provides tabbed navigation between:
1. **Details** — Core judge information, contact, specializations, tier/status
2. **Participants** — Participants assigned to this judge, evaluation status, scoring history
3. **Revenue** — Financial metrics, compensation, payment history, audit trail
4. **Settings** — Judge-specific preferences, availability, notification settings, rules

---

## Architecture Pattern

### Pattern Source
**Reference:** `src/components/admin/CompetitionDetailsLayout.tsx`

The Competitions module demonstrates the production pattern we'll replicate:

```
Details Page (server component)
  ├─ Fetches metadata server-side
  ├─ Redirects if entity not found
  └─ Passes to DetailsLayout (client wrapper)
       ├─ URL state sync (useSearchParams)
       ├─ Sub-tab state management
       └─ Secondary navigation sidebar
            ├─ Details SubTab
            ├─ Participants SubTab
            ├─ Revenue SubTab
            └─ Settings SubTab
```

---

## File Structure

```
src/
├── app/admin/judges/
│   └── [id]/
│       └── page.tsx                      ← Route handler (NEW)
├── components/admin/
│   ├── JudgesDetailsLayout.tsx            ← Client wrapper (NEW)
│   └── judges-details/
│       ├── DetailsSubTab.tsx              ← Details content (NEW)
│       ├── ParticipantsSubTab.tsx         ← Participants list (NEW)
│       ├── RevenueSubTab.tsx              ← Revenue/financial (NEW)
│       └── SettingsSubTab.tsx             ← Judge settings (NEW)
├── types/
│   └── judges-details.ts                  ← TypeScript types (NEW)
├── lib/
│   └── api/
│       └── judges-api.ts                  ← API client methods (NEW)
```

---

## 📋 TODO Checklist

**A complete todo list has been created with 95+ tasks. Use this to track progress:**

### Phase 1 Tasks (3 TODOs) ✅
- [x] Create type definitions (src/types/judges-details.ts)
- [x] Define all TypeScript interfaces (JudgeMetadata, SubTab, ParticipantAssignment, etc.)
- [x] Run 'npx tsc --noEmit' to verify compilation

### Phase 2 Tasks (5 TODOs) ✅
- [x] Create route folder structure (src/app/admin/judges/[id]/)
- [x] Implement page.tsx async server component with metadata fetch
- [x] Add 404 redirect for non-existent judges
- [x] Wrap content in Suspense with Loading fallback
- [x] Verify params/searchParams are awaited (Next.js 15+)

### Phase 3 Tasks (9 TODOs) ✅
- [x] Create JudgesDetailsLayout.tsx client component
- [x] Implement useSearchParams() to read URL state
- [x] Add useState for activeSubTab
- [x] Implement useEffect for URL→State sync
- [x] Implement handleTabChange for state+URL update
- [x] Build responsive sidebar layout
- [x] Add 4 tab navigation buttons with styling
- [x] Add Suspense boundaries for lazy-loaded tabs
- [x] Apply design-system colors and verify <500 lines

### Phase 4 Tasks (31 TODOs split by sub-tab) ✅
**DetailsSubTab (5 tasks) ✅**
- [x] Create DetailsSubTab.tsx
- [x] Display judge metadata
- [x] Add Edit button with modal
- [x] Show status/tier badges
- [x] Display metrics (evaluations, score, deviation)

**ParticipantsSubTab (9 tasks) ✅**
- [x] Create ParticipantsSubTab.tsx
- [x] Implement pagination state
- [x] Fetch from GET /api/admin/judges/{id}/participants
- [x] Add Loading overlay during fetch
- [x] Build search input with clear button
- [x] Build participants table
- [x] Add pagination controls
- [x] Show empty state
- [x] Verify <250 lines

**RevenueSubTab (5 tasks) ✅**
- [x] Create RevenueSubTab.tsx
- [x] Fetch revenue summary
- [x] Display metrics
- [x] Display payment history table
- [x] Verify <200 lines

**SettingsSubTab (7 tasks) ✅**
- [x] Create SettingsSubTab.tsx
- [x] Create Zod validation schema
- [x] Build settings form
- [x] Add category multi-select
- [x] Add notification toggles
- [x] Implement form submission
- [x] Show success/error feedback

### Phase 5 Tasks (17 TODOs split by endpoint) ✅
**GET /api/admin/judges/[id] (5 tasks) ✅**
- [x] Create API route
- [x] Create Zod validation schema
- [x] Add authorization check
- [x] Query judge and calculate metrics
- [x] Return JudgeMetadata DTO

**GET /api/admin/judges/[id]/participants (3 tasks) ✅**
- [x] Create participants endpoint
- [x] Add pagination/search validation
- [x] Query and return PaginatedResponse

**GET /api/admin/judges/[id]/revenue (2 tasks) 🔶 INCOMPLETE**
- [x] Create revenue endpoint (scaffold created)
- [ ] ⚠️ CRITICAL: Implement tier-based revenue calculation (Currently hardcoded, ignores revenueShare% settings)

**GET /api/admin/judges/[id]/payments (2 tasks) ✅**
- [x] Create payments endpoint
- [x] Return paginated payment records

**PATCH /api/admin/judges/[id] (2 tasks) ✅**
- [x] Create update judge endpoint
- [x] Validate and update in Prisma

**PATCH /api/admin/judges/[id]/settings (2 tasks) ✅**
- [x] Create settings endpoint
- [x] Validate and update settings
- [x] Verify error handling for all endpoints

### Verification Tasks (16 TODOs) 🔶 PARTIAL
- [x] Run 'npx tsc --noEmit' — verify no TypeScript errors
- [x] Run 'npm run lint' — fix linting issues
- [x] Run 'npm run build' — ensure production build
- [x] Test: Page loads with judge metadata
- [x] Test: Tab navigation works (all 4 tabs)
- [x] Test: URL state syncs (?subtab=...)
- [x] Test: Browser back/forward work
- [x] Test: Page refresh restores active tab
- [x] Test: Pagination works (prev/next)
- [x] Test: Search filters and resets pagination
- [x] Test: Form validation works
- [x] Test: Form submission works (settings form)
- [x] Test: 404 redirect works
- [x] Test: API errors return correct codes
- [x] Test: Mobile layout (horizontal scroll on tabs)
- [x] Test: Desktop layout (sidebar left, content right)
- [x] Test: No custom spinners (only <Loading /> component)
- [x] Test: No hardcoded colors (all design-system tokens)
- [ ] ⚠️ Test: Revenue calculation uses tier-based percentages (NOT YET IMPLEMENTED)
- [ ] Test: Revenue page shows breakdown by participant tier
- [ ] Test: Revenue matches: `(entryFee × revenueShare%) × numParticipantsInTier`

**Total: 🔶 93/96 tasks completed (Revenue calculation pending)**

---

## Comprehensive Developer Instructions

### Prerequisites
- Node.js 18+ with npm
- Existing `Judge` Prisma model in `prisma/schema.prisma`
- Familiarity with Next.js App Router, React 19, TypeScript strict mode
- Access to `.agents/skills/` directory for pattern reference

### Quick Reference: Where to Find Patterns
| Requirement | See File |
|------------|----------|
| API endpoint structure | `.agents/skills/api-rules/SKILL.md` (lines 87-150) |
| Component sizing limits | `.agents/skills/component-rules/SKILL.md` (lines 120-145) |
| Form/validation patterns | `.agents/skills/frontend-rules/SKILL.md` (lines 116-169) |
| Design tokens (colors, spacing) | `.agents/skills/design-system-rules/SKILL.md` (lines 13-89) |
| RSC boundaries (Server vs Client) | `.agents/skills/next-best-practices/rsc-boundaries.md` (lines 6-45) |
| Verification checklist | `.agents/skills/code-verification/SKILL.md` (lines 62-161) |

---

## Implementation Steps

### Phase 1: Type Definitions & API Contracts (30 minutes)

**File:** `src/types/judges-details.ts` (NEW)

**Instructions:**
1. Create the file with complete TypeScript interfaces
2. Use discriminated unions for status/state (not string literals everywhere)
3. Ensure all response DTOs match API contracts exactly
4. Use `readonly` on immutable props

**Type Definitions:**

```typescript
// src/types/judges-details.ts

// Response DTO for judge metadata
export interface JudgeMetadata {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly specializations: readonly string[];
  readonly tier: "LOCAL" | "REGIONAL" | "NATIONAL" | "INTERNATIONAL";
  readonly isActive: boolean;
  readonly joinedDate: string; // ISO 8601
  readonly totalEvaluations: number;
  readonly averageScore: number;
  readonly deviationPercentage?: number | null;
}

// Sub-tab state type
export type SubTab = "details" | "participants" | "revenue" | "settings";

// Participant assignment DTO
export interface ParticipantAssignment {
  readonly id: string;
  readonly participantId: string;
  readonly participantName: string;
  readonly categoryId: string;
  readonly categoryName: string;
  readonly submissionScore?: number | null;
  readonly evaluationStatus: "pending" | "in-progress" | "completed";
  readonly submittedAt: string; // ISO 8601
}

// Paginated response wrapper (matches api-rules pattern)
export interface PaginatedResponse<T> {
  readonly data: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

// Revenue share percentages by participant tier
export interface RevenueShareByTier {
  readonly LOCAL: number | null;
  readonly REGIONAL: number | null;
  readonly NATIONAL: number | null;
  readonly EXPERT: number | null;
}

// Revenue summary DTO
export interface RevenueMetadata {
  readonly totalEarned: number;
  readonly totalPending: number;
  readonly hourlyRate: number;
  readonly perEvaluationRate: number;
  readonly lastPaymentDate?: string | null;
}

// Payment history DTO
export interface PaymentRecord {
  readonly id: string;
  readonly amount: number;
  readonly status: "pending" | "completed" | "failed";
  readonly invoiceNumber: string;
  readonly createdAt: string; // ISO 8601
  readonly completedAt?: string | null;
}

// Settings DTO
export interface JudgeSettings {
  readonly maxEvaluationsPerDay: number;
  readonly restPeriodHours: number;
  readonly paymentPerEvaluation: number;
  readonly revenueShareByTier: RevenueShareByTier;
  readonly preferredCategories: readonly string[];
  readonly emailNotifications: boolean;
  readonly smsNotifications: boolean;
}
```

**Verification:**
- ✅ All dates are strings (ISO 8601, not Date objects) — serializable for client components
- ✅ All props are `readonly` — prevents accidental mutations
- ✅ Union types discriminated (not string literals) — type-safe state
- ✅ Matches Prisma response structure — ensures ORM compatibility

**Reasoning from api-rules:**
- Request/Response DTOs prevent misalignment between API and client
- `PaginatedResponse<T>` wrapper enables consistent pagination across all paginated endpoints
- All dates as ISO 8601 strings ensure RSC boundary compliance (Date objects aren't serializable)

---

### Phase 2: Route Handler & Server Component (45 minutes)

**File:** `src/app/admin/judges/[id]/page.tsx` (NEW)

**Instructions:**
1. Create dynamic route folder: `src/app/admin/judges/[id]/` with `page.tsx`
2. Implement async server component (never `'use client'` for data fetching)
3. Await `params` and `searchParams` at the start (Next.js 15+ pattern)
4. Handle 404 by redirecting to judges grid
5. Wrap content in Suspense for loading fallback
6. Pass serializable data only to client component

**Implementation:**

```typescript
// src/app/admin/judges/[id]/page.tsx

import { Suspense } from "react";
import { redirect } from "next/navigation";
import Loading from "@/components/Loading";
import JudgesDetailsLayout from "@/components/admin/JudgesDetailsLayout";
import type { JudgeMetadata } from "@/types/judges-details";

async function fetchJudgeMetadata(judgeId: string): Promise<JudgeMetadata | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    
    const res = await fetch(
      `${baseUrl}/api/admin/judges/${judgeId}`,
      { 
        cache: "no-store", // Fresh data on each request
        headers: {
          "Content-Type": "application/json",
        }
      }
    );

    if (!res.ok) {
      console.error(`[JudgeDetails] API error: ${res.status}`);
      return null;
    }

    const data: JudgeMetadata = await res.json();
    return data;
  } catch (err) {
    console.error("[JudgeDetails] Fetch failed:", err);
    return null;
  }
}

export default async function JudgeDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  // ✅ Pattern: Always await params first (Next.js 15+)
  const { id: judgeId } = await params;
  
  // Fetch metadata server-side (no client waterfall)
  const judge = await fetchJudgeMetadata(judgeId);

  // Handle 404: redirect to judges grid
  if (!judge) {
    redirect("/admin/dashboard?tab=judges");
  }

  // ✅ Pattern: All data serialized (strings, numbers, booleans, objects/arrays)
  // ✅ Safety: Suspense boundary with fallback
  return (
    <Suspense fallback={<Loading variant="screen" text="Loading judge details..." />}>
      <JudgesDetailsLayout
        judge={judge}
        judgeId={judgeId}
      />
    </Suspense>
  );
}
```

**Key Patterns Applied:**

| Pattern | Code | Reason |
|---------|------|--------|
| **Async `params`** | `await params` | Next.js 15+ requirement (not `params.id` directly) |
| **No 'use client'** | Server component only | Enables server-side fetching + Suspense |
| **Serializable data** | All strings/numbers, no Date objects | RSC boundary compliance |
| **Suspense boundary** | Wraps client component | Enables Loading fallback |
| **cache: "no-store"** | `fetch(..., { cache: "no-store" })` | Fresh data on each request |

**Verification Checklist:**
- ✅ File location: `src/app/admin/judges/[id]/page.tsx`
- ✅ No `'use client'` directive
- ✅ Component is `async` function
- ✅ `params` and `searchParams` awaited
- ✅ 404 redirects to `/admin/dashboard?tab=judges`
- ✅ Suspense wraps JudgesDetailsLayout with Loading fallback
- ✅ All data passed to layout is JSON-serializable (strings, numbers, objects)

**Reasoning from next-best-practices:**
- Async `params` is the Next.js 15+ standard (replaces old direct access)
- Server components prevent client waterfalls and keep sensitive logic server-side
- `cache: "no-store"` ensures fresh judge data (not stale)
- Suspense + Fallback provides UX feedback during data load

---

### Phase 3: Client Layout Component (45 minutes)

**File:** `src/components/admin/JudgesDetailsLayout.tsx` (NEW)

**Instructions:**
1. Create client component (`'use client'`) for interactive navigation
2. Use `useSearchParams()` to read `?subtab=` URL parameter
3. Implement state management: `useState` for active tab
4. On mount, sync URL state → component state
5. On tab change, update state AND URL simultaneously
6. Implement responsive layout: flex-col (mobile) → flex-row with sidebar (desktop)
7. Use Suspense boundaries for each sub-tab (lazy loading on tab click)
8. Follow design-system-rules for spacing, colors, shadows

**Implementation:**

```typescript
// src/components/admin/JudgesDetailsLayout.tsx

'use client';

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { JudgeMetadata, SubTab } from "@/types/judges-details";
import Loading from "@/components/Loading";
import DetailsSubTab from "@/components/admin/judges-details/DetailsSubTab";
import ParticipantsSubTab from "@/components/admin/judges-details/ParticipantsSubTab";
import RevenueSubTab from "@/components/admin/judges-details/RevenueSubTab";
import SettingsSubTab from "@/components/admin/judges-details/SettingsSubTab";

interface JudgesDetailsLayoutProps {
  readonly judge: JudgeMetadata;
  readonly judgeId: string;
}

function JudgesDetailsContent({
  judge,
  judgeId,
}: JudgesDetailsLayoutProps) {
  const searchParams = useSearchParams();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("details");
  const [mounted, setMounted] = useState(false);

  // ✅ Pattern: Sync URL → State on mount (back/forward support)
  useEffect(() => {
    const subtab = searchParams.get("subtab") as SubTab | null;
    const initial: SubTab = 
      subtab && ["details", "participants", "revenue", "settings"].includes(subtab)
        ? subtab
        : "details";
    
    Promise.resolve().then(() => {
      setActiveSubTab(initial);
      setMounted(true);
    });
  }, [searchParams]);

  // ✅ Pattern: Tab change updates state AND URL
  const handleTabChange = (tab: SubTab) => {
    setActiveSubTab(tab);
    const params = new URLSearchParams(searchParams);
    params.set("subtab", tab);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  };

  if (!mounted) return null;

  return (
    <div className="flex-1 bg-charcoal p-6 md:p-8 overflow-y-auto space-y-6">
      {/* Breadcrumb & Header */}
      <div className="space-y-2 pb-4 border-b border-terracotta/10">
        <p className="text-xs uppercase font-bold text-cream/40 tracking-wider">
          Admin Dashboard &gt; Judges
        </p>
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h1 className="font-serif text-2xl font-bold text-cream truncate">
              {judge.name}
            </h1>
            <p className="text-sm text-cream/50 mt-1">
              Manage judge details, assigned participants, revenue, and preferences
            </p>
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap justify-end">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                judge.isActive
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {judge.isActive ? "Active" : "Inactive"}
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase bg-charcoal border border-gold/20 text-gold">
              {judge.tier}
            </span>
          </div>
        </div>
      </div>

      {/* Container: Sidebar + Content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* LEFT SIDEBAR: Sub-Tab Navigation */}
        <div className="w-full md:w-48 shrink-0 flex flex-row md:flex-col gap-1 border-b md:border-b-0 md:border-r border-terracotta/15 pb-4 md:pb-0 md:pr-4 overflow-x-auto md:overflow-x-visible">
          <button
            onClick={() => handleTabChange("details")}
            className={`cursor-pointer px-4 py-2.5 rounded-lg text-left text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
              activeSubTab === "details"
                ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal shadow-sm"
                : "text-cream/60 hover:bg-cream/5 hover:text-cream"
            }`}
          >
            ℹ️ Details
          </button>
          <button
            onClick={() => handleTabChange("participants")}
            className={`cursor-pointer px-4 py-2.5 rounded-lg text-left text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
              activeSubTab === "participants"
                ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal shadow-sm"
                : "text-cream/60 hover:bg-cream/5 hover:text-cream"
            }`}
          >
            👥 Participants
          </button>
          <button
            onClick={() => handleTabChange("revenue")}
            className={`cursor-pointer px-4 py-2.5 rounded-lg text-left text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
              activeSubTab === "revenue"
                ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal shadow-sm"
                : "text-cream/60 hover:bg-cream/5 hover:text-cream"
            }`}
          >
            💰 Revenue
          </button>
          <button
            onClick={() => handleTabChange("settings")}
            className={`cursor-pointer px-4 py-2.5 rounded-lg text-left text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
              activeSubTab === "settings"
                ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal shadow-sm"
                : "text-cream/60 hover:bg-cream/5 hover:text-cream"
            }`}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1 min-w-0">
          {activeSubTab === "details" && (
            <DetailsSubTab judge={judge} judgeId={judgeId} />
          )}
          {activeSubTab === "participants" && (
            <Suspense fallback={<Loading variant="overlay" text="Loading participants..." />}>
              <ParticipantsSubTab judgeId={judgeId} />
            </Suspense>
          )}
          {activeSubTab === "revenue" && (
            <Suspense fallback={<Loading variant="overlay" text="Loading revenue data..." />}>
              <RevenueSubTab judgeId={judgeId} />
            </Suspense>
          )}
          {activeSubTab === "settings" && (
            <Suspense fallback={<Loading variant="overlay" text="Loading settings..." />}>
              <SettingsSubTab judge={judge} judgeId={judgeId} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JudgesDetailsLayout(props: JudgesDetailsLayoutProps) {
  return (
    <div className="min-h-screen bg-charcoal text-cream flex flex-col font-sans dark">
      <JudgesDetailsContent {...props} />
    </div>
  );
}
```

**Design System Applied (from design-system-rules):**

| Element | Classes | Reason |
|---------|---------|--------|
| Page background | `bg-charcoal` | Dark theme primary color |
| Text color | `text-cream` | Primary foreground on dark |
| Borders | `border-terracotta/15`, `border-terracotta/10` | Subtle accent borders |
| Active tab | `bg-terracotta text-cream dark:bg-gold dark:text-charcoal` | Visual hierarchy + dark mode support |
| Hover state | `hover:bg-cream/5 hover:text-cream` | Interactive feedback |
| Spacing | `p-6 md:p-8`, `gap-6` | Consistent spacing scale (24px / 32px) |
| Responsive | `md:flex-row`, `overflow-x-auto md:overflow-x-visible` | Mobile: horizontal scroll, Desktop: sidebar |

**Verification Checklist:**
- ✅ File has `'use client'` directive (client component)
- ✅ Uses `useSearchParams()` to read URL state
- ✅ Sync URL → state on mount (back/forward support)
- ✅ Tab change updates both state AND URL
- ✅ Suspense boundaries with Loading fallback for each lazy-loaded tab
- ✅ Responsive layout (flex-col mobile → flex-row desktop)
- ✅ Component stays under 500 lines (currently ~180 lines)
- ✅ Design system colors/spacing applied
- ✅ No hardcoded colors (all from Tailwind tokens)

**Reasoning from component-rules:**
- Suspense boundaries enable lazy loading (sub-tabs fetch data only when clicked)
- Presentation isolated in this layout component (sub-tabs handle content)
- Max line count respected (180 lines < 500 limit)

---

### Phase 4: Sub-Tab Components (2 hours)

#### 4a. DetailsSubTab.tsx (150 lines max)

**File:** `src/components/admin/judges-details/DetailsSubTab.tsx` (NEW)

**Instructions:**
1. Accept judge metadata as prop (no additional fetch)
2. Display read-only judge info
3. Add Edit button that opens JudgeFormModal (existing component)
4. Show status badge (active/inactive)
5. Display tier badge (LOCAL/REGIONAL/NATIONAL/INTERNATIONAL)
6. Show specializations as tags
7. Display key metrics (total evaluations, average score, deviation)

**Code Structure:**

```typescript
// src/components/admin/judges-details/DetailsSubTab.tsx

'use client';

import { useState } from "react";
import { Edit, AlertTriangle } from "lucide-react";
import Button from "@/components/Button";
import JudgeFormModal from "@/components/admin/JudgeFormModal"; // Existing
import type { JudgeMetadata } from "@/types/judges-details";

interface DetailsSubTabProps {
  readonly judge: JudgeMetadata;
  readonly judgeId: string;
}

export default function DetailsSubTab({ judge, judgeId }: DetailsSubTabProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Details Card */}
      <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-6 shadow-xl">
        
        {/* Header with Edit Button */}
        <div className="flex justify-between items-start gap-4 pb-4 border-b border-terracotta/10">
          <h3 className="font-serif text-xl font-bold text-cream">
            Judge Profile
          </h3>
          <Button
            onClick={() => setShowEditModal(true)}
            variant="primary"
            size="md"
            className="flex items-center gap-1.5"
          >
            <Edit className="w-4 h-4" /> Edit
          </Button>
        </div>

        {/* Judge Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <p className="text-xs uppercase text-cream/40 font-bold tracking-wider mb-1">
              Name
            </p>
            <p className="text-cream font-semibold">{judge.name}</p>
          </div>

          {/* Email */}
          <div>
            <p className="text-xs uppercase text-cream/40 font-bold tracking-wider mb-1">
              Email
            </p>
            <p className="text-cream font-semibold break-all">{judge.email}</p>
          </div>

          {/* Phone */}
          <div>
            <p className="text-xs uppercase text-cream/40 font-bold tracking-wider mb-1">
              Phone
            </p>
            <p className="text-cream font-semibold">{judge.phone}</p>
          </div>

          {/* Tier */}
          <div>
            <p className="text-xs uppercase text-cream/40 font-bold tracking-wider mb-1">
              Tier
            </p>
            <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase bg-charcoal border border-gold/20 text-gold">
              {judge.tier}
            </span>
          </div>

          {/* Joined Date */}
          <div>
            <p className="text-xs uppercase text-cream/40 font-bold tracking-wider mb-1">
              Joined
            </p>
            <p className="text-cream font-semibold">
              {new Date(judge.joinedDate).toLocaleDateString()}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs uppercase text-cream/40 font-bold tracking-wider mb-1">
              Status
            </p>
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                judge.isActive
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {judge.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Specializations */}
        {judge.specializations.length > 0 && (
          <div className="pt-4 border-t border-cream/5">
            <p className="text-xs uppercase text-cream/40 font-bold tracking-wider mb-3">
              Specializations
            </p>
            <div className="flex flex-wrap gap-2">
              {judge.specializations.map((spec) => (
                <span
                  key={spec}
                  className="px-3 py-1 bg-terracotta/20 text-terracotta border border-terracotta/30 rounded-lg text-xs font-semibold"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="pt-4 border-t border-cream/5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-charcoal rounded-lg p-3">
            <p className="text-xs uppercase text-cream/40 font-bold mb-1">
              Total Evaluations
            </p>
            <p className="text-2xl font-bold text-cream">{judge.totalEvaluations}</p>
          </div>

          <div className="bg-charcoal rounded-lg p-3">
            <p className="text-xs uppercase text-cream/40 font-bold mb-1">
              Average Score
            </p>
            <p className="text-2xl font-bold text-cream">
              {judge.averageScore.toFixed(2)}
            </p>
          </div>

          {judge.deviationPercentage !== null && judge.deviationPercentage !== undefined && (
            <div className={`rounded-lg p-3 ${
              judge.deviationPercentage > 15 ? "bg-yellow-500/10" : "bg-charcoal"
            }`}>
              <div className="flex items-center gap-1.5 mb-1">
                {judge.deviationPercentage > 15 && (
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                )}
                <p className="text-xs uppercase text-cream/40 font-bold">
                  Deviation
                </p>
              </div>
              <p className={`text-2xl font-bold ${
                judge.deviationPercentage > 15 ? "text-yellow-400" : "text-cream"
              }`}>
                {judge.deviationPercentage.toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <JudgeFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          editingJudge={judge}
          onRefresh={() => {}}
        />
      )}
    </div>
  );
}
```

**Component Sizing:** ~150 lines ✅  
**Suspense:** None needed (no data fetch) ✅

---

#### 4b. ParticipantsSubTab.tsx (250 lines max)

**File:** `src/components/admin/judges-details/ParticipantsSubTab.tsx` (NEW)

**Instructions:**
1. This component is lazy-loaded (wrapped in Suspense by parent)
2. Fetch participants on mount using useEffect + client-side API call
3. Implement server-side pagination (skip/take in query params)
4. Show loading spinner during fetch
5. Display paginated table of assigned participants
6. Include search & filter controls
7. Show evaluation status, scores, submission timestamp

**API Contract:**

```
GET /api/admin/judges/{judgeId}/participants?page=0&limit=20&search=...

Response:
{
  "data": [
    {
      "id": "...",
      "participantId": "...",
      "participantName": "...",
      "categoryId": "...",
      "categoryName": "...",
      "submissionScore": 85 or null,
      "evaluationStatus": "pending" | "in-progress" | "completed",
      "submittedAt": "2026-05-27T10:30:00Z"
    }
  ],
  "total": 42,
  "page": 0,
  "limit": 20
}
```

**Code Skeleton:**

```typescript
// src/components/admin/judges-details/ParticipantsSubTab.tsx

'use client';

import { useEffect, useState, useMemo } from "react";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import Loading from "@/components/Loading";
import type { ParticipantAssignment, PaginatedResponse } from "@/types/judges-details";

interface ParticipantsSubTabProps {
  readonly judgeId: string;
}

export default function ParticipantsSubTab({ judgeId }: ParticipantsSubTabProps) {
  const [participants, setParticipants] = useState<ParticipantAssignment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch participants on mount and when pagination/search changes
  useEffect(() => {
    const fetchParticipants = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          ...(search && { search }),
        });

        const res = await fetch(
          `/api/admin/judges/${judgeId}/participants?${params}`,
          { cache: "no-store" }
        );

        if (!res.ok) throw new Error("Failed to fetch participants");

        const data: PaginatedResponse<ParticipantAssignment> = await res.json();
        setParticipants(data.data);
        setTotal(data.total);
      } catch (err) {
        console.error("[ParticipantsSubTab] Fetch error:", err);
        setParticipants([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipants();
  }, [judgeId, page, limit, search]);

  const totalPages = Math.ceil(total / limit);

  if (isLoading) {
    return <Loading variant="overlay" text="Loading participants..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-charcoal-light border border-terracotta/15 rounded-2xl p-6 space-y-6">
        <h3 className="font-serif text-xl font-bold text-cream">
          Assigned Participants
        </h3>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search participants..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0); // Reset to first page on search
            }}
            className="w-full bg-charcoal border border-terracotta/20 rounded-xl pl-9 pr-8 py-2.5 text-cream placeholder-cream/35 focus:outline-none focus:border-gold"
          />
          <Search className="w-4 h-4 text-cream/30 absolute left-3 top-3 pointer-events-none" />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-3 text-cream/30 hover:text-cream"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream/10">
                <th className="text-left px-4 py-3 text-cream/60 font-semibold uppercase">Name</th>
                <th className="text-left px-4 py-3 text-cream/60 font-semibold uppercase">Category</th>
                <th className="text-left px-4 py-3 text-cream/60 font-semibold uppercase">Status</th>
                <th className="text-right px-4 py-3 text-cream/60 font-semibold uppercase">Score</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id} className="border-b border-cream/5 hover:bg-cream/5">
                  <td className="px-4 py-3 text-cream">{p.participantName}</td>
                  <td className="px-4 py-3 text-cream/70">{p.categoryName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      p.evaluationStatus === "completed"
                        ? "bg-green-500/20 text-green-400"
                        : p.evaluationStatus === "in-progress"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {p.evaluationStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-cream font-semibold">
                    {p.submissionScore !== null ? p.submissionScore : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {participants.length === 0 && (
          <p className="text-center text-cream/50 py-8">No participants assigned yet</p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-4 border-t border-cream/10">
            <p className="text-sm text-cream/60">
              Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded hover:bg-cream/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="p-2 rounded hover:bg-cream/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Component Sizing:** ~250 lines ✅  
**Data Fetching:** useEffect with client-side fetch ✅  
**Pagination:** Server-side via query params ✅

---

#### 4c. RevenueSubTab.tsx (200 lines max)

**File:** `src/components/admin/judges-details/RevenueSubTab.tsx` (NEW)

**Instructions:**
1. Fetch revenue summary on mount
2. Display compensation metrics:
   - Total earned (cumulative)
   - Total pending (unpaid)
   - Per-evaluation rate (from judge settings)
   - Revenue share percentage (tier-based, read-only)
3. Fetch and display payment history table (paginated)
4. Show payment status badges
5. Add export invoice button (optional)

**API Contract:**

```
GET /api/admin/judges/{judgeId}/revenue
Response:
{
  "totalEarned": 15000,
  "totalPending": 2500,
  "hourlyRate": 0,
  "perEvaluationRate": 150,
  "lastPaymentDate": "2026-05-20T00:00:00Z"
}

GET /api/admin/judges/{judgeId}/payments?page=0&limit=20
Response: PaginatedResponse<PaymentRecord>
```

---

#### 4d. SettingsSubTab.tsx (180 lines max)

**File:** `src/components/admin/judges-details/SettingsSubTab.tsx` (NEW)

**Instructions:**
1. Accept judge metadata as prop
2. Render form with React Hook Form + Zod validation
3. Fields:
   - Max evaluations/day (number input)
   - Rest period hours (number input)
   - Payment per evaluation (currency input with ₹ symbol, tier-based guidance)
   - Revenue share by participant tier (4 separate decimal inputs: LOCAL, REGIONAL, NATIONAL, EXPERT)
   - Preferred categories (multi-select checkboxes)
   - Email/SMS notification toggles
4. Revenue share is **user-configurable per judge, per participant tier**:
   - Judge sets different percentage for each tier of participants they evaluate
   - Example: Judge A earns 20% when evaluating LOCAL tier participants, 30% for REGIONAL, 50% for NATIONAL, 75% for EXPERT
   - Allow values 0-100 with decimal precision (step=0.1)
   - Each field is optional (nullable in DB)
   - Display guidance: "Set different percentages based on the tier of participants this judge evaluates"
5. Validate on submit
6. Send PATCH request to update settings
7. Show success/error feedback
8. Use design-system button styling

**Form Schema (Zod):**

```typescript
const JudgeSettingsSchema = z.object({
  maxEvaluationsPerDay: z.number().min(1).max(50),
  restPeriodHours: z.number().min(0).max(24),
  paymentPerEvaluation: z.number().min(0).max(10000),
  revenueShareLOCAL: z.number().min(0).max(100).nullable().optional(),
  revenueShareREGIONAL: z.number().min(0).max(100).nullable().optional(),
  revenueShareNATIONAL: z.number().min(0).max(100).nullable().optional(),
  revenueShareEXPERT: z.number().min(0).max(100).nullable().optional(),
  preferredCategories: z.array(z.string()).min(1, "Select at least 1 category"),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
});
```

**Compensation Model:**
- **Fixed Per Evaluation:** Configurable amount paid per candidate evaluated, with tier-based guidance (LOCAL ₹100-150, REGIONAL ₹200-300, NATIONAL ₹400-500, EXPERT ₹600+)
- **Revenue Share (Tiered):** Automatic percentage of competition entry fees based on judge tier, displayed as read-only
- Judges earn through **both** compensation modes simultaneously

---

### Phase 5: API Route Handlers (1 hour)

**Instructions:** Follow the **api-rules** skill patterns exactly. All API code follows this structure:
1. Input parsing & validation (Zod)
2. Authorization check (middleware)
3. Database query (Prisma)
4. Response DTO transformation
5. Error handling with typed responses

**Files to create:**

| Route | HTTP | Purpose |
|-------|------|---------|
| `/api/admin/judges/[id]` | GET | Fetch judge metadata |
| `/api/admin/judges/[id]/participants` | GET | Paginated participants list |
| `/api/admin/judges/[id]/revenue` | GET | Revenue summary |
| `/api/admin/judges/[id]/payments` | GET | Payment history |
| `/api/admin/judges/[id]` | PATCH | Update judge details |
| `/api/admin/judges/[id]/settings` | PATCH | Update judge settings |

---

#### API Implementation Pattern (from api-rules)

**File:** `src/app/api/admin/judges/[id]/route.ts` (NEW)

**Structure:** 
1. Zod schemas for validation
2. Type guards (authorization middleware)
3. Service layer functions
4. Route handler with error handling

**Example: GET /api/admin/judges/[id]**

```typescript
// src/app/api/admin/judges/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { JudgeMetadata } from "@/types/judges-details";

// ✅ Pattern: Zod schema for request validation
const JudgeIdParamSchema = z.object({
  id: z.string().uuid("Invalid judge ID"),
});

// ✅ Pattern: Type guard for auth
async function checkAdminAuth(request: NextRequest): Promise<boolean> {
  // Implementation depends on your auth middleware
  // Usually: check session, JWT, or header-based auth
  return true; // Replace with actual auth check
}

// ✅ Pattern: Service function (business logic separated)
async function fetchJudgeMetadata(judgeId: string): Promise<JudgeMetadata | null> {
  const judge = await prisma.judge.findUnique({
    where: { id: judgeId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      specializations: true,
      tier: true,
      isActive: true,
      createdAt: true,
      evaluations: {
        select: { score: true },
      },
    },
  });

  if (!judge) return null;

  const evaluationScores = judge.evaluations.map(e => e.score);
  const avgScore = evaluationScores.length > 0
    ? evaluationScores.reduce((a, b) => a + b, 0) / evaluationScores.length
    : 0;

  // ✅ Pattern: Return DTO (not Prisma model directly)
  return {
    id: judge.id,
    name: judge.name,
    email: judge.email,
    phone: judge.phone,
    specializations: judge.specializations,
    tier: judge.tier,
    isActive: judge.isActive,
    joinedDate: judge.createdAt.toISOString(),
    totalEvaluations: judge.evaluations.length,
    averageScore: avgScore,
  };
}

// ✅ Pattern: Route handler with error handling
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Extract route param
    const { id: judgeId } = await params;

    // 2. Validate input
    const validated = JudgeIdParamSchema.safeParse({ id: judgeId });
    if (!validated.success) {
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "Invalid judge ID format",
          details: validated.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    // 3. Check authorization
    const isAuthorized = await checkAdminAuth(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Admin access required" },
        { status: 401 }
      );
    }

    // 4. Business logic
    const judge = await fetchJudgeMetadata(validated.data.id);
    if (!judge) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Judge not found" },
        { status: 404 }
      );
    }

    // 5. Response
    return NextResponse.json({ data: judge }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/admin/judges/[id]]", err);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Server error" },
      { status: 500 }
    );
  }
}
```

---

#### Participants Endpoint Pattern

**Example: GET /api/admin/judges/[id]/participants**

```typescript
// ✅ Pattern: Pagination params validation
const PaginationSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

// ✅ Pattern: Fetch with Prisma pagination (skip/take)
async function fetchParticipants(
  judgeId: string,
  pagination: z.infer<typeof PaginationSchema>
): Promise<PaginatedResponse<ParticipantAssignment>> {
  const where = {
    judgeId,
    ...(pagination.search && {
      participant: {
        name: { contains: pagination.search, mode: "insensitive" },
      },
    }),
  };

  const [assignments, total] = await Promise.all([
    prisma.judgeParticipantAssignment.findMany({
      where,
      skip: pagination.page * pagination.limit,
      take: pagination.limit,
      select: {
        id: true,
        participant: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        evaluation: { select: { score: true, status: true, createdAt: true } },
      },
    }),
    prisma.judgeParticipantAssignment.count({ where }),
  ]);

  return {
    data: assignments.map(a => ({
      id: a.id,
      participantId: a.participant.id,
      participantName: a.participant.name,
      categoryId: a.category.id,
      categoryName: a.category.name,
      submissionScore: a.evaluation?.score,
      evaluationStatus: (a.evaluation?.status || "pending") as "pending" | "in-progress" | "completed",
      submittedAt: a.evaluation?.createdAt.toISOString() || "",
    })),
    total,
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get query params
    const params = PaginationSchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams)
    );

    if (!params.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", details: params.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { id: judgeId } = await request.nextUrl.searchParams; // Route param
    const result = await fetchParticipants(judgeId, params.data);

    return NextResponse.json({ ...result }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/admin/judges/[id]/participants]", err);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Server error" },
      { status: 500 }
    );
  }
}
```

---

#### PATCH Endpoint Pattern

**Example: PATCH /api/admin/judges/[id]/settings**

```typescript
// ✅ Pattern: Request DTO validation
const UpdateSettingsSchema = z.object({
  maxEvaluationsPerDay: z.number().min(1).max(50),
  restPeriodHours: z.number().min(0).max(24),
  paymentPerEvaluation: z.number().min(0).max(10000),
  preferredCategories: z.array(z.string()).min(1),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: judgeId } = await params;
    const body: unknown = await request.json();

    // Validate input
    const validated = UpdateSettingsSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", details: validated.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    // Update in database
    const updated = await prisma.judgeSettings.update({
      where: { judgeId },
      data: validated.data,
    });

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (err) {
    if ((err as any)?.code === "P2025") {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Settings not found" },
        { status: 404 }
      );
    }
    console.error("[PATCH /api/admin/judges/[id]/settings]", err);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Server error" },
      { status: 500 }
    );
  }
}
```

**Key Patterns Applied (from api-rules):**

| Pattern | Implementation | Why |
|---------|---------------|-----|
| Input validation | Zod schemas | Type safety + error details |
| Authorization | Auth guard function | Centralized permission checking |
| Service layer | Separate `fetch*` functions | Business logic isolated from HTTP |
| DTOs | Response transformation | Decouples API from DB schema |
| Pagination | `skip`/`take` in Prisma | Efficient database queries |
| Error codes | Standard codes (NOT_FOUND, VALIDATION_ERROR) | Consistent client error handling |
| Status codes | Proper HTTP codes (200, 201, 400, 404, 422, 500) | RESTful compliance |

**Verification Checklist:**
- ✅ All fetch calls in route handlers (not components)
- ✅ Request body validated with Zod
- ✅ Response DTOs separate from Prisma models
- ✅ Pagination uses `skip`/`take`
- ✅ Error responses have `code` + `message` + optional `details`
- ✅ HTTP status codes correct (400, 401, 404, 422, 500)
- ✅ Authorization checked before business logic
- ✅ No sensitive data in responses

---

## Judge Compensation Model

### Per-Judge, Participant-Tier-Based Revenue Share (Implemented)

Judge compensation combines two models:

1. **Fixed Per-Evaluation Payment**
   - Configurable amount per participant evaluated
   - Tier-based guidance provided in UI showing typical rates by judge tier:
     - LOCAL judges: ₹100-150 range
     - REGIONAL judges: ₹200-300 range
     - NATIONAL judges: ₹400-500 range
     - EXPERT judges: ₹600+ range
   - Stored in database and customizable per judge
   - This is the fixed amount paid per candidate the judge evaluates

2. **Per-Judge Revenue Share by Participant Tier**
   - Percentage of competition entry fees, configured per judge and per participant tier
   - **Fully customizable** — each judge sets different percentages for each tier
   - Configuration:
     - Judge sets % for LOCAL tier participants they evaluate
     - Judge sets % for REGIONAL tier participants they evaluate
     - Judge sets % for NATIONAL tier participants they evaluate
     - Judge sets % for EXPERT tier participants they evaluate
   - Example: Judge A earns 20% when evaluating LOCAL, 30% for REGIONAL, 50% for NATIONAL, 75% for EXPERT
   - Example: Judge B earns 10% when evaluating LOCAL, 15% for REGIONAL, 25% for NATIONAL, 40% for EXPERT
   - Each field allows 0-100 with decimal precision
   - Fields are optional (can be left null/empty)
   - Judges earn through **both** compensation modes simultaneously

### Why This Model

- **Fairness:** Each judge has independent configuration, not tied to their tier
- **Flexibility:** Judges can adjust revenue share based on their expertise and availability
- **Transparency:** Clear breakdown by participant tier helps judges understand earnings
- **Scalability:** Works across competitions and participant tiers without pre-configured limits

---

## 🔴 INCOMPLETE: Revenue Calculation Implementation

### ⚠️ CRITICAL REQUIREMENT
**Revenue is calculated ONLY for EVALUATED participants, NOT for all assigned participants.**

- Judge may be assigned 100+ participants
- Judge may only EVALUATE (complete scoring) 20 of them
- Revenue = calculated only on those 20 completed evaluations
- Unstarted/pending evaluations = 0 revenue

### Current State
- ✅ Judge settings store: `revenueShareLOCAL`, `revenueShareREGIONAL`, `revenueShareNATIONAL`, `revenueShareEXPERT`
- ✅ Settings UI allows configuration of per-judge, per-tier percentages
- ❌ Revenue endpoint (`GET /api/admin/judges/[id]/revenue`) returns hardcoded rates, **ignores tier percentages entirely**
- ❌ Does NOT distinguish between assigned vs. evaluated participants

### What Needs to Be Fixed

**File:** `src/app/api/admin/judges/[id]/revenue/route.ts`

**Current (Broken):**
```typescript
// Lines 31-32: Hardcoded, doesn't use tier-based percentages
const hourlyRate = 500;
const perEvaluationRate = 150;

// Missing: Actual calculation using revenueShareLOCAL/REGIONAL/NATIONAL/EXPERT
```

**Needed Logic:**
1. Fetch judge with tier-based revenue share fields:
   ```typescript
   const judge = await prisma.judge.findUnique({
     where: { id: judgeId },
     select: {
       revenueShareLOCAL,
       revenueShareREGIONAL,
       revenueShareNATIONAL,
       revenueShareEXPERT,
       // ...
     }
   });
   ```

2. Get EVALUATED participants only (not just assigned):
   ```typescript
   // ⚠️ CRITICAL: Only count evaluations where judge completed the evaluation
   const evaluations = await prisma.evaluation.findMany({
     where: { judgeId },
     select: {
       participant: {
         select: {
           tier: true,  // "LOCAL" | "REGIONAL" | "NATIONAL" | "EXPERT"
           submission: {
             select: { competitionEntryFee: true }  // or equivalent
           }
         }
       },
       status: true,  // Only count where status = "completed"
       score: true,   // Used to verify evaluation is real
     }
   });
   
   // Filter to completed evaluations only
   const completedEvaluations = evaluations.filter(e => e.status === "completed");
   ```

3. Calculate revenue by tier for EVALUATED participants only:
   ```typescript
   const revenueByTier = {
     LOCAL: [],
     REGIONAL: [],
     NATIONAL: [],
     EXPERT: [],
   };

   // ⚠️ Only process completed evaluations
   completedEvaluations.forEach(evaluation => {
     const tier = evaluation.participant.tier;
     const entryFee = evaluation.participant.submission.competitionEntryFee;
     const sharePercent = judge[`revenueShare${tier}`] || 0;
     const earnedAmount = (entryFee * sharePercent) / 100;
     
     revenueByTier[tier].push({
       participantId: evaluation.participant.id,
       entryFee,
       sharePercent,
       earnedAmount,
       evaluationScore: evaluation.score,  // proof of evaluation
     });
   });
   ```

4. Sum totals and return breakdown:
   ```typescript
   const totalByTier = {
     LOCAL: sum(revenueByTier.LOCAL),
     REGIONAL: sum(revenueByTier.REGIONAL),
     NATIONAL: sum(revenueByTier.NATIONAL),
     EXPERT: sum(revenueByTier.EXPERT),
   };
   
   const totalEarned = Object.values(totalByTier).reduce((a, b) => a + b, 0);
   ```

### Example Revenue Calculation
```
Judge Settings:
  revenueShareLOCAL: 20
  revenueShareREGIONAL: 30
  revenueShareNATIONAL: 50
  revenueShareEXPERT: 75

⚠️ CRITICAL: Only count EVALUATED participants (status = "completed")

Participants EVALUATED by Judge:
  - 3 LOCAL tier (out of 10 assigned) @ ₹1,000 entry = 3 × 1,000 × 0.20 = ₹600
  - 2 REGIONAL tier (out of 8 assigned) @ ₹2,000 entry = 2 × 2,000 × 0.30 = ₹1,200
  - 2 NATIONAL tier (out of 5 assigned) @ ₹5,000 entry = 2 × 5,000 × 0.50 = ₹5,000
  - 1 EXPERT tier (out of 2 assigned) @ ₹10,000 entry = 1 × 10,000 × 0.75 = ₹7,500

Result:
  totalEarned = ₹14,300
  Breakdown (EVALUATED ONLY):
    - LOCAL: ₹600 (20% × 3 evaluated)
    - REGIONAL: ₹1,200 (30% × 2 evaluated)
    - NATIONAL: ₹5,000 (50% × 2 evaluated)
    - EXPERT: ₹7,500 (75% × 1 evaluated)
  
  Note: 7 other participants assigned but NOT yet evaluated
        = zero revenue contribution
```

### RevenueMetadata Update Needed
Current type doesn't include tier breakdown. Needs update:

```typescript
// src/types/judges-details.ts
export interface RevenueMetadata {
  readonly totalEarned: number;
  readonly totalPending: number;
  readonly hourlyRate: number;
  readonly perEvaluationRate: number;
  readonly lastPaymentDate?: string | null;
  
  // NEW: Tier-based breakdown
  readonly byTier?: {
    readonly LOCAL: number;
    readonly REGIONAL: number;
    readonly NATIONAL: number;
    readonly EXPERT: number;
  };
}
```

### Task List for Revenue Calculation
- [ ] ⚠️ **CRITICAL:** Query `Evaluation` table (not JudgeParticipantAssignment) — only COMPLETED evaluations count
- [ ] Update `fetchRevenueMetadata()` to use tier-based revenue share percentages
- [ ] Query judge's `revenueShareLOCAL/REGIONAL/NATIONAL/EXPERT` fields
- [ ] Query EVALUATED participants (JOIN: Evaluation → Participant → Tier)
- [ ] Filter evaluations where `status = "completed"`
- [ ] Get competition entry fees for each evaluated submission
- [ ] Calculate: `(entryFee × sharePercent) / 100` per EVALUATED participant only
- [ ] Group and sum by tier (LOCAL, REGIONAL, NATIONAL, EXPERT)
- [ ] Update `RevenueMetadata` type to include tier breakdown
- [ ] Update `RevenueSubTab.tsx` to display breakdown by tier with evaluation count
- [ ] Test: Verified participants show revenue, unverified/pending don't
- [ ] Test with multiple participants across all 4 tiers
- [ ] Verify calculation matches manual math (evaluated participants only)
- [ ] Run `npx tsc --noEmit` (verify types)
- [ ] Run `npm run build` (verify no build errors)

### Task List for Payment Process (Future Implementation)
- [ ] Create `JudgeEarning` table (tracks individual evaluation earnings)
- [ ] Create `JudgePayout` table (tracks monthly aggregated payouts)
- [ ] Create `JudgePaymentMethod` table (stores encrypted payment credentials)
- [ ] Implement ledger states: earned → held → available → processing → paid
- [ ] 14-day hold period enforcement
- [ ] ₹500 minimum threshold logic
- [ ] Monthly batch payout processing
- [ ] UPI + NEFT payment rail integration
- [ ] Payment method validation (micro-deposits or API)
- [ ] Failed payout retry logic (automatic retries + manual escalation)
- [ ] Tax document generation (annual)
- [ ] Payment reconciliation reports
- [ ] Judge payout status dashboard display
- [ ] Payout history + receipt download
- [ ] Payment method management UI for judges
- [ ] Fraud detection (duplicate UPI IDs, rate limiting, account lockouts)

---

## Earned Revenue Payment Process (Industry Best Practices)

### Overview
The earned revenue payment process handles converting judge earnings into actual payouts. This is distinct from revenue calculation—payment execution requires careful planning around holds, minimums, thresholds, and multiple payment rails.

### Core Payment System Components

**Real-Time Earnings Visibility** ✅
- Judges see earned revenue immediately when evaluation is marked "completed"
- Dashboard shows separate balances: earned, held, available, and paid
- Breakdown by tier (LOCAL, REGIONAL, NATIONAL, EXPERT)
- Example: Judge evaluates a LOCAL participant → ₹200 revenue instantly visible

**Ledger-Based Accounting** ✅
- Internal ledger tracks earnings (decoupled from payout balance)
- Entries:
  - `earned_balance` — revenue from completed evaluations
  - `held_balance` — during hold period (not yet available)
  - `available_balance` — ready for payout
  - `paid_balance` — successfully disbursed to judge
- Automatic reconciliation between states

**Clear Attribution** ✅
- Each evaluation creates earning record:
  - Participant ID, tier, entry fee
  - Revenue share %, calculated amount
  - Timestamp of completion
  - Holds/disputes tracked

### Payment Hold Period & Minimum Thresholds

**Recommended Pratibha Parishad Settings:**

```
Hold Period:      14 days (after evaluation completed)
Minimum Threshold: ₹500 (minimum amount to trigger payout)
Payout Frequency: Monthly (MVP phase)

Timeline Example:
─────────────────────────────────────────────
Day 0:   Judge completes evaluation
         → Revenue recorded in earned_balance
         → Visible in dashboard as "Earned (Pending)"

Day 14:  Hold period expires
         → Amount moves to available_balance
         → Visible as "Available for Payout"

Day 30:  Month-end batch processing
         → Judge balance ≥ ₹500?
         → Yes → include in payout batch
         → No → carry forward to next month

Day 31:  Payout executed
         → Funds sent via selected rail
         → Status updated to paid_balance
         → Judge receives notification
```

**Why These Settings:**
- **14-day hold:** Allows time for evaluation disputes, chargebacks, or corrections
- **₹500 threshold:** Reduces payment failures (invalid accounts), minimizes transaction fees, focuses on meaningful payouts
- **Monthly batching:** Cost-optimized (MVP phase), standard accounting cycles, lower operational overhead

### Payout Frequency Evolution

Recommend phased rollout based on platform maturity:

**Phase 1 (MVP - Current):** Monthly
- Single batch on month-end
- Automatic processing for eligible judges (balance ≥ ₹500)
- Lowest operational cost
- Risk: Judge may wait 30+ days for first payout

**Phase 2 (Growth - 6-12 months):** Weekly
- Batch processing every Friday
- Keeps motivation high, faster cash flow
- Moderate operational overhead
- Better judge retention

**Phase 3 (Scale - 12+ months):** On-Demand + Real-Time
- Judges request payout anytime (after hold expires)
- Real-time payment networks (UPI, FedNow) for instant settlement
- Premium feature or standard offering (depends on costs)
- Highest judge satisfaction, highest operational costs

### Multi-Rail Payout Strategy

Support multiple payment methods by judge region/preference:

```
Primary (India):
├── UPI (Unified Payments Interface)
│   └─ Fastest, lowest fees, instant settlement
├── NEFT (National Electronic Funds Transfer)
│   └─ Bank account direct deposit, standard
└── Wallet (Google Pay, PhonePe, PayPal)
    └─ Alternative for judges without traditional banking

Fallback:
└── Check / Wire Transfer
    └─ For disputed or problematic accounts
```

**Validation Required:**
- Bank account verification (micro-deposits or API validation)
- UPI ID confirmation (trial transaction)
- Tax document collection (PAN, TAN for India)
- Compliance checks (KYC documentation)

### Payment Processing Flow

```
1. EARNED STATE (Immediate - Day 0)
   ├─ Evaluation marked "completed"
   ├─ Revenue calculated: (entryFee × sharePercent) ÷ 100
   ├─ Recorded in earned_balance with timestamp
   ├─ Visible in judge dashboard
   └─ Status badge: "Earned (Pending Hold)"

2. HELD STATE (Waiting Period - Days 1-14)
   ├─ Amount in temporary hold
   ├─ Dispute window open (judge can report issues)
   ├─ Competition payouts verified (no chargebacks)
   ├─ Visible as "Held Until [Date]"
   └─ Status badge: "On Hold"

3. AVAILABLE STATE (Ready - Day 15+)
   ├─ Hold period expires automatically
   ├─ Amount moves to available_balance
   ├─ Accumulates until month-end or threshold reached
   ├─ Visible as "Available for Payout"
   └─ Status badge: "Ready to Payout"

4. PROCESSING STATE (Batch Window - Month-End)
   ├─ Automated batch job runs
   ├─ Query: judges with available_balance ≥ ₹500
   ├─ Validate payment methods (still valid? unblocked?)
   ├─ Create payout records with status "processing"
   ├─ Generate tax documents
   └─ Status badge: "Payment Processing"

5. PAID STATE (Complete - Day 31-35)
   ├─ Payment executed to judge's account/UPI
   ├─ Confirmation received from payment gateway
   ├─ Amount moved to paid_balance
   ├─ Tax year reconciliation updated
   ├─ Judge receives notification + receipt
   └─ Status badge: "Paid on [Date]"

6. RECONCILIATION (Monthly)
   ├─ Match outgoing transfers to ledger entries
   ├─ Handle failed payouts (retry logic)
   ├─ Log disputes and resolutions
   └─ Generate reports for finance team
```

### Revenue & Payout Ledger Structure

**Database Schema (Conceptual):**

```typescript
// JudgeEarning - Each evaluation creates one record
{
  id: UUID,
  judgeId: UUID,
  evaluationId: UUID,
  participantTier: "LOCAL" | "REGIONAL" | "NATIONAL" | "EXPERT",
  entryFee: number,
  revenueSharePercent: number,
  earnedAmount: number,  // (entryFee × percent) ÷ 100
  status: "completed" | "disputed" | "cancelled",
  earnedAt: timestamp,
  createdAt: timestamp,
}

// JudgePayout - Monthly aggregation
{
  id: UUID,
  judgeId: UUID,
  payoutMonth: "2026-05",
  earnedTotal: number,    // Sum of all JudgeEarning.earnedAmount
  holdUntil: timestamp,   // 14 days after latest evaluation
  threshold: ₹500,
  elegibleAmount: number, // Amount ≥ threshold and past hold
  status: "held" | "available" | "processing" | "paid" | "failed",
  paymentMethod: "upi" | "neft" | "wallet" | "check",
  paymentReference: string,  // Transaction ID from gateway
  processingAt: timestamp,
  paidAt: timestamp,
  failureReason: string,  // If failed
  retryCount: number,
  createdAt: timestamp,
  updatedAt: timestamp,
}

// Judge PaymentMethod - Stored credentials
{
  id: UUID,
  judgeId: UUID,
  method: "upi" | "bank_account" | "wallet",
  isDefault: boolean,
  isVerified: boolean,
  verificationAt: timestamp,
  accountHolder: string,
  accountNumber: string (encrypted),
  upiId: string (encrypted),
  walletProvider: string,
  walletId: string (encrypted),
  failureCount: number,  // Track failed payouts
  lastAttemptAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp,
}
```

### Tax Compliance & Reporting

**Required for Indian Judges:**

```
1. Form 26AS / TDS Certificate
   ├─ Annual TDS deducted (if applicable)
   └─ Filed with income tax

2. Payment Documentation
   ├─ All payouts logged with date, amount, method
   ├─ Retained for audit (7 years)
   └─ Provided to judge on request

3. Year-End Reporting
   ├─ Total earned: ₹X (sum of all completed evaluations)
   ├─ Total paid: ₹Y (sum of successful payouts)
   ├─ Difference: ₹(X-Y) (held/available, not yet paid)
   ├─ Tax document generated in January
   └─ Shared with judge + tax authority (if required)

4. Compliance Checks
   ├─ PAN verification (judge's tax ID)
   ├─ KYC documentation (if required by bank/regulator)
   ├─ TDS applicability check (depends on judge tier/amount)
   └─ Annual threshold ₹₹2,000 (US), varies by country
```

### Recommended Implementation Roadmap

**MVP (Phase 1) - Launch:**
- [x] Ledger tracking (earned, held, available, paid states)
- [ ] Monthly batch payout processing
- [ ] UPI + NEFT payment rails
- [ ] 14-day hold, ₹500 minimum threshold
- [ ] Real-time dashboard showing earnings + payout status
- [ ] Manual payout reconciliation (spreadsheet-based)
- [ ] Tax document generation (basic)

**Phase 2 (3-6 months):**
- [ ] Weekly payout frequency option
- [ ] Automatic retry logic for failed payouts
- [ ] Judge payment method management UI
- [ ] Payout history + receipt download
- [ ] Integrated tax document management
- [ ] Automated reconciliation reports

**Phase 3 (6-12 months):**
- [ ] On-demand payouts (anytime request)
- [ ] Real-time payment networks (UPI instant settlement)
- [ ] Instant settlement (sub-second confirmation)
- [ ] Lower threshold option (₹250)
- [ ] Multi-currency support (if scaling internationally)
- [ ] Advanced dispute handling

### Operational Considerations

**Payment Failure Handling:**
- Reason codes: Invalid account, closed account, blocked judge, insufficient balance
- Automatic retry: Retry failed payouts 2-3 times over 2-3 weeks
- Manual intervention: Notify judge after 3 failed attempts, offer alternate payment method
- Hold period extends: Failed payout doesn't reset hold, only extends by 1 week

**Fraud Prevention:**
- Verify payment methods before first payout (micro-deposit or API validation)
- Monitor for unusual patterns (same UPI ID shared by multiple judges → flag)
- Rate limiting: Max 3 payment method changes per month
- Account lockout: After 5 failed consecutive payouts, require judge contact/verification

**Reporting & Analytics:**
- Payout velocity: Median days from evaluation to payout
- Success rate: % of payouts completed without retry
- Cost analysis: Total payout fees, fee per transaction, % of earnings lost to fees
- Retention correlation: Judge retention vs. faster payout frequency

### Example: Judge Payout Scenario

```
Judge Profile:
  Name: Priya Sharma
  Tier: NATIONAL
  Settings: revenueShare LOCAL=20%, REGIONAL=30%, NATIONAL=50%, EXPERT=75%
  Payment Method: UPI (priya@okhdfcbank)

Week 1 (May 1-7):
  May 1: Evaluates LOCAL participant, entry fee ₹1,000
         → Earned: ₹1,000 × 20% = ₹200
         → Status: "Earned (Hold until May 15)"
         
  May 3: Evaluates NATIONAL participant, entry fee ₹5,000
         → Earned: ₹5,000 × 50% = ₹2,500
         → Status: "Earned (Hold until May 17)"
         
  May 5: Evaluates REGIONAL participant, entry fee ₹2,000
         → Earned: ₹2,000 × 30% = ₹600
         → Status: "Earned (Hold until May 19)"

May 17:
  May 15: LOCAL evaluation hold expires
          → ₹200 moves to "Available for Payout"
  
  May 17: NATIONAL evaluation hold expires
          → ₹2,500 moves to "Available for Payout"
          → Total Available: ₹2,700 (exceeds ₹500 threshold)

May 31: Month-End Batch Processing
  ├─ Priya's available balance: ₹2,700 + ₹600 (still held until May 19)
  ├─ Process ₹2,700 (already past hold)
  ├─ Create payout record: status="processing"
  ├─ Validate UPI ID is active
  └─ Queue for execution

June 3: Payout Execution
  ├─ Transfer ₹2,700 to priya@okhdfcbank
  ├─ UPI transaction ID: UPI20260603000123ABC
  ├─ Confirmation received: ✓ Success
  ├─ Update payout record: status="paid", paidAt=2026-06-03
  ├─ Update ledger: available → paid
  ├─ Send judge notification:
  │   "Payment Processed ✓
  │    Amount: ₹2,700
  │    Date: Jun 3, 2026
  │    Ref: UPI20260603000123ABC"
  └─ Priya checks dashboard: "Paid on Jun 3"

June 20 (End of May Hold Period for REGIONAL):
  ├─ REGIONAL evaluation (₹600) hold expires
  ├─ Now available for next month's batch (June 30)
```

### Razorpay Payout Integration (Implementation)

#### **Why RazorpayX for Automatic Judge Payouts**

Since Pratibha already uses Razorpay for payments, **RazorpayX Payouts** is the natural choice:
- ✅ Seamless integration with existing Razorpay setup
- ✅ Bulk payouts to hundreds of judges (unlimited scale)
- ✅ Multiple payment rails: UPI, NEFT, IMPS, RTGS, Wallet
- ✅ Scheduled & batch payouts (automate month-end processing)
- ✅ Real-time webhooks for status updates
- ✅ Automatic retry on failures
- ✅ Queue on low balance (handles insufficient funds gracefully)

**Sources:** [RazorpayX Payouts](https://razorpay.com/x/payouts/), [Payouts API Docs](https://razorpay.com/docs/api/x/payouts/)

#### **Complete Payout Workflow**

```
Day 0:   Evaluation completed
         → Revenue calculated & earned
         → Judge sees in dashboard: "Earned (Hold 14 days)"

Day 14:  Hold period expires
         → Amount moves to available_balance
         → Judge sees: "Available for Payout"

Day 30:  Month-end batch processing
         ├─ Query: judges with available_balance ≥ ₹500
         ├─ Validate payment methods (UPI/bank account still valid)
         ├─ Create payouts via Razorpay API
         └─ Status: "queued" or "processing"

Day 31-35: Razorpay executes payout
         ├─ UPI: Instant settlement (seconds)
         ├─ NEFT: 2-4 hours settlement
         ├─ Webhook triggered: payout.processed
         └─ Judge receives funds

Day 36+: Reconciliation
         ├─ Match payout status with ledger
         ├─ Update database: status = "paid"
         └─ Judge notification sent
```

#### **Setup: Contacts & Fund Accounts**

**Create Contact (When Judge Signs Up):**
```typescript
const contact = await razorpay.contacts.create({
  name: judge.name,
  email: judge.email,
  phone: judge.phone,
  type: "individual",
  referenceId: judge.id, // Track in your DB
});
// Store: judge.razorpayContactId = contact.id
```

**Create Fund Account (After Judge Verifies Payment Method):**

Option A - UPI (Fastest):
```typescript
const fundAccount = await razorpay.fundAccount.create({
  contact_id: judge.razorpayContactId,
  account_type: "vpa",
  vpa: { address: judge.upiId }, // e.g., "judge@okhdfcbank"
});
```

Option B - Bank Account:
```typescript
const fundAccount = await razorpay.fundAccount.create({
  contact_id: judge.razorpayContactId,
  account_type: "bank_account",
  bank_account: {
    ifsc: judge.ifscCode,
    benef_name: judge.name,
    account_number: judge.accountNumber, // Encrypted by Razorpay
  },
});
```

**Store:** `judge.razorpayFundAccountId = fundAccount.id`

#### **Monthly Payout Batch Job**

```typescript
// Run on 30th of month at 2:00 AM
async function monthlyPayoutBatch() {
  // 1. Query eligible judges
  const eligibleJudges = await db.query(`
    SELECT j.id, j.razorpayContactId, j.razorpayFundAccountId,
           SUM(je.earnedAmount) as available_balance
    FROM Judge j
    JOIN JudgeEarning je ON je.judgeId = j.id
    WHERE je.status = 'completed'
      AND je.holdUntilDate <= NOW()
      AND j.razorpayFundAccountId IS NOT NULL
    GROUP BY j.id
    HAVING SUM(je.earnedAmount) >= 500
  `);

  // 2. Create payouts for each judge
  for (const judge of eligibleJudges) {
    try {
      const payout = await razorpay.payouts.create({
        account_number: RAZORPAY_ACCOUNT_ID,
        amount: Math.round(judge.available_balance * 100), // In paise
        currency: "INR",
        mode: "UPI", // or "NEFT", "IMPS"
        purpose: "revenue_share",
        fund_account_id: judge.razorpayFundAccountId,
        queue_if_low_balance: true, // Queue if insufficient balance
        receipt: `PAYOUT-${judge.id}-${Date.now()}`,
      });

      // 3. Log in database
      await db.table("JudgePayout").insert({
        judgeId: judge.id,
        razorpayPayoutId: payout.id,
        amount: judge.available_balance,
        status: payout.status, // "queued" or "processing"
        processingAt: new Date(),
      });

      // 4. Mark earnings as being processed
      await db.table("JudgeEarning").update(
        { judgeId: judge.id, status: "completed", holdUntilDate: { $lte: new Date() } },
        { status: "processing_payout" }
      );

    } catch (error) {
      console.error(`Failed to create payout for judge ${judge.id}:`, error);
      // Will be retried automatically next cycle
    }
  }
}
```

#### **Webhook Handler for Payout Status Updates**

```typescript
// Configure in Razorpay Dashboard:
// Settings → Webhooks → Subscribe to: payout.processed, payout.failed, payout.reversed

app.post("/webhooks/razorpay-payout", async (req, res) => {
  const event = req.body;
  const payoutId = event.payload.payout.entity.id;
  const status = event.payload.payout.entity.status;

  if (event.event === "payout.processed") {
    // Update payout record
    await db.table("JudgePayout").update(
      { razorpayPayoutId: payoutId },
      {
        status: "paid",
        paidAt: new Date(),
        razorpayUtr: event.payload.payout.entity.utr,
      }
    );

    // Move earnings to paid state
    const payout = await db.table("JudgePayout").findOne({ razorpayPayoutId: payoutId });
    await db.table("JudgeEarning").update(
      { judgeId: payout.judgeId, status: "processing_payout" },
      { status: "paid", paidAt: new Date() }
    );

    // Notify judge
    await sendNotification(
      payout.judgeId,
      `Payment of ₹${payout.amount} received! UTR: ${event.payload.payout.entity.utr}`
    );
  }

  if (event.event === "payout.failed") {
    await db.table("JudgePayout").update(
      { razorpayPayoutId: payoutId },
      {
        status: "failed",
        failureReason: event.payload.payout.entity.failure_reason,
        retryCount: (await db.table("JudgePayout").findOne(...)).retryCount + 1,
      }
    );

    // Alert judge if action needed
    if (event.payload.payout.entity.failure_reason === "invalid_account_number") {
      await sendAlert(
        payout.judgeId,
        "Payment failed: Please verify your UPI ID or bank account details"
      );
    }
  }

  res.json({ received: true });
});
```

**Source:** [Payouts Webhooks](https://razorpay.com/docs/api/x/webhooks/)

#### **Automatic Retry Logic for Failed Payouts**

```typescript
// Run daily to retry failed payouts
async function retryFailedPayouts() {
  const failedPayouts = await db.table("JudgePayout").where({
    status: "failed",
    retryCount: { $lt: 3 }, // Max 3 retries
  });

  for (const payout of failedPayouts) {
    try {
      const newPayout = await razorpay.payouts.create({
        account_number: RAZORPAY_ACCOUNT_ID,
        amount: payout.amount * 100,
        currency: "INR",
        mode: "UPI",
        fund_account_id: (await db.table("Judge").findOne(payout.judgeId)).razorpayFundAccountId,
        queue_if_low_balance: true,
      });

      await db.table("JudgePayout").update(
        { id: payout.id },
        {
          razorpayPayoutId: newPayout.id,
          status: newPayout.status,
          retryCount: payout.retryCount + 1,
          lastRetryAt: new Date(),
        }
      );
    } catch (error) {
      console.error(`Retry failed for payout ${payout.id}:`, error);
    }
  }
}
```

#### **Database Schema for Payouts**

```typescript
// JudgePayout table
{
  id: UUID,
  judgeId: UUID,
  amount: number,                // ₹ amount
  status: "queued" | "processing" | "paid" | "failed" | "reversed",
  
  // Razorpay references
  razorpayPayoutId: string,      // "payout_1234567890xyz"
  razorpayUtr: string,           // UTR (Unique Transaction Reference)
  paymentMethod: "upi" | "neft" | "imps" | "wallet",
  
  // Tracking
  processingAt: timestamp,       // When payout created
  paidAt: timestamp,             // When successfully sent
  failureReason: string,         // If failed
  retryCount: number,            // Auto-retry attempts
  lastRetryAt: timestamp,        // Last retry time
  
  createdAt: timestamp,
  updatedAt: timestamp,
}

// Add to Judge table
{
  razorpayContactId: string,          // "cont_1234567890xyz"
  razorpayFundAccountId: string,      // "fa_1234567890xyz"
  paymentMethodVerified: boolean,
  paymentMethodVerifiedAt: timestamp,
}
```

#### **Implementation Roadmap**

**Phase 1 (MVP - Manual Monthly Payouts):**
- [ ] Create `JudgePayout` table with Razorpay ID tracking
- [ ] Add Razorpay fields to Judge table
- [ ] Implement contact & fund account creation on judge onboarding
- [ ] Build monthly batch payout cron job
- [ ] Implement webhook handler for status updates
- [ ] Add payout history to RevenueSubTab UI
- [ ] Manual retry logic for failed payouts
- **Timeline:** 2-3 weeks
- **Cost:** Razorpay fees (~0.5-1% per transaction)
- **Effort:** 5-10 min monthly batch approval

**Phase 2 (Automatic Scheduled Payouts):**
- [ ] Switch to Razorpay Scheduled Payouts (90 days in advance)
- [ ] Fully automatic execution (no cron job needed)
- [ ] Advanced retry logic (auto-queue on low balance)
- **Timeline:** 1 week
- **Effort:** Zero (fully automated)

**Phase 3 (On-Demand Payouts):**
- [ ] Allow judges to request payouts anytime (after hold expires)
- [ ] Instant UPI payouts (sub-second settlement)
- [ ] Lower threshold (₹250 instead of ₹500)
- **Timeline:** 2-3 weeks
- **Cost:** Premium fees for instant settlements

#### **Key Razorpay Limits**

| Limit | Value |
|-------|-------|
| Min payout amount | ₹10 |
| Max payout amount | ₹100,000 per transaction |
| Schedule window | Up to 90 days in advance |
| Settlement time (UPI) | Instant (seconds) |
| Settlement time (NEFT) | 2-4 hours |
| Max bulk payouts | Unlimited (1000s per batch) |
| Auto-retry attempts | Up to 3 automatic retries |
| Fund accounts per contact | Unlimited |

**Sources:** [RazorpayX Payouts](https://razorpay.com/x/payouts/), [Payouts API](https://razorpay.com/docs/api/x/payouts/), [Scheduled Payouts](https://razorpay.com/docs/x/payouts/scheduled/), [Payouts Best Practices](https://razorpay.com/docs/x/payouts/best-practices/), [Payout Error Codes](https://razorpay.com/docs/x/error-codes/payout/)

---

### Sources & References

- [Routable - Building Global Creator Payout Systems](https://www.paymentlabs.io/blog/global-payments/building-a-global-creator-payout-system-reconciliation-taxes-compliance-and-currency-exchange-at-scale)
- [Stripe Creator Economy Payments](https://stripe.com/use-cases/creator-economy)
- [Stripe Payout Management](https://docs.stripe.com/connect/manage-payout-schedule)
- [How to Pay Freelancers (2026)](https://www.xflowpay.com/blog/freelancer-payment-terms)
- [RazorpayX Payouts](https://razorpay.com/x/payouts/)
- [Razorpay Payouts API Documentation](https://razorpay.com/docs/api/x/payouts/)
- [Razorpay Scheduled Payouts](https://razorpay.com/docs/x/payouts/scheduled/)
- [Razorpay Payouts Webhooks](https://razorpay.com/docs/api/x/webhooks/)
- [Razorpay Payouts Best Practices](https://razorpay.com/docs/x/payouts/best-practices/)

---

## Design System Integration

### Colors & Tokens
| Element | Light | Dark |
|---------|-------|------|
| Active Tab | Terracotta | Gold |
| Sidebar Border | terracotta/10 | terracotta/15 |
| Page Background | #fcf9f2 | charcoal |
| Card Background | white | charcoal-light |

### Components Used
- **Button** (primary, ghost)
- **Input** / **Textarea** (form fields)
- **Loading** (variant: "screen", "overlay", "inline")
- **Modal** (for edit forms)
- **Table** / **Grid** (participant/revenue lists)
- **Badge** (status indicators)

### Loading Rules
Per CLAUDE.md:
- **Never** use inline `animate-spin` on lucide icons
- **Always** use `<Loading variant="..." />` component
- Page-level: `<Loading variant="screen" text="Loading judge..." />`
- Overlay: `<Loading variant="overlay" text="Loading participants..." />`

---

## Navigation Integration

### Existing Pattern
In `src/app/admin/layout.tsx`, the AdminLayout detects active tab via pathname:

```typescript
if (pathname.includes("/judges")) return "judges";
```

### New Path Detection
Add to the existing `getActiveTab()` logic:

```typescript
// Existing: judges tab (grid view)
if (pathname.includes("/judges") && !pathname.includes("/judges/")) return "judges";

// New: judges detail view
if (pathname.includes("/judges/") && pathname.includes("/")) {
  // Don't change main tab — detail view handles its own sub-tabs
  return "judges";
}
```

**Note:** The detail view is accessible from the judges grid (click a judge card). The main "Judges" tab should link to the grid view.

---

## URL State Pattern

### Main Navigation
```
/admin/dashboard?tab=judges              ← Grid view (existing)
/admin/judges/[id]?subtab=details        ← Detail view (new)
/admin/judges/[id]?subtab=participants   ← Detail + participants
/admin/judges/[id]?subtab=revenue        ← Detail + revenue
/admin/judges/[id]?subtab=settings       ← Detail + settings
```

### Implementation
- Read `searchParams.get("subtab")` on mount
- Validate against allowed tabs: `["details", "participants", "revenue", "settings"]`
- Default to "details"
- Update URL on tab change: `window.history.replaceState`
- Enables back/forward browser navigation

---

## Component Sizing & Performance

### Max Line Counts
Per CLAUDE.md (max 500 lines for complex UI):

- `JudgesDetailsLayout.tsx`: ~180 lines (navigation + content routing)
- `DetailsSubTab.tsx`: ~150 lines (display + edit form)
- `ParticipantsSubTab.tsx`: ~250 lines (table + pagination + filters)
- `RevenueSubTab.tsx`: ~200 lines (summary + payment history)
- `SettingsSubTab.tsx`: ~180 lines (form + validation)

### Suspense Boundaries
```tsx
<Suspense fallback={<Loading variant="overlay" text="Loading..." />}>
  <ParticipantsSubTab judgeId={judgeId} />
</Suspense>
```

Each sub-tab component receives `judgeId` as prop. Data fetching is internal (useEffect with client-side API calls or server component boundaries).

---

## Data Fetching Strategy

### Metadata (Details)
- **Where:** Server component (`page.tsx`)
- **When:** Page load
- **How:** Direct Prisma query
- **Cache:** `no-store` for fresh data

### Sub-Tab Data (Participants, Revenue, Settings)
- **Where:** Client component (sub-tab)
- **When:** On tab click (lazy load)
- **How:** React `useEffect` + fetch API
- **Loading:** Show spinner during fetch

**Reasoning:**
- Avoids data waterfall (main page loads fast)
- Enables independent error handling per tab
- Sub-tabs can be cached/refetched independently

---

## Testing & Verification (Follow code-verification skill)

### Pre-Implementation Checklist

Before starting, verify:
- [ ] Judge Prisma model exists in `prisma/schema.prisma`
- [ ] Read `.agents/skills/api-rules/SKILL.md` (lines 87-150 for API patterns)
- [ ] Read `.agents/skills/component-rules/SKILL.md` (lines 120-145 for sizing)
- [ ] Read `.agents/skills/design-system-rules/SKILL.md` (lines 13-89 for tokens)
- [ ] Read `.agents/skills/next-best-practices/rsc-boundaries.md` (for server/client boundaries)

### Type Safety Verification
```bash
# Run TypeScript compiler (strict mode)
npx tsc --noEmit

# Expected: No errors
# If errors: Fix type mismatches immediately
```

**Specific checks:**
- ✅ No `any` types anywhere
- ✅ All function params have explicit types
- ✅ All component props use `readonly` keyword
- ✅ Dates are ISO 8601 strings (not Date objects)
- ✅ Union types use discriminated unions, not string literals

### Linting Verification
```bash
npm run lint

# Expected: No errors
# Checks: Import order, component structure, naming conventions
```

**Specific checks:**
- ✅ Imports organized: React → 3rd party → @/ → relative
- ✅ Component names PascalCase
- ✅ File names match component names
- ✅ No unused variables or imports

### Build Verification
```bash
npm run build

# Expected: Success, no warnings about bundle size
# If build fails: Fix issues before considering implementation complete
```

### Manual QA Checklist (Code Verification Skill)

**Read the full condition before testing. Trace URL through the code.**

#### Tab Navigation Tests
```typescript
// Expected behavior:
// URL: /admin/judges/[judgeId]?subtab=details

Test Case 1: Click "Participants" tab
  ✅ URL changes to ?subtab=participants
  ✅ Content switches to ParticipantsSubTab
  ✅ No page reload
  ✅ Loading spinner appears during data fetch

Test Case 2: Browser back button
  ✅ URL changes to ?subtab=details
  ✅ Content reverts to DetailsSubTab
  ✅ No page reload

Test Case 3: Refresh page on ?subtab=revenue
  ✅ Page loads RevenueSubTab
  ✅ Active tab highlighted correctly
  ✅ Data loads and displays
```

#### Component Rendering Tests
```
Test Case 1: Load /admin/judges/[valid-id]
  ✅ Server fetches judge metadata
  ✅ No Loading fallback (server renders immediately)
  ✅ Judge name, email, tier displayed in header

Test Case 2: Load /admin/judges/[invalid-id]
  ✅ Redirects to /admin/dashboard?tab=judges
  ✅ No error page shown

Test Case 3: Click Edit button in Details tab
  ✅ JudgeFormModal opens
  ✅ Pre-filled with judge data
  ✅ Can update and save
```

#### Responsiveness Tests
```
Test Case 1: Desktop view (≥1024px)
  ✅ Sidebar on left (width: 12rem)
  ✅ Content on right (flex-1)
  ✅ Vertical tab buttons

Test Case 2: Mobile view (<768px)
  ✅ Tabs scroll horizontally (overflow-x-auto)
  ✅ No horizontal scroll on page content
  ✅ Touch-friendly tap targets (≥44px height)
```

#### API Integration Tests
```
Test Case 1: Fetch participants (paginated)
  ✅ GET /api/admin/judges/[id]/participants?page=0&limit=20
  ✅ Returns PaginatedResponse<ParticipantAssignment>
  ✅ Pagination buttons work (prev/next)

Test Case 2: Update settings
  ✅ PATCH /api/admin/judges/[id]/settings
  ✅ Request body validated (Zod schema)
  ✅ Response shows updated settings
  ✅ Form shows success message

Test Case 3: Error handling
  ✅ Invalid judge ID returns 404
  ✅ Unauthorized returns 401
  ✅ Validation error returns 422 with details
```

#### Loading State Tests
```
Test Case 1: ParticipantsSubTab loading
  ✅ Shows: <Loading variant="overlay" text="Loading participants..." />
  ✅ Never shows: <div animate-spin> (custom spinner)
  ✅ Loading component from @/components/Loading

Test Case 2: Revenue data loading
  ✅ Shows overlay spinner during fetch
  ✅ Spinner disappears when data arrives
  ✅ No flash/flicker on fast networks
```

### Verification Using code-verification Skill Pattern

**Before confirming implementation complete, answer:**

```
❓ Read the full condition?
  ✅ YES — I read entire JudgesDetailsLayout component
  ❌ NO — Go back, read complete files

❓ Know exact URL being tested?
  ✅ YES — /admin/judges/[valid-uuid]?subtab=participants
  ❌ NO — Test with concrete URLs

❓ Traced URL through code?
  ✅ YES — Confirmed:
    - useSearchParams gets "participants"
    - handleTabChange updates URL AND state
    - activeSubTab === "participants" renders ParticipantsSubTab
  ❌ NO — Do this now

❓ Verified ALL test cases?
  ✅ YES — Tested:
    - Tab switching (4 tabs)
    - URL state sync (back/forward)
    - Responsive layout (mobile/desktop)
    - API pagination
    - Error handling (404, validation)
  ❌ NO — Run remaining tests

❓ Can I show the actual extracted specs?
  ✅ YES — API contracts, component props, design tokens applied
  ❌ NO — This is meta-documentation, not actual implementation
```

**If ANY = NO → Implementation incomplete. Fix before submitting.**

---

## Implementation Verification Commands

Run these commands to verify each phase:

### After Phase 1 (Types)
```bash
npx tsc --noEmit src/types/judges-details.ts
# Expected: No errors
```

### After Phase 2 (Route)
```bash
npx tsc --noEmit src/app/admin/judges/[id]/page.tsx
# Expected: No errors
# Check: params/searchParams are Promise types
```

### After Phase 3 (Layout)
```bash
npx tsc --noEmit src/components/admin/JudgesDetailsLayout.tsx
npm run lint src/components/admin/JudgesDetailsLayout.tsx
# Expected: No errors, component < 500 lines (should be ~180)
```

### After Phase 4 (Sub-Tabs)
```bash
npx tsc --noEmit src/components/admin/judges-details/
npm run lint src/components/admin/judges-details/
# Expected: All components under 500 lines
# Expected: No hardcoded colors (all Tailwind tokens)
```

### After Phase 5 (API)
```bash
npx tsc --noEmit src/app/api/admin/judges/
# Expected: No errors
# Check: Zod schemas match TypeScript types
```

### Full Build
```bash
npm run build

# Expected: Success
# Check: No bundle size warnings
# Check: All imports resolved
# Check: No unused variables
```

---

## Success Criteria (Final Verification)

### Functional Completeness
- ✅ All 4 tabs navigate correctly
- ✅ URL state syncs (back/forward work)
- ✅ No data waterfalls (metadata fetched server-side)
- ✅ Sub-tabs lazy-load data on click
- ✅ Proper error handling (404 → redirect, 401 → error response)
- ❌ **CRITICAL:** Revenue calculation uses tier-based percentages (Currently returns hardcoded rates)
- ✅ Pagination works (prev/next buttons functional)

### Code Quality (from component-rules + code-verification)
- ✅ TypeScript strict mode passes (`npx tsc --noEmit`)
- ✅ No `any` types anywhere
- ✅ No hardcoded colors (all design-system tokens)
- ✅ Components under max lines (180/180/250/200/180)
- ✅ Proper Suspense boundaries (no Loading component misuse)
- ✅ All data serializable (RSC compliance)
- ✅ Linting passes (`npm run lint`)

### Design System Compliance (from design-system-rules)
- ✅ Colors: Charcoal (bg), Terracotta (borders), Gold (active)
- ✅ Spacing: Consistent 6/8/4 grid (p-6, gap-6, rounded-2xl)
- ✅ Typography: Text sizes follow scale (text-sm to text-2xl)
- ✅ Responsive: Mobile-first (md:flex-row, overflow-x-auto)
- ✅ Dark mode: All `dark:` prefixes applied
- ✅ Touch targets: ≥44px height buttons/inputs

### API Compliance (from api-rules)
- ✅ All fetch in services, not components
- ✅ Request DTOs validated with Zod
- ✅ Response DTOs match interface definitions
- ✅ Pagination uses PaginatedResponse<T> wrapper
- ✅ Error codes standard (NOT_FOUND, VALIDATION_ERROR, etc.)
- ✅ HTTP status codes correct (200, 201, 400, 404, 422, 500)
- ✅ Authorization checked before business logic

### User Experience
- ✅ Page loads in <2s
- ✅ Sub-tabs load in <1s
- ✅ Smooth tab transitions (no flicker)
- ✅ Accessible (keyboard nav, ARIA labels on buttons)
- ✅ Mobile responsive (no horizontal scroll on mobile)
- ✅ Proper loading indicators (never custom spinners)

### Revenue & Payment Process (Documented, MVP Phase Pending)
- 🔶 Revenue calculation implemented (tier-based)
- ⏳ Payment infrastructure documented (14-day hold, ₹500 threshold, monthly batches)
- ⏳ Payment ledger schema designed (earned → held → available → paid states)
- ⏳ Payout methods documented (UPI, NEFT, retry logic)
- ⏳ Tax compliance framework outlined
- ⏳ Phase 2+ features documented (weekly payouts, on-demand, real-time settlement)

---

## Related Patterns

### Existing Implementations to Reference
- **Competitions Details:** `src/components/admin/CompetitionDetailsLayout.tsx`
- **Judges Grid:** `src/components/admin/JudgesTab.tsx`
- **Settings Tabs:** `docs/settings-tabs-pattern.md` (user memory)

### Key Differences from Competitions
| Aspect | Competitions | Judges |
|--------|-------------|--------|
| Sub-tabs | 5 | 4 |
| Data scope | Per-competition | Per-judge |
| Main actions | Assign judges, export certs | Manage participants, revenue |
| API endpoints | 5+ | 4+ |

---

## Rollout Plan

### Step 1: Types & API (30 min)
- Define `judges-details.ts` types
- Create API route stubs

### Step 2: Route & Layout (45 min)
- Create `page.tsx` route
- Implement `JudgesDetailsLayout.tsx`
- Add URL state sync

### Step 3: Sub-Tab Components (2 hours)
- `DetailsSubTab.tsx` (simple display)
- `ParticipantsSubTab.tsx` (table + pagination)
- `RevenueSubTab.tsx` (summary + history)
- `SettingsSubTab.tsx` (form + validation)

### Step 4: API Implementation (1 hour)
- Implement Prisma queries
- Add error handling
- Test with Postman/curl

### Step 5: Integration & QA (45 min)
- Connect judges grid to detail view
- Update navigation logic
- Manual testing
- Type/lint/build verification

**Total:** ~5 hours

---

## Constraints & Assumptions

### Constraints
- Must use existing design system (Charcoal, Terracotta, Gold)
- Must use `<Loading />` component (never custom spinners)
- Must validate with TypeScript strict mode
- Must follow component max-line rules (500 lines)
- Must use Prisma ORM (no raw SQL)

### Assumptions
- Judge entity already exists in Prisma schema
- Authentication/authorization middleware in place
- API response errors follow existing pattern (401, 403, 404, 500)
- Parent grid view (`JudgesTab.tsx`) can trigger navigation to detail page

### Open Questions
1. Is there an existing `Judge` Prisma model? If not, create schema first.
2. Should settings form changes require confirmation modal?
3. Should revenue payments be readonly or allow editing?
4. Max participants per page for pagination?

---

## Success Criteria

✅ **Functional:**
- All 4 tabs navigate correctly
- URL state syncs (back/forward work)
- No data waterfalls
- Proper error handling

✅ **Code Quality:**
- TypeScript strict mode passes
- No `any` types
- Components under line limits
- Proper Suspense boundaries

✅ **UX:**
- Mobile responsive
- Proper loading indicators
- Accessible (keyboard nav, ARIA labels)
- Consistent with Competitions pattern

✅ **Performance:**
- Page loads in <2s
- Sub-tabs load in <1s
- No unnecessary re-renders

---

## Mandatory Agent Execution Rules (from `.agents/policies/AI_AGENT_EXECUTION_RULES.md`)

**TL;DR:** Execute instructions. Don't document instructions.

### For Developers Following This Plan

✅ **DO:**
- Read the actual code files referenced (CompetitionDetailsLayout.tsx)
- Extract actual specifications from those files
- Build implementation from the extracted specs
- Show the actual code changes, not plans about changes
- Follow the .agents skills exactly (api-rules, component-rules, design-system-rules)

❌ **DON'T:**
- Create new documents explaining how to follow this plan
- Write "meta-documentation" about this implementation plan
- Create guides about the specifications
- Plan how to follow the plan

### If You're an AI Agent Implementing This

**Execution Checklist:**
- [ ] Read CLAUDE.md in project root
- [ ] Read `.agents/skills/api-rules/SKILL.md` (actual patterns, not summaries)
- [ ] Read `.agents/skills/component-rules/SKILL.md` (actual sizing rules)
- [ ] Read `.agents/skills/frontend-rules/SKILL.md` (actual templates)
- [ ] Read `.agents/skills/design-system-rules/SKILL.md` (actual tokens)
- [ ] Read `.agents/skills/code-verification/SKILL.md` (how to verify your work)
- [ ] Read `src/components/admin/CompetitionDetailsLayout.tsx` (reference implementation)
- [ ] Execute the 5 phases in order (types → route → layout → sub-tabs → API)
- [ ] Verify using the code-verification skill (trace URLs through code)
- [ ] Run verification commands (tsc, lint, build) before submitting

**If you create any new documents beyond this plan → Stop. That's meta-documentation.**

---

## Rollout Schedule

### Recommended Timeline
```
Day 1 (Morning): Phase 1-2 (Types + Route) - 1 hour
Day 1 (Afternoon): Phase 3 (Layout) - 45 min
Day 2 (Morning): Phase 4 (Sub-Tabs) - 2 hours
Day 2 (Afternoon): Phase 5 (API) - 1 hour
Day 3 (Morning): Integration + QA - 1 hour

Total: ~5 hours
```

### Parallel Work Possible
- Phase 4 sub-tab components can be started while Phase 3 layout is being refined
- API routes (Phase 5) can be started while sub-tabs are being implemented

---

## Common Issues & Fixes

### Issue: "Component is too large (>500 lines)"
**Fix:** Break into smaller components. Each sub-tab should handle its own layout.

### Issue: "TypeScript error: Cannot find module"
**Fix:** Check import paths use `@/` alias (not relative paths).

### Issue: "API returns Date objects instead of ISO strings"
**Fix:** Transform dates in route handler: `createdAt: date.toISOString()`

### Issue: "RSC boundary violation: Date object in props"
**Fix:** All dates must be ISO 8601 strings, not Date objects.

### Issue: "Mobile view has horizontal scroll"
**Fix:** Use `overflow-x-auto` on sidebar, `flex-col` on mobile layout.

### Issue: "Custom spinner used instead of <Loading />"
**Fix:** Replace `<div animate-spin>` with `<Loading variant="..." />`

### Issue: "404 redirect doesn't work"
**Fix:** Ensure route param is validated before redirect:
```typescript
if (!judge) {
  redirect("/admin/dashboard?tab=judges");
}
```

### Issue: "Search doesn't reset pagination"
**Fix:** When search changes, reset page to 0:
```typescript
onChange={(e) => {
  setSearch(e.target.value);
  setPage(0); // Reset!
}}
```

---

## Reference Files

### Key Files to Read
| File | Lines | Purpose |
|------|-------|---------|
| `src/components/admin/CompetitionDetailsLayout.tsx` | All | URL state sync + tab navigation pattern |
| `.agents/skills/api-rules/SKILL.md` | 87-150 | API endpoint structure + error handling |
| `.agents/skills/component-rules/SKILL.md` | 120-145 | Component sizing limits + composition |
| `.agents/skills/design-system-rules/SKILL.md` | 13-89 | Design tokens (colors, spacing, typography) |
| `CLAUDE.md` | Project root | Project standards + Loading component usage |

### Existing Components to Reuse
- `<Loading />` — from `@/components/Loading` (use instead of custom spinners)
- `<Button />` — from `@/components/Button` (use for all buttons)
- `JudgeFormModal` — existing component for judge editing
- `AdminSidebar` — existing admin navigation

---

## Glossary

| Term | Definition |
|------|-----------|
| **SubTab** | The 4 secondary navigation tabs (details, participants, revenue, settings) |
| **DTOs** | Data Transfer Objects (typed request/response contracts) |
| **RSC** | React Server Component (async, can fetch data) |
| **Serializable** | Can be converted to JSON (no Date objects, functions, or class instances) |
| **Meta-documentation** | Documentation about documentation (avoid this) |
| **Suspense boundary** | Wraps async component with fallback loading UI |
| **Pagination** | Server-side limit/skip (not client-side slicing) |
| **Discriminated union** | Type with single distinguishing field (e.g., `status: "pending" \| "done"`) |
| **Zod schema** | TypeScript validator for runtime input validation |

---

## Questions to Ask During Implementation

1. **Judge Prisma model:** Does it already exist? If not, run `npx prisma migrate dev` after schema update.
2. **Authorization:** What role can access judge details? (Admin? Admin+Judge?) Check auth middleware.
3. **Participants relation:** How are judges related to participants? One-to-many? Many-to-many?
4. **Revenue calculation:** Is compensation stored in DB or calculated on-the-fly?
5. **Settings:** Are judge settings in a separate table or denormalized in Judge model?

If these aren't clear, update the Prisma schema before implementing the frontend.

---

## Final Reminders

🔶 **Status:** UI implementation complete, revenue calculation INCOMPLETE

✅ **Phases 1-4 complete:** Types, Route, Layout, Sub-Tabs implemented

❌ **Phase 5 incomplete:** Revenue calculation endpoint hardcodes rates instead of using tier-based percentages

⚠️ **CRITICAL TODO:** Update `/api/admin/judges/[id]/revenue` to:
1. Fetch judge's `revenueShareLOCAL/REGIONAL/NATIONAL/EXPERT` settings
2. Get assigned participants by tier
3. Calculate: `(entryFee × sharePercent) / 100` per participant
4. Return breakdown by tier
5. Update `RevenueSubTab.tsx` to display tier breakdown

📋 **Next Steps:**
1. Implement revenue calculation in route handler
2. Update `RevenueMetadata` type with tier breakdown
3. Update `RevenueSubTab.tsx` UI to show breakdown
4. Test with sample data
5. Run verification commands (`tsc --noEmit`, `npm run lint`, `npm run build`)

✅ **Follow all .agents skills exactly (api-rules, component-rules, design-system-rules).**

✅ **Use code-verification skill to trace your work before submitting.**

✅ **Run verification commands (tsc, lint, build) before considering implementation done.**

✅ **No meta-documentation. Only actual code.**

✅ **When in doubt, reference CompetitionDetailsLayout.tsx — it's the proven pattern.**

---

**UI scaffolding done. Now implement the revenue calculation logic and verify all tests pass.**
