---
name: rule-architecture
description: Verify codebase architecture, project boundaries, and Next.js App Router layout rules
user-invocable: false
---

# Architecture Overview — Scout App

## Application Type
Mobile-first React PWA for agricultural field operations (scout workflows).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | TailwindCSS + shadcn/ui |
| State | Zustand (global), TanStack Query (server), React state (local) |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| ORM | Drizzle ORM |
| PWA | Serwist |
| Deployment | Cloudflare |

## Architecture Principles

1. **Server-first rendering** — All pages default to Server Components. Client Components only when browser APIs or interactivity required.
2. **Feature-driven organization** — Each business domain lives in `src/components/features/<feature-name>/`.
3. **Composition over inheritance** — Screens compose from reusable primitives, never monolithic page components.
4. **Offline-first PWA** — App shell caches layout; data syncs via service worker queue.
5. **Typed contracts** — All API calls use typed DTOs; no untyped fetch.

## Component Architecture

```
src/components/
├── ui/          ← Design system primitives (Button, Input, Card, Dialog, etc.)
├── layout/      ← App shell, navigation, responsive containers
├── forms/       ← Form field wrappers, validation display, submit handling
├── mobile/      ← Mobile-specific UX patterns (bottom sheets, sticky bars)
├── feedback/    ← Empty/error/loading/offline states
├── shared/      ← Cross-feature business components
└── features/    ← Feature-scoped components
    ├── auth/
    ├── dashboard/
    ├── farmer-registration/
    ├── popper-registration/
    ├── pond-inspection/
    ├── warehouse/
    ├── lot-verification/
    ├── seal-application/
    ├── bidding/
    ├── rejection/
    └── settings/
```

## Data Flow

```
UI Component (server by default)
  → Service Layer (src/services/)
    → API / Drizzle ORM
  ← Typed Response DTO
  ← TanStack Query cache (client-side hydration)
```

- Server Components fetch data directly
- Client Components use TanStack Query hooks
- Zustand stores only for global UI state (auth, theme, offline queue)
- Form state stays local to React Hook Form

## Routing Strategy

```
src/app/
├── (auth)/           ← Auth route group (login, OTP, registration)
├── (dashboard)/      ← Authenticated route group
│   ├── dashboard/
│   ├── farmers/
│   ├── poppers/
│   ├── ponds/
│   ├── warehouses/
│   ├── lots/
│   ├── bids/
│   └── settings/
├── api/              ← Route handlers
├── layout.tsx        ← Root layout with AppShell
└── page.tsx          ← Entry redirect
```

## PWA Architecture

- **App Shell**: Layout + navigation cached via Serwist
- **Offline Queue**: Failed mutations stored in Zustand, retried on connectivity
- **Network Banner**: Global offline indicator in layout
- **Install Flow**: manifest.json + service worker registration

## Key Design Decisions

1. **Why Zustand over Context**: Smaller re-render surface, simpler API, better devtools
2. **Why TanStack Query over SWR**: More mature caching, mutation helpers, devtools
3. **Why no tRPC**: REST contracts are clearer for mobile/PWA with offline support
4. **Why shadcn/ui over MUI**: Smaller bundle, Tailwind-native, easier customization