---
name: component-rules
description: Check component boundaries, reuse, maximum lines, and composition over config
user-invocable: false
---

# Component Patterns — Scout App

## Component Categories

### UI Primitives (`src/components/ui/`)
Design system atoms. Pure presentational, zero business logic.

| Component | Responsibility | Variants |
|-----------|---------------|----------|
| Button | Clickable action | primary, secondary, ghost, destructive, loading |
| Input | Text/number entry | default, error, disabled |
| Textarea | Multi-line text | default, error |
| Select | Dropdown selection | default, error |
| Checkbox | Boolean toggle | default, disabled |
| Radio | Single choice | default, disabled |
| Switch | Toggle | default, disabled |
| Card | Content container | default, interactive (hoverable) |
| Badge | Status indicator | default, success, warning, destructive |
| Tabs | Tab navigation | underline, pills |
| Dialog | Modal overlay | default |
| Sheet | Bottom sheet | default |
| Dropdown | Popover menu | default |
| Avatar | User/entity image | default, with fallback initials |
| Tooltip | Hover info | top, bottom |
| Skeleton | Loading placeholder | text, card, circle |
| Spinner | Loading indicator | default |

### Layout Components (`src/components/layout/`)
Structural composition. Define the app skeleton.

| Component | Responsibility |
|-----------|---------------|
| AppShell | Root layout wrapper with nav + content area |
| DashboardLayout | Authenticated layout with sidebar/header |
| AuthLayout | Centered card layout for auth screens |
| MobileHeader | Top bar with title + back button + actions |
| BottomNavigation | 3-5 item tab bar for mobile |
| SidebarNavigation | Tablet/desktop sidebar |
| ResponsiveContainer | Width-constrained content container |
| PageWrapper | Standard page with title + scroll + actions |
| ScrollContainer | Scrollable content area |
| SafeAreaLayout | Handles safe-area insets |

### Form Components (`src/components/forms/`)
Reusable form infrastructure.

| Component | Responsibility |
|-----------|---------------|
| FormField | Label + input + error message wrapper |
| FormSection | Grouped fields with section header |
| SubmitButton | Submit with loading spinner + disabled state |
| ValidationMessage | Inline error display |

### Mobile Components (`src/components/mobile/`)
Mobile-specific UX patterns.

| Component | Responsibility |
|-----------|---------------|
| StickyActionBar | Bottom-fixed action bar with primary/secondary buttons |
| FloatingActionButton | Circular FAB for primary create action |
| FilterChips | Horizontal scrollable filter pills |
| SwipeableCard | Card with swipe-left/right actions |

### Feedback Components (`src/components/feedback/`)
Consistent UX states across the app.

| Component | Responsibility |
|-----------|---------------|
| EmptyState | Icon + message + optional action for empty lists |
| ErrorState | Error message + retry button |
| LoadingState | Skeleton/skeleton for page loads |
| OfflineBanner | Persistent banner when offline |
| RetryPanel | Error state with retry + dismiss |

## Composition Rules

### Screen = Layout + Primitives + Feature Components
```
A screen is NEVER a single monolithic component.
A screen IS a composition of:
  - Layout container (PageWrapper / DashboardLayout)
  - UI primitives (Card, Button, Input)
  - Feature-specific components (from src/components/features/)
  - Feedback components (EmptyState, ErrorState)
```

### Container/Presenter Pattern
```
Container component:
  - Handles data fetching, state management, event handlers
  - Passes data down as props
  - Lives in features/<name>/

Presenter component:
  - Pure rendering, no side effects
  - Receives all data via props, emits events via callbacks
  - Lives in ui/ or features/<name>/ (if feature-specific)
```

### Server/Client Boundary
```
Server Component (default):
  - Can be async
  - Fetches data directly
  - Renders static + client-component-children
  - Lives in src/app/ pages and layouts

Client Component ("use client"):
  - Required for interactivity, hooks, browser APIs
  - Receives data as props from server parent
  - Lives in src/components/ (features, ui when interactive)
```

## Anti-Patterns

❌ **Don't do this:**
- One component per screen (monolithic)
- Business logic inside JSX
- Inline styles
- Hardcoded colors/spacing
- Duplicate JSX across screens
- API calls inside UI components
- Any type
- Excessive useEffect
- Prop drilling beyond 2 levels
- Giant component files (>200 lines)

✅ **Do this:**
- Compose screens from primitives
- Separate data fetching from rendering
- Use Tailwind classes only
- Use design tokens
- Extract repeated patterns into reusable components
- API calls in services/ only
- Strict TypeScript types
- Derived state over useEffect
- Zustand for truly global state
- Keep components under 200 lines

## State Patterns

### Loading State
```tsx
{isLoading ? <Skeleton variant="card" /> : <DataCard data={data} />}
```

### Empty State
```tsx
{!data?.length ? <EmptyState icon={Package} message="No items found" /> : <List items={data} />}
```

### Error State
```tsx
{error ? <ErrorState message={error.message} onRetry={refetch} /> : <Content data={data} />}
```

### Offline State
```tsx
<OfflineBanner /> // Always rendered in AppShell when offline