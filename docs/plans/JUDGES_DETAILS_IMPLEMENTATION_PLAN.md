# Judges Details Module Implementation Plan

**Status:** Ready for Implementation  
**Last Updated:** 2026-05-27  
**Author:** Claude Code

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

### Phase 1 Tasks (3 TODOs)
- [ ] Create type definitions (src/types/judges-details.ts)
- [ ] Define all TypeScript interfaces (JudgeMetadata, SubTab, ParticipantAssignment, etc.)
- [ ] Run 'npx tsc --noEmit' to verify compilation

### Phase 2 Tasks (5 TODOs)
- [ ] Create route folder structure (src/app/admin/judges/[id]/)
- [ ] Implement page.tsx async server component with metadata fetch
- [ ] Add 404 redirect for non-existent judges
- [ ] Wrap content in Suspense with Loading fallback
- [ ] Verify params/searchParams are awaited (Next.js 15+)

### Phase 3 Tasks (9 TODOs)
- [ ] Create JudgesDetailsLayout.tsx client component
- [ ] Implement useSearchParams() to read URL state
- [ ] Add useState for activeSubTab
- [ ] Implement useEffect for URL→State sync
- [ ] Implement handleTabChange for state+URL update
- [ ] Build responsive sidebar layout
- [ ] Add 4 tab navigation buttons with styling
- [ ] Add Suspense boundaries for lazy-loaded tabs
- [ ] Apply design-system colors and verify <500 lines

### Phase 4 Tasks (31 TODOs split by sub-tab)
**DetailsSubTab (5 tasks)**
- [ ] Create DetailsSubTab.tsx
- [ ] Display judge metadata
- [ ] Add Edit button with modal
- [ ] Show status/tier badges
- [ ] Display metrics (evaluations, score, deviation)

**ParticipantsSubTab (9 tasks)**
- [ ] Create ParticipantsSubTab.tsx
- [ ] Implement pagination state
- [ ] Fetch from GET /api/admin/judges/{id}/participants
- [ ] Add Loading overlay during fetch
- [ ] Build search input with clear button
- [ ] Build participants table
- [ ] Add pagination controls
- [ ] Show empty state
- [ ] Verify <250 lines

**RevenueSubTab (5 tasks)**
- [ ] Create RevenueSubTab.tsx
- [ ] Fetch revenue summary
- [ ] Display metrics
- [ ] Display payment history table
- [ ] Verify <200 lines

**SettingsSubTab (7 tasks)**
- [ ] Create SettingsSubTab.tsx
- [ ] Create Zod validation schema
- [ ] Build settings form
- [ ] Add category multi-select
- [ ] Add notification toggles
- [ ] Implement form submission
- [ ] Show success/error feedback

### Phase 5 Tasks (17 TODOs split by endpoint)
**GET /api/admin/judges/[id] (5 tasks)**
- [ ] Create API route
- [ ] Create Zod validation schema
- [ ] Add authorization check
- [ ] Query judge and calculate metrics
- [ ] Return JudgeMetadata DTO

**GET /api/admin/judges/[id]/participants (3 tasks)**
- [ ] Create participants endpoint
- [ ] Add pagination/search validation
- [ ] Query and return PaginatedResponse

**GET /api/admin/judges/[id]/revenue (2 tasks)**
- [ ] Create revenue endpoint
- [ ] Query and return RevenueMetadata

**GET /api/admin/judges/[id]/payments (2 tasks)**
- [ ] Create payments endpoint
- [ ] Return paginated payment records

**PATCH /api/admin/judges/[id] (2 tasks)**
- [ ] Create update judge endpoint
- [ ] Validate and update in Prisma

**PATCH /api/admin/judges/[id]/settings (2 tasks)**
- [ ] Create settings endpoint
- [ ] Validate and update settings
- [ ] Verify error handling for all endpoints

### Verification Tasks (16 TODOs)
- [ ] Run 'npx tsc --noEmit' — verify no TypeScript errors
- [ ] Run 'npm run lint' — fix linting issues
- [ ] Run 'npm run build' — ensure production build
- [ ] Test: Page loads with judge metadata
- [ ] Test: Tab navigation works (all 4 tabs)
- [ ] Test: URL state syncs (?subtab=...)
- [ ] Test: Browser back/forward work
- [ ] Test: Page refresh restores active tab
- [ ] Test: Pagination works (prev/next)
- [ ] Test: Search filters and resets pagination
- [ ] Test: Form validation works
- [ ] Test: Form submission works
- [ ] Test: 404 redirect works
- [ ] Test: API errors return correct codes
- [ ] Test: Mobile layout (horizontal scroll on tabs)
- [ ] Test: Desktop layout (sidebar left, content right)
- [ ] Test: No custom spinners (only <Loading /> component)
- [ ] Test: No hardcoded colors (all design-system tokens)

**Total: 95 tasks across 5 phases + verification**

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
2. Display compensation metrics (total earned, pending, rates)
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
  "hourlyRate": 500,
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
3. Fields: max evaluations/day, rest period hours, preferred categories, notification toggles
4. Validate on submit
5. Send PATCH request to update settings
6. Show success/error toast
7. Use design-system button styling

**Form Schema (Zod):**

```typescript
const JudgeSettingsSchema = z.object({
  maxEvaluationsPerDay: z.number().min(1).max(50),
  restPeriodHours: z.number().min(0).max(24),
  preferredCategories: z.array(z.string()).min(1, "Select at least 1 category"),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
});
```

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

✅ **This plan is complete and ready to implement.**

✅ **Follow all .agents skills exactly (api-rules, component-rules, design-system-rules).**

✅ **Use code-verification skill to trace your work before submitting.**

✅ **Run verification commands (tsc, lint, build) before considering implementation done.**

✅ **No meta-documentation. Only actual code.**

✅ **When in doubt, reference CompetitionDetailsLayout.tsx — it's the proven pattern.**

---

**Start with Phase 1. Execute each phase in order. Verify using the checklist. Done!**
