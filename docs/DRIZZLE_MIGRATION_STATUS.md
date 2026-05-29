# Drizzle ORM Migration Status

**Started:** 2026-05-29  
**Current Phase:** Phase 3 - API Route Conversion (Batch 1 - ✅ COMPLETE)  
**Overall Progress:** ~30% Complete (Schema + All Auth Routes Complete)

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

✅ **Auth Routes Converted** (15/15) - BATCH 1 COMPLETE
- `POST /api/auth/register` - Create user + parent with transaction
- `POST/GET /api/auth/verify-email` - Email verification
- `POST/GET /api/auth/set-password` - Password setup  
- `POST /api/auth/forgot-password` - Password reset request
- `POST/GET /api/auth/reset-password` - Password reset with token
- `POST /api/auth/resend-verification` - Email verification retry
- `POST /api/auth/setup/add-phone` - Save phone number validation
- `POST /api/auth/setup/save-address` - Parent address info
- `POST /api/auth/setup/set-password` - Password hashing
- `POST /api/auth/setup/verify-email` - Email verification complete
- `POST /api/auth/setup/resend-verification-email` - Resend token
- `POST /api/auth/setup/confirm-phone-otp` - OTP verification
- `POST /api/auth/setup/verify-phone` - Send OTP to phone
- `POST /api/auth/facebook/create-user` - Uses auto-converted helper
- `[...nextauth]/route` - Configuration file (no changes needed)

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

### Batch 1: Auth Routes (15 total, 15 done)
**Status:** ✅ COMPLETE  
**Remaining:** 0 routes

- [x] `/api/auth/forgot-password` - POST
- [x] `/api/auth/reset-password` - POST
- [x] `/api/auth/resend-verification` - POST
- [x] `/api/auth/facebook/create-user` - POST (uses helper lib, auto-converted)
- [x] `/api/auth/setup/verify-email` - POST
- [x] `/api/auth/setup/add-phone` - POST
- [x] `/api/auth/setup/confirm-phone-otp` - POST
- [x] `/api/auth/setup/save-address` - POST
- [x] `/api/auth/setup/set-password` - POST
- [x] `/api/auth/setup/resend-verification-email` - POST
- [x] `/api/auth/setup/verify-phone` - POST
- [x] `[...nextauth]/route` - NextAuth config (configuration, no changes needed)

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

1. **Batch 2 (Account Routes)** ⏳ Pending
   - Dashboard queries require pagination + filtering
   - May need additional query utilities
   - Estimated: 8-10 hours

2. **Batch 3 (Admin Routes)** ⏳ Pending
   - Competition, judge, certificate, prize management
   - Complex filtering and pagination
   - Estimated: 12-15 hours

3. **Batch 4 (Judge Routes)** ⏳ Pending
   - Judge profile, assignments, scoring, analytics
   - Estimated: 4-5 hours

4. **Batch 5 (Misc Routes)** ⏳ Pending
   - Cron jobs, public endpoints, registrations, notifications
   - Estimated: 5-6 hours

5. **Testing & Verification** ⏳ Pending
   - Integration tests after each batch
   - Performance verification vs Prisma
   - End-to-end auth flow testing

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

- **Batch 1 (Auth)**: ✅ COMPLETE (15/15 routes)
- **Batch 2 (Account)**: 2-3 days (8-10 hours estimated)
- **Batch 3 (Admin)**: 3-4 days (12-15 hours estimated)
- **Batch 4 (Judge)**: 1-2 days (4-5 hours estimated)
- **Batch 5 (Misc)**: 1-2 days (5-6 hours estimated)
- **Testing & Cleanup**: 2-3 days (15 hours estimated)

**Total Remaining**: 10-14 days full-time / 3-4 weeks part-time  
**Overall Completion**: ~70% done with schema + auth; 30% remaining for accounts/admin/judge/misc

---

## Branch Information

- **Base Branch**: `main`
- **Current Branch**: `main` (commits being added directly)
- **Last Commit**: feat: convert auth routes to Drizzle ORM (Phase 3 - Batch 1)

Recommendation: Consider creating a feature branch for ongoing route conversions, then merge to main once batches are tested.
