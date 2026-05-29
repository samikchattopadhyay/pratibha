---
name: accessibility-rules
description: Verify semantic HTML, ARIA attributes, color contrast, and keyboard support
user-invocable: false
---

# Accessibility Standards — Scout App

## Principle
This app is used by agricultural scouts in the field — often in bright sunlight, with dusty screens, and sometimes by users with limited tech literacy. Accessibility is a core requirement, not an afterthought.

## WCAG Target
- **Level AA** compliance (minimum)
- AAA where reasonable (contrast, touch targets)

## Semantic HTML Requirements

### Landmarks
Every page must use:
```html
<header role="banner">    ← Top nav / header
<nav aria-label="Main">   ← Primary navigation
<main id="main-content">  ← Page content (skip link target)
<footer>                  ← Bottom actions
<aside>                   ← Sidebar (tablet/desktop)
<section>                 ← Content sections with headings
<form>                    ← All forms
```

### Heading Hierarchy
```
h1 — Page title (one per page)
h2 — Major sections
h3 — Sub-sections
h4 — Card titles within sections
```
Never skip levels (h1 → h3 without h2).

## Skip Navigation
```tsx
<SkipToContent />
// Renders: <a href="#main-content" class="sr-only focus:not-sr-only">
//   Skip to main content
// </a>
```

## Keyboard Navigation

### All Interactive Elements Must Be:
- Focusable: `button`, `input`, `select`, `textarea`, `a[href]`
- Custom interactive elements: use `<button>` or add `tabIndex={0}`
- Focus order logical (matches visual order)
- Focus visible with visible outline ring
- No keyboard traps
- Escape closes modals/sheets

### Focus Ring
```css
/* Global focus ring (in globals.css) */
*:focus-visible {
  @apply outline-2 outline-offset-2 outline-primary;
}
```

## aria Guidelines

### Icon-Only Buttons
```tsx
<button aria-label="Close dialog">
  <XIcon />
</button>
```

### Loading State
```tsx
<div role="status" aria-label="Loading farmers list">
  <Spinner />
  <span className="sr-only">Loading...</span>
</div>
```

### Alerts / Toast
```tsx
<div role="alert" aria-live="polite">
  Farmer registered successfully
</div>
```

### Error Messages
```tsx
<Input aria-describedby="firstName-error" aria-invalid={!!error} />
<p id="firstName-error" role="alert">{error?.message}</p>
```

### Cards / Lists
```tsx
<ul aria-label="Farmers list">
  {farmers.map(f => (
    <li key={f.id}>{f.name}</li>
  ))}
</ul>
```

### Navigation
```tsx
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard" aria-current="page">Dashboard</a></li>
  </ul>
</nav>
```

### Dialogs
```tsx
<Dialog aria-labelledby="dialog-title" aria-describedby="dialog-desc">
  <h2 id="dialog-title">Confirm Action</h2>
  <p id="dialog-desc">This action cannot be undone.</p>
</Dialog>
```

## Color & Contrast

### Minimum Requirements
- **Text**: 4.5:1 contrast ratio (AA)
- **Large text (18px+ or bold 14px+)**: 3:1 (AA)
- **Icons and controls**: 3:1

### Never Use Color Alone
- Error: show icon + text + color
- Status badges: show icon + text + color
- Chart segments: add labels/patterns

## Touch Targets

### Minimum Size
```
Buttons:            44×44px minimum
Checkboxes/radios:  44×44px (with padding)
List items:         44px minimum height
Navigation items:   48×44px minimum
```

### Spacing Between Touch Targets
- Minimum 8px between tappable elements
- 16px preferred on mobile

## Form Accessibility

### Every Input Must Have:
```tsx
<div>
  <Label htmlFor="firstName">First Name</Label>
  <Input
    id="firstName"
    aria-describedby="firstName-hint firstName-error"
    aria-required={true}
    aria-invalid={!!error}
  />
  <p id="firstName-hint" className="text-sm text-muted-foreground">
    Enter your legal first name
  </p>
  {error && (
    <p id="firstName-error" className="text-sm text-destructive" role="alert">
      {error.message}
    </p>
  )}
</div>
```

### Required Fields
- Mark with asterisk + aria-required="true"
- Don't rely on color alone for required state

### Error Summary
For multi-step forms, show error summary at top:
```tsx
{form.formState.errors && Object.keys(form.formState.errors).length > 0 && (
  <div role="alert" aria-label="Form errors">
    <h3>Please fix the following errors:</h3>
    <ul>
      {Object.entries(form.formState.errors).map(([field, error]) => (
        <li key={field}>
          <a href={`#${field}`}>{error.message}</a>
        </li>
      ))}
    </ul>
  </div>
)}
```

## Reduced Motion

```tsx
// Respect OS motion preferences
<div className="motion-safe:animate-fade-in motion-reduce:animate-none">
```

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Screen Reader Only Utility
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
```

## Images

### All Images MUST Have Alt Text
```tsx
// Decorative
<img alt="" src="/decorative-pattern.svg" />

// Informative
<img alt="Pond aerial view showing water quality areas" src={pondImage} />

// Complex (use aria-describedby for long descriptions)
<img alt="Grade certificate" aria-describedby="cert-desc" src={cert} />
<p id="cert-desc">Grade A certificate showing moisture 12%, purity 95%</p>
```

## Dynamic Content

### Loading
```tsx
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? <Skeleton /> : <FarmerList farmers={data} />}
</div>
```

### Updates (Live Regions)
```tsx
// Polite: announce after current speech finishes
<div aria-live="polite">{syncStatus}</div>

// Assertive: interrupt immediately (use sparingly)
<div aria-live="assertive">Connection lost! 3 pending syncs.</div>
```

## Testing

### Automated
- `npm run lint` — ESLint with jsx-a11y plugin
- Lighthouse accessibility audit
- axe DevTools browser extension

### Manual
- Tab through every screen
- Test with screen reader (VoiceOver / NVDA)
- Zoom to 200% — nothing breaks
- Color contrast checker on all text/controls

## Accessibility Checklist Per Screen

- [ ] Semantic HTML landmarks present
- [ ] Heading hierarchy correct (no skipped levels)
- [ ] Skip to content link present and works
- [ ] All interactive elements keyboard accessible
- [ ] Focus visible on all focusable elements
- [ ] Focus order matches visual order
- [ ] No keyboard traps (especially modals/sheets)
- [ ] Escape closes modals/dialogs
- [ ] All images have appropriate alt text
- [ ] All form inputs have labels
- [ ] Icon-only buttons have aria-label
- [ ] Error messages linked to inputs via aria-describedby
- [ ] Toast/alert uses role="alert" and aria-live
- [ ] Color not sole indicator of information
- [ ] Touch targets 44×44px minimum
- [ ] Reduced motion respected
- [ ] Works at 200% zoom
- [ ] Screen reader announces content logically