---
name: scout-workflows-builder
description: Build Scout role workflows from FenBridgeDocs specifications only. 19 workflows across 6 tiers. Spec-first development mandatory.
user-invocable: true
---

# Scout Workflows Builder Skill

You are building Scout role workflows for FenBridge agricultural supply chain PWA. Your ONLY focus is Scout workflows — no Farmer workflows, no Buyer workflows, no Admin workflows.

**Core Principle:** Every line of code comes FROM FenBridgeDocs specifications. NEVER from assumptions, patterns, or prior work.

---

## THE SPEC-FIRST WORKFLOW

### Before Coding ANY Screen, Answer These 5 Questions

1. **Do I have the documentation?** (`FenBridgeDocs/html/scout/<workflow>/<screen>.html`)
2. **Do I have the mockup?** (`FenBridgeDocs/app/screens_v2/scout/<workflow>/<screen>/code.html`)
3. **Do the specs tell me exactly what to build?**
4. **Can I see what it should look like?**
5. **Am I about to make any assumptions?**

**If you hesitate on ANY question → STOP. Read more specs first.**

---

## 4-STEP IMPLEMENTATION WORKFLOW

### Step 1: Preparation (READ DOCUMENTATION)
```
1. Open FenBridgeDocs/html/scout/<workflow>/<screen>.html
2. Read the entire documentation (not skimming)
3. Extract and document:
   - Screen purpose & user flow
   - Form fields (name, type, validation rules)
   - Data storage method (localStorage key, API endpoint)
   - Navigation logic (where to go next)
   - Error handling requirements
   - Accessibility requirements (ARIA labels, keyboard nav)
```

### Step 2: Design Review (READ MOCKUP)
```
1. Open FenBridgeDocs/app/screens_v2/scout/<workflow>/<screen>/code.html
2. Read the entire HTML mockup
3. Extract and document:
   - HTML structure (exact div hierarchy)
   - CSS classes (exact Tailwind + design token classes)
   - Layout & spacing (exact values)
   - Colors & typography
   - Icons & images
   - Button placement & labels
   - Form field placement
```

### Step 3: React Implementation
```
1. Create component at correct location
2. Add "use client" directive (if interactive)
3. COPY HTML structure from mockup (EXACT, no changes)
4. Convert HTML to JSX syntax
5. Use EXACT CSS classes from mockup
6. Import React Hook Form + Zod
7. Define or import validation schema
8. Implement form with React Hook Form
   - register() for inputs
   - formState.errors for validation
   - handleSubmit() for form submission
9. Implement state management (useState, useRouter)
10. Implement data storage per documentation
11. Implement navigation logic per documentation
12. Add ARIA labels (aria-label, aria-describedby, aria-invalid)
13. Add keyboard navigation support
14. Add loading states (aria-busy)
15. Add error handling (error messages, retry buttons)
```

### Step 4: Verification
```
1. Compare HTML structure with mockup → Identical?
2. Compare CSS classes with mockup → Exact match?
3. Compare form fields with documentation → All present?
4. Compare validation rules with documentation → Match exactly?
5. Compare data storage with documentation → Correct method & key?
6. Compare navigation logic with documentation → Goes to right screen?
7. Test happy path end-to-end → Works?
8. Test all error scenarios → Handled?
9. Test keyboard navigation (Tab, Enter, Arrow keys) → Works?
10. Test responsive design (375px, 768px, 1024px) → All work?
11. Test screen reader (NVDA/JAWS/VoiceOver) → Accessible?
12. Side-by-side comparison with mockup → Looks identical?
13. TypeScript strict mode → No errors?
```

---

## 19 SCOUT WORKFLOWS TO BUILD

### TIER 1: Registration & Onboarding (18 screens)

**Workflow 1: Scout Farmer Registration (9 screens)**
- Documentation: `FenBridgeDocs/html/scout/farmer-registration.html`
- Mockups: `FenBridgeDocs/app/screens_v2/scout/scout_farmer_registration/`
- Build Path: `src/app/(auth)/scout-farmer-registration/<step>/page.tsx`
- Screens: Welcome, Identity Verification, Territory Assignment, Bank Account, Equipment, ID Upload, Supervisor, Permissions, Complete

**Workflow 2: Scout Popper/Supplier Registration (9 screens)**
- Documentation: `FenBridgeDocs/html/scout/popper-registration.html`
- Mockups: `FenBridgeDocs/app/screens_v2/scout/scout_popper_registration/`
- Build Path: `src/app/(auth)/scout-popper-registration/<step>/page.tsx`
- Screens: Welcome, Identity Verification, Warehouse, Documents, Bank/Tax, Products, Service Area, Supervisor, Complete

---

### TIER 2: Scout Dashboard (1 screen)

**Workflow 3: Scout Home Dashboard**
- Documentation: `FenBridgeDocs/html/scout/dashboard-home.html`
- Mockup: `FenBridgeDocs/app/screens_v2/scout/scout_dashboard/`
- Build Path: `src/app/(dashboard)/scout/page.tsx`
- Screen: Home dashboard with quick stats, tasks, announcements

---

### TIER 3: Scout Operational Workflows (35 screens)

**Workflow 4: Lot Verification (5 screens)**
- Documentation: `FenBridgeDocs/html/scout/lot-verification.html`
- Build Path: `src/app/(dashboard)/scout/lot-verification/[lotId]/<step>/page.tsx`

**Workflow 5: Seal Application (6 screens)**
- Documentation: `FenBridgeDocs/html/scout/seal-application.html`
- Build Path: `src/app/(dashboard)/scout/seal-application/[lotId]/<step>/page.tsx`

**Workflow 6: Storage Recheck (4 screens)**
- Documentation: `FenBridgeDocs/html/scout/storage-recheck.html`
- Build Path: `src/app/(dashboard)/scout/storage-recheck/[lotId]/<step>/page.tsx`

**Workflow 7: Re-Inspection (4 screens)**
- Documentation: `FenBridgeDocs/html/scout/re-inspection.html`
- Build Path: `src/app/(dashboard)/scout/re-inspection/[lotId]/<step>/page.tsx`

**Workflow 8: Rejection Handling (5 screens)**
- Documentation: `FenBridgeDocs/html/scout/rejection-handling.html`
- Build Path: `src/app/(dashboard)/scout/rejection-handling/[lotId]/<step>/page.tsx`

**Workflow 9: Warehouse Fitness Check (4 screens)**
- Documentation: `FenBridgeDocs/html/scout/warehouse-fitness-check.html`
- Build Path: `src/app/(dashboard)/scout/warehouse-fitness/[warehouseId]/page.tsx`

**Workflow 10: Mark Lot Ready (2 screens)**
- Documentation: `FenBridgeDocs/html/scout/mark-lot-ready.html`
- Build Path: `src/app/(dashboard)/scout/mark-lot-ready/[lotId]/page.tsx`

**Workflow 11: Bid Submission (5 screens)**
- Documentation: `FenBridgeDocs/html/scout/bid-submission.html`
- Build Path: `src/app/(dashboard)/scout/bid-submission/[requirementId]/<step>/page.tsx`

**Workflow 12: Spot Offer Submission (4 screens)**
- Documentation: `FenBridgeDocs/html/scout/spot-offer.html`
- Build Path: `src/app/(dashboard)/scout/spot-offer/<step>/page.tsx`

---

### TIER 4: Scout Management Workflows (9 screens)

**Workflow 13: Manage Farmers (2 screens)**
- Documentation: `FenBridgeDocs/html/scout/manage-farmers.html`
- Build Path: `src/app/(dashboard)/scout/manage-farmers/` (list + detail)

**Workflow 14: Manage Suppliers (2 screens)**
- Documentation: `FenBridgeDocs/html/scout/manage-suppliers.html`
- Build Path: `src/app/(dashboard)/scout/manage-suppliers/` (list + detail)

**Workflow 15: Scout Profile Settings (5 screens)**
- Documentation: `FenBridgeDocs/html/scout/profile-settings.html`
- Build Path: `src/app/(dashboard)/scout/settings/<section>/page.tsx`

---

### TIER 5: Scout Directories (6 screens)

**Workflow 16: Ponds Directory (2 screens)**
- Documentation: `FenBridgeDocs/html/scout/ponds-directory.html`
- Build Path: `src/app/(dashboard)/scout/directories/ponds/` (list + detail)

**Workflow 17: Warehouses Directory (2 screens)**
- Documentation: `FenBridgeDocs/html/scout/warehouses-directory.html`
- Build Path: `src/app/(dashboard)/scout/directories/warehouses/` (list + detail)

**Workflow 18: Users Directory (2 screens)**
- Documentation: `FenBridgeDocs/html/scout/users-directory.html`
- Build Path: `src/app/(dashboard)/scout/directories/users/` (list + detail)

---

### TIER 6: Scout Sync Queue (1 screen)

**Workflow 19: Sync Queue Management**
- Documentation: `FenBridgeDocs/html/scout/sync-queue.html`
- Build Path: `src/app/(dashboard)/scout/sync-queue/page.tsx`

---

## CODE PATTERNS

### Form Component Pattern
```tsx
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScreenSchema } from "@/validators/scout-workflows.schema";

export default function ScreenPage() {
  const router = useRouter();
  
  const { register, formState: { errors, isValid }, handleSubmit } = useForm({
    resolver: zodResolver(ScreenSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    // Store per documentation
    localStorage.setItem("fenbridge_<workflow>_<screen>", JSON.stringify(data));
    
    // Navigate per documentation
    router.push("/next-screen-per-docs");
  };

  return (
    <main className="flex-1 flex flex-col p-safe-area">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Form fields with exact CSS from mockup */}
        <button
          type="submit"
          disabled={!isValid}
          className="w-full h-12 bg-primary text-on-primary font-bold rounded-lg"
          aria-label="Submit form"
        >
          Submit
        </button>
      </form>
    </main>
  );
}
```

### Multi-Step Form Pattern
```tsx
"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StepSchema } from "@/validators/scout-workflows.schema";

const TOTAL_STEPS = 9; // From documentation

export default function StepPage() {
  const router = useRouter();
  const params = useParams();
  const step = parseInt(params.step as string);

  const { register, formState: { errors, isValid }, handleSubmit } = useForm({
    resolver: zodResolver(StepSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    // Store this step
    localStorage.setItem(`fenbridge_<workflow>_step${step}`, JSON.stringify(data));
    
    if (step < TOTAL_STEPS) {
      router.push(`/path/${step + 1}`);
    } else {
      router.push("/next-workflow");
    }
  };

  return (
    <main className="flex-1 flex flex-col p-safe-area">
      <h1>Step {step} of {TOTAL_STEPS}</h1>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
      
      <div className="flex gap-2">
        {step > 1 && (
          <button
            type="button"
            onClick={() => router.push(`/path/${step - 1}`)}
            className="flex-1 h-12 border border-outline rounded-lg"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid}
          className="flex-1 h-12 bg-primary text-on-primary rounded-lg"
        >
          {step < TOTAL_STEPS ? "Next" : "Complete"}
        </button>
      </div>
    </main>
  );
}
```

---

## TESTING CHECKLIST

For every screen before finishing:

- [ ] Matches mockup HTML structure (visually identical)
- [ ] Matches mockup CSS classes (exact)
- [ ] All form fields from documentation present
- [ ] All validation rules from documentation work
- [ ] Data stored per documentation (correct key, method)
- [ ] Navigation per documentation (goes to correct screen)
- [ ] No TypeScript errors (`strict: true`)
- [ ] Keyboard navigation works (Tab, Enter, Arrow keys)
- [ ] Focus indicators visible and clear
- [ ] ARIA labels present on all form inputs
- [ ] Errors display inline near field
- [ ] Loading state shows (aria-busy)
- [ ] Screen reader tested
- [ ] Responsive at 375px, 768px, 1024px
- [ ] Safe area padding respected (p-safe-area on main)
- [ ] Touch targets ≥ 44px minimum
- [ ] No console errors or warnings
- [ ] Side-by-side with mockup looks identical

**Do not merge until ALL checks pass.**

---

## BUILD ORDER (RECOMMENDED)

**Phase 1: Registration (Weeks 1-2)**
- Scout Farmer Registration (9 screens)
- Scout Popper Registration (9 screens)

**Phase 2: Dashboard & Core (Weeks 3-4)**
- Scout Dashboard (1 screen)
- Lot Verification (5 screens)
- Seal Application (6 screens)

**Phase 3: Operational Flows (Weeks 5-6)**
- Storage Recheck (4), Re-Inspection (4), Rejection Handling (5)
- Warehouse Fitness (4), Mark Lot Ready (2)

**Phase 4: Marketplace (Weeks 7-8)**
- Bid Submission (5)
- Spot Offer Submission (4)

**Phase 5: Management & Directories (Weeks 9-10)**
- Manage Farmers (2), Manage Suppliers (2), Settings (5)
- Ponds (2), Warehouses (2), Users (2)

**Phase 6: Offline Support (Week 11)**
- Sync Queue Management (1)

---

## CRITICAL RULES

- ✅ **Build FROM specs ONLY** — Read documentation + mockup FIRST
- ✅ **Answer the 5 questions** — Before touching ANY code
- ✅ **Extract HTML/CSS exactly** — From mockups, no rebuilding
- ✅ **Match mockup perfectly** — Side-by-side comparison required
- ✅ **Follow documentation exactly** — Form fields, validation, navigation, data storage
- ✅ **Accessibility mandatory** — WCAG 2.1 AA, tested with screen reader
- ✅ **Responsive design** — Works at 375px, 768px, 1024px
- ✅ **Type safety** — No `any`, strict TypeScript

❌ **NEVER:**
- Assume how it should work
- Copy code from other workflows
- Redesign the mockup
- Skip documentation
- Skip verification
- Use inline styles
- Hardcode colors/values
- Build components > 200 lines
- Make forms without React Hook Form + Zod

---

## SUCCESS CRITERIA

A Scout screen is **COMPLETE** when:

- ✅ Code matches documentation exactly
- ✅ Code matches mockup exactly
- ✅ TypeScript strict mode: zero errors
- ✅ Accessibility: WCAG 2.1 AA (screen reader tested)
- ✅ Responsive: 375px, 768px, 1024px all work
- ✅ Keyboard navigation: Tab, Enter, Arrow keys work
- ✅ Touch targets: All ≥ 44px
- ✅ Error states: Handled and shown
- ✅ Loading states: Shown with aria-busy
- ✅ Screen reader: Tested and accessible
- ✅ Verification: Side-by-side with mockup is identical
- ✅ No console errors/warnings
- ✅ Safe area padding respected

**Ready to merge? All checkboxes ✅?**

---

**Remember:** Every line of code comes FROM specs, NEVER from assumptions. Build Scout workflows correctly from FenBridgeDocs specifications.
