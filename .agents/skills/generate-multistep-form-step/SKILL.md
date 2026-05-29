---
name: generate-multistep-form-step
description: Create multi-step wizard form pages with localStorage draft persistence and gate checks
user-invocable: false
---

# Skill: Generate Multi-Step Form Step

## Usage

Use for creating individual step pages in a multi-step form wizard. Each step is a client component that validates, persists to localStorage, and gates the next step.

---

## Core Pattern

Every multi-step form step follows this structure:

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { StepSchema } from "@/validators/scout-workflows.schema";
import { StepSchema } from "@/validators/scout-workflows.schema";

const STEP_NUMBER = 1;
const TOTAL_STEPS = 12;
const STORAGE_KEY = "fenbridge_scout_farmer_registration_step1";
const PREVIOUS_STEP_STORAGE_KEY = "fenbridge_scout_farmer_registration_step0"; // Only for step > 1
const NEXT_STEP_URL = "/scout-farmer-registration/step-2";

export default function RegistrationStep1() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  const { register, handleSubmit, formState: { errors, isValid }, setValue } = useForm<StepSchema>({
    mode: "onChange",
    resolver: zodResolver(StepSchema),
  });

  // Gate: Redirect if previous step not complete (for step > 1)
  useEffect(() => {
    if (STEP_NUMBER > 1) {
      const previousStepData = localStorage.getItem(PREVIOUS_STEP_STORAGE_KEY);
      if (!previousStepData) {
        router.replace(`/scout-farmer-registration/step-${STEP_NUMBER - 1}`);
        return;
      }
    }
    setIsLoaded(true);
  }, [router]);

  // Restore persisted data
  useEffect(() => {
    if (!isLoaded) return;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      // Restore each field with validation
      Object.entries(data).forEach(([key, value]) => {
        setValue(key as any, value, { shouldValidate: true });
      });
    }
  }, [isLoaded, setValue]);

  const onSubmit = (data: StepSchema) => {
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    // Navigate to next step
    router.push(NEXT_STEP_URL);
  };

  const handleSaveDraft = () => {
    // Get current form values (without full validation)
    const formData = new FormData();
    // Manually collect values from registered fields or use getValues()
    // Then save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  };

  if (!isLoaded) return null;

  const progressPercentage = ((STEP_NUMBER - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="min-h-screen bg-surface">
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-high transition-colors text-primary"
            aria-label="Back to previous step"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <h1 className="text-headline-sm font-headline-sm text-primary font-bold truncate">
            Step {STEP_NUMBER}: Introduction
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
            aria-label="More options"
          >
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </header>

      {/* Progress Bar (Sticky) */}
      <div className="sticky top-16 left-0 w-full z-40 bg-surface-container/90 backdrop-blur-md border-b border-outline-variant/30 mt-16 px-margin-mobile py-3">
        <div className="max-w-2xl mx-auto">
          <div className="relative w-full h-6 bg-surface-container-highest rounded-full overflow-hidden border border-outline-variant/30">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Registration progress Step ${STEP_NUMBER} of ${TOTAL_STEPS}`}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-on-primary-container uppercase tracking-widest">
                Step {STEP_NUMBER} of {TOTAL_STEPS}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Form Content */}
      <div className="pt-0">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto px-margin-mobile py-6">
          {/* Form Fields - Use 3-Part Pattern for Each */}
          <div className="space-y-6">
            {/* Example Field 1 */}
            <div className="space-y-2">
              <label className="text-label-md font-label-md text-on-surface-variant uppercase tracking-widest flex justify-between">
                Full Name
                <span className="text-primary text-[10px]">* MANDATORY</span>
              </label>
              <input
                {...register("fullName")}
                className="w-full bg-surface-container border border-outline-variant text-on-surface py-3 px-4 rounded-lg focus:outline-none focus:border-primary transition-colors font-body-lg"
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? "fullName-error" : undefined}
              />
              {errors.fullName && (
                <p id="fullName-error" className="text-error text-body-md font-bold px-2 animate-pulse" role="alert">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Example Field 2 */}
            <div className="space-y-2">
              <label className="text-label-md font-label-md text-on-surface-variant uppercase tracking-widest flex justify-between">
                Mobile Number
                <span className="text-primary text-[10px]">* MANDATORY</span>
              </label>
              <input
                {...register("mobileNumber")}
                type="tel"
                className="w-full bg-surface-container border border-outline-variant text-on-surface py-3 px-4 rounded-lg focus:outline-none focus:border-primary transition-colors font-body-lg"
                aria-invalid={!!errors.mobileNumber}
                aria-describedby={errors.mobileNumber ? "mobileNumber-error" : undefined}
              />
              {errors.mobileNumber && (
                <p id="mobileNumber-error" className="text-error text-body-md font-bold px-2 animate-pulse" role="alert">
                  {errors.mobileNumber.message}
                </p>
              )}
            </div>
          </div>

          {/* Bottom CTA Buttons */}
          <div className="mt-12 pb-12 flex gap-4">
            <button
              type="submit"
              disabled={!isValid}
              className={isValid
                ? "flex-grow bg-primary text-on-primary font-bold py-4 rounded-full text-headline-sm flex justify-center items-center gap-2 cursor-pointer shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                : "flex-grow bg-outline-variant text-on-surface-variant font-bold py-4 rounded-full text-headline-sm flex justify-center items-center gap-2 cursor-not-allowed opacity-50 transition-transform"
              }
              aria-label="Continue to next step"
            >
              Continue
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>

            <button
              type="button"
              disabled={!isValid}
              onClick={handleSaveDraft}
              className={isValid
                ? "px-6 border border-outline-variant text-on-surface-variant font-label-md py-4 rounded-full uppercase tracking-wider hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer"
                : "px-6 border border-outline-variant text-on-surface-variant/40 font-label-md py-4 rounded-full uppercase tracking-wider cursor-not-allowed opacity-40 transition-all"
              }
              aria-label="Save draft and come back later"
            >
              Save Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## Key Implementation Details

### 1. Constants Section

```ts
const STEP_NUMBER = 1;
const TOTAL_STEPS = 12;
const STORAGE_KEY = "fenbridge_scout_farmer_registration_step1";
const PREVIOUS_STEP_STORAGE_KEY = "fenbridge_scout_farmer_registration_step0"; // Only if STEP_NUMBER > 1
const NEXT_STEP_URL = "/scout-farmer-registration/step-2";
```

**Update these for each step.** `STORAGE_KEY` format: `fenbridge_scout_farmer_registration_step<N>`.

### 2. Gate Check (for step > 1)

```ts
useEffect(() => {
  if (STEP_NUMBER > 1) {
    const previousStepData = localStorage.getItem(PREVIOUS_STEP_STORAGE_KEY);
    if (!previousStepData) {
      router.replace(`/scout-farmer-registration/step-${STEP_NUMBER - 1}`);
      return;
    }
  }
  setIsLoaded(true);
}, [router]);
```

**Rule:** If previous step data is missing, redirect to that step (not optional). This prevents skipping steps.

### 3. Render Guard

```ts
const [isLoaded, setIsLoaded] = useState(false);

// ... in useEffect after gate check ...
setIsLoaded(true);

if (!isLoaded) return null; // Don't render until gate passed and data loaded
```

**Rule:** Always return `null` until `isLoaded` is true. Prevents hydration mismatch and flashing.

### 4. Form Setup

```ts
const { register, handleSubmit, formState: { errors, isValid }, setValue } = useForm<StepSchema>({
  mode: "onChange",
  resolver: zodResolver(StepSchema),
});
```

**Rule:** `mode: "onChange"` (not `onBlur`) so validation fires as user types, enabling Continue button.

### 5. Data Restoration

```ts
useEffect(() => {
  if (!isLoaded) return;
  
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const data = JSON.parse(saved);
    Object.entries(data).forEach(([key, value]) => {
      setValue(key as any, value, { shouldValidate: true });
    });
  }
}, [isLoaded, setValue]);
```

**Rule:** 
- Restore AFTER `isLoaded` becomes true
- Use `setValue(..., { shouldValidate: true })` so validation runs on restored values
- Each field is restored individually

### 6. Submit Handler

```ts
const onSubmit = (data: StepSchema) => {
  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  
  // Navigate to next step
  router.push(NEXT_STEP_URL);
};
```

**Rule:** Save first, then navigate. Next step's restoration runs immediately.

### 7. Save Draft Handler

```ts
const handleSaveDraft = () => {
  const formData = new FormData();
  // Manually collect from registered fields or use getValues()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
};
```

**Rule:** Save current state without validating entire form. User can save incomplete drafts.

### 8. Progress Bar Calculation

```ts
const progressPercentage = ((STEP_NUMBER - 1) / (TOTAL_STEPS - 1)) * 100;
```

**Formula:** `(currentStep - 1) / (totalSteps - 1) * 100`. For 12 total steps:
- Step 1 = 0%
- Step 6 = 50%
- Step 12 = 100%

---

## 4 Structural DOM Pieces (Required in Every Step)

### 1. Top App Bar (Fixed)

```tsx
<header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile h-16 bg-surface border-b border-outline-variant">
  <div className="flex items-center gap-4">
    <button onClick={() => router.back()} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-high transition-colors text-primary">
      <span className="material-symbols-outlined text-xl">arrow_back</span>
    </button>
    <h1 className="text-headline-sm font-headline-sm text-primary font-bold truncate">
      Step N: Title
    </h1>
  </div>
</header>
```

**Classes:** `fixed top-0 z-50 h-16 bg-surface border-b border-outline-variant`

### 2. Progress Bar (Sticky)

```tsx
<div className="sticky top-16 left-0 w-full z-40 bg-surface-container/90 backdrop-blur-md border-b border-outline-variant/30 mt-16 px-margin-mobile py-3">
  <div className="max-w-2xl mx-auto">
    <div className="relative w-full h-6 bg-surface-container-highest rounded-full overflow-hidden border border-outline-variant/30">
      <div
        className="h-full bg-primary transition-all duration-500"
        style={{ width: `${progressPercentage}%` }}
        role="progressbar"
        aria-valuenow={progressPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Registration progress Step ${STEP_NUMBER} of ${TOTAL_STEPS}`}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[10px] font-bold text-on-primary-container uppercase tracking-widest">
          Step N of Total
        </span>
      </div>
    </div>
  </div>
</div>
```

**Classes:** `sticky top-16 z-40 backdrop-blur-md`. Must stick below fixed header at `top-16` (64px).

### 3. Scrollable Form Content

```tsx
<div className="pt-0">
  <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto px-margin-mobile py-6">
    {/* Form fields with 3-part pattern */}
  </form>
</div>
```

**Classes:** `max-w-2xl mx-auto` (centering), `px-margin-mobile` (side padding), `py-6` (top/bottom padding).

### 4. Bottom CTA Buttons

```tsx
<div className="mt-12 pb-12 flex gap-4">
  <button type="submit" disabled={!isValid} className={...}>
    Continue
    <span className="material-symbols-outlined">arrow_forward</span>
  </button>

  <button type="button" disabled={!isValid} onClick={handleSaveDraft} className={...}>
    Save Draft
  </button>
</div>
```

**Classes:** `mt-12 pb-12 flex gap-4` (margin above, padding below for bottom nav). Dynamic classes from `isValid` boolean.

---

## localStorage Key Convention

```ts
fenbridge_scout_farmer_registration_step<N>
```

Examples:
- Step 1: `fenbridge_scout_farmer_registration_step1`
- Step 6: `fenbridge_scout_farmer_registration_step6`
- Step 12: `fenbridge_scout_farmer_registration_step12`

**Format:** All lowercase, underscores, no hyphens.

---

## File Structure

```
src/app/(dashboard)/scout-farmer-registration/
├── step-1/
│   └── page.tsx          ← Step 1 component
├── step-2/
│   └── page.tsx          ← Step 2 component
├── step-3/
│   └── page.tsx          ← Step 3 component
└── ... (up to step-12)
```

---

## Error Handling

Form validation errors are displayed inline using the 3-part field pattern:

```tsx
{errors.fieldName && (
  <p id="fieldName-error" className="text-error text-body-md font-bold px-2 animate-pulse" role="alert">
    {errors.fieldName.message}
  </p>
)}
```

**Rule:** Errors must be defined in the Zod schema with descriptive messages.

---

## Accessibility Requirements

- ✅ **Gate check** — Prevent skipping steps
- ✅ **Render guard** — Return `null` until loaded
- ✅ **Form validation** — `mode: "onChange"` for immediate feedback
- ✅ **Progress bar** — `role="progressbar"` with ARIA attributes
- ✅ **Form fields** — 3-part pattern with `aria-invalid`, `aria-describedby`
- ✅ **Material icons** — Use `material-symbols-outlined` class
- ✅ **Button states** — Dynamic disabled/enabled based on `isValid`
- ✅ **Keyboard navigation** — All interactive elements in tab order

---

## Critical Rules

- ✅ **`"use client"` directive** — Client component with browser APIs
- ✅ **Gate check for step > 1** — Redirect if previous step missing
- ✅ **Render guard** — Return `null` until `isLoaded`
- ✅ **localStorage key format** — `fenbridge_scout_farmer_registration_step<N>`
- ✅ **Progress calculation** — `(currentStep - 1) / (totalSteps - 1) * 100`
- ✅ **useForm mode** — `mode: "onChange"` (not `onBlur`)
- ✅ **setValue with validation** — `{ shouldValidate: true }`
- ✅ **4 structural pieces** — TopAppBar + ProgressBar + Form + BottomCTA
- ✅ **Dynamic button classes** — Computed from `isValid`, no `cn()` utility
- ✅ **Form field 3-part pattern** — Label + Input + Error (every field)
- ✅ **Save then navigate** — `localStorage.setItem()` before `router.push()`

