# Drizzle ORM Migration Status

**Started:** 2026-05-29  
**Current Phase:** Phase 3 - API Route Conversion (Batch 1 - 40% Complete)  
**Overall Progress:** ~25% Complete (Schema + Auth Routes + Helpers)

---

## Phase Completion Status

| Phase | Name | Status | Effort |
|-------|------|--------|--------|
| 1-2 | Schema Definition & Relations | ✅ Complete | 14 hours |
| 3 | API Route Conversion | 🔄 In Progress | 40-50 hours (critical path) |
| 4 | Testing & Validation | ⏳ Pending | 10 hours |
| 5 | Cleanup & Optimization | ⏳ Pending | 3 hours |
| 6 | Deployment & Verification | ⏳ Pending | 6 hours |

---

## Completed Work (Phase 1-2)

✅ **Schema Setup** (13 files)
- `src/lib/db/drizzle.ts` - Neon HTTP client configuration
- `drizzle.config.ts` - Migration configuration
- 13 schema modules under `src/lib/db/schema/`:
  - enums.ts, users.ts, students.ts, competitions.ts
  - registrations.ts, judges.ts, scoring.ts, certificates.ts
  - prizes.ts, qualifications.ts, courier.ts
  - notifications.ts, settings.ts, index.ts

✅ **Query Utilities** (`src/lib/db/queries.ts`)
- 45+ query functions covering all common operations
- Type-safe select, insert, update, delete operations
- Relation counting utilities

✅ **Auth Routes Converted** (6/15)
- `POST /api/auth/register` - Create user + parent with transaction
- `POST/GET /api/auth/verify-email` - Email verification
- `POST/GET /api/auth/set-password` - Password setup  
- `POST /api/auth/forgot-password` - Password reset request
- `POST/GET /api/auth/reset-password` - Password reset with token
- `POST /api/auth/resend-verification` - Email verification retry

✅ **Auth Helper Libraries Converted**
- `src/lib/email-verification.ts` - Token generation, verification, cleanup
- `src/lib/profile-setup-token.ts` - Profile setup token management

---

## API Route Conversion Pattern

### Conversion Checklist
1. **Import** Drizzle utilities instead of Prisma
   ```typescript
   // OLD: import prisma from "@/lib/db"
   // NEW: import { db } from "@/lib/db/drizzle"
   //      import { users, ... } from "@/lib/db/schema"
   //      import { getUserById, ... } from "@/lib/db/queries"
   ```

2. **Replace findUnique/findMany**
   ```typescript
   // OLD: await prisma.user.findUnique({ where: { email } })
   // NEW: await getUserByEmail(email)
   ```

3. **Replace create/update**
   ```typescript
   // OLD: await prisma.user.create({ data: {...} })
   // NEW: await createUser({ ...data })
   ```

4. **Replace $transaction**
   ```typescript
   // OLD: await prisma.$transaction(async (tx) => { ... })
   // NEW: await db.transaction(async (tx) => { ... })
   ```

5. **Handle includes/relations with `with` clause**
   ```typescript
   // OLD: await prisma.judge.findUnique({ 
   //   where: { id }, 
   //   include: { user: true, assignments: true } 
   // })
   // NEW: await db.query.judges.findFirst({
   //   where: eq(judges.id, id),
   //   with: { user: true, assignments: true }
   // })
   ```

---

## Routes Remaining by Batch

### Batch 1: Auth Routes (15 total, 6 done)
**Status:** 🔄 In Progress (40% complete)  
**Remaining:** 9 routes

- [x] `/api/auth/forgot-password` - POST
- [x] `/api/auth/reset-password` - POST
- [x] `/api/auth/resend-verification` - POST
- [ ] `/api/auth/facebook/create-user` - POST (uses helper lib, auto-converted)
- [ ] `/api/auth/setup/verify-email` - POST
- [ ] `/api/auth/setup/add-phone` - POST
- [ ] `/api/auth/setup/confirm-phone-otp` - POST
- [ ] `/api/auth/setup/save-address` - POST
- [ ] `/api/auth/setup/set-password` - POST
- [ ] `/api/auth/setup/resend-verification-email` - POST
- [ ] `/api/auth/setup/verify-phone` - POST
- [ ] `[...nextauth]/route` - NextAuth config (may need special handling)

**Estimated:** 4-6 hours remaining

### Batch 2: Account Routes (20 total, 0 done)
**Status:** ⏳ Pending

Routes for parent/student dashboard, profile, entries, qualifications

**Estimated:** 8-10 hours

### Batch 3: Admin Routes (35 total, 0 done)
**Status:** ⏳ Pending

Routes for competition, judge, certificate, prize, registration management

**Estimated:** 12-15 hours

### Batch 4: Judge Routes (10 total, 0 done)
**Status:** ⏳ Pending

Routes for judge profile, assignments, scoring, analytics

**Estimated:** 4-5 hours

### Batch 5: Misc Routes (15 total, 0 done)
**Status:** ⏳ Pending

Cron jobs, public endpoints, registrations, notifications

**Estimated:** 5-6 hours

---

## Key Query Functions Created

### User Management
- `getUserById(id)`, `getUserByEmail(email)`, `getUserByFacebookId(facebookId)`
- `createUser(data)`, `updateUser(id, data)`

### Parent/Student
- `getParentByUserId(userId)`, `getParentByPhone(phone)`
- `getStudentById(id)`, `getStudentsByParentId(parentId)`
- `createStudent(data)`, `updateStudent(id, data)`

### Judge
- `getJudgeById(id)`, `getJudgeByUserId(userId)`, `getJudges(limit, offset)`
- `createJudge(data)`, `updateJudge(id, data)`

### Tokens
- `getPasswordSetupTokenByToken(token)`, `getPasswordResetTokenByToken(token)`
- `getEmailVerificationTokenByToken(token)`, `getProfileSetupTokenByToken(token)`
- `createPasswordSetupToken()`, `createProfileSetupToken()`
- `updatePasswordSetupToken()`, `updateProfileSetupToken()`
- `deletePasswordSetupToken()`, `deleteEmailVerificationToken()`

### Core Operations
- `getRegistrationById(id)`, `getRegistrationsByStudentId(studentId)`
- `getCompetitionById(id)`, `getCompetitions(limit, offset)`
- `getJudgeAssignmentsByJudgeId(judgeId)`, `getJudgeAssignmentsByRegistrationId(registrationId)`
- `getCertificateByRegistrationId(registrationId)`
- `getScoreByJudgeAssignmentId(judgeAssignmentId)`
- `getPrizeAwardByRegistrationId(registrationId)`

### Relations Counting
- `countJudgeAssignments(judgeId)`
- `countStudentsByParentId(parentId)`
- `countRegistrationsByStudentId(studentId)`

---

## Next Steps

1. **Continue Batch 1 (Auth Routes)**
   - Complete remaining 12 auth routes
   - Test each route with Postman or integration tests
   - Estimated: 2-4 hours

2. **Move to Batch 2 (Account Routes)**
   - Dashboard queries require pagination + filtering
   - May need additional query utilities
   - Estimated: 3-4 hours

3. **Create More Query Utilities as Needed**
   - Add query functions for filtering (status, category, etc.)
   - Add pagination helpers
   - Add complex joins for reports/analytics

4. **Test Each Batch**
   - Run integration tests after each batch
   - Verify API responses match expected format
   - Check for missing relations or data

5. **Performance Verification**
   - Test query performance vs Prisma
   - Add indexes if needed
   - Verify N+1 query issues don't exist

---

## Important Notes

### Limitations & Considerations

1. **Transaction Syntax**: Drizzle transactions may need different error handling patterns
2. **Count Operations**: Use `countJudgeAssignments()` utilities instead of Prisma's `_count`
3. **Nested Relations**: For deep includes (user.judge.assignments), use `with` clause or separate queries
4. **Pagination**: Always use offset + limit for server-side pagination
5. **Updates**: Drizzle's update returns affected rows, not the updated record (use separate select if needed)

### Build & Type Safety

- All changes verified with `npx tsc --noEmit`
- All changes verified with `npm run build`
- Production build successful

---

## Timeline Estimate

- **Batch 1 (Auth)**: 1-2 days (2-4 hours remaining)
- **Batch 2 (Account)**: 2-3 days (8-10 hours)
- **Batch 3 (Admin)**: 3-4 days (12-15 hours)
- **Batch 4 (Judge)**: 1-2 days (4-5 hours)
- **Batch 5 (Misc)**: 1-2 days (5-6 hours)
- **Testing & Cleanup**: 2-3 days (15 hours)

**Total Estimate**: 2-3 weeks full-time / 4-6 weeks part-time

---

## Branch Information

- **Base Branch**: `main`
- **Current Branch**: `main` (commits being added directly)
- **Last Commit**: feat: convert auth routes to Drizzle ORM (Phase 3 - Batch 1)

Recommendation: Consider creating a feature branch for ongoing route conversions, then merge to main once batches are tested.
