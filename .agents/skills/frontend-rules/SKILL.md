---
name: frontend-rules
description: Apply general React/TypeScript best practices, coding style, and anti-patterns prevention
user-invocable: false
---

# Frontend Guidelines — Scout App

## Philosophy
Production-grade mobile-first PWA. Prioritize reliability, offline capability, and field usability over visual flair. This app is used by agricultural scouts in rural areas with intermittent connectivity.

## Development Workflow

### Per-Screen Process (8 Steps)
1. **Analyze** — UX purpose, mobile behavior, data requirements
2. **Extract Components** — Identify reusable vs new components
3. **State Architecture** — Define local/global/server state ownership
4. **API Contracts** — Define typed DTOs before implementing
5. **Responsive/Mobile UX** — Plan mobile-first, tablet, desktop
6. **Accessibility/PWA** — Semantic HTML, keyboard, offline behavior
7. **Implement** — Generate production React code
8. **Audit/Refactor** — Review for duplication, size, accessibility

### Forbidden Shortcuts
- ❌ "Convert screenshot to React" — leads to monolith
- ❌ "Build entire feature" — too large, loses quality
- ❌ Single prompt for screen — always multi-step
- ❌ Skip component extraction — guarantees duplication

## Coding Standards

### File Naming
```
Components:  PascalCase.tsx    → Button.tsx, MobileHeader.tsx
Hooks:       useSomething.ts   → useAuth.ts, useOfflineQueue.ts
Services:    kebab-case.ts     → auth-service.ts, farmer-service.ts
Stores:      feature.store.ts  → auth.store.ts, ui.store.ts
Types:       feature.types.ts  → farmer.types.ts, lot.types.ts
Validators:  feature.schema.ts → auth.schema.ts, farmer.schema.ts
Constants:   feature.const.ts  → status.const.ts
```

### Import Order
```
1. React / Next.js imports
2. Third-party library imports
3. Internal absolute imports (@/components, @/services, etc.)
4. Relative imports
5. Type imports (import type)
```

### Component Template
```tsx
// 1. Imports
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { FarmerType } from "@/types/farmer.types";

// 2. Props interface
interface FarmerCardProps {
  readonly farmer: FarmerType;
  readonly onViewDetails: (id: string) => void;
}

// 3. Component
export function FarmerCard({ farmer, onViewDetails }: FarmerCardProps) {
  // 4. Derived state / handlers
  const fullName = `${farmer.firstName} ${farmer.lastName}`;

  // 5. JSX (pure rendering)
  return (
    <Card>
      <div className="flex items-center gap-4 p-4">
        <Avatar fallback={farmer.firstName[0]} />
        <div>
          <h3 className="text-lg font-semibold">{fullName}</h3>
          <p className="text-sm text-muted-foreground">{farmer.village}</p>
        </div>
        <Button variant="ghost" onClick={() => onViewDetails(farmer.id)}>
          View
        </Button>
      </div>
    </Card>
  );
}
```

### Service Template
```ts
// src/services/farmer/farmer.service.ts
import type { FarmerType, FarmerCreateDTO, FarmerListParams } from "@/types/farmer.types";
import type { PaginatedResponse } from "@/types/api.types";

const BASE_URL = "/api/farmers";

export async function getFarmers(params: FarmerListParams): Promise<PaginatedResponse<FarmerType>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.search) searchParams.set("search", params.search);

  const response = await fetch(`${BASE_URL}?${searchParams}`);
  if (!response.ok) throw new Error(`Failed to fetch farmers: ${response.statusText}`);
  return response.json();
}

export async function createFarmer(dto: FarmerCreateDTO): Promise<FarmerType> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!response.ok) throw new Error(`Failed to create farmer: ${response.statusText}`);
  return response.json();
}
```

### Store Template
```ts
// src/stores/auth.store.ts
import { create } from "zustand";
import type { UserType } from "@/types/auth.types";

interface AuthState {
  user: UserType | null;
  isAuthenticated: boolean;
  login: (user: UserType) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

## TypeScript Standards

### Always
- `strict: true` in tsconfig
- Explicit return types for exported functions
- `readonly` on immutable props
- Discriminated unions for status/state
- `type` for unions, `interface` for objects

### Never
- `any` — use `unknown` if truly unknown
- `as` casts unless absolutely necessary
- `@ts-ignore` or `@ts-expect-error`

## State Management Decision Tree

```
Is this data from the server?
  → Yes: TanStack Query
  → No: continue

Is this data needed across multiple unrelated components?
  → Yes: Zustand
  → No: React useState / useReducer

Is this URL state (search, filters, pagination)?
  → Yes: URL searchParams (next/navigation)
  → No: continue

Is this form state?
  → Yes: React Hook Form
```

## PWA-Specific Rules

### Offline-First
- All data entry screens must queue mutations when offline
- Show OfflineBanner when connectivity lost
- Retry failed mutations on reconnect
- Cache app shell (layout + navigation) aggressively

### Service Worker
- Serwist for SW management
- Cache static assets (CSS, JS, fonts)
- Cache API GET responses (stale-while-revalidate)
- Don't cache POST/PUT/DELETE

### Install Flow
- manifest.json with correct icons and name
- Add to Home Screen prompt after 3 interactions
- Standalone mode with proper safe areas

## Performance Checklist

Per screen:
- [ ] Server Component unless interactivity required
- [ ] No unnecessary 'use client' directives
- [ ] Images use next/image
- [ ] Heavy components lazy-loaded
- [ ] No unnecessary useEffect
- [ ] TanStack Query stale time configured
- [ ] Skeleton loaders for async content
- [ ] Bundle size reasonable (check with `npm run build`)

## Accessibility Checklist

Per screen:
- [ ] Semantic HTML (main, nav, section, article, form)
- [ ] All interactive elements keyboard accessible
- [ ] Focus visible on all focusable elements
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] aria-label on icon-only buttons
- [ ] Color contrast 4.5:1 minimum
- [ ] Touch targets minimum 44x44px
- [ ] Reduced motion support (prefers-reduced-motion)

## Mobile UX Checklist

Per screen:
- [ ] No horizontal scroll on mobile
- [ ] Scrollable content area
- [ ] Sticky bottom actions when needed
- [ ] Bottom sheet for secondary actions
- [ ] No hover-only interactions
- [ ] Thumb-friendly tap targets
- [ ] Safe area insets respected
- [ ] Keyboard-safe inputs (don't hide behind keyboard)
- [ ] Pull-to-refresh where appropriate