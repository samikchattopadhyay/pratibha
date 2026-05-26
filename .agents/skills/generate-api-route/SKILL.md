---
name: generate-api-route
description: Create Next.js App Router route.ts files with proper structure, auth guards, and error handling
user-invocable: false
---

# Skill: Generate API Route (route.ts)

## Usage

Use when creating a new API endpoint in `src/app/api/` directory. Follows the exact pattern found in Scout App.

---

## Pattern: Numbered Comment Sections

Every route handler is structured in 4 numbered sections:

```ts
// 1. Parse input
// 2. Validate  
// 3. Business logic
// 4. Response
```

This structure is mandatory and must appear as comments.

---

## Public Routes (No Auth)

```ts
// src/app/api/auth/send-otp/route.ts
import { SendOtpSchema } from "@/validators/auth.schema";
import { sendOtp } from "@/services/auth/auth.service";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  // 1. Parse input
  const body: unknown = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "Invalid request body" },
      { status: 400 }
    );
  }

  // 2. Validate
  const parsed = SendOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  // 3. Business logic
  const result = await sendOtp(parsed.data);

  // 4. Response
  return NextResponse.json(
    { message: "OTP sent successfully", data: result },
    { status: 200 }
  );
}
```

---

## Protected Routes (With Auth Guards)

```ts
// src/app/api/scout/farmers/route.ts
import { withScout } from "@/utils/auth-guards";
import { CreateFarmerSchema } from "@/validators/scout-workflows.schema";
import { createFarmer } from "@/services/farmers/farmer.service";
import { NextResponse } from "next/server";

// Protected endpoints use HOF wrappers
export const POST = withScout(async (request, session) => {
  // 1. Parse input
  const body: unknown = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "Invalid request body" },
      { status: 400 }
    );
  }

  // 2. Validate
  const parsed = CreateFarmerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  // 3. Business logic
  const farmer = await createFarmer(parsed.data, session.userId);

  // 4. Response
  return NextResponse.json(
    { message: "Farmer created", data: farmer },
    { status: 201 }
  );
});

export const GET = withScout(async (request, session) => {
  // 1. Parse query params (if needed)
  const url = new URL(request.url);
  const page = url.searchParams.get("page") ?? "0";

  // 2. Validate (if needed)
  const pageNum = parseInt(page, 10);
  if (isNaN(pageNum) || pageNum < 0) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Invalid page number" },
      { status: 422 }
    );
  }

  // 3. Business logic
  const farmers = await listFarmers(session.userId, { page: pageNum });

  // 4. Response
  return NextResponse.json({ data: farmers });
});
```

---

## Dynamic Route Parameters

```ts
// src/app/api/scout/farmers/[id]/route.ts
import { withScout } from "@/utils/auth-guards";
import { UpdateFarmerSchema } from "@/validators/scout-workflows.schema";
import { updateFarmer, getFarmer } from "@/services/farmers/farmer.service";
import { NextResponse } from "next/server";

// Extract dynamic [id] param from URL
function getFarmerId(request: Request): string | null {
  const url = new URL(request.url);
  const match = url.pathname.match(/\/farmers\/([^\/]+)/);
  return match?.[1] ?? null;
}

export const GET = withScout(async (request, session) => {
  // 1. Parse input
  const farmerId = getFarmerId(request);
  if (!farmerId) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "Invalid farmer ID" },
      { status: 400 }
    );
  }

  // 2. Validate (n/a for GET with ID)

  // 3. Business logic
  const farmer = await getFarmer(farmerId, session.userId);
  if (!farmer) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Farmer not found" },
      { status: 404 }
    );
  }

  // 4. Response
  return NextResponse.json({ data: farmer });
});

export const PATCH = withScout(async (request, session) => {
  // 1. Parse input
  const farmerId = getFarmerId(request);
  const body: unknown = await request.json().catch(() => null);

  if (!farmerId || !body) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "Invalid request" },
      { status: 400 }
    );
  }

  // 2. Validate
  const parsed = UpdateFarmerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  // 3. Business logic
  const farmer = await updateFarmer(farmerId, parsed.data, session.userId);

  // 4. Response
  return NextResponse.json({ message: "Farmer updated", data: farmer });
});
```

---

## Error Code Mappings

| Code | HTTP Status | When to Use |
|------|-------------|-----------|
| `"BAD_REQUEST"` | 400 | Malformed request, missing body, invalid JSON |
| `"VALIDATION_ERROR"` | 422 | Zod schema validation failed; include `details: fieldErrors` |
| `"NOT_FOUND"` | 404 | Resource doesn't exist; include resource type in message |
| `"UNAUTHORIZED"` | 401 | Missing/invalid JWT (handled by middleware, rarely in route) |
| `"FORBIDDEN"` | 403 | Insufficient permissions (role check failed) |
| `"RATE_LIMITED"` | 429 | Rate limit exceeded; include `retryAfterSeconds` |
| `"INTERNAL_ERROR"` | 500 | Server error; log the full error, return generic message |

---

## Auth Guard HOFs

All protected routes use HOF wrappers from `src/utils/auth-guards.ts`:

### `withScout(handler)`
Allows roles: `"scout"` or `"admin"`

```ts
export const POST = withScout(async (request, session) => {
  // session.userId, session.role, session.mobile
});
```

### `withAuth(handler)`
Any authenticated user (any role)

```ts
export const GET = withAuth(async (request, session) => {
  // ...
});
```

### `withRole(roles, handler)`
Specific roles only

```ts
export const PATCH = withRole(["scout", "admin"], async (request, session) => {
  // ...
});
```

**Session object contains:**
- `userId: string` — user ID
- `role: string` — "scout", "admin", "farmer", etc.
- `mobile: string` — user's mobile number

---

## Service Layer Imports

Always import domain services (not directly calling database):

```ts
// ✅ CORRECT
import { createFarmer, listFarmers } from "@/services/farmers/farmer.service";

// ❌ WRONG
import { prisma } from "@/services/db/prisma";
```

Services handle:
- Database queries
- Validation
- DTO mapping
- Tenant isolation (via withTenantContext)

---

## Response Format

All responses use this structure:

```ts
// Success
NextResponse.json(
  { 
    message: "...",
    data: {...} 
  },
  { status: 200 }
)

// Validation error (include fieldErrors)
NextResponse.json(
  {
    code: "VALIDATION_ERROR",
    message: "Validation failed",
    details: {
      full_name: ["Must be at least 2 characters"],
      mobile_number: ["Invalid format"]
    }
  },
  { status: 422 }
)

// Error (no data field)
NextResponse.json(
  {
    code: "NOT_FOUND",
    message: "Farmer not found"
  },
  { status: 404 }
)
```

---

## Critical Rules

- ✅ Exactly 4 comment sections: `// 1.`, `// 2.`, `// 3.`, `// 4.`
- ✅ Use Zod `.safeParse()` for validation
- ✅ Always check `body` for null before accessing properties
- ✅ Include `details: parsed.error.flatten().fieldErrors` on 422 errors
- ✅ Use HOF auth guards (`withScout`, `withAuth`, etc.)
- ✅ Never import `prisma` directly — use services
- ✅ Extract dynamic params via regex (not Next.js params object)
- ✅ Use exact error codes from table above
- ✅ Always set correct HTTP status code
- ✅ Return `NextResponse.json()`, never `Response`
