# Drizzle ORM Migration Plan

**Goal:** Migrate from Prisma ORM to Drizzle ORM to reduce bundle size from 3MB+ to <3MB for Cloudflare Workers deployment.

**Status:** Planning Phase  
**Last Updated:** 2026-05-29  
**Target Versions:** 
- drizzle-orm: 0.45.2
- drizzle-kit: 0.31.10

---

## Executive Summary

### Current State
- **ORM:** Prisma 5.22.0 with Neon adapter
- **Database:** PostgreSQL (Neon)
- **Schema Models:** 33 models across 798 lines
- **Enums:** 18 enums
- **Affected Files:** 106 files using Prisma
- **API Routes:** 95 route handlers with database queries
- **Bundle Impact:** Prisma WASM engines add ~2MB to bundle

### Target State
- **ORM:** Drizzle ORM 0.45.2 (lightweight, ~30KB)
- **Query Builder:** drizzle-kit 0.31.10 for migrations
- **Database:** Same PostgreSQL (Neon) - no schema changes
- **Bundle Size:** Estimated reduction to 1.5MB-2MB gzipped
- **Migration Effort:** 40-50 hours of development

---

## Phase 1: Setup & Preparation

### Task 1.1: Install Drizzle Dependencies
- **Action:** Add drizzle-orm and drizzle-kit to package.json
  ```bash
  npm install drizzle-orm@0.45.2 drizzle-kit@0.31.10
  npm install -D @types/pg
  ```
- **Status:** ⏳ TODO
- **Effort:** 5 minutes

### Task 1.2: Create Drizzle Configuration
- **Files to Create:**
  - `src/lib/db/drizzle.config.ts` - Drizzle config with Neon connection
  - `drizzle.config.ts` - Migration config for drizzle-kit
- **Action:**
  ```typescript
  // src/lib/db/drizzle.config.ts
  import { neon } from '@neondatabase/serverless';
  import { drizzle } from 'drizzle-orm/neon-http';
  
  const sql = neon(process.env.DATABASE_URL!);
  export const db = drizzle(sql);
  ```
- **Status:** ⏳ TODO
- **Effort:** 30 minutes

### Task 1.3: Create Schema Directory Structure
- **Create:** `src/lib/db/schema/`
- **Subdirectories:**
  - `src/lib/db/schema/enums.ts` - All 18 enums
  - `src/lib/db/schema/users.ts` - User-related models (User, Role, Auth)
  - `src/lib/db/schema/students.ts` - Student and Parent models
  - `src/lib/db/schema/competitions.ts` - Competition and Division models
  - `src/lib/db/schema/judges.ts` - Judge and Jury models
  - `src/lib/db/schema/scoring.ts` - Judge assignments and scores
  - `src/lib/db/schema/entries.ts` - Entry and qualification models
  - `src/lib/db/schema/certificates.ts` - Certificate models
  - `src/lib/db/schema/prizes.ts` - Prize and award models
  - `src/lib/db/schema/transactions.ts` - Payment and transaction models
  - `src/lib/db/schema/notifications.ts` - Notification models
  - `src/lib/db/schema/courier.ts` - Shipping and courier models
  - `src/lib/db/schema/index.ts` - Export all schemas
- **Status:** ⏳ TODO
- **Effort:** 1 hour (structure only)

---

## Phase 2: Schema Definition

### Task 2.1: Convert Enums
- **Files to Update:** `src/lib/db/schema/enums.ts`
- **Enums to Convert:** (18 total)
  1. Role (SUPER_ADMIN, MODERATOR, JUDGE, PARENT)
  2. PaymentStatus (PENDING, SUCCESS, FAILED)
  3. EntryStatus (PENDING_VERIFICATION, VERIFIED, REJECTED, DISQUALIFIED)
  4. CertificateType (PARTICIPATION, MERIT_1, MERIT_2, MERIT_3, SPECIAL_MENTION)
  5. CertificateStatus (PENDING, GENERATED, SHARED, REVOKED)
  6. CompetitionScope (STATE, NATIONAL)
  7. PrizeType (DIGITAL_CERTIFICATE, DIGITAL_MEDAL, PHYSICAL_MEDAL, PHYSICAL_TROPHY, CASH_PRIZE, SCHOLARSHIP, RECOGNITION)
  8. PrizeRank (FIRST_PLACE, SECOND_PLACE, THIRD_PLACE, MERIT_1, MERIT_2, MERIT_3, SPECIAL_MENTION, PEOPLES_CHOICE, PARTICIPATION)
  9. JudgeTier (LOCAL, REGIONAL, NATIONAL, EXPERT)
  10. QualificationStatus (OFFERED, ACCEPTED, DECLINED, EXPIRED, REVOKED)
  11. And 8 more...
- **Pattern:**
  ```typescript
  export const roleEnum = pgEnum('role', ['SUPER_ADMIN', 'MODERATOR', 'JUDGE', 'PARENT']);
  ```
- **Status:** ⏳ TODO
- **Effort:** 2 hours

### Task 2.2: Convert Models to Drizzle Tables
- **Files to Update:** All files in `src/lib/db/schema/`
- **Models to Convert:** 33 total
  - Priority 1 (Core): User, Parent, Student, Competition, Judge
  - Priority 2 (Scoring): JudgeAssignment, JudgeScore, Qualification
  - Priority 3 (Content): Entry, Certificate, Prize, Division
  - Priority 4 (Transactions): Payment, Transaction, BannerTemplate
  - Priority 5 (Notifications): NotificationPreference, TelegramMessageDelivery
  - Priority 6 (Courier): CourierShipment, ShippingLabel
- **Pattern:**
  ```typescript
  export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').unique().notNull(),
    name: text('name').notNull(),
    role: roleEnum('role').notNull().default('PARENT'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  });
  ```
- **Status:** ⏳ TODO
- **Effort:** 6-8 hours

### Task 2.3: Define Relations
- **Action:** Add Drizzle relations for all foreign keys
- **Pattern:**
  ```typescript
  export const usersRelations = relations(users, ({ many }) => ({
    students: many(students),
    judges: many(judges),
  }));
  ```
- **Status:** ⏳ TODO
- **Effort:** 2-3 hours

### Task 2.4: Create Migrations
- **Action:** Generate initial migration from schema
  ```bash
  npx drizzle-kit generate:pg --config=drizzle.config.ts
  ```
- **Verify:** All existing tables are recognized (should be empty migration)
- **Status:** ⏳ TODO
- **Effort:** 30 minutes

---

## Phase 3: API Route Conversion

### Task 3.1: Audit API Route Patterns
- **Action:** Identify common query patterns used across routes
  - `findUnique()` → `db.select().from(table).where(eq(id, value)).limit(1)`
  - `findMany()` → `db.select().from(table).where(...)`
  - `create()` → `db.insert(table).values({...}).returning()`
  - `update()` → `db.update(table).set(...).where(...).returning()`
  - `delete()` → `db.delete(table).where(...)`
  - `upsert()` → Using conditional logic
- **Status:** ⏳ TODO
- **Effort:** 2 hours

### Task 3.2: Create Database Query Utilities
- **File:** `src/lib/db/queries.ts`
- **Purpose:** Common query functions to reduce boilerplate
- **Examples:**
  ```typescript
  export async function getUserById(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }
  
  export async function createStudent(data: InsertStudent) {
    return db.insert(students).values(data).returning();
  }
  ```
- **Status:** ⏳ TODO
- **Effort:** 3-4 hours

### Task 3.3: Convert API Routes (Batch by Priority)
- **Batch 1 - Auth Routes (15 routes)**
  - `src/app/api/auth/**`
  - Impact: High (core functionality)
  - Estimated time: 6-8 hours
  
- **Batch 2 - Account Routes (20 routes)**
  - `src/app/api/account/**`
  - Impact: High (user data management)
  - Estimated time: 8-10 hours
  
- **Batch 3 - Admin Routes (35 routes)**
  - `src/app/api/admin/**`
  - Impact: High (competition management)
  - Estimated time: 12-15 hours
  
- **Batch 4 - Judge Routes (10 routes)**
  - `src/app/api/judge/**`
  - Impact: Medium
  - Estimated time: 4-5 hours
  
- **Batch 5 - Misc Routes (15 routes)**
  - `src/app/api/cron/**`, `src/app/api/public/**`, etc.
  - Impact: Low
  - Estimated time: 5-6 hours

- **Total Routes to Convert:** 95
- **Status:** ⏳ TODO
- **Effort:** 35-44 hours (most of migration)

---

## Phase 4: Testing & Validation

### Task 4.1: Unit Tests
- **Action:** Create test file for each major module
- **Coverage:** Database queries, conversions, error handling
- **Status:** ⏳ TODO
- **Effort:** 5-6 hours

### Task 4.2: Integration Tests
- **Action:** Test full API workflows
- **Scope:** Auth flow, student registration, judge scoring
- **Status:** ⏳ TODO
- **Effort:** 3-4 hours

### Task 4.3: Load Testing
- **Action:** Verify performance with Drizzle vs Prisma
- **Tools:** Artillery or k6
- **Status:** ⏳ TODO
- **Effort:** 2 hours

---

## Phase 5: Cleanup & Optimization

### Task 5.1: Remove Prisma
- **Action:** 
  - Delete `prisma/schema.prisma`
  - Remove `@prisma/client`, `@prisma/adapter-neon` from package.json
  - Delete `src/lib/db.ts`
  - Remove `prisma` field from package.json
- **Status:** ⏳ TODO
- **Effort:** 30 minutes

### Task 5.2: Update Build Configuration
- **Files:** `next.config.ts`, `wrangler.toml`
- **Action:** Remove Prisma-specific configurations
- **Status:** ⏳ TODO
- **Effort:** 30 minutes

### Task 5.3: Documentation
- **Create:** `docs/DATABASE.md` for Drizzle setup
- **Create:** `docs/QUERY_PATTERNS.md` for common patterns
- **Status:** ⏳ TODO
- **Effort:** 2 hours

---

## Phase 6: Deployment & Verification

### Task 6.1: Build & Measure Bundle Size
- **Command:** `npx opennextjs-cloudflare build`
- **Target:** <3MB gzipped
- **Expected:** 1.5-2MB (50% reduction)
- **Status:** ⏳ TODO
- **Effort:** 1 hour

### Task 6.2: Deploy to Cloudflare
- **Action:** Deploy optimized build
- **Verify:** All core flows work
- **Status:** ⏳ TODO
- **Effort:** 1 hour

### Task 6.3: Monitor & Hotfix
- **Action:** Watch for errors, fix issues
- **Duration:** 24-48 hours post-deploy
- **Status:** ⏳ TODO
- **Effort:** 4-8 hours

---

## Critical Path & Timeline

```
Phase 1 (Setup)           → 2 hours
Phase 2 (Schema)          → 12 hours
Phase 3 (API Routes)      → 40 hours (CRITICAL PATH)
Phase 4 (Testing)         → 10 hours
Phase 5 (Cleanup)         → 3 hours
Phase 6 (Deployment)      → 6 hours
───────────────────────────────────
Total Estimated:          73 hours
```

**Realistic Timeline:**
- Full-time: 2 weeks (40 hrs/week)
- Part-time: 4-5 weeks (15-20 hrs/week)

---

## Migration Strategy

### Approach 1: Big Bang (Risky)
- Convert everything at once
- Pro: Done faster, single PR
- Con: Hard to debug, risky for production

### Approach 2: Incremental (Safer) ✅ RECOMMENDED
1. Convert schema first
2. Convert auth routes (core)
3. Convert account routes
4. Convert admin routes
5. Convert judge routes
6. Clean up and deploy

**Benefits:**
- Can test each batch independently
- Easier to rollback
- Catch issues early
- Can deploy incrementally

---

## Key Gotchas & Mitigations

| Issue | Mitigation |
|-------|-----------|
| WASM engines still bundled | Remove @prisma/* completely from package.json |
| Transaction handling differences | Use `db.transaction()` for multi-step operations |
| Relation queries behavior | May need to use `query` API instead of builder API |
| Migration conflicts | Keep drizzle migrations in version control |
| Neon connection pooling | Ensure connection limits match Drizzle expectations |
| Type safety gaps | Use Drizzle's `.inferSelect()` and `.inferInsert()` |

---

## Rollback Plan

If issues arise:
1. Keep Prisma in package.json (don't delete)
2. Revert API routes to Prisma one batch at a time
3. If critical: rollback deployment and restart Phase 1

---

## Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Bundle size (gzipped) | <3MB | 3MB+ | 🎯 |
| API response time | <50ms | TBD | ⏳ |
| Test coverage | >80% | TBD | ⏳ |
| Cloudflare deployment | ✅ Success | ❌ Failed | ⏳ |
| Zero data loss | ✅ 100% | TBD | ⏳ |

---

## Dependencies & References

- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Neon Postgres Integration](https://orm.drizzle.team/docs/get-started-postgresql)
- [Drizzle Relations](https://orm.drizzle.team/docs/rls)
- [Neon HTTP Client](https://neon.tech/docs/guides/serverless)

---

## Next Steps

1. ✅ Review this plan
2. ⏳ Get approval to proceed
3. ⏳ Start Phase 1: Setup & Preparation
4. ⏳ Complete schema definition
5. ⏳ Begin incremental route conversion
