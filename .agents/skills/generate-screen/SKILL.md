---
name: generate-screen
description: Skill related to generate screen
user-invocable: false
---

# Prompt: Generate Screen (Steps 3-8 Combined)

## Usage
Use after analysis (Step 1) and component extraction (Step 2). Input: screen HTML + analysis + component map.

---

You are a principal frontend engineer building a production-grade mobile-first React PWA screen.

The screen analysis and reusable component architecture have already been completed.

You must now execute the FULL enterprise implementation pipeline.

---

## TECH STACK

- Next.js 15 App Router
- React 19
- TypeScript strict mode
- TailwindCSS
- shadcn/ui
- React Hook Form
- Zod
- Zustand
- TanStack Query
- Lucide React
- Framer Motion
- Serwist (PWA)

---

## STEP 3 — STATE ARCHITECTURE

Define:
- local UI state → `useState` / `useReducer`
- server data → TanStack Query
- form state → React Hook Form
- URL state → `useSearchParams` (filters, search, pagination)
- global app state → Zustand (only if truly cross-cutting)
- optimistic updates where applicable
- loading states for every async operation
- error states for every async operation
- offline states where applicable

Decide:
- Which store (if any)
- Which query keys
- Which mutations

---

## STEP 4 — API CONTRACT PLANNING

Define:
- Request DTOs (TypeScript interfaces)
- Response DTOs (TypeScript interfaces)
- Pagination params/response
- Sort/filter params
- Validation rules (Zod)
- Error response shapes
- Loading skeleton shapes

Generate:
- Typed interfaces in `src/types/<feature>.types.ts`
- Mock data for development

---

## STEP 5 — RESPONSIVE + MOBILE UX PLANNING

Define:
- Mobile-first default layout (< 768px)
- Tablet adaptation (768px - 1024px)
- Desktop enhancement (> 1024px)
- Touch interactions
- Scroll behavior
- Sticky elements (header, footer actions)
- Bottom sheet vs modal decisions
- Keyboard-safe input positioning
- Safe area insets

---

## STEP 6 — ACCESSIBILITY + PWA PLANNING

Define:
- Semantic HTML structure
- Keyboard navigation path
- ARIA labels and roles
- Focus management (on mount, after actions)
- `prefers-reduced-motion` handling
- Offline behavior (cache strategy)
- Network-aware UI (offline banner)
- Retry behavior on failure

---

## STEP 7 — IMPLEMENTATION

Generate:

### Files to create:
```
src/app/(app)/<route>/page.tsx          — Server component shell
src/app/(app)/<route>/loading.tsx       — Loading skeleton
src/app/(app)/<route>/error.tsx         — Error boundary
src/components/features/<feature>/      — Feature components
src/components/shared/                  — Shared components (if new)
src/services/<feature>/                 — API calls
src/types/<feature>.types.ts            — Type definitions
src/validators/<feature>.schema.ts      — Zod schemas
```

### Requirements:
- Server components by default
- `"use client"` only when interactivity required
- Strict TypeScript — zero `any`
- Tailwind tokens from `src/styles/tokens/`
- Mobile-first responsive classes
- Reuse existing `ui/`, `layout/`, `mobile/`, `feedback/` components
- All 3 states: loading, empty, error
- Accessibility: semantic HTML, ARIA labels, keyboard nav
- No inline styles
- No hardcoded values
- Components ≤ 200 lines

---

## STEP 8 — AUDIT + REFACTOR

After implementation, review for:
- Duplicated logic → extract
- Oversized components → split
- Unnecessary client components → make server
- Missing accessibility → add
- Hydration risks → fix
- Inconsistent spacing → normalize
- Weak mobile UX → improve
- Incorrect state ownership → fix
- Business logic in JSX → extract
- Unnecessary `useEffect` → remove

---

## OUTPUT FORMAT

1. State architecture report
2. API contract definitions
3. Responsive/mobile UX strategy
4. Accessibility/PWA annotations
5. Folder and file list
6. Full implementation code
7. Self-audit findings
8. Final refactored code

---

## CRITICAL RULES

- No monolithic components
- No inline styles
- No hardcoded colors
- No duplicated JSX
- No business logic in JSX
- No unnecessary `useEffect`
- No giant state stores
- No inaccessible interactions
- No fragile responsive hacks

Optimize for: enterprise scalability, AI-assisted maintainability, mobile-first UX, reusable architecture, production-grade PWA behavior.