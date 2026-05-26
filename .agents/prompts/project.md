# Pratibha Parishad Project Context

## Project Overview

**Type:** Production-grade talent competition management platform  
**Domain:** Cultural & talent competition administration  
**Platform:** Next.js (App Router) + React 19 + TypeScript (Strict)  
**Database:** Prisma ORM + PostgreSQL  
**Authentication:** NextAuth.js (Credentials, secure JWT sessions)

## Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Framework** | Next.js (App Router) | Server-first layout structure |
| **Runtime** | React 19 + TypeScript (Strict) | Strong typing required, no `any` |
| **Styling** | TailwindCSS | Charcoal dark-mode core, Terracotta accents, Gold highlights |
| **ORM** | Prisma ORM | Type-safe database queries |
| **Forms** | React Hook Form + Zod | Strict schema validations |

## Directory Structure

```
src/
├── app/                          # Next.js App Router layout & pages
│   ├── admin/                    # Admin workspace layout & tabs
│   ├── judge/                    # Jury evaluation scorecard layout & tabs
│   ├── parent/                   # Parent intake portal layout & tabs
│   └── api/                      # REST API routes (/api/admin, /api/judge, etc.)
├── components/                   # Shared React UI components
│   ├── admin/                    # Admin portal tab sub-components
│   ├── judge/                    # Jury evaluation tab sub-components
│   ├── competitions/             # Reusable competition widgets
│   └── Loading.tsx               # Unified Loader component
├── lib/                          # Auth configurations, database client instance
└── types/                        # TypeScript types & representation interfaces
```

## Key Commands

```bash
npm run dev           # Start local dev server
npm run build         # Build production bundle
npm run lint          # Run ESLint validation checks
npx tsc --noEmit      # Run static TypeScript compiler checks
```

## Key Constraints & Rules

### Loading UI & Theme Rules
* **Always Use `<Loading />` Component:** Any loading spinner, indicator, authenticating message, or progress screen MUST use the unified `<Loading />` component from `@/components/Loading`. 
* **No Duplicate Spinner Logic:** **Never** write duplicate SVG loading spinner markup, inline animated elements (such as `animate-spin` classes on lucide icons), or custom spinner wrappers.
* **Loading Variants:**
  - Page-level loaders: Use `<Loading variant="screen" text="..." />`.
  - Modal/overlay loaders: Use `<Loading variant="overlay" text="..." />`.
  - Inline button/state loaders: Use `<Loading variant="inline" text="..." />` which supports text color inheritance (`text-current` spinner track color).
* **Proper Light/Dark Theme Contrast:** Loader cards/overlays must respect light and dark themes properly. Use `bg-white dark:bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30` for floating overlay card elements. Light theme components must use a bright background (`bg-white`) and explicit borders (`border-terracotta/20`) to stand out from the cream page background (`#fcf9f2`). Do not let overlay dialog elements blend into the cream background.

### AJAX Pagination Rules
* **Always Use Server-Side AJAX Pagination:** Do **NOT** use client-side local pagination (slicing lists in memory, e.g., `.slice((page - 1) * limit, page * limit)`) for list tables, grids, and workspaces (like Circuits/Competitions, Transactions/Finance, or social metrics).
* **Database Pagination:** All lists must be paginated server-side (AJAX pagination using database-level `skip` and `take` via query params) to ensure consistent data loading states, proper memory usage, and loading animations.
* **Code Cleanliness:** Do not leave unused imports or abandoned code variables. Delete unused variables, imports, or files.

### Component Limits
* **Maximum 500 lines** per complex dashboard component layout file. Decompose large workspaces into the appropriate components directories.
* Keep props minimal and clean.

### TypeScript and Type Safety
* Strict type enforcement. **No `any` types.**
* Leverage type declarations from `src/types/` rather than loose configurations.
