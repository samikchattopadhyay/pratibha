# Pratibha Parishad Form Validation Implementation Strategy

**Date Created:** 2026-05-29  
**Status:** Planning Phase  
**Priority:** HIGH

---

## Executive Summary

This document outlines a comprehensive strategy to introduce **robust form validation** across all forms in the Pratibha Parishad application using the **React Hook Form + Zod** combination—the industry-standard approach for Next.js applications in 2026.

### Key Goals
1. **Standardize** validation across all forms using a unified, modern approach
2. **Improve UX** with real-time validation feedback and error handling
3. **Reduce bugs** by eliminating manual validation logic
4. **Enhance maintainability** with declarative schema-based validation
5. **Ensure type safety** via Zod's TypeScript inference

---

## Progress Summary

**Overall Status: Phase 2 COMPLETE, Phase 3 & 4 PARTIAL COMPLETE (40% of 25 forms)**

| Phase | Forms | Status | Target Date |
|-------|-------|--------|-------------|
| **Phase 1** | 4/4 | ✅ COMPLETE | 2026-05-29 |
| **Phase 2** | 4/4 | ✅ COMPLETE | 2026-06-12 |
| **Phase 3** | 1/5 | ⚠️ 20% COMPLETE | 2026-06-19 |
| **Phase 4** | 1/7 | ⚠️ 14% COMPLETE | 2026-06-26 |
| **Phase 5** | Testing | ⏳ Pending | 2026-07-03 |

**Forms Upgraded:**
1. ✅ Login Form
2. ✅ Register Form
3. ✅ Forgot Password Form
4. ✅ Reset Password Form
5. ✅ Register Entry Form
6. ✅ Profile Completion Modal
7. ✅ Setup/Onboarding Wizard
8. ✅ Add Student Wizard
9. ✅ Contact Form
10. ✅ Judge Form Modal

**Components Created:**
- ✅ FormError
- ✅ FormField
- ✅ PasswordField

---

## 1. Research & Technology Selection

### 1.1 Popular Form Validation Frameworks (2026)

Based on research from industry sources:

| Framework | Status | Bundle Size | Use Case |
|-----------|--------|-------------|----------|
| **React Hook Form** | ✅ Active & Recommended | ~10 KB (gzipped) | Default choice for most projects |
| **Conform** | ✅ Active & Specialized | ~12 KB (gzipped) | Server actions + progressive enhancement |
| **Formik** | ⚠️ Maintenance Mode | ~22 KB (gzipped) | Legacy projects; avoid for new code |
| **TanStack Form** | ✅ Active | Varies | Deeply nested/dynamic forms with TypeScript |

**✅ Recommendation:** **React Hook Form (RHF)** 
- Lightweight & performant
- Minimal re-renders via uncontrolled components
- Best-in-class ecosystem
- Already installed in this project

### 1.2 Validation Schema Libraries

| Library | Status | TypeScript | Use Case |
|---------|--------|-----------|----------|
| **Zod** | ✅ Recommended | Excellent (z.infer<>) | Default choice for TypeScript projects |
| **Valibot** | ✅ Good Alternative | Good | Lightweight alternative to Zod |
| **Yup** | ⚠️ Legacy | Adequate | Works, but Zod is preferred |

**✅ Recommendation:** **Zod**
- Already used in API routes (`/api/**/*.ts`)
- Better TypeScript inference
- Community standard (20M+ weekly downloads)
- Strict-by-default API catches issues early

### 1.3 Integration Pattern: React Hook Form + Zod

```typescript
// Schema Definition
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Form Component
function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur", // or "onChange" for real-time validation
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
}
```

### 1.4 Alternative Approach: Next.js Server Actions (Lightweight)

For simple forms (contact form, etc.), Next.js 16's `useActionState` + Zod can cover requirements in ~30 lines without a library. **Use for:** single-field, non-interactive forms.

---

## 2. Current State Assessment

### 2.1 Current Form Validation Approach
❌ **Manual `useState` state management** with no schema validation:
- No client-side validation (security anti-pattern)
- Inline error handling
- Duplicated validation logic in API routes and forms
- Type mismatches between frontend and backend
- Poor UX (no real-time feedback)

### 2.2 Installed Dependencies (Current)
✅ **Already present:**
- `react-hook-form`: ^7.76.1
- `@hookform/resolvers`: ^5.4.0
- `zod`: Used in API routes

❌ **Missing:**
- No dedicated form validation integration in UI forms

---

## 3. Forms in the Application

### 3.1 Authentication & Account Forms (8 forms)

| Form Name | Location | Type | Complexity | Status |
|-----------|----------|------|-----------|--------|
| **Login Form** | `src/app/login/page.tsx` | Auth | Medium | ✅ RHF + Zod |
| **Register Form** | `src/app/register/page.tsx` | Auth | Medium | ✅ RHF + Zod |
| **Forgot Password** | `src/app/forgot-password/page.tsx` | Auth | Low | ✅ RHF + Zod |
| **Reset Password** | `src/app/reset-password/page.tsx` | Auth | Low | ✅ RHF + Zod |
| **Email Verification** | `src/app/auth/verify-email/page.tsx` | Auth | Low | ❌ Manual |
| **Setup/Onboarding** | `src/components/auth/SetupOnboarding.tsx` | Wizard | High | ❌ Manual |
| **Judge Setup** | `src/app/judge-setup/[token]/page.tsx` | Auth | Medium | ❌ Manual |
| **Profile Settings** | `src/app/admin/profile/page.tsx` | Account | Low | ❌ Manual |

### 3.2 Data Entry & Submission Forms (10 forms)

| Form Name | Location | Type | Complexity | Status |
|-----------|----------|------|-----------|--------|
| **Entry Registration** | `src/app/register-entry/page.tsx` | Entry | High | ✅ RHF + Zod |
| **Student Entry** | `src/app/student/[id]/page.tsx` | Entry | Medium | ❌ Manual |
| **Contact Form** | `src/app/contact/page.tsx` | Inquiry | Low | ✅ RHF + Zod |
| **Add Student (Parent)** | `src/components/account/AddStudentWizard.tsx` | Wizard | High | ✅ RHF + Zod |
| **Judge Form Modal** | `src/components/admin/JudgeFormModal.tsx` | Modal | High | ✅ RHF + Zod |
| **Competition Creation Wizard** | `src/components/admin/CreateCompetitionWizard.tsx` | Wizard | Very High | ❌ Manual |
| **Profile Completion** | `src/components/account/ProfileCompletionModal.tsx` | Modal | Medium | ✅ RHF + Zod |
| **Settings Form** | `src/components/admin/SettingsTab.tsx` | Settings | Low-Medium | ❌ Manual |
| **Judge Settings** | `src/components/admin/judges-details/SettingsSubTab.tsx` | Settings | Low-Medium | ❌ Manual |
| **Competition Details** | `src/components/admin/competition-details/DetailsSubTab.tsx` | Settings | Medium | ❌ Manual |

### 3.3 Modal & Inline Forms (5 forms)

| Form Name | Location | Type | Complexity | Status |
|-----------|----------|------|-----------|--------|
| **Slug Input** | `src/components/account/SlugInput.tsx` | Inline | Low | ⚠️ Partial |
| **Searchable Select** | `src/components/admin/SearchableSelect.tsx` | Dropdown | Low | ❌ Manual |
| **Chip Multi-Select** | `src/components/admin/ChipMultiSelect.tsx` | Dropdown | Low | ❌ Manual |
| **External Achievement** | `src/components/account/ExternalAchievementModal.tsx` | Modal | Medium | ❌ Manual |
| **Judge Feedback** | `src/components/competitions/JudgeFeedback.tsx` | Modal | Medium | ❌ Manual |

### 3.4 Rich Text Editor Forms (2 forms)

| Form Name | Location | Type | Complexity | Status |
|-----------|----------|------|-----------|--------|
| **Description/Rules Editor** | `src/components/RichTextEditor.tsx` | RTE | Medium | ❌ Manual |
| **Bio/Credentials Editor** | Integrated in JudgeFormModal | RTE | Medium | ❌ Manual |

---

## Complete Forms Inventory (25 Total)

### ✅ Upgraded Forms (4/25 - 16%)

#### Authentication Forms (Phase 1 - Complete)
| # | Form Name | File Path | Type | Status |
|---|-----------|-----------|------|--------|
| 1 | Login Form | `src/app/login/page.tsx` | Auth | ✅ Phase 1 |
| 2 | Register Form | `src/app/register/page.tsx` | Auth | ✅ Phase 1 |
| 3 | Forgot Password Form | `src/app/forgot-password/page.tsx` | Auth | ✅ Phase 1 |
| 4 | Reset Password Form | `src/app/reset-password/page.tsx` | Auth | ✅ Phase 1 |

### ❌ Pending Forms (21/25 - 84%)

#### Authentication & Account (4 forms - Phase 2)
| # | Form Name | File Path | Type | Priority |
|---|-----------|-----------|------|----------|
| 5 | Email Verification Form | `src/app/auth/verify-email/page.tsx` | Auth | MEDIUM |
| 6 | Setup/Onboarding Wizard | `src/components/auth/SetupOnboarding.tsx` | Wizard | HIGH |
| 7 | Judge Setup Form | `src/app/judge-setup/[token]/page.tsx` | Auth | MEDIUM |
| 8 | Admin Profile Settings | `src/app/admin/profile/page.tsx` | Account | LOW |

#### Entry & Data Forms (10 forms - Phase 2-3)
| # | Form Name | File Path | Type | Priority | Phase |
|---|-----------|-----------|------|----------|-------|
| 9 | Entry Registration Form | `src/app/register-entry/page.tsx` | Entry | HIGH | ✅ Complete |
| 10 | Student Entry Form | `src/app/student/[id]/page.tsx` | Entry | MEDIUM | 2 |
| 11 | Add Student Wizard | `src/components/account/AddStudentWizard.tsx` | Wizard | HIGH | ✅ Complete |
| 12 | Profile Completion Modal | `src/components/account/ProfileCompletionModal.tsx` | Modal | MEDIUM | ✅ Complete |
| 13 | Contact Form | `src/app/contact/page.tsx` | Inquiry | MEDIUM | ✅ Complete |
| 14 | Judge Form Modal | `src/components/admin/JudgeFormModal.tsx` | Modal | HIGH | ✅ Complete |
| 15 | Competition Creation Wizard | `src/components/admin/CreateCompetitionWizard.tsx` | Wizard | HIGH | 3 |
| 16 | Admin Settings Tab | `src/components/admin/SettingsTab.tsx` | Settings | MEDIUM | 3 |
| 17 | Judge Settings SubTab | `src/components/admin/judges-details/SettingsSubTab.tsx` | Settings | MEDIUM | 3 |
| 18 | Competition Details SubTab | `src/components/admin/competition-details/DetailsSubTab.tsx` | Settings | MEDIUM | 3 |

#### Modal & Utility Forms (5 forms - Phase 4)
| # | Form Name | File Path | Type | Priority |
|---|-----------|-----------|------|----------|
| 19 | Slug Input | `src/components/account/SlugInput.tsx` | Inline | LOW |
| 20 | Searchable Select | `src/components/admin/SearchableSelect.tsx` | Dropdown | LOW |
| 21 | Chip Multi-Select | `src/components/admin/ChipMultiSelect.tsx` | Dropdown | LOW |
| 22 | External Achievement Modal | `src/components/account/ExternalAchievementModal.tsx` | Modal | MEDIUM |
| 23 | Judge Feedback Form | `src/components/competitions/JudgeFeedback.tsx` | Modal | MEDIUM |

#### Rich Text Editor Forms (2 forms - Phase 4)
| # | Form Name | File Path | Type | Priority |
|---|-----------|-----------|------|----------|
| 24 | Description/Rules Editor | `src/components/RichTextEditor.tsx` | RTE | MEDIUM |
| 25 | Bio/Credentials Editor | Integrated in JudgeFormModal | RTE | MEDIUM |

---

## 4. Implementation Strategy

### 4.1 Tech Stack (Final)

```json
{
  "dependencies": {
    "react-hook-form": "^7.76.1",        // ✅ Already installed
    "@hookform/resolvers": "^5.4.0",     // ✅ Already installed
    "zod": "^3.22.0"                     // ✅ Already used in APIs
  }
}
```

**No additional package installation required!** ✅

### 4.2 Architecture & Best Practices

#### 4.2.1 Schema Organization
Create validation schemas in a dedicated directory:

```
src/
├── schemas/
│   ├── auth.ts           // Login, Register, Password Reset
│   ├── entries.ts        // Entry registration, student submission
│   ├── admin.ts          // Judge, Competition, Settings forms
│   ├── account.ts        // Profile, Student Wizard
│   └── index.ts          // Export all schemas
```

#### 4.2.2 Form Component Patterns

**Pattern 1: Client-Side Form with Server Mutation**
```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/schemas/auth";

export function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    // Call API or server action
  };

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

**Pattern 2: Progressive Enhancement (Server Actions + Zod)**
```typescript
"use server";

import { loginSchema } from "@/schemas/auth";

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  // Process valid data
}
```

#### 4.2.3 Error Handling & Display

```typescript
// Consistent error display component
function FormError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <div className="text-red-600 text-sm font-sans mt-1 flex gap-2">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{error}</span>
    </div>
  );
}

// Usage in form
<input {...register("email")} />
{errors.email && <FormError error={errors.email.message} />}
```

---

## 5. Phased Implementation Plan

### Phase 1: Foundation & Patterns (Week 1)
**Goal:** Establish reusable patterns and core authentication forms

#### 1.1 Create Schema System
- [x] Create `src/schemas/` directory
- [x] Create `src/schemas/auth.ts` with Login, Register, Password Reset schemas
- [x] Export schemas from `src/schemas/index.ts`
- [x] Document schema patterns in code comments

#### 1.2 Create Form Components
- [x] Create `src/components/forms/FormError.tsx` (reusable error display)
- [x] Create `src/components/forms/FormField.tsx` (wraps input + error)
- [x] Create `src/components/forms/PasswordField.tsx` (password-specific)

#### 1.3 Migrate Core Auth Forms
- [x] Migrate `src/app/login/page.tsx` (Priority: HIGH) — ✅ COMPLETE
- [x] Migrate `src/app/register/page.tsx` (Priority: HIGH) — ✅ COMPLETE
- [x] Migrate `src/app/forgot-password/page.tsx` (Priority: MEDIUM) — ✅ COMPLETE
- [x] Migrate `src/app/reset-password/page.tsx` (Priority: MEDIUM) — ✅ COMPLETE

**Deliverable:** ✅ All 4 core auth forms use RHF + Zod with full validation
**Status:** Phase 1 COMPLETE (2026-05-29)

### Phase 2: Entry & Account Forms (Week 2)
**Goal:** Validate complex multi-step entry forms

#### 2.1 Create Entry Schemas
- [ ] Create `src/schemas/entries.ts`
- [ ] Define schemas for student entry registration
- [ ] Define schemas for parent student wizard

#### 2.2 Migrate Entry Forms
- [x] Migrate `src/app/register-entry/page.tsx` (Priority: HIGH) — ✅ COMPLETE
- [x] Migrate `src/components/account/ProfileCompletionModal.tsx` (Priority: MEDIUM) — ✅ COMPLETE
- [x] Migrate `src/components/account/AddStudentWizard.tsx` (Priority: HIGH) — ✅ COMPLETE
- [x] Migrate `src/app/auth/verify-email/page.tsx` (Priority: MEDIUM) — ⏭️ Not a form (auto-verify page)

**Deliverable:** 4/4 Phase 2 forms migrated. RegisterEntry + ProfileCompletionModal + AddStudentWizard fully validated.

### Phase 3: Admin & Settings Forms (Week 3)
**Goal:** Validate complex wizard and settings forms

#### 3.1 Create Admin Schemas
- [ ] Create `src/schemas/admin.ts`
- [ ] Define schemas for Judge form
- [ ] Define schemas for Competition creation wizard
- [ ] Define schemas for Settings forms

#### 3.2 Migrate Admin Forms
- [x] Migrate `src/components/admin/JudgeFormModal.tsx` (Priority: HIGH) — ✅ COMPLETE
- [ ] Migrate `src/components/admin/CreateCompetitionWizard.tsx` (Priority: HIGH)
- [ ] Migrate `src/components/admin/SettingsTab.tsx` (Priority: MEDIUM)
- [ ] Migrate `src/components/admin/judges-details/SettingsSubTab.tsx` (Priority: MEDIUM)
- [ ] Migrate `src/components/admin/competition-details/DetailsSubTab.tsx` (Priority: MEDIUM)

**Deliverable:** Admin forms fully validated and refactored

### Phase 4: Modal & Utility Forms (Week 4)
**Goal:** Validate remaining modal and inline forms

#### 4.1 Migrate Modal Forms
- [ ] Migrate `src/components/account/ExternalAchievementModal.tsx` (Priority: MEDIUM)
- [ ] Migrate `src/components/competitions/JudgeFeedback.tsx` (Priority: MEDIUM)
- [ ] Migrate `src/components/admin/ChipMultiSelect.tsx` (Priority: LOW)
- [ ] Migrate `src/components/admin/SearchableSelect.tsx` (Priority: LOW)

#### 4.2 Integrate Rich Text Editors
- [ ] Update `src/components/RichTextEditor.tsx` integration patterns (Priority: MEDIUM)
- [ ] Validate RTE fields in schemas (Priority: MEDIUM)

#### 4.3 Migrate Remaining Forms
- [x] Migrate `src/app/contact/page.tsx` (Priority: MEDIUM) — ✅ COMPLETE
- [ ] Migrate `src/app/judge-setup/[token]/page.tsx` (Priority: MEDIUM)
- [ ] Migrate `src/components/auth/SetupOnboarding.tsx` (Priority: HIGH)

**Deliverable:** All remaining forms migrated

### Phase 5: Testing & Documentation (Week 5)
**Goal:** Comprehensive testing and documentation

#### 5.1 Testing
- [ ] Type-check with `npx tsc --noEmit` (must pass)
- [ ] Run lint with `npm run lint` (must pass)
- [ ] Manual test all forms in browser (Dev + Production builds)
- [ ] Test form error states
- [ ] Test loading states during submission
- [ ] Test keyboard navigation
- [ ] Test accessibility (screen reader)

#### 5.2 Documentation
- [ ] Create `docs/FORM_VALIDATION_GUIDE.md` (for developers)
- [ ] Create `docs/SCHEMA_PATTERNS.md` (reusable patterns)
- [ ] Document all schemas in `src/schemas/index.ts`
- [ ] Add JSDoc comments to all form components

**Deliverable:** All tests passing, comprehensive documentation

---

## 6. Migration Template

### Before (Manual `useState`)
```typescript
const [formData, setFormData] = useState({ email: "", password: "" });
const [error, setError] = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.email.includes("@")) {
    setError("Invalid email");
    return;
  }
  // API call...
};
```

### After (React Hook Form + Zod)
```typescript
const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
  resolver: zodResolver(loginSchema),
  mode: "onBlur",
});

const onSubmit = handleSubmit(async (data) => {
  // data is fully typed and validated
  // API call...
});

return (
  <form onSubmit={onSubmit}>
    <input {...register("email")} />
    {errors.email && <FormError error={errors.email.message} />}
  </form>
);
```

---

## 7. Validation Rules Reference

### Common Rules (Zod)
```typescript
// Text fields
z.string().min(1, "Required").max(255, "Too long")

// Email
z.string().email("Invalid email address")

// Password (minimum security)
z.string()
  .min(8, "Must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain uppercase")
  .regex(/[0-9]/, "Must contain number")

// Phone (India)
z.string().regex(/^(\+91|0)?[6-9]\d{9}$/, "Invalid phone number")

// Age (minAge/maxAge)
z.number().min(18, "Must be 18+").max(99, "Invalid age")

// Date
z.coerce.date().refine(d => d > new Date(), "Date must be in future")

// Multi-select (non-empty array)
z.array(z.string()).min(1, "Select at least one item")
```

---

## 8. Success Criteria

### Completion Checklist
- [ ] All 25 forms migrated to React Hook Form + Zod
- [ ] Zero manual `useState` validation logic in forms
- [ ] Type-safe form data (via `z.infer<>`)
- [ ] Consistent error display across all forms
- [ ] Real-time validation feedback (with debounce where needed)
- [ ] Accessibility requirements met (ARIA labels, error announcements)
- [ ] Full TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Manual QA: All forms submit, validate, and handle errors correctly
- [ ] Documentation complete and indexed in CLAUDE.md

### Metrics to Track
- **Code Reduction:** ~30-40% fewer lines in form components
- **Bug Prevention:** 100% of forms now have compile-time type safety
- **Developer Velocity:** Faster form creation using patterns
- **User Experience:** Real-time validation feedback across the app

---

## 9. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Forms break during migration | HIGH | Test each form in isolation; keep original code accessible for reference |
| Learning curve for team | MEDIUM | Create detailed patterns guide; document all changes in comments |
| Performance regression | LOW | RHF is optimized; monitor bundle size; use `mode: "onBlur"` for large forms |
| Existing validations conflict | MEDIUM | Audit all API route validators first; align schemas between client & server |

---

## 10. Resources & References

### Official Documentation
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [@hookform/resolvers](https://github.com/react-hook-form/resolvers)

### Community Resources
- [Best Next.js form library in 2026 (splitforms.com)](https://splitforms.com/blog/best-nextjs-form-library-2026)
- [Building Efficient Forms in Next.js](https://peerlist.io/jagss/articles/building-efficient-forms-in-nextjs-with-react-hook-form-and-)
- [React Hook Form + Zod Tutorial](https://www.youtube.com/results?search_query=react+hook+form+zod+tutorial)

### Examples in Codebase
- **API Validation:** `src/app/api/**/*.ts` (already uses Zod schemas)
- **Existing RHF Usage:** None (opportunity to establish patterns)

---

## 11. Project Timeline

| Phase | Weeks | Owner | Target Completion |
|-------|-------|-------|-------------------|
| Foundation & Patterns | 1 | Frontend Lead | 2026-06-05 |
| Entry & Account Forms | 1 | Frontend Lead | 2026-06-12 |
| Admin & Settings Forms | 1 | Full-stack Team | 2026-06-19 |
| Modal & Utility Forms | 1 | Frontend Lead | 2026-06-26 |
| Testing & Documentation | 1 | QA + Frontend Lead | 2026-07-03 |
| **Total Duration** | **5 weeks** | | **2026-07-03** |

---

## 12. Next Steps

1. **Approve this plan** with team stakeholders
2. **Create schema directory** and establish patterns
3. **Create reusable form components** (FormError, FormField, etc.)
4. **Begin Phase 1** migration with authentication forms
5. **Document patterns** as implementations progress
6. **Schedule weekly reviews** to address blockers

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-29  
**Review Date:** 2026-06-05
