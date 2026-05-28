# Student Profile Slug Implementation Plan

**Date**: 2026-05-28  
**Status**: Phase 1 & 2 Complete ✅  
**Owner**: Pratibha Parishad Team

### Implementation Progress
- ✅ Phase 1: Database & Backend (COMPLETE)
- ✅ Phase 2: Frontend UI (COMPLETE)
- ⏳ Phase 3: Route Migration (IN PROGRESS)
- ⏳ Phase 4: Data Migration (PENDING)

---

## Overview

Replace UUID-based student profile URLs (`/student/e6c2a0fd-6782-46fc-aa74-aa8e8a70a0c3`) with readable, user-chosen slugs (`/student/john-doe-123`). This improves UX, shareability, and SEO while maintaining uniqueness and availability validation.

---

## Industry Best Practices & Validation

### 1. Slug Standards (SEO & UX)
- **Format**: Lowercase alphanumeric + hyphens only (RFC 3986 compliant)
- **Length**: 3-32 characters (optimal: 15-20 for readability)
- **Separators**: Hyphens (`-`) for word separation, no underscores
- **Case Handling**: Always convert to lowercase (case-insensitive matching)
- **Special Characters**: Strip accents, remove punctuation, replace spaces with hyphens
- **Avoidance**: Don't include dates/versions (avoid `john-doe-2024`)

**References**:
- [URL Slug Best Practices for SEO (2026 Guide)](https://seoservicecare.com/url-slug-guide/)
- [Backlinko: What Is a URL Slug](https://backlinko.com/hub/seo/url-slug)

### 2. Real-Time Availability Checking
Industry standard approaches:
- **On-Focus AJAX Debounce**: Check availability 300-500ms after user stops typing
- **Visual Feedback**: Green checkmark (available), red X (taken), spinner (checking)
- **No Third-Party Lookups**: Keep validation internal to your database only
- **First-Come, First-Served**: Slugs become permanent once claimed (Discord model)

**References**:
- [Happy-CSS: Check availability without page refresh](https://happy-css.com/articles/check-username-and-email-availability-without-a-page-refresh/)

### 3. User Experience Patterns
Platforms like **GitHub**, **Discord**, and **Twitter** implement:
- ✅ Unique slug per user (no duplicates)
- ✅ User-selectable with availability checking
- ✅ Permanent slugs (no reassignment)
- ✅ Reserved words list (prevent admin, api, etc.)
- ✅ Fallback suggestions (e.g., `john-doe-123` if `john-doe` taken)

---

## Current Architecture

### Database Schema (Prisma)
```prisma
model Student {
  id                  String              @id @default(uuid())
  parentId            String
  name                String
  dateOfBirth         DateTime
  // ... existing fields ...
  slug                String?             // NEW: Will be unique, lowercase
  // ... existing fields ...
}
```

### Current Routes (UUID-based)
- `GET /student/[id]` → Public student profile
- `GET /parent/students/[id]` → Parent-managed student
- `GET /admin/students/[id]` → Admin student dashboard
- `GET /api/public/student/[id]` → API endpoint

### Existing Slug Implementation
**Pattern already used for Categories** (`src/app/api/admin/categories/route.ts`):
```typescript
const slug = name
  .toLowerCase()
  .trim()
  .replace(/[^\w\s-]/g, "")      // Remove special chars
  .replace(/[\s_-]+/g, "-")       // Replace spaces/underscores with dash
  .replace(/^-+|-+$/g, "");       // Remove leading/trailing dashes
```

---

## Implementation Phases

### Phase 1: Database & Backend (Backend Team)

#### 1.1 Prisma Schema Migration
```prisma
model Student {
  id                  String              @id @default(uuid())
  slug                String              @unique         // NEW
  // ... existing fields ...
}

// Add index for faster slug lookups
// @@index([slug])
```

**Migration Command**:
```bash
npx prisma migrate dev --name add_student_slug
```

#### 1.2 New API Endpoint: Slug Availability Check
**Route**: `POST /api/parent/students/check-slug`

**Request**:
```json
{
  "slug": "john-doe",
  "excludeStudentId": "uuid-of-current-student" // For updates
}
```

**Response**:
```json
{
  "available": true,
  "slug": "john-doe",
  "suggestions": ["john-doe-123", "john-doe-2025"] // If taken
}
```

**Validation Rules**:
- Minimum 3 characters, maximum 32
- Alphanumeric + hyphens only: `/^[a-z0-9-]+$/`
- Cannot start/end with hyphen: `/^(?!-)(?!.*-)([a-z0-9-]+)$/`
- Reserved words: `admin`, `api`, `public`, `verify`, `dashboard`, `settings`, `auth`, etc.
- Case-insensitive uniqueness check

**Implementation Location**: `src/app/api/parent/students/check-slug/route.ts`

```typescript
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

const slugSchema = z.object({
  slug: z.string()
    .toLowerCase()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Only alphanumeric and hyphens allowed")
    .regex(/^(?!-)(?!.*-)/, "Cannot start or end with hyphen")
    .min(3, "Minimum 3 characters")
    .max(32, "Maximum 32 characters"),
  excludeStudentId: z.string().uuid().optional(),
});

const RESERVED_WORDS = [
  "admin", "api", "public", "verify", "dashboard", 
  "settings", "auth", "profile", "edit", "delete"
];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const { slug, excludeStudentId } = slugSchema.parse(body);

    // Check reserved words
    if (RESERVED_WORDS.includes(slug)) {
      return Response.json({ 
        available: false, 
        reason: "Reserved word" 
      });
    }

    // Check database
    const existing = await prisma.student.findUnique({
      where: { slug },
    });

    const available = !existing || existing.id === excludeStudentId;

    if (!available) {
      // Generate suggestions
      const suggestions = [
        `${slug}-${Math.floor(Math.random() * 9000) + 1000}`,
        `${slug}-${new Date().getFullYear()}`,
      ];
      
      return Response.json({
        available: false,
        slug,
        suggestions,
      });
    }

    return Response.json({ available: true, slug });
  } catch (error) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
```

#### 1.3 Update Student Creation/Edit API
**Route**: `PATCH /api/parent/students/[id]`

Add slug to request body:
```typescript
const updateStudentSchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(), // NEW
  // ... other fields ...
});
```

**Validation**:
- Check slug availability before saving (call check-slug endpoint)
- On creation, generate default slug from name if not provided
- On update, allow slug change only if new slug is available

#### 1.4 Default Slug Generation (On Student Creation)
If user doesn't provide custom slug:
```typescript
function generateDefaultSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Usage: slug = await ensureUniqueSlug(generateDefaultSlug(name), studentId);

async function ensureUniqueSlug(
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.student.findUnique({
      where: { slug },
    });

    if (!existing || existing.id === excludeId) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}
```

#### 1.5 Query Updates: Slug-Based Lookups
Update API routes to query by `slug` instead of `id` where appropriate:

```typescript
// Before
const student = await prisma.student.findUnique({
  where: { id },
});

// After (for public routes)
const student = await prisma.student.findUnique({
  where: { slug },
});
```

---

### Phase 2: Frontend UI (Frontend Team)

#### 2.1 Slug Input Component
**Location**: `src/components/parent/SlugInput.tsx`

```typescript
"use client";

import { useState, useCallback } from "react";
import { debounce } from "lodash-es";
import Loading from "@/components/Loading";

interface SlugInputProps {
  value: string;
  onChange: (slug: string) => void;
  onAvailabilityChange: (available: boolean) => void;
  studentId?: string;
  disabled?: boolean;
}

export default function SlugInput({
  value,
  onChange,
  onAvailabilityChange,
  studentId,
  disabled,
}: SlugInputProps) {
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = useCallback(
    debounce(async (slug: string) => {
      if (!slug || slug.length < 3) {
        setAvailable(null);
        setError(null);
        return;
      }

      setChecking(true);
      try {
        const res = await fetch("/api/parent/students/check-slug", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: slug.toLowerCase().trim(),
            excludeStudentId: studentId,
          }),
        });

        const data = await res.json();

        if (data.available) {
          setAvailable(true);
          setError(null);
          onAvailabilityChange(true);
        } else {
          setAvailable(false);
          setError(
            `Not available. Try: ${data.suggestions?.join(", ") || "another slug"}`
          );
          onAvailabilityChange(false);
        }
      } catch {
        setError("Error checking availability");
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 500),
    [studentId, onAvailabilityChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    onChange(slug);
    checkAvailability(slug);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-charcoal dark:text-white">
        Profile URL Slug
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="john-doe"
          className="w-full px-4 py-2 rounded-lg border border-charcoal/10 dark:border-white/10 bg-white dark:bg-charcoal-light focus:outline-none focus:ring-2 focus:ring-terracotta/50"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {checking && <Loading variant="inline" />}
          {!checking && available && (
            <span className="text-green-600">✓</span>
          )}
          {!checking && available === false && (
            <span className="text-red-600">✗</span>
          )}
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-charcoal/60 dark:text-white/60">
        https://pratibha.local/student/{value || "your-slug"}
      </p>
    </div>
  );
}
```

#### 2.2 Integrate into Student Edit Form
**File**: `src/app/parent/students/[id]/edit/page.tsx`

```typescript
"use client";

import { useState } from "react";
import SlugInput from "@/components/parent/SlugInput";

export default function EditStudentPage() {
  const [slug, setSlug] = useState("");
  const [slugAvailable, setSlugAvailable] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!slugAvailable) {
      alert("Please choose an available slug");
      return;
    }

    // Submit form...
  };

  return (
    <form onSubmit={handleSubmit}>
      <SlugInput
        value={slug}
        onChange={setSlug}
        onAvailabilityChange={setSlugAvailable}
        disabled={false}
      />
      <button disabled={!slugAvailable} type="submit">
        Save Student
      </button>
    </form>
  );
}
```

#### 2.3 Display Slug in Student Profile
Show the slug URL prominently in student dashboard:
```typescript
<div className="bg-white dark:bg-charcoal-light p-4 rounded-lg border border-terracotta/20">
  <p className="text-sm text-charcoal/60 dark:text-white/60">
    Public Profile URL
  </p>
  <p className="font-mono text-terracotta">
    https://pratibha.local/student/{student.slug}
  </p>
  <button onClick={() => copyToClipboard(url)}>
    Copy Link
  </button>
</div>
```

---

### Phase 3: Route Migration (Full-Stack Team)

#### 3.1 Dual-Route Support (Backward Compatibility)
Support both `/student/[slug]` and `/student/[id]` during transition:

```typescript
// src/app/student/[slugOrId]/page.tsx
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { v4 as isUuid } from "uuid";

export default async function StudentPage({
  params: { slugOrId },
}: {
  params: { slugOrId: string };
}) {
  let student;

  // Try slug first
  student = await prisma.student.findUnique({
    where: { slug: slugOrId.toLowerCase() },
  });

  // Fallback to ID if not found
  if (!student && isUuid(slugOrId)) {
    student = await prisma.student.findUnique({
      where: { id: slugOrId },
    });
  }

  if (!student) notFound();

  // Redirect UUID URLs to slug URLs for SEO
  if (!student.slug && student.id === slugOrId) {
    // Can only happen if slug is null (shouldn't be after Phase 1)
    return notFound();
  }

  return <StudentProfile student={student} />;
}
```

#### 3.2 Redirect Strategy (SEO)
Implement permanent redirects (301) from UUID to slug URLs:
- Option A: Middleware with URL rewriting
- Option B: getServerSideProps on legacy route
- Option C: Post-migration via SQL script

**Recommended**: Middleware approach for Next.js 13+

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const studentIdMatch = pathname.match(/^\/student\/([a-f0-9\-]{36})$/);

  if (studentIdMatch) {
    const id = studentIdMatch[1];
    // Query database to find slug
    // Redirect to /student/[slug]
    // This would require async operation, better to handle in route handler
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*"],
};
```

#### 3.3 Update All URL References
Search and update throughout codebase:
- `src/app/parent/students/StudentList.tsx` — Update link generation
- `src/components/StudentCard.tsx` — Update profile links
- `src/app/admin/students/page.tsx` — Update admin links
- Email templates — Update notification links
- Breadcrumbs, navigation — Use slug URLs

---

### Phase 4: Data Migration (DevOps/Backend)

#### 4.1 Populate Slugs for Existing Students
Run migration script:

```typescript
// scripts/migrate-student-slugs.ts
import prisma from "@/lib/prisma";

async function migrateStudentSlugs() {
  const studentsWithoutSlug = await prisma.student.findMany({
    where: { slug: null },
  });

  for (const student of studentsWithoutSlug) {
    let slug = student.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Ensure uniqueness
    let counter = 1;
    let finalSlug = slug;
    while (
      await prisma.student.findUnique({ where: { slug: finalSlug } })
    ) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    await prisma.student.update({
      where: { id: student.id },
      data: { slug: finalSlug },
    });

    console.log(`Migrated ${student.name} → ${finalSlug}`);
  }
}

migrateStudentSlugs()
  .then(() => console.log("Done"))
  .catch(console.error);
```

**Run**: `npx ts-node scripts/migrate-student-slugs.ts`

#### 4.2 Database Constraints
Ensure Prisma constraint is applied:
```prisma
model Student {
  slug String @unique
}
```

---

## Testing Checklist

### Unit Tests
- [ ] Slug validation (format, length, reserved words)
- [ ] Default slug generation from name
- [ ] Uniqueness enforcement
- [ ] Case-insensitive matching

### Integration Tests
- [ ] API: Check slug availability
- [ ] API: Create student with slug
- [ ] API: Update student slug
- [ ] API: Query by slug vs ID
- [ ] Route: Dual `/student/[slug]` and `/student/[id]` work

### E2E Tests (Manual)
- [ ] Parent creates student with auto-generated slug
- [ ] Parent customizes student slug in edit form
- [ ] Availability check shows real-time feedback
- [ ] Public profile accessible via slug URL
- [ ] Old UUID URLs redirect to slug URLs (if implemented)
- [ ] Copy-to-clipboard works for slug URL

### Performance Tests
- [ ] Slug lookup is O(1) with unique constraint
- [ ] Availability API responds <500ms
- [ ] No N+1 queries in student list

---

## Timeline & Dependencies

| Phase | Duration | Dependencies | Status |
|-------|----------|--------------|--------|
| 1. DB & Backend | 3-4 days | None | Blocked on planning approval |
| 2. Frontend UI | 2-3 days | Phase 1 complete | Blocked on Phase 1 |
| 3. Route Migration | 1-2 days | Phase 1 & 2 complete | Blocked on Phase 2 |
| 4. Data Migration | 1 day | Phase 1 complete | Blocked on Phase 1 |

**Total**: ~7-10 days

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Slug not unique | Data integrity | Add UNIQUE constraint in Prisma, validate before insert |
| URL structure breaks existing links | User impact | Implement 301 redirects from UUID → slug |
| Availability API slow | UX pain | Add database index on slug, cache results (careful) |
| User confusion (old vs new URLs) | UX friction | Display prominent "profile URL" section, documentation |
| Name change without slug update | Stale slugs | Allow slug customization, don't auto-update from name |

---

## Success Metrics

- ✅ All students have unique, readable slugs
- ✅ Slug availability check responds <500ms
- ✅ Public profiles accessible via `/student/[slug]`
- ✅ Zero broken links (redirects in place)
- ✅ User adoption: >90% of new students set custom slug

---

## References

- [URL Slug Best Practices for SEO (2026)](https://seoservicecare.com/url-slug-guide/)
- [Slug Best Practices - Yoast](https://yoast.com/slug/)
- [Check availability without page refresh - Happy CSS](https://happy-css.com/articles/check-username-and-email-availability-without-a-page-refresh/)
- [GitHub slug implementation patterns](https://github.com/topics/slug)
- [Discord Profile Vanity Slugs](https://discord.dog/blog/share-discord-profile)

---

## Implementation Summary (2026-05-28)

### Phase 1 Implementation (Backend)
✅ **Database Schema**
- Added `slug` field to `Student` model (unique, optional)
- Applied schema changes via `prisma db push`

✅ **API Endpoints Created**
1. `POST /api/parent/students/check-slug` — Real-time slug availability checking
   - Validates slug format (alphanumeric + hyphens, 3-32 chars)
   - Checks reserved words list (admin, api, dashboard, etc.)
   - Returns availability status + suggestions if taken
   - Excludes current student on updates

2. Updated `POST /api/parent/students` (Student Creation)
   - Accepts optional `slug` parameter
   - Auto-generates slug from name if not provided
   - Ensures uniqueness via `ensureUniqueSlug()` helper

3. Updated `PATCH /api/parent/students/[id]` (Student Update)
   - Allows slug changes
   - Validates uniqueness (excluding current student)
   - Handles slug updates atomically

**Helper Functions Added**
- `generateDefaultSlug(name)` — Convert name to slug format
- `ensureUniqueSlug(baseSlug, excludeId)` — Ensure uniqueness with retry logic

### Phase 2 Implementation (Frontend)
✅ **SlugInput Component** (`src/components/parent/SlugInput.tsx`)
- Real-time availability checking with 500ms debounce
- Live visual feedback (✓ green / ✗ red / loading spinner)
- Input sanitization (auto-converts spaces/special chars)
- Shows preview: `https://pratibha.local/student/{slug}`
- Dark/light theme support

**Features:**
- Debounced API calls to reduce server load
- Accessibility labels and error messages
- Responsive design with Tailwind CSS
- Uses `Loading` component from design system

### Phase 3 Implementation (In Progress)
✅ **Route Migration** (`src/app/student/[id]/page.tsx`)
- Updated to support both slug and UUID-based lookups
- **Slug-first strategy**: Tries slug lookup before ID fallback
- UUID regex detection for safe ID fallback
- Maintains backwards compatibility with UUID URLs
- Updated metadata generation to use correct profile path

**How it works:**
1. User visits `/student/john-doe` → Finds by slug
2. User visits `/student/uuid...` → Falls back to ID lookup
3. Public profile accessible via either URL

## Next Steps

1. ✅ Present plan to stakeholders for approval
2. ✅ Implement Phase 1 (Backend)
3. ✅ Implement Phase 2 (Frontend)
4. ✅ Begin Phase 3 (Route Migration — dual support ready)
5. ⏳ Phase 4: Data Migration Script (populate existing students)
6. ⏳ Integration Testing (E2E, API, UI)
7. ⏳ Deploy to staging/production
