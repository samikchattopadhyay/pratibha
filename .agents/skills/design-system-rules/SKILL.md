---
name: design-system-rules
description: Review design tokens, colors, shadows, typography, and spacing alignment
user-invocable: false
---

# Design System — Scout App

## Overview
Mobile-first design system for agricultural field operations. All UI must follow these tokens and patterns.

## Design Tokens Reference

### Spacing Scale
```
xs  → 4px   (0.25rem)
sm  → 8px   (0.5rem)
md  → 16px  (1rem)
lg  → 24px  (1.5rem)
xl  → 32px  (2rem)
2xl → 48px  (3rem)
3xl → 64px  (4rem)
```

### Typography Scale
```
Heading 1 → text-2xl font-bold (mobile) / text-3xl (desktop)
Heading 2 → text-xl font-semibold
Heading 3 → text-lg font-semibold
Body      → text-base leading-relaxed
Body Sm   → text-sm leading-relaxed
Caption   → text-xs leading-normal
```

Minimum text size: 14px (text-sm). Never go below.

### Border Radius
```
Cards    → rounded-2xl
Buttons  → rounded-xl
Inputs   → rounded-lg
Modals   → rounded-t-2xl (bottom sheet) / rounded-2xl (dialog)
Badges   → rounded-full
```

### Elevation / Shadows
```
Card (rest)    → shadow-sm
Card (hover)   → shadow-md
Modal/Sheet    → shadow-xl
Bottom Nav     → shadow-lg (top shadow)
FAB            → shadow-lg
```

### Color Semantics
```
Primary      → agricultural green (#16a34a / green-600)
Primary Dark → dark mode primary (#22c55e / green-500)
Secondary    → earth brown (#92400e / amber-800)
Success      → green-500
Warning      → amber-500
Destructive  → red-500
Muted        → gray-100 (light) / gray-800 (dark)
Border       → gray-200 (light) / gray-700 (dark)
Background   → white (light) / gray-950 (dark)
Surface      → gray-50 (light) / gray-900 (dark)
Foreground   → gray-900 (light) / gray-50 (dark)
Accent       → sky-500
```

### Z-Index Scale
```
Base content → z-0
Dropdowns    → z-10
Sticky header → z-20
Bottom nav   → z-30
Modal/Sheet  → z-40
Toast        → z-50
```

### Motion
```
Quick press   → 150ms ease-out
Transition    → 200ms ease-in-out
Page enter    → 250ms ease-out
Modal enter   → 300ms ease-out (slide up)
Modal exit    → 200ms ease-in (slide down)
```

### Breakpoints (Mobile-First)
```
Base   → 0px    (mobile)
sm     → 640px  (large phone)
md     → 768px  (tablet)
lg     → 1024px (small desktop)
xl     → 1280px (desktop)
2xl    → 1536px (large desktop)
```

## Component Patterns

### Cards
All cards use:
- `rounded-2xl shadow-sm border border-border`
- Consistent padding: `p-4` (mobile) / `p-6` (desktop)
- Title in `text-lg font-semibold`
- Body in `text-sm text-muted-foreground`

### Buttons
Three variants:
- **Primary**: `bg-primary text-primary-foreground hover:bg-primary/90`
- **Secondary**: `bg-secondary text-secondary-foreground hover:bg-secondary/80`
- **Ghost**: `hover:bg-muted`

All buttons: minimum 44px height touch target.

### Forms
- Labels: `text-sm font-medium` above input
- Inputs: `h-10 rounded-lg border border-border px-3 text-base`
- Error text: `text-sm text-destructive mt-1`
- Submit button: full-width on mobile, right-aligned on desktop

### Lists
- List items: minimum 48px height touch target
- Dividers: `border-t border-border`
- Active state: `bg-muted`
- Empty state: centered icon + message

### Bottom Sheets
- `rounded-t-2xl` top corners
- Backdrop: `bg-black/50`
- Drag handle at top
- Max height: 85vh

## Mobile UX Standards

### Touch Targets
- Minimum 44x44px for all interactive elements
- Buttons: 44px height minimum
- List items: 48px height minimum
- Form inputs: 40px height minimum

### Safe Areas
- Respect `env(safe-area-inset-*)` on all edge-to-edge screens
- Bottom nav padded for home indicator
- Content padded for notch/island

### Navigation
- Bottom tab bar on mobile (3-5 items max)
- Sidebar on tablet/desktop
- Back button on sub-screens (never break browser back)

## Dark Mode
All components must support dark mode via Tailwind's `dark:` prefix. Colors invert using the semantic tokens above.

## Accessibility
- All interactive elements focus-visible outlined
- Color contrast minimum 4.5:1 for text
- Touch targets minimum 44x44px
- Screen reader labels on all interactive elements