# Mockup-First Workflow Policy

## Critical Rule: Mockups are the Specification

**Never build screens without reading the HTML mockups first.**

### The Problem
- Built Farmer & Buyer Onboarding screens without checking mockups
- Result: Screens have completely different UI/layout/purpose than designs
- Cost: All code is visually wrong, even if functionally correct

### The Rule
**If mockup shows phone input screen but code shows benefits page = code is WRONG.**

Visual design mismatch = incorrect implementation. No exceptions.

## Mandatory Workflow

For ANY new screen/feature:

1. **Read mockup first** → `FenBridgeDocs/app/screens_v2/<workflow-name>/`
2. **Extract exact specs:**
   - Layout & grid structure
   - Form fields (types, labels, placement)
   - Content & copy (exact text from mockup)
   - Button placement & labels
   - Colors & spacing
   - Icons & images
3. **Build React component to match exactly**
4. **Verify against mockup** before marking done

### How to Find Mockups
```
FenBridgeDocs/app/screens_v2/
├── farmer_onboarding/
│   ├── welcome_to_fenbridge/code.html
│   ├── choose_your_language/code.html
│   └── ...
├── buyer_onboarding/
│   └── ...
└── scout_*/
    └── ...
```

Each folder contains `code.html` with the mockup.

## Example: Correct Approach

### ❌ WRONG (What We Did)
```
1. "I'll build a welcome screen"
2. [writes React code from memory]
3. [screen looks nothing like mockup]
```

### ✅ RIGHT (What We Should Do)
```
1. Open FenBridgeDocs/app/screens_v2/farmer_onboarding/welcome_to_fenbridge/code.html
2. Read the HTML structure
3. Extract: logo, form fields, content, buttons
4. Build React to match that exact structure
5. Compare side-by-side
6. Verify pixel-perfect match (or close as possible)
```

## Why This Matters

The mockups represent:
- **What the UX designer intended**
- **What the user will see**
- **The actual specification**

Code that looks different is broken, regardless of functionality.

---

**Status:** Active Policy - All screen builds must follow this.
