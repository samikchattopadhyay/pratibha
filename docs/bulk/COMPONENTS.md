# Component Library Guide

This document outlines the reusable Button and NavLink components and their usage patterns.

## Button Component

The `Button` component provides a reusable, accessible button with multiple variants and sizes. It includes `cursor-pointer` by default.

### Import

```typescript
import { Button } from "@/components";
```

### Usage

```tsx
<Button>Click Me</Button>
```

### Variants

- **primary** (default) — Terracotta background, used for primary actions
- **secondary** — Light background, used for secondary actions
- **destructive** — Red background, used for dangerous actions (delete, logout, etc.)
- **outline** — Border only, used for alternative actions
- **ghost** — Transparent, used for minimal actions
- **link** — Text only with underline, used for inline links

### Sizes

- **sm** — Small (text-xs, px-3 py-1.5)
- **md** (default) — Medium (text-sm, px-4 py-2.5)
- **lg** — Large (text-base, px-6 py-3)

### Examples

```tsx
// Primary button
<Button variant="primary" size="md">
  Save Changes
</Button>

// Destructive button
<Button variant="destructive">
  Delete Account
</Button>

// Button with icon
import { LogOut } from "lucide-react";
<Button variant="destructive">
  <LogOut className="w-5 h-5" />
  Logout
</Button>

// Loading state
<Button isLoading>Processing...</Button>

// Disabled state
<Button disabled>Disabled</Button>

// Custom className
<Button className="w-full">Full Width Button</Button>
```

### Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}
```

---

## NavLink Component

The `NavLink` component provides a reusable navigation link with multiple variants. It wraps Next.js `Link` and includes `cursor-pointer` by default.

### Import

```typescript
import { NavLink } from "@/components";
```

### Usage

```tsx
<NavLink href="/dashboard">Dashboard</NavLink>
```

### Variants

- **nav** (default) — Navigation menu link with active state support
- **button** — Styled like a button, used for CTA links
- **subtle** — Minimal styling, used for secondary navigation
- **ghost** — Transparent with hover effect
- **underline** — Text with underline on hover

### Sizes

- **sm** — Small (text-xs)
- **md** (default) — Medium (text-sm)
- **lg** — Large (text-base)

### Examples

```tsx
// Navigation link with active state
<NavLink href="/competitions" isActive={pathname.startsWith("/competitions")}>
  Competitions
</NavLink>

// Button-styled link
<NavLink href="/register" variant="button">
  Sign Up Now
</NavLink>

// Ghost variant
<NavLink href="/profile" variant="ghost">
  View Profile
</NavLink>

// Link with icon
import { User } from "lucide-react";
<NavLink href="/profile" variant="ghost">
  <User className="w-4 h-4" />
  My Profile
</NavLink>

// Underline variant
<NavLink href="/about" variant="underline">
  Learn More
</NavLink>
```

### Props

```typescript
interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: "nav" | "button" | "subtle" | "ghost" | "underline";
  size?: "sm" | "md" | "lg";
  isActive?: boolean;
  children: React.ReactNode;
}
```

---

## Design System

Both components respect the Pratibha Parishad design system:

- **Colors**: Terracotta (primary), Gold (accent), Charcoal (dark), Cream (light)
- **Dark Mode**: Full dark mode support via Tailwind's dark variant
- **Spacing**: Consistent padding/margin following Tailwind scale
- **Transitions**: Smooth animations (0.3s ease) for hover and active states
- **Typography**: Sans-serif for buttons, proper font weights

---

## Migration Guide

When refactoring existing code to use these components:

### Before

```tsx
<button className="px-6 py-2.5 bg-terracotta hover:bg-terracotta-light text-cream rounded-lg font-sans font-bold text-sm transition-all dark:bg-gold dark:hover:bg-gold-light dark:text-charcoal">
  Save
</button>

<Link href="/dashboard" className="text-charcoal/75 dark:text-cream/75 hover:text-terracotta dark:hover:text-gold font-semibold">
  Dashboard
</Link>
```

### After

```tsx
<Button>Save</Button>

<NavLink href="/dashboard">Dashboard</NavLink>
```

---

## Benefits

✅ **DRY Code** — Eliminates repeated inline class strings
✅ **Consistency** — Single source of truth for interactive element styling
✅ **Maintainability** — Easy to update styling across entire app
✅ **Accessibility** — Built with semantic HTML and proper ARIA support
✅ **Dark Mode** — Full dark mode support out of the box
✅ **Type Safety** — Full TypeScript support with proper prop types
✅ **Flexibility** — Multiple variants and sizes for different use cases
✅ **Production Ready** — Used industry-wide best practice approach

---

## Future Enhancements

- IconButton component for icon-only buttons
- ButtonGroup component for grouped actions
- Tooltip component for button tooltips
- DropdownMenu component for menu links
- Form-specific Button variants (submit, reset)
