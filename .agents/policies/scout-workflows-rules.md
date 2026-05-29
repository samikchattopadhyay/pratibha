# Scout Workflows Development Rules (Generic Agent Format)

Scout is a production-grade mobile-first React PWA for agricultural supply chain management. Scout role screens must be built from FenBridgeDocs specifications only. 19 workflows across 6 tiers, 349+ unique screens.

---

## CORE RULE: BUILD FROM SPECS, NEVER FROM ASSUMPTIONS

**Every line of code must come directly FROM FenBridgeDocs specifications.**

### The Spec Sources (In Order)
1. **Documentation:** `FenBridgeDocs/html/scout/<workflow>/<screen>.html` — Build instructions (WHAT + HOW)
2. **Mockup:** `FenBridgeDocs/app/screens_v2/scout/<workflow>/<screen>/code.html` — Visual design (HTML + CSS)

### The 5 Verification Questions (Answer BEFORE ANY CODE)
1. Do I have the documentation? (`FenBridgeDocs/html/scout/...`)
2. Do I have the mockup? (`FenBridgeDocs/app/screens_v2/scout/...`)
3. Do the specs tell me exactly what to build?
4. Can I see what it should look like?
5. Am I about to make any assumptions?

**If you hesitate on ANY question → STOP. Read more specs first.**

---

## RED FLAGS: STOP & READ SPECS

🚩 **"I think this should work like..."** → Read documentation. It tells you exactly how.

🚩 **"This is similar to X screen, so I'll..."** → Stop. Read THIS screen's specs. It might be completely different.

🚩 **"I remember building this before..."** → Stop. Every screen is different. Read the specs for THIS screen.

🚩 **"I'll refactor this to be more elegant..."** → Stop. Match the specs first. Elegance comes later, if needed.

🚩 **"The old code works, reuse it..."** → Stop. The old code might be wrong. Build from specs instead.

---

## IMPLEMENTATION WORKFLOW (4 STEPS FOR EACH SCREEN)

### Step 1: Preparation (READ DOCUMENTATION)
```
1. Open FenBridgeDocs/html/scout/<workflow>/<screen>.html
2. Read entire documentation (not skimming)
3. Extract:
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
2. Read entire HTML mockup
3. Extract:
   - HTML structure (exact div hierarchy)
   - CSS classes (exact Tailwind + design tokens)
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
3. Copy HTML structure from mockup (EXACT, no changes)
4. Convert HTML to JSX syntax
5. Use EXACT CSS classes from mockup
6. Import React Hook Form + Zod
7. Implement form with React Hook Form
8. Implement state management (useState, useRouter)
9. Implement data storage per documentation
10. Implement navigation logic per documentation
11. Add ARIA labels (aria-label, aria-describedby, aria-invalid)
12. Add keyboard navigation support
13. Add loading states (aria-busy)
14. Add error handling
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

## HTML/CSS EXTRACTION RULE (MANDATORY)

**Extract HTML structure and CSS classes directly from mockups. Don't rebuild from scratch.**

### Workflow
1. Open `FenBridgeDocs/app/screens_v2/scout/<workflow>/<screen>/code.html`
2. Copy the HTML section for that screen
3. Identify CSS classes (Tailwind + design tokens)
4. Adapt to React (convert HTML to JSX)
5. **Keep CSS classes identical** — don't simplify, don't reorganize, don't add extras

### Rule
CSS classes must match the mockup exactly. No removing classes, no adding extra classes (unless accessibility requires it), no "improvements."

---

## FORM STANDARDS (MANDATORY)

**All forms must use React Hook Form + Zod.**

### Validation Schema
```typescript
import { z } from "zod";

// Extract from documentation exactly
export const ScreenSchema = z.object({
  field1: z.string().min(2, "Error message from docs"),
  field2: z.string().email("Error message from docs"),
  // ... more fields from documentation
});
```

### Form Implementation
```typescript
const { register, formState: { errors, isValid }, handleSubmit } = useForm({
  resolver: zodResolver(ScreenSchema),
  mode: "onBlur",
  defaultValues: { /* from docs */ },
});

const onSubmit = async (data) => {
  // Store per documentation
  localStorage.setItem("key_from_docs", JSON.stringify(data));
  
  // Navigate per documentation
  router.push("/screen_from_docs");
};
```

### Form Field Requirements
- Every input has a label with `<label htmlFor>`
- Every input has error handling with `aria-describedby`
- Every form has error banner for form-level errors
- Submit button shows loading state
- Accessible validation (not just color)

---

## DATA STORAGE STRATEGY

### Registration Workflows
```javascript
localStorage.setItem("fenbridge_scout_farmer_registration_step1", JSON.stringify(data));
localStorage.setItem("fenbridge_scout_farmer_registration_step2", JSON.stringify(data));
// ... Continue for all steps following documentation exactly
```

### Operational Workflows
```javascript
localStorage.setItem("fenbridge_lot_verification_<lotId>", JSON.stringify(data));
localStorage.setItem("fenbridge_seal_application_<lotId>", JSON.stringify(data));
```

**Rule:** Follow the pattern from documentation exactly. If docs say key is X, use key X.

---

## ACCESSIBILITY (WCAG 2.1 AA MANDATORY)

### Semantic HTML
Use proper elements: `<button>`, `<label>`, `<form>`, `<main>`, `<nav>`, `<article>`.

### ARIA Labels
- `aria-label` for icon buttons
- `aria-describedby` for error/helper text
- `aria-invalid="true"` for validation errors
- `aria-busy="true"` for loading states
- `role="status"` for dynamic updates

### Keyboard Navigation
- All interactive elements accessible via Tab
- Enter submits forms
- Arrow keys for selection (if applicable)
- Shift+Tab moves backward
- Escape closes modals/dropdowns

### Focus Management
- Clear, visible focus indicators on all interactive elements
- Logical tab order
- Focus trapped in modals
- Focus restored after modal closes

### Screen Reader Testing
Test with NVDA, JAWS, or VoiceOver before finishing. All form labels announced correctly. Error messages announced. Page structure makes sense.

---

## MOBILE-FIRST STANDARDS

### Responsive Design
- Base styles mobile-first (< 768px)
- Tablet adaptation (md: 768px - 1024px)
- Desktop enhancement (lg: 1024px+)
- Use Tailwind responsive prefixes: `p-4 md:p-6 lg:p-8`

### Touch-First Interactions
- 44px minimum touch targets (48px preferred)
- No hover-dependent interactions (use focus-visible)
- Bottom-sticky action bars
- Swipe gestures for navigation

### Safe Area Insets
- Respect notch/home indicator
- Use `p-safe-area` class on main container

---

## STYLING STANDARDS

### Tailwind CSS Only
- No inline styles
- No arbitrary values (use design tokens)
- Safe class merging with `cn()`

### Design Tokens (Required)
- Colors: primary, surface, error, success, warning, outline, on-*
- Spacing: xs, sm, md, lg, xl
- Typography: text-xs, text-sm, text-base, text-lg, etc.
- No hardcoded colors/values

---

## COMPONENT STANDARDS

### Size Limit: 200 Lines Maximum
If larger, split into smaller components.

### Composition Over Inheritance
- Use composition patterns
- Extract sub-components when necessary
- Prop-based customization

### Single Responsibility
Each component has one reason to change.

---

## STATE MANAGEMENT

| State Type | Library | Usage |
|-----------|---------|--------|
| Local UI | React `useState` | Form inputs, toggles, modals |
| Server | TanStack Query | API data, caching |
| Global App | Zustand | Auth, theme, offline queue |

### Rules
- Never use Zustand for form data
- Never use Zustand for server data
- Never use Context for global state (use Zustand)
- No multiple sources of truth

---

## SERVER VS CLIENT COMPONENTS

### Default: Server Components
Use for: data fetching, private API calls, sensitive logic, static content

### Client Components: Only When
- Browser APIs required (localStorage, geolocation)
- Event handlers required
- Local interactive state required
- Client-side routing required

**Rule:** Minimize `"use client"` markers.

---

## TYPE SAFETY

**Never use `any`.** Always define proper types. Strict TypeScript enabled.

---

## FORBIDDEN PATTERNS

❌ Use `any`
❌ Use inline styles
❌ Build components > 200 lines
❌ Fetch in render
❌ Put business logic in JSX
❌ Duplicate state
❌ Excessive `useEffect`
❌ Deep prop drilling
❌ Massive context providers
❌ Ignore accessibility
❌ Copy code from other workflows
❌ Redesign the mockup
❌ Skip documentation
❌ Skip verification

---

## SCOUT WORKFLOW STRUCTURE

**19 Workflows Across 6 Tiers**

- **TIER 1:** Scout Farmer Reg (9), Scout Popper Reg (9) = 18 screens
- **TIER 2:** Scout Dashboard (1) = 1 screen
- **TIER 3:** Lot Verification (5), Seal Application (6), Storage Recheck (4), Re-Inspection (4), Rejection Handling (5), Warehouse Fitness (4), Mark Lot Ready (2), Bid Submission (5), Spot Offer (4) = 39 screens
- **TIER 4:** Manage Farmers (2), Manage Suppliers (2), Profile Settings (5) = 9 screens
- **TIER 5:** Ponds Directory (2), Warehouses Directory (2), Users Directory (2) = 6 screens
- **TIER 6:** Sync Queue (1) = 1 screen

**Total: 74 screens**

---

## FILE ORGANIZATION (MANDATORY)

- **Documentation files** → `docs/<subfolder>/`
- **Policy files** → `.agents/policies/`
- **Cline rules** → `.cline/rules/`
- **Cline skills** → `.cline/skills/<skill>/SKILL.md`

**Never:** Markdown files directly in project root.

---

## DEFINITION OF DONE

A Scout screen is DONE when:

- [ ] Code matches documentation exactly
- [ ] Code matches mockup exactly
- [ ] TypeScript strict mode: zero errors
- [ ] Accessibility: WCAG 2.1 AA (tested with screen reader)
- [ ] Responsive: Works at 375px, 768px, 1024px
- [ ] Keyboard navigation: Complete
- [ ] Touch targets: All ≥ 44px
- [ ] Error states: Handled and shown
- [ ] Loading states: Shown with aria-busy
- [ ] Screen reader: Tested and accessible
- [ ] Verification: Side-by-side with mockup is identical
- [ ] No console errors/warnings
- [ ] Safe area padding respected

**Do not merge until ALL checks pass.**

---

**Status:** Active Policy — Scout development MUST follow spec-driven approach.
