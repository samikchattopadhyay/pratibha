---
name: api-rules
description: Validate REST API contracts, service isolation, and typed response DTOs
user-invocable: false
---

# API Integration Patterns — Scout App

## Architecture
API calls exist ONLY inside `src/services/`. Never fetch inside components. Domain services use the base API client.

## Service Layer Structure
```
src/services/
├── api-client.ts         ← Core: apiGet/apiPost/apiPut/apiPatch/apiDelete functions
├── auth/
│   ├── auth.service.ts   ← Client-facing OTP, logout, refresh calls
│   ├── otp.ts            ← OTP generation, storage, verification
│   ├── session.ts        ← JWT sign/verify, HttpOnly cookie management
│   ├── refresh.ts        ← Refresh token rotation
│   ├── rate-limit.ts     ← In-memory rate limiting
│   └── audit.ts          ← Audit log service
├── db/
│   ├── connection.ts     ← PostgreSQL connection pool
│   ├── prisma.ts         ← Prisma singleton with tenant RLS
│   ├── tenant.ts         ← Tenant context helper
│   └── extensions/
│       └── tenant-rls.ts ← Prisma extension for RLS
├── farmers/
│   ├── farmer.service.ts ← CRUD: createFarmer, updateFarmer, listFarmers, etc.
│   ├── farmer-mapper.ts  ← DTO ↔ Prisma transformations
│   ├── farmer-otp.service.ts ← Mobile OTP during registration
│   └── pond.service.ts   ← Pond CRUD
└── index.ts              ← Re-export all (optional)
```

## Base HTTP Client (Functional)

```ts
// src/services/api-client.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public details?: Record<string, string[]>
  ) {
    super(code);
    this.name = "ApiError";
  }
}

interface ApiRequestConfig {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  timeout?: number;
}

const DEFAULT_TIMEOUT = 15000; // 15s
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export async function apiRequest<T>(config: ApiRequestConfig & { path: string }): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout ?? DEFAULT_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${config.path}`, {
      method: config.method ?? "GET",
      headers: { "Content-Type": "application/json" },
      body: config.body ? JSON.stringify(config.body) : undefined,
      credentials: "include", // HttpOnly cookies
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        code: "NETWORK_ERROR",
        message: response.statusText,
      }));
      throw new ApiError(response.status, error.code, error.details);
    }

    if (response.status === 204) return undefined as T;
    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

// Convenience wrappers
export async function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>({ path, method: "GET" });
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>({ path, method: "POST", body });
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>({ path, method: "PUT", body });
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>({ path, method: "PATCH", body });
}

export async function apiDelete<T>(path: string): Promise<T> {
  return apiRequest<T>({ path, method: "DELETE" });
}
```

## Service Example (Domain Service)

```ts
// src/services/farmers/farmer.service.ts
import { apiPost, apiGet, apiPatch } from "../api-client";
import { prisma } from "../db/prisma";
import type { FarmerDTO } from "@/types";

export async function createFarmer(
  input: CreateFarmerInput,
  scoutId: string
): Promise<FarmerDTO> {
  // 1. Validate input
  const parsed = CreateFarmerSchema.safeParse(input);
  if (!parsed.success) throw new Error("Validation failed");

  // 2. Database call
  const farmer = await prisma.farmer.create({
    data: {
      fullName: parsed.data.full_name,
      mobileNumber: parsed.data.mobile_number,
      registeredBy: scoutId,
    },
  });

  // 3. Return DTO
  return mapToFarmerDTO(farmer);
}

export async function listFarmers(
  scoutId: string,
  params?: PaginationParams
): Promise<PaginatedFarmersDTO> {
  const [farmers, total] = await Promise.all([
    prisma.farmer.findMany({
      where: { registeredBy: scoutId },
      skip: (params?.page ?? 0) * (params?.limit ?? 10),
      take: params?.limit ?? 10,
    }),
    prisma.farmer.count({ where: { registeredBy: scoutId } }),
  ]);

  return {
    data: farmers.map(mapToFarmerDTO),
    total,
    page: params?.page ?? 0,
    limit: params?.limit ?? 10,
  };
}

// DTO mapping in separate mapper file
function mapToFarmerDTO(farmer: PrismaFarmer): FarmerDTO {
  return {
    id: farmer.id,
    fullName: farmer.fullName,
    mobileNumber: farmer.mobileNumber,
    createdAt: farmer.createdAt.toISOString(),
  };
}
```

## API Route Pattern (Next.js App Router)

```ts
// src/app/api/scout/farmers/route.ts
import { withScout } from "@/utils/auth-guards";
import { CreateFarmerSchema } from "@/validators/scout-workflows.schema";
import { createFarmer } from "@/services/farmers/farmer.service";
import { NextResponse } from "next/server";

// 1. Parse input, 2. Validate, 3. Business logic, 4. Response
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

// Protected GET endpoint
export const GET = withScout(async (request, session) => {
  const farmers = await listFarmers(session.userId);
  return NextResponse.json({ data: farmers });
});
```

**Error Code Strings & HTTP Mappings:**
- `"VALIDATION_ERROR"` → 422 (with `details: fieldErrors`)
- `"NOT_FOUND"` → 404
- `"UNAUTHORIZED"` → 401
- `"FORBIDDEN"` / "RATE_LIMITED" → 429
- `"INTERNAL_ERROR"` → 500
- `"BAD_REQUEST"` → 400

**Auth Guard HOFs** (from `src/utils/auth-guards.ts`):
- `withScout(handler)` — allows roles "scout" or "admin"
- `withAuth(handler)` — any authenticated user
- `withRole(roles[], handler)` — specific roles only
- Guards read `x-user-id`, `x-user-role`, `x-user-mobile` headers from Edge middleware

## Error Handling

```ts
// src/services/error-handler.ts
import type { ApiError } from "./client";

export class ApiException extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiException";
  }
}

export function handleApiError(error: unknown): ApiException {
  if (error instanceof ApiException) {
    return error;
  }

  const apiError = error as ApiError;

  return new ApiException(
    apiError.code || "UNKNOWN_ERROR",
    apiError.message || "Something went wrong. Please try again.",
    apiError.details
  );
}
```

## Offline-Aware Mutations

```ts
// src/services/sync/sync.service.ts
import { api } from "../client";
import type { PendingMutation } from "@/stores/sync.store";

export const syncService = {
  processMutation: async (mutation: PendingMutation): Promise<void> => {
    switch (mutation.type) {
      case "create":
        await api.post(mutation.endpoint, mutation.payload);
        break;
      case "update":
        await api.put(mutation.endpoint, mutation.payload);
        break;
      case "delete":
        await api.delete(mutation.endpoint);
        break;
    }
  },

  checkConnectivity: async (): Promise<boolean> => {
    try {
      return navigator.onLine;
    } catch {
      return true; // Server-side: assume online
    }
  },
};
```

## DTO Naming Convention

```ts
// Request DTOs: VerbNounRequest
CreateFarmerRequest
UpdatePondRequest
SubmitInspectionRequest
MarkLotReadyRequest

// Response DTOs: Entity (no suffix) or EntityResponse
Farmer
Pond
Inspection
LotVerificationResponse

// Query params: EntityQueryParams
FarmersQueryParams
LotsQueryParams
InspectionsQueryParams

// Paginated wrapper: PaginatedResponse<T>
PaginatedResponse<Farmer>
PaginatedResponse<Lot>
```

## Validation Contracts

```ts
// src/validators/farmer.schema.ts
import { z } from "zod";
import type { CreateFarmerRequest } from "@/services/farmers/farmers.types";

export const createFarmerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number"),
  language: z.enum(["hi", "en", "bn", "or"]),
  residentialAddress: z.object({
    line1: z.string().min(5, "Address required"),
    line2: z.string().optional(),
    village: z.string().min(2),
    district: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
  }),
}) satisfies z.ZodSchema<CreateFarmerRequest>;

export type CreateFarmerFormData = z.infer<typeof createFarmerSchema>;
```

## API Pattern Checklist

- [ ] All fetch calls in services/ only
- [ ] Strongly typed request/response DTOs
- [ ] Paginated responses use PaginatedResponse<T>
- [ ] Error handling centralized in ApiException
- [ ] TanStack Query wraps all queries
- [ ] Query keys exported as constants
- [ ] Mutations invalidate relevant queries on success
- [ ] Offline mutations go to sync queue
- [ ] Zod schemas match API DTOs where applicable
- [ ] No .then() — async/await only
- [ ] Authorization header added in client.ts (not per service)