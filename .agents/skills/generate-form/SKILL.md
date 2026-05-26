---
name: generate-form
description: Generate production-grade mobile-first React Hook Form + Zod components
user-invocable: false
---

# Prompt: Generate Form Screen

## Usage
Use for any screen that is primarily a form (registration, settings, data entry).

---

You are a principal frontend engineer building a production-grade mobile-first React PWA form.

---

## TECH STACK

- Next.js 15 App Router
- React 19
- TypeScript strict mode
- TailwindCSS (design tokens from `src/app/globals.css`)
- React Hook Form
- Zod
- Zustand (for multi-step form state persistence)
- Material Symbols Outlined icons

---

## FORM ARCHITECTURE REQUIREMENTS

### Zod Schema First
- Define complete Zod validation schema before any component
- Place in `src/validators/<feature>.schema.ts`
- Include all field validations, refinements, and superRefine for cross-field validation

### React Hook Form Integration
- `useForm` with `zodResolver`
- Proper `defaultValues` (never undefined)
- `mode: "onChange"` for registration/wizard steps (real-time feedback expected)
- `shouldFocusError: true` for accessibility

### Field Components (3-Part Pattern)
Every field must have three parts in this exact structure:
1. **Label block** with uppercase font-label-md, text-on-surface-variant, flex between label + asterisk
2. **Input element** with Tailwind utility classes (w-full, bg-surface-container, py-3, px-4, rounded-lg, border border-outline-variant)
3. **Error message paragraph** with id matching aria-describedby, role="alert", red error color, animate-pulse if animated

**Example structure:**
```tsx
<div className="space-y-2">
  <label className="text-label-md font-label-md text-on-surface-variant uppercase tracking-widest flex justify-between">
    Field Label <span className="text-primary text-[10px]">* MANDATORY</span>
  </label>
  <input
    {...register("fieldName")}
    className="w-full bg-surface-container border border-outline-variant text-on-surface py-3 px-4 rounded-lg focus:outline-none focus:border-primary transition-colors font-body-lg"
    aria-invalid={!!errors.fieldName}
    aria-describedby={errors.fieldName ? "fieldName-error" : undefined}
  />
  {errors.fieldName && (
    <p id="fieldName-error" className="text-error text-body-md font-bold px-2" role="alert">
      {errors.fieldName.message}
    </p>
  )}
</div>
```

### Submission Handling
- `useMutation` from TanStack Query for async submission
- Disable submit button during mutation (`formState.isSubmitting || mutation.isPending`)
- Show loading spinner in submit button
- Handle: success (redirect/toast), error (inline + toast), network error (retry UI)

### Multi-Step Forms
- Use `useForm` with `formState` across steps via context or single form with conditional sections
- Step indicator at top
- Back/Next buttons
- Keep step state in URL if deep-linkable

### Draft Persistence (Multi-Step Forms)
- Save draft to `localStorage` with key pattern: `fenbridge_<feature>_<step>`
- Restore on mount: read, parse, call `setValue(field, value, { shouldValidate: true })`
- Gate check: if required previous step missing, `router.replace()` to that step
- Render guard: `if (!isLoaded) return null` to prevent hydration flash
- On submit: save to localStorage, then navigate to next step

---

## MOBILE UX REQUIREMENTS

- Full-width inputs on mobile
- Labels above inputs (not side-by-side)
- Touch targets ≥ 44px height
- Keyboard type per field (`inputMode`, `type`)
- Avoid opening keyboard unnecessarily
- Sticky submit button at bottom on mobile
- Safe area padding for bottom button
- Scroll to first error on validation failure
- Avoid dropdowns on mobile (use native select or bottom sheet)

---

## ACCESSIBILITY REQUIREMENTS

- Every input has associated `<Label>`
- Error messages linked via `aria-describedby`
- Required fields marked with asterisk + `aria-required`
- Focus trapped in modals/sheets during multi-step confirmation
- Submit button announces state via `aria-busy`
- Keyboard: Tab through fields, Enter to submit
- Color not sole indicator of error state

---

## STATE REQUIREMENTS

- Form state: React Hook Form (local)
- Submission state: TanStack Query `useMutation`
- Draft persistence: Zustand (optional, if multi-step or long form)
- Dependent data (dropdowns): TanStack Query `useQuery`

---

## OUTPUT

1. Zod schema definitions
2. TypeScript interfaces for form data
3. Component file list with responsibilities
4. Form field components
5. Form page component
6. Submission handling hooks
7. Loading/error/empty states
8. Mobile UX annotations
9. Accessibility annotations

---

## CRITICAL RULES

- All forms use React Hook Form + Zod — NO exceptions
- No form state in plain useState
- No inline validation logic
- No hardcoded error messages
- Use design tokens for spacing/colors
- Mobile-first layout
- Accessible by default