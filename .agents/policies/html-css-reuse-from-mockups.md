# HTML/CSS Reuse Policy: Extract & Adapt from Mockups

## Rule: Use HTML Structure & CSS Directly from Mockups

**Don't rebuild the HTML/CSS structure. Extract it from the mockups and adapt it to React.**

### The Principle

The mockups in `FenBridgeDocs/app/screens_v2/<workflow>/` contain:
- ✅ Correct HTML structure (semantic, accessible)
- ✅ Correct CSS classes (Tailwind + design tokens)
- ✅ Correct layout & spacing
- ✅ Correct form field markup

**Reuse them. Don't reinvent.**

---

## Workflow: Extract → Adapt → Build

### Step 1: Read the Mockup HTML
```
FenBridgeDocs/app/screens_v2/farmer_onboarding/welcome_to_fenbridge/code.html
```

### Step 2: Extract the Relevant Section
**Example from mockup:**
```html
<main class="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto px-margin pt-xl pb-md">
    <div class="mb-lg relative">
        <div class="absolute inset-0 bg-primary/25 blur-3xl rounded-full"></div>
        <img alt="FenBridge Logo" class="relative w-24 h-24 object-contain mx-auto"/>
    </div>

    <section class="space-y-1 mb-lg w-full">
        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10">
            <span id="role-indicator-badge">Role: Farmer</span>
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight text-on-surface">
            Welcome to <span class="text-primary">FenBridge</span>
        </h1>
    </section>

    <div class="w-full bg-surface-container-low border border-outline-variant p-5 rounded-2xl space-y-4">
        <label class="block font-label-lg text-xs font-semibold uppercase tracking-wider text-primary">Mobile Number</label>
        <div class="flex items-center bg-surface-container-lowest border border-outline-variant rounded-xl h-12">
            <div class="flex items-center gap-1 pl-3.5 pr-2.5 bg-surface-container-low">
                <span>+91</span>
            </div>
            <input class="w-full bg-transparent px-3 py-2" placeholder="98765 43210" type="tel"/>
        </div>
    </div>
</main>
```

### Step 3: Adapt to React Component
**Keep the HTML structure intact, convert to JSX:**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WelcomeSchema, type WelcomeInput } from "@/validators/farmer-onboarding.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function WelcomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, formState: { errors, isValid }, handleSubmit } = useForm<WelcomeInput>({
    resolver: zodResolver(WelcomeSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: WelcomeInput) => {
    setIsLoading(true);
    try {
      localStorage.setItem("fenbridge_farmer_step1", JSON.stringify(data));
      router.push("/(auth)/choose-language");
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto px-margin pt-xl pb-md">
      {/* Logo Container - EXACT FROM MOCKUP */}
      <div className="mb-lg relative">
        <div className="absolute inset-0 bg-primary/25 blur-3xl rounded-full"></div>
        <img 
          alt="FenBridge Logo" 
          className="relative w-24 h-24 object-contain mx-auto transition-transform hover:scale-105 duration-300 filter drop-shadow-[0_0_15px_rgba(78,222,163,0.3)]"
          src="/logo.png"
        />
      </div>

      {/* Typography Stack - EXACT FROM MOCKUP */}
      <section className="space-y-1 mb-lg w-full">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary font-semibold text-[11px] tracking-widest uppercase rounded-full border border-primary/20 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          <span id="role-indicator-badge">Role: Farmer</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface font-['Hanken_Grotesk']">
          Welcome to <span className="text-primary">FenBridge</span>
        </h1>
        <p className="font-body-md text-sm text-on-surface-variant max-w-[280px] mx-auto">
          Enter your mobile number to instantly sign in or register your account.
        </p>
      </section>

      {/* Form Container - EXACT FROM MOCKUP */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full bg-surface-container-low border border-outline-variant p-5 rounded-2xl shadow-xl space-y-4 text-left">
        <div className="space-y-1.5">
          <label className="block font-label-lg text-xs font-semibold uppercase tracking-wider text-primary">
            Mobile Number
          </label>
          <div className="flex items-center bg-surface-container-lowest border border-outline-variant rounded-xl focus-within:border-primary focus-within:ring-1 focus-within:ring-primary overflow-hidden h-12 transition-all">
            <div className="flex items-center gap-1 pl-3.5 pr-2.5 py-2 bg-surface-container-low text-on-surface border-r border-outline-variant/40 select-none font-semibold text-sm h-full">
              <span>+91</span>
            </div>
            <Input
              {...register("phoneNumber")}
              type="tel"
              inputMode="numeric"
              placeholder="98765 43210"
              maxLength={10}
              className="w-full bg-transparent px-3 py-2 text-on-surface outline-none font-body-md placeholder:text-outline/40 border-none focus:ring-0 text-sm tracking-wide"
              aria-label="Phone number without country code"
              aria-invalid={!!errors.phoneNumber}
              aria-describedby={errors.phoneNumber ? "phoneNumber-error" : undefined}
              autoFocus
            />
          </div>
          {errors.phoneNumber && (
            <p id="phoneNumber-error" className="text-sm text-error flex items-center gap-1.5">
              <span>!</span>
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        {/* Security Info - EXACT FROM MOCKUP */}
        <div className="flex items-start gap-2.5 p-3 bg-surface-container-highest/40 rounded-xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 flex-shrink-0">shield_lock</span>
          <p className="text-[11px] leading-relaxed text-on-surface-variant">
            Institutional security protocol active. Authenticating via continuous multi-role cryptographic mapping.
          </p>
        </div>

        {/* Submit Button - EXACT FROM MOCKUP */}
        <Button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full h-12 bg-primary-container text-on-primary-container font-semibold text-sm rounded-xl shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer safe-area-inset-bottom"
          aria-label="Send verification code"
          aria-busy={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full" />
          ) : (
            <>
              <span>Send OTP</span>
              <span>→</span>
            </>
          )}
        </Button>
      </form>
    </main>
  );
}
```

---

## Key Principles

### 1. **Copy the Structure First**
- Take the HTML from mockup exactly as-is
- Don't rearrange or "improve" it
- Preserve all div nesting, spacing classes

### 2. **Preserve All CSS Classes**
- `flex-1 flex flex-col items-center justify-center` → Keep all
- `space-y-1 mb-lg` → Keep exact spacing
- `bg-primary/25 blur-3xl` → Keep all effects
- Only adjust when necessary for React specifics

### 3. **Add React Functionality**
- Form submission logic
- State management
- Navigation
- Validation
- ARIA labels (in addition to mockup)

### 4. **One-to-One Mapping**
- HTML div → JSX div
- HTML input → Input component (or native input)
- HTML label → label element
- HTML button → Button component (or native button)

---

## What NOT to Do

❌ **Don't:**
- Simplify the HTML structure
- Reorganize div hierarchy
- Remove CSS classes
- Change spacing/layout
- Rebuild from scratch
- Use different components than mockup suggests

✅ **Do:**
- Extract HTML verbatim
- Convert to JSX syntax
- Add React state/handlers
- Enhance with ARIA (if not in mockup)
- Use exact same CSS

---

## Example: Spacing Must Match

**Mockup:**
```html
<div class="mb-lg relative">
  <div class="absolute inset-0 bg-primary/25 blur-3xl rounded-full"></div>
  <img class="relative w-24 h-24 object-contain mx-auto"/>
</div>
<section class="space-y-1 mb-lg w-full">
```

**React (EXACT MATCH):**
```tsx
<div className="mb-lg relative">
  <div className="absolute inset-0 bg-primary/25 blur-3xl rounded-full"></div>
  <img className="relative w-24 h-24 object-contain mx-auto" />
</div>
<section className="space-y-1 mb-lg w-full">
```

**NOT:**
```tsx
<div className="mb-8 relative">  // ❌ Changed mb-lg to mb-8
  <div className="absolute inset-0 bg-primary/20 blur-3xl"/>  // ❌ Removed rounded-full
  <img className="w-24 h-24"/>  // ❌ Removed object-contain, mx-auto
</div>
```

---

## Implementation Checklist

- [ ] Read mockup HTML from `FenBridgeDocs/app/screens_v2/`
- [ ] Extract complete HTML structure (copy-paste section)
- [ ] Convert HTML to JSX syntax
- [ ] Add `"use client"` directive
- [ ] Add form validation (React Hook Form + Zod)
- [ ] Add state management (useState)
- [ ] Add navigation (useRouter)
- [ ] Add ARIA labels (aria-label, aria-describedby, aria-invalid, etc.)
- [ ] Verify all CSS classes match mockup exactly
- [ ] Test at 375px, 768px, 1024px breakpoints
- [ ] Compare screenshot with mockup side-by-side

---

**Status:** Active Policy - All screen implementations must follow this.
