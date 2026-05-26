# Documentation First Policy: Read Instructions Before Coding

## Rule: Read Workflow Documentation BEFORE Coding

**For every screen, read the documentation in `FenBridgeDocs/html/<workflow>/` first. These contain the build instructions.**

### The Sequence (MANDATORY)

1. **Read documentation** → `FenBridgeDocs/html/<workflow>/<screen-name>.html` (instructions)
2. **Read mockup** → `FenBridgeDocs/app/screens_v2/<workflow>/<screen-name>/code.html` (specification)
3. **Extract HTML/CSS** from mockup
4. **Implement in React** following documentation instructions
5. **Verify** against both docs and mockup

### Why Documentation Matters

The documentation files explain:
- ✅ **What the screen does** (purpose & user flow)
- ✅ **How to implement it** (step-by-step instructions)
- ✅ **What data it handles** (inputs, validation, storage)
- ✅ **How to connect it** (routing, state management, API calls)
- ✅ **Edge cases** (error handling, boundary conditions)
- ✅ **Accessibility requirements** (ARIA labels, keyboard nav)

**The mockup shows what it looks like. The documentation shows how to build it.**

---

## Workflow: Documentation → Mockup → Code

### Step 1: Read Documentation

**Location:** `FenBridgeDocs/html/<workflow>/<screen-name>.html`

**Example:**
```
FenBridgeDocs/html/scout/lot-verification.html
FenBridgeDocs/html/farmer_onboarding/welcome.html
FenBridgeDocs/html/buyer_onboarding/pond-geofencing.html
```

**Extract from documentation:**
- Screen purpose & user flow
- Form fields required
- Validation rules
- Data storage/retrieval
- Navigation logic
- Error handling
- Accessibility features

### Step 2: Read Mockup

**Location:** `FenBridgeDocs/app/screens_v2/<workflow>/<screen-name>/code.html`

**Extract from mockup:**
- HTML structure
- CSS classes (Tailwind + design tokens)
- Layout & spacing
- Colors & typography
- Icons & images
- Button placement & labels

### Step 3: Extract HTML/CSS

Copy the HTML structure and CSS classes directly from mockup (see `html-css-reuse-from-mockups.md`).

### Step 4: Implement Following Docs Instructions

Use the documentation as the implementation spec:

**Example from documentation:**
```
Screen: Lot Verification
Purpose: Scout verifies lot quality and assigns grade

Steps:
1. Display lot information (farmer name, pond, species, quantity)
2. Show inspection checklist (6 items, each can be passed/failed)
3. If all pass: Ask for grade assignment (A/B/C)
4. If any fail: Show rejection options
5. Save inspection results to localStorage
6. Navigate to next screen

Validation:
- At least 1 item must be checked
- Grade must be selected if all pass
- Rejection reason must be provided if failing

Error Handling:
- Show inline errors for validation
- Show alert if save fails
- Provide retry mechanism
```

**Implement exactly as specified:**
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LotVerificationSchema } from "@/validators/scout-onboarding.schema";

export default function LotVerificationPage() {
  const router = useRouter();
  const { register, formState: { errors }, handleSubmit } = useForm({
    resolver: zodResolver(LotVerificationSchema),
  });

  const onSubmit = async (data) => {
    // Step 1: Validation happens automatically via Zod
    // Step 2: Save to localStorage (as per docs)
    localStorage.setItem("fenbridge_lot_verification", JSON.stringify(data));
    
    // Step 3: Navigate to next screen (as per docs)
    if (data.allItemsPass) {
      router.push("/scout/lot-verification-grade");
    } else {
      router.push("/scout/lot-rejection");
    }
  };

  return (
    // HTML/CSS structure from mockup
    // Implementation logic from documentation
  );
}
```

---

## Documentation File Structure

Typical `FenBridgeDocs/html/<workflow>/<screen>.html` contains:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Screen Name - Instructions</title>
</head>
<body>
  <h1>Screen Name</h1>
  
  <section>
    <h2>Purpose</h2>
    <p>What this screen does and why...</p>
  </section>
  
  <section>
    <h2>User Flow</h2>
    <ol>
      <li>Step 1...</li>
      <li>Step 2...</li>
      <li>Step 3...</li>
    </ol>
  </section>
  
  <section>
    <h2>Form Fields</h2>
    <ul>
      <li>Field 1: type, validation, required?</li>
      <li>Field 2: type, validation, required?</li>
    </ul>
  </section>
  
  <section>
    <h2>Validation Rules</h2>
    <ul>
      <li>Rule 1...</li>
      <li>Rule 2...</li>
    </ul>
  </section>
  
  <section>
    <h2>Data Storage</h2>
    <p>Where data is saved (localStorage, API, etc.)</p>
  </section>
  
  <section>
    <h2>Navigation</h2>
    <p>Where to go next, based on conditions</p>
  </section>
  
  <section>
    <h2>Error Handling</h2>
    <p>How to handle errors, show messages, retry</p>
  </section>
  
  <section>
    <h2>Accessibility</h2>
    <ul>
      <li>ARIA labels required</li>
      <li>Keyboard navigation</li>
      <li>Screen reader support</li>
    </ul>
  </section>
</body>
</html>
```

---

## Implementation Checklist

For each screen:

- [ ] **Documentation Phase**
  - [ ] Read `FenBridgeDocs/html/<workflow>/<screen>.html`
  - [ ] Understand purpose & user flow
  - [ ] Note all form fields & validation rules
  - [ ] Identify data storage method
  - [ ] Plan navigation logic
  - [ ] Review accessibility requirements

- [ ] **Design Phase**
  - [ ] Read `FenBridgeDocs/app/screens_v2/<workflow>/<screen>/code.html`
  - [ ] Extract HTML structure
  - [ ] Extract CSS classes
  - [ ] Note layout & spacing
  - [ ] Identify icons/images

- [ ] **Implementation Phase**
  - [ ] Create React component (`"use client"`)
  - [ ] Copy HTML structure from mockup (exact)
  - [ ] Import validation schema
  - [ ] Implement form with React Hook Form + Zod
  - [ ] Implement state management (useState, useRouter)
  - [ ] Implement data storage (localStorage, API, etc.)
  - [ ] Implement navigation logic
  - [ ] Implement error handling
  - [ ] Add ARIA labels (from docs + additional)
  - [ ] Add keyboard navigation
  - [ ] Add loading states (aria-busy)

- [ ] **Verification Phase**
  - [ ] Compare HTML structure with mockup
  - [ ] Verify CSS classes match mockup exactly
  - [ ] Verify form validation matches documentation
  - [ ] Test user flow end-to-end
  - [ ] Test all error scenarios
  - [ ] Test keyboard navigation
  - [ ] Test responsive design (375px, 768px, 1024px)
  - [ ] Test accessibility (screen reader, ARIA)

---

## Example: Complete Workflow

### Documentation (FenBridgeDocs/html/scout/lot-verification.html)
```
Screen: Lot Verification

Purpose: Scout inspects a lot and verifies quality before sealing

Steps:
1. Display lot details (farmer name, pond, species, quantity, photos)
2. Present 6-item inspection checklist
3. Scout checks each item (pass/fail)
4. If all pass: Show grade selector (A/B/C)
5. If any fail: Show rejection reason selector
6. Save to localStorage as fenbridge_lot_verification_<lotId>
7. Navigate to: 
   - All pass → Lot Grading screen
   - Any fail → Rejection Handling screen

Form Fields:
- Item 1: Water Quality (checkbox)
- Item 2: Fish Count (checkbox)
- Item 3: Health (checkbox)
- Item 4: Feed Quality (checkbox)
- Item 5: Storage (checkbox)
- Item 6: Documentation (checkbox)
- Grade: Select (A/B/C) - only if all pass
- Rejection Reason: Text - only if any fail

Validation:
- At least 1 item must be checked
- Grade required if all pass
- Rejection reason required if any fail
- Min 10 chars for rejection reason
```

### Mockup (FenBridgeDocs/app/screens_v2/scout/lot_verification/code.html)
```html
<main class="flex-1 flex flex-col">
  <section class="space-y-4">
    <h1 class="text-2xl font-bold">Verify Lot Quality</h1>
    <div class="bg-surface-container p-4 rounded-lg">
      <p>Farmer: <strong>John Doe</strong></p>
      <p>Pond: <strong>Pond A</strong></p>
      <p>Quantity: <strong>500 kg</strong></p>
    </div>
  </section>
  
  <section class="space-y-3">
    <h2 class="font-semibold">Inspection Checklist</h2>
    <div class="space-y-2">
      <label class="flex items-center gap-2">
        <input type="checkbox" />
        <span>Water Quality</span>
      </label>
      <!-- More checkboxes -->
    </div>
  </section>
  
  <section class="space-y-2" id="grade-section">
    <label class="block">Grade</label>
    <select class="w-full border rounded-lg p-2">
      <option value="">Select Grade</option>
      <option value="A">Grade A</option>
      <option value="B">Grade B</option>
      <option value="C">Grade C</option>
    </select>
  </section>
</main>
```

### React Implementation
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LotVerificationSchema } from "@/validators/scout.schema";

export default function LotVerificationPage() {
  const router = useRouter();
  const [lotData] = useState({
    farmerName: "John Doe",
    pond: "Pond A",
    quantity: "500 kg"
  });

  const { register, formState: { errors }, watch, handleSubmit } = useForm({
    resolver: zodResolver(LotVerificationSchema),
    mode: "onBlur",
  });

  const allItemsPass = watch(["item1", "item2", "item3", "item4", "item5", "item6"])
    .every(v => v === true);

  const onSubmit = async (data) => {
    // Save per docs: localStorage as fenbridge_lot_verification_<lotId>
    localStorage.setItem("fenbridge_lot_verification_123", JSON.stringify(data));
    
    // Navigate per docs: all pass → grading, any fail → rejection
    if (allItemsPass) {
      router.push("/scout/lot-grading");
    } else {
      router.push("/scout/lot-rejection");
    }
  };

  return (
    <main className="flex-1 flex flex-col"> {/* HTML from mockup */}
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Verify Lot Quality</h1>
        <div className="bg-surface-container p-4 rounded-lg">
          <p>Farmer: <strong>{lotData.farmerName}</strong></p>
          <p>Pond: <strong>{lotData.pond}</strong></p>
          <p>Quantity: <strong>{lotData.quantity}</strong></p>
        </div>
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <h2 className="font-semibold">Inspection Checklist</h2>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("item1")}
              aria-invalid={!!errors.item1}
            />
            <span>Water Quality</span>
          </label>
          {/* More checkboxes following docs */}
        </div>

        {allItemsPass && (
          <section className="space-y-2" id="grade-section">
            <label className="block font-semibold">Grade</label>
            <select
              {...register("grade")}
              className="w-full border rounded-lg p-2"
              aria-label="Select grade A, B, or C"
              aria-invalid={!!errors.grade}
            >
              <option value="">Select Grade</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
            </select>
            {errors.grade && (
              <p className="text-error text-sm" role="alert">
                {errors.grade.message}
              </p>
            )}
          </section>
        )}

        {!allItemsPass && (
          <section className="space-y-2">
            <label className="block font-semibold">Rejection Reason</label>
            <textarea
              {...register("rejectionReason")}
              className="w-full border rounded-lg p-2"
              placeholder="Describe why this lot is rejected (min 10 chars)"
              aria-label="Reason for lot rejection"
              aria-invalid={!!errors.rejectionReason}
              aria-describedby={errors.rejectionReason ? "rejection-error" : undefined}
              minLength={10}
            />
            {errors.rejectionReason && (
              <p id="rejection-error" className="text-error text-sm" role="alert">
                {errors.rejectionReason.message}
              </p>
            )}
          </section>
        )}

        <button
          type="submit"
          className="w-full h-12 bg-primary text-on-primary font-bold rounded-lg"
          aria-label={allItemsPass ? "Proceed to grading" : "Submit rejection"}
        >
          {allItemsPass ? "Assign Grade" : "Submit Rejection"}
        </button>
      </form>
    </main>
  );
}
```

---

## Key Principles

1. **Documentation is the specification** - It tells you WHAT to build
2. **Mockup is the design** - It shows you HOW it looks
3. **Code is the implementation** - You combine both

**Never skip documentation.** It contains critical information about:
- Edge cases & error handling
- Data storage & retrieval
- Navigation flows
- Validation rules
- Accessibility requirements

---

**Status:** Active Policy - All screen implementations must read documentation first.
