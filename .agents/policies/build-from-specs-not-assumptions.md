# Build From Specifications, Never From Assumptions

## Core Rule: No Assumptions. Only Specs.

**Everything must be built FROM the mockups and documentation. Never from assumptions, patterns, or prior work.**

---

## The Principle

### ❌ WRONG (What Happened Before)
```
1. "I know how to build an onboarding screen"
2. "I remember patterns from other projects"
3. "I'll build a welcome screen based on experience"
4. [Builds screen from memory/assumptions]
5. [Screen looks nothing like the actual mockup]
```

### ✅ RIGHT (Going Forward)
```
1. Read FenBridgeDocs/html/<workflow>/<screen>.html (instructions)
2. Read FenBridgeDocs/app/screens_v2/<workflow>/<screen>/code.html (design)
3. "This is exactly what needs to be built"
4. [Build screen to match specs exactly]
5. [Screen matches mockup pixel-perfect]
```

---

## Why Assumptions Fail

### The Cost of Assumptions
- **Different UI layout** — Designer intended one thing, you built another
- **Missing fields** — Form is incomplete
- **Wrong validation** — User flow breaks
- **Wrong data handling** — localStorage vs API mismatch
- **Wrong navigation** — Goes to wrong screen
- **Accessibility issues** — ARIA labels missing or wrong
- **Wrong content/copy** — Text doesn't match design intent

**Result: Code looks & works different from specs. That's broken code.**

---

## Specification Sources (In Order)

### 1. Documentation (Primary Spec - WHAT to build)
**Location:** `FenBridgeDocs/html/<workflow>/<screen>.html`

Contains:
- Screen purpose & user flow
- Form fields & their types
- Validation rules
- Data storage location
- Navigation logic
- Error handling
- Accessibility requirements

**Read this first. It's the instruction manual.**

### 2. Mockup (Design Spec - HOW it looks)
**Location:** `FenBridgeDocs/app/screens_v2/<workflow>/<screen>/code.html`

Contains:
- HTML structure
- CSS classes (exact)
- Layout & spacing (exact)
- Colors & typography
- Icons & images
- Button placement
- Form field placement

**Read this second. It's the visual specification.**

### 3. Previous Similar Screens (Reference Only - NOT spec)
**Location:** `src/app/` (existing code)

**Use only for:**
- Understanding React patterns
- Code organization
- Component structure
- Styling approach

**Do NOT use for:**
- Content or copy
- Form field decisions
- Validation rules
- Navigation logic
- Data handling

**If previous code doesn't match specs, don't copy it. The specs are correct, previous code might be wrong.**

---

## Anti-Pattern: Copy-Paste from Similar Screens

### ❌ WRONG
```tsx
// "I built a welcome screen before, I'll copy that"
import WelcomePageFarmer from "...existing/welcome";

export default function WelcomePageBuyer() {
  // Just change a few strings
  return <WelcomePageFarmer title="Buyer Welcome" />;
}
```

**Problem:** Assumes the old screen is correct. But it was built without checking specs, so it's probably wrong.

### ✅ RIGHT
```tsx
// Read the Buyer welcome specs from FenBridgeDocs
// It might be completely different from Farmer welcome
// Build fresh from specs

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BuyerWelcomeSchema } from "@/validators/buyer-onboarding.schema";

// Extract from FenBridgeDocs/html/buyer_onboarding/welcome.html
// Extract HTML from FenBridgeDocs/app/screens_v2/buyer_onboarding/welcome/code.html
// Build to match specs exactly

export default function WelcomePageBuyer() {
  const router = useRouter();
  // ... implementation from specs
}
```

---

## The Questions to Ask Before Coding

### Before touching ANY code:

1. **Do I have documentation?**
   - ✅ Read `FenBridgeDocs/html/<workflow>/<screen>.html`
   - ❌ If not found, ask the user for clarification

2. **Do I have a mockup?**
   - ✅ Read `FenBridgeDocs/app/screens_v2/<workflow>/<screen>/code.html`
   - ❌ If not found, ask the user for clarification

3. **Do the specs tell me exactly what to build?**
   - ✅ I can extract requirements, form fields, validation, data handling
   - ❌ If ambiguous, ask the user for clarification

4. **Can I see what it should look like?**
   - ✅ I have the HTML structure and CSS from mockup
   - ❌ If missing details, ask the user

5. **Am I about to make any assumptions?**
   - ✅ Stop. Re-read the specs.
   - ❌ If tempted to assume, that's a sign I'm missing something from specs

**If you can't answer YES to all 5, don't code. Read more specs first.**

---

## Red Flags: When You're Making Assumptions

### 🚩 "I think this should work like..."
→ Stop. Read the documentation. It tells you exactly how it should work.

### 🚩 "This is similar to the X screen, so I'll..."
→ Stop. Read THIS screen's specs. It might be completely different.

### 🚩 "Users probably want..."
→ Stop. Read the mockup. The designer already decided what users get.

### 🚩 "I remember building something like this..."
→ Stop. Every screen is different. Read the specs for THIS screen.

### 🚩 "This form field looks optional, so..."
→ Stop. Read the documentation. It defines required fields.

### 🚩 "I'll refactor this to be more elegant..."
→ Stop. Match the specs first. Elegance comes later, if needed.

### 🚩 "The old code structure works, so I'll reuse it..."
→ Stop. The old code might be wrong. Build from specs instead.

---

## Checklist: Am I Building from Specs?

Before starting ANY screen:

- [ ] **Documentation Phase**
  - [ ] Located `FenBridgeDocs/html/<workflow>/<screen>.html`
  - [ ] Read entire documentation
  - [ ] Extracted all requirements
  - [ ] No assumptions about missing details

- [ ] **Mockup Phase**
  - [ ] Located `FenBridgeDocs/app/screens_v2/<workflow>/<screen>/code.html`
  - [ ] Read HTML structure
  - [ ] Noted all CSS classes
  - [ ] Identified layout & spacing
  - [ ] No changes or "improvements" planned

- [ ] **Code Phase**
  - [ ] Built component structure matching mockup HTML exactly
  - [ ] Used exact CSS classes from mockup
  - [ ] Implemented logic matching documentation exactly
  - [ ] No assumptions about UX or flow
  - [ ] No copy-paste from other screens without verification

- [ ] **Verification Phase**
  - [ ] Compare HTML structure with mockup → match?
  - [ ] Compare CSS classes with mockup → match?
  - [ ] Compare form fields with documentation → match?
  - [ ] Compare validation rules with documentation → match?
  - [ ] Compare navigation logic with documentation → match?
  - [ ] Compare data handling with documentation → match?
  - [ ] All checks passed? Ready to merge.
  - [ ] Any mismatch? Fix before merging.

---

## The Cost of Assumptions

### Previous Mistake Summary
- Built Farmer Onboarding (9 screens) without checking specs
- Built Buyer Onboarding (12 screens) without checking specs
- Built UI components without checking design tokens
- Built validators without checking form fields
- Built hooks without checking data handling patterns

**Result:** Everything was wrong because it was built from assumptions, not specs.

**Fix:** Delete everything. Start fresh. Build from specs only.

**Prevention:** This rule. Apply it to every single screen going forward.

---

## Implementation Promise

**From now on:**

Every screen, every component, every hook will be:
1. ✅ Built FROM documented specs (not assumptions)
2. ✅ Built TO match exact mockup (not reimagined)
3. ✅ Verified AGAINST specs (not just "it works")
4. ✅ Never copied from prior work without checking THIS screen's specs

**No shortcuts. No pattern-matching. No assumptions.**

---

**Status:** Foundational Rule - All development must follow this principle.

**Severity:** CRITICAL - Breaking this rule means building wrong code.

**Enforcement:** Review every PR by asking: "Was this built from the specs in FenBridgeDocs, or from assumptions?"
