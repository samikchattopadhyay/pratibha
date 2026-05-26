---
name: generate-service
description: Create domain services for isolated business logic and database access
user-invocable: false
---

# Skill: Generate Service (Domain Service)

## Usage

Use when creating server-side business logic for a domain (farmers, poppers, lots, inspections, etc.).

---

## Core Principles

- **Plain async functions** (NOT classes, NOT service objects)
- **Server-only** (never import in client components)
- **Domain-based organization** (not type-based)
- **Database access via Prisma singleton**
- **Types in `src/types/index.ts`, mappers in `<domain>-mapper.ts`**
- **No fetch calls** (services call other services or database, not API directly)

---

## Service File Structure

```
src/services/
├── <domain>/
│   ├── <domain>.service.ts       ← Main CRUD functions
│   ├── <domain>-mapper.ts        ← DTO mapping
│   ├── <domain>-otp.service.ts   ← Feature-specific (if needed)
│   └── related.service.ts        ← Related domain (if needed)
```

---

## Pattern: Basic CRUD Service

```ts
// src/services/farmers/farmer.service.ts
import { prisma } from "../db/prisma";
import { mapCreateFarmerInput, toFarmerDTO } from "./farmer-mapper";
import type { FarmerDTO, CreateFarmerInput } from "@/types";

/**
 * Create a new farmer record.
 * @param input - Farmer creation input (from Zod validation)
 * @param scoutId - Scout user ID (from session)
 * @returns FarmerDTO
 */
export async function createFarmer(
  input: CreateFarmerInput,
  scoutId: string
): Promise<FarmerDTO> {
  const mapped = mapCreateFarmerInput(input);

  const farmer = await prisma.farmer.create({
    data: {
      ...mapped,
      registeredBy: scoutId,
    },
  });

  return toFarmerDTO(farmer);
}

/**
 * Get a single farmer by ID.
 */
export async function getFarmer(farmerId: string, scoutId: string): Promise<FarmerDTO | null> {
  const farmer = await prisma.farmer.findFirst({
    where: {
      id: farmerId,
      registeredBy: scoutId, // Ownership check
    },
  });

  return farmer ? toFarmerDTO(farmer) : null;
}

/**
 * List farmers for a scout with pagination.
 */
export async function listFarmers(
  scoutId: string,
  params?: { page?: number; limit?: number }
): Promise<{ data: FarmerDTO[]; total: number; page: number; limit: number }> {
  const page = params?.page ?? 0;
  const limit = params?.limit ?? 10;

  const [farmers, total] = await Promise.all([
    prisma.farmer.findMany({
      where: { registeredBy: scoutId },
      skip: page * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.farmer.count({ where: { registeredBy: scoutId } }),
  ]);

  return {
    data: farmers.map(toFarmerDTO),
    total,
    page,
    limit,
  };
}

/**
 * Update farmer details.
 */
export async function updateFarmer(
  farmerId: string,
  input: Partial<CreateFarmerInput>,
  scoutId: string
): Promise<FarmerDTO> {
  const mapped = mapCreateFarmerInput(input as CreateFarmerInput);

  const farmer = await prisma.farmer.update({
    where: { id: farmerId },
    data: mapped,
  });

  return toFarmerDTO(farmer);
}

/**
 * Delete (archive) a farmer.
 */
export async function deleteFarmer(farmerId: string, scoutId: string): Promise<void> {
  await prisma.farmer.update({
    where: { id: farmerId },
    data: { deletedAt: new Date() },
  });
}
```

---

## Pattern: Mapper File

Handles conversion between:
- **API input** (snake_case from JSON body)
- **TypeScript types** (camelCase)
- **Prisma models** (camelCase)
- **DTOs** (camelCase, selected fields only)

```ts
// src/services/farmers/farmer-mapper.ts
import type { Farmer as PrismaFarmer } from "@prisma/client";
import type { CreateFarmerInput, FarmerDTO } from "@/types";

/**
 * Map API input (snake_case) to Prisma-compatible format (camelCase).
 */
export function mapCreateFarmerInput(input: CreateFarmerInput) {
  return {
    fullName: input.full_name,
    mobileNumber: input.mobile_number,
    language: input.language,
    // Convert area units if needed
    pondAreaUnit: input.pond_area_unit,
    pondAreaAcres: convertToAcres(input.pond_area_value, input.pond_area_unit),
  };
}

/**
 * Map Prisma model to DTO (only expose necessary fields).
 */
export function toFarmerDTO(farmer: PrismaFarmer): FarmerDTO {
  return {
    id: farmer.id,
    fullName: farmer.fullName,
    mobileNumber: farmer.mobileNumber,
    language: farmer.language,
    pondAreaAcres: farmer.pondAreaAcres,
    createdAt: farmer.createdAt.toISOString(),
    registeredBy: farmer.registeredBy,
  };
}

/**
 * Unit conversion helper.
 */
function convertToAcres(value: number, unit: "acres" | "bigha" | "hectares"): number {
  const conversions = {
    acres: 1,
    bigha: value * 0.625, // 1 bigha ≈ 0.625 acres
    hectares: value * 2.47, // 1 hectare ≈ 2.47 acres
  };
  return conversions[unit];
}
```

---

## Pattern: Tenant-Aware Service

For multi-tenant applications, use `withTenantContext` helper:

```ts
// src/services/farmers/farmer.service.ts
import { withTenantContext } from "../db/tenant";

export async function createFarmerWithTenantIsolation(
  input: CreateFarmerInput,
  scoutId: string,
  tenantId: string
): Promise<FarmerDTO> {
  return withTenantContext(tenantId, async () => {
    const mapped = mapCreateFarmerInput(input);

    const farmer = await prisma.farmer.create({
      data: {
        ...mapped,
        registeredBy: scoutId,
        tenantId, // Explicit tenant foreign key
      },
    });

    return toFarmerDTO(farmer);
  });
}
```

---

## Pattern: Feature-Specific Service

For OTP, verification, or other sub-features:

```ts
// src/services/farmers/farmer-otp.service.ts
import { prisma } from "../db/prisma";
import { generateOtp, verifyOtp as verifyOtpHash } from "../auth/otp";

/**
 * Send mobile OTP during farmer registration.
 */
export async function sendFarmerMobileOtp(mobileNumber: string): Promise<string> {
  // Generate 6-digit OTP
  const otp = generateOtp();

  // Store hashed OTP in database
  await prisma.farmerOtpRecord.upsert({
    where: { mobileNumber },
    update: {
      otpHash: otp.hash,
      expiresAt: otp.expiresAt,
      attemptCount: 0,
    },
    create: {
      mobileNumber,
      otpHash: otp.hash,
      expiresAt: otp.expiresAt,
    },
  });

  // Return plaintext OTP (for SMS sending in route handler)
  return otp.plaintext;
}

/**
 * Verify OTP entered by farmer.
 */
export async function verifyFarmerMobileOtp(
  mobileNumber: string,
  enteredOtp: string
): Promise<boolean> {
  const record = await prisma.farmerOtpRecord.findUnique({
    where: { mobileNumber },
  });

  if (!record || record.expiresAt < new Date()) {
    return false;
  }

  const isValid = await verifyOtpHash(enteredOtp, record.otpHash);
  if (isValid) {
    await prisma.farmerOtpRecord.update({
      where: { mobileNumber },
      data: { verified: true },
    });
  }

  return isValid;
}
```

---

## Pattern: Related Domain Service

```ts
// src/services/farmers/pond.service.ts
import { prisma } from "../db/prisma";
import type { PondDTO, CreatePondInput } from "@/types";

/**
 * Create a pond for a farmer.
 */
export async function createPond(
  farmerId: string,
  input: CreatePondInput
): Promise<PondDTO> {
  const pond = await prisma.pond.create({
    data: {
      farmerId,
      pondName: input.pond_name,
      areaAcres: input.area_acres,
      gpsLatitude: input.gps_latitude,
      gpsLongitude: input.gps_longitude,
    },
  });

  return toPondDTO(pond);
}

/**
 * List ponds for a farmer.
 */
export async function listPonds(farmerId: string): Promise<PondDTO[]> {
  const ponds = await prisma.pond.findMany({
    where: { farmerId },
    orderBy: { createdAt: "desc" },
  });

  return ponds.map(toPondDTO);
}

function toPondDTO(pond: Pond): PondDTO {
  return {
    id: pond.id,
    farmerId: pond.farmerId,
    pondName: pond.pondName,
    areaAcres: pond.areaAcres,
    gpsLatitude: pond.gpsLatitude,
    gpsLongitude: pond.gpsLongitude,
    createdAt: pond.createdAt.toISOString(),
  };
}
```

---

## Import Rules

### ✅ CORRECT
```ts
// Import from db
import { prisma } from "../db/prisma";

// Import from other services (same directory or parent)
import { verifyOtp } from "../auth/otp";

// Import types
import type { FarmerDTO, CreateFarmerInput } from "@/types";

// Use relative imports for local mappers
import { mapCreateFarmerInput, toFarmerDTO } from "./farmer-mapper";
```

### ❌ WRONG
```ts
// Don't import API client—services don't call APIs
import { apiPost } from "../api-client";

// Don't import from components
import { FarmerForm } from "@/components/farmers";

// Don't import directly from node_modules auth libraries
import bcrypt from "bcryptjs"; // Use service wrapper instead
```

---

## Critical Rules

- ✅ Plain **async functions** (not classes, not objects)
- ✅ **Database-first** (call prisma, not API)
- ✅ **Types from `src/types/index.ts`**
- ✅ **Mappers in separate file** (`<domain>-mapper.ts`)
- ✅ **Export functions, not objects** (`export async function` not `export const service = {}`)
- ✅ **JSDoc comments** for public functions (purpose, params, returns)
- ✅ **No fetch calls** — services are backend-only
- ✅ **Ownership/tenant checks** — validate user can access resource
- ✅ **Parallel queries** where possible (use `Promise.all()`)
- ✅ **DTOs for API** — never return raw Prisma models
