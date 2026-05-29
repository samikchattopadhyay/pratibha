import { db } from "./drizzle";
import { eq, and } from "drizzle-orm";
import * as schema from "./schema";

// ─── USER QUERIES ────────────────────────────────────────────────────────────

export async function getUserById(id: string) {
  return db.query.users.findFirst({
    where: eq(schema.users.id, id),
  });
}

export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });
}

export async function getUserByFacebookId(facebookId: string) {
  return db.query.users.findFirst({
    where: eq(schema.users.facebookId, facebookId),
  });
}

export async function createUser(data: typeof schema.users.$inferInsert) {
  return db.insert(schema.users).values(data).returning();
}

export async function updateUser(
  id: string,
  data: Partial<typeof schema.users.$inferInsert>
) {
  return db
    .update(schema.users)
    .set(data)
    .where(eq(schema.users.id, id))
    .returning();
}

// ─── PARENT QUERIES ──────────────────────────────────────────────────────────

export async function getParentByUserId(userId: string) {
  return db.query.parents.findFirst({
    where: eq(schema.parents.userId, userId),
  });
}

export async function getParentByPhone(phone: string) {
  return db.query.parents.findFirst({
    where: eq(schema.parents.phone, phone),
  });
}

export async function createParent(data: typeof schema.parents.$inferInsert) {
  return db.insert(schema.parents).values(data).returning();
}

export async function updateParent(
  id: string,
  data: Partial<typeof schema.parents.$inferInsert>
) {
  return db
    .update(schema.parents)
    .set(data)
    .where(eq(schema.parents.id, id))
    .returning();
}

// ─── STUDENT QUERIES ─────────────────────────────────────────────────────────

export async function getStudentById(id: string) {
  return db.query.students.findFirst({
    where: eq(schema.students.id, id),
  });
}

export async function getStudentsByParentId(parentId: string) {
  return db.query.students.findMany({
    where: eq(schema.students.parentId, parentId),
  });
}

export async function createStudent(data: typeof schema.students.$inferInsert) {
  return db.insert(schema.students).values(data).returning();
}

export async function updateStudent(
  id: string,
  data: Partial<typeof schema.students.$inferInsert>
) {
  return db
    .update(schema.students)
    .set(data)
    .where(eq(schema.students.id, id))
    .returning();
}

// ─── JUDGE QUERIES ───────────────────────────────────────────────────────────

export async function getJudgeByUserId(userId: string) {
  return db.query.judges.findFirst({
    where: eq(schema.judges.userId, userId),
  });
}

export async function getJudgeById(id: string) {
  return db.query.judges.findFirst({
    where: eq(schema.judges.id, id),
  });
}

export async function getJudges(limit?: number, offset?: number) {
  return db.query.judges.findMany({
    limit,
    offset,
  });
}

export async function createJudge(data: typeof schema.judges.$inferInsert) {
  return db.insert(schema.judges).values(data).returning();
}

export async function updateJudge(
  id: string,
  data: Partial<typeof schema.judges.$inferInsert>
) {
  return db
    .update(schema.judges)
    .set(data)
    .where(eq(schema.judges.id, id))
    .returning();
}

// ─── REGISTRATION QUERIES ────────────────────────────────────────────────────

export async function getRegistrationById(id: string) {
  return db.query.registrations.findFirst({
    where: eq(schema.registrations.id, id),
  });
}

export async function getRegistrationsByStudentId(studentId: string) {
  return db.query.registrations.findMany({
    where: eq(schema.registrations.studentId, studentId),
  });
}

export async function createRegistration(
  data: typeof schema.registrations.$inferInsert
) {
  return db.insert(schema.registrations).values(data).returning();
}

export async function updateRegistration(
  id: string,
  data: Partial<typeof schema.registrations.$inferInsert>
) {
  return db
    .update(schema.registrations)
    .set(data)
    .where(eq(schema.registrations.id, id))
    .returning();
}

// ─── COMPETITION QUERIES ──────────────────────────────────────────────────────

export async function getCompetitionById(id: string) {
  return db.query.competitions.findFirst({
    where: eq(schema.competitions.id, id),
  });
}

export async function getCompetitions(limit?: number, offset?: number) {
  return db.query.competitions.findMany({
    limit,
    offset,
  });
}

export async function createCompetition(
  data: typeof schema.competitions.$inferInsert
) {
  return db.insert(schema.competitions).values(data).returning();
}

export async function updateCompetition(
  id: string,
  data: Partial<typeof schema.competitions.$inferInsert>
) {
  return db
    .update(schema.competitions)
    .set(data)
    .where(eq(schema.competitions.id, id))
    .returning();
}

// ─── NOTIFICATION QUERIES ────────────────────────────────────────────────────

export async function getNotificationsByUserId(userId: string) {
  return db.query.notifications.findMany({
    where: eq(schema.notifications.userId, userId),
    orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
  });
}

export async function createNotification(
  data: typeof schema.notifications.$inferInsert
) {
  return db.insert(schema.notifications).values(data).returning();
}

export async function updateNotification(
  id: string,
  data: Partial<typeof schema.notifications.$inferInsert>
) {
  return db
    .update(schema.notifications)
    .set(data)
    .where(eq(schema.notifications.id, id))
    .returning();
}

// ─── TOKEN QUERIES ───────────────────────────────────────────────────────────

export async function getPasswordSetupTokenByToken(token: string) {
  return db.query.passwordSetupTokens.findFirst({
    where: eq(schema.passwordSetupTokens.token, token),
  });
}

export async function getPasswordResetTokenByToken(token: string) {
  return db.query.passwordResetTokens.findFirst({
    where: eq(schema.passwordResetTokens.token, token),
  });
}

export async function getEmailVerificationTokenByToken(token: string) {
  return db.query.emailVerificationTokens.findFirst({
    where: eq(schema.emailVerificationTokens.token, token),
  });
}

export async function getProfileSetupTokenByToken(token: string) {
  return db.query.profileSetupTokens.findFirst({
    where: eq(schema.profileSetupTokens.token, token),
  });
}

export async function createPasswordSetupToken(
  data: typeof schema.passwordSetupTokens.$inferInsert
) {
  return db.insert(schema.passwordSetupTokens).values(data).returning();
}

export async function createPasswordResetToken(
  data: typeof schema.passwordResetTokens.$inferInsert
) {
  return db.insert(schema.passwordResetTokens).values(data).returning();
}

export async function createEmailVerificationToken(
  data: typeof schema.emailVerificationTokens.$inferInsert
) {
  return db.insert(schema.emailVerificationTokens).values(data).returning();
}

export async function createProfileSetupToken(
  data: typeof schema.profileSetupTokens.$inferInsert
) {
  return db.insert(schema.profileSetupTokens).values(data).returning();
}

export async function updatePasswordSetupToken(
  id: string,
  data: Partial<typeof schema.passwordSetupTokens.$inferInsert>
) {
  return db
    .update(schema.passwordSetupTokens)
    .set(data)
    .where(eq(schema.passwordSetupTokens.id, id))
    .returning();
}

export async function updateProfileSetupToken(
  id: string,
  data: Partial<typeof schema.profileSetupTokens.$inferInsert>
) {
  return db
    .update(schema.profileSetupTokens)
    .set(data)
    .where(eq(schema.profileSetupTokens.id, id))
    .returning();
}

export async function deletePasswordSetupToken(id: string) {
  return db
    .delete(schema.passwordSetupTokens)
    .where(eq(schema.passwordSetupTokens.id, id));
}

export async function deletePasswordResetToken(id: string) {
  return db
    .delete(schema.passwordResetTokens)
    .where(eq(schema.passwordResetTokens.id, id));
}

export async function deleteEmailVerificationToken(id: string) {
  return db
    .delete(schema.emailVerificationTokens)
    .where(eq(schema.emailVerificationTokens.id, id));
}

export async function deleteProfileSetupToken(id: string) {
  return db
    .delete(schema.profileSetupTokens)
    .where(eq(schema.profileSetupTokens.id, id));
}

// ─── CERTIFICATE QUERIES ─────────────────────────────────────────────────────

export async function getCertificateByRegistrationId(registrationId: string) {
  return db.query.certificates.findFirst({
    where: eq(schema.certificates.registrationId, registrationId),
  });
}

export async function createCertificate(
  data: typeof schema.certificates.$inferInsert
) {
  return db.insert(schema.certificates).values(data).returning();
}

export async function updateCertificate(
  id: string,
  data: Partial<typeof schema.certificates.$inferInsert>
) {
  return db
    .update(schema.certificates)
    .set(data)
    .where(eq(schema.certificates.id, id))
    .returning();
}

// ─── SCORE QUERIES ───────────────────────────────────────────────────────────

export async function getScoreByJudgeAssignmentId(judgeAssignmentId: string) {
  return db.query.scores.findFirst({
    where: eq(schema.scores.judgeAssignmentId, judgeAssignmentId),
  });
}

export async function createScore(data: typeof schema.scores.$inferInsert) {
  return db.insert(schema.scores).values(data).returning();
}

export async function updateScore(
  id: string,
  data: Partial<typeof schema.scores.$inferInsert>
) {
  return db
    .update(schema.scores)
    .set(data)
    .where(eq(schema.scores.id, id))
    .returning();
}

// ─── JUDGE ASSIGNMENT QUERIES ────────────────────────────────────────────────

export async function getJudgeAssignmentById(id: string) {
  return db.query.judgeAssignments.findFirst({
    where: eq(schema.judgeAssignments.id, id),
  });
}

export async function getJudgeAssignmentsByRegistrationId(registrationId: string) {
  return db.query.judgeAssignments.findMany({
    where: eq(schema.judgeAssignments.registrationId, registrationId),
  });
}

export async function getJudgeAssignmentsByJudgeId(judgeId: string) {
  return db.query.judgeAssignments.findMany({
    where: eq(schema.judgeAssignments.judgeId, judgeId),
  });
}

export async function createJudgeAssignment(
  data: typeof schema.judgeAssignments.$inferInsert
) {
  return db.insert(schema.judgeAssignments).values(data).returning();
}

export async function updateJudgeAssignment(
  id: string,
  data: Partial<typeof schema.judgeAssignments.$inferInsert>
) {
  return db
    .update(schema.judgeAssignments)
    .set(data)
    .where(eq(schema.judgeAssignments.id, id))
    .returning();
}

// ─── PRIZE AWARD QUERIES ──────────────────────────────────────────────────────

export async function getPrizeAwardByRegistrationId(registrationId: string) {
  return db.query.prizeAwards.findFirst({
    where: eq(schema.prizeAwards.registrationId, registrationId),
  });
}

export async function createPrizeAward(
  data: typeof schema.prizeAwards.$inferInsert
) {
  return db.insert(schema.prizeAwards).values(data).returning();
}

export async function updatePrizeAward(
  id: string,
  data: Partial<typeof schema.prizeAwards.$inferInsert>
) {
  return db
    .update(schema.prizeAwards)
    .set(data)
    .where(eq(schema.prizeAwards.id, id))
    .returning();
}

// ─── UTILITY: Count Relations ─────────────────────────────────────────────────

export async function countJudgeAssignments(judgeId: string) {
  const result = await db
    .select({ count: schema.judgeAssignments.id })
    .from(schema.judgeAssignments)
    .where(eq(schema.judgeAssignments.judgeId, judgeId));
  return result.length > 0 ? result[0] : { count: "0" };
}

export async function countStudentsByParentId(parentId: string) {
  const result = await db
    .select({ count: schema.students.id })
    .from(schema.students)
    .where(eq(schema.students.parentId, parentId));
  return result.length > 0 ? result[0] : { count: "0" };
}

export async function countRegistrationsByStudentId(studentId: string) {
  const result = await db
    .select({ count: schema.registrations.id })
    .from(schema.registrations)
    .where(eq(schema.registrations.studentId, studentId));
  return result.length > 0 ? result[0] : { count: "0" };
}
