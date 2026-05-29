import { db } from "./drizzle";
import { eq, and, isNull, gt, lt, desc, asc, sql, gte, inArray } from "drizzle-orm";
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

export async function getJudgeWithUserAndAssignments(id: string) {
  return db.query.judges.findFirst({
    where: eq(schema.judges.id, id),
    with: {
      user: true,
      assignments: {
        with: {
          score: true,
        },
      },
    },
  });
}

export async function getAllJudgesWithUserAndAssignments() {
  return db.query.judges.findMany({
    with: {
      user: true,
      assignments: {
        with: {
          score: true,
        },
      },
    },
    orderBy: (judges, { asc }) => [asc(judges.tier), asc(judges.name)],
  });
}

export async function getAllScores() {
  return db.query.scores.findMany({
    columns: { totalScore: true },
  });
}

// ─── QUALIFICATION QUERIES ────────────────────────────────────────────────────

export async function getAllQualificationRules() {
  return db.query.qualificationRules.findMany({
    with: {
      stateCompetition: {
        columns: { id: true, title: true, scope: true },
      },
      nationalCompetition: {
        columns: { id: true, title: true, scope: true, registrationDeadline: true },
      },
      slots: true,
    },
    orderBy: (rules, { desc }) => [desc(rules.createdAt)],
  });
}

export async function createQualificationRule(data: typeof schema.qualificationRules.$inferInsert) {
  return db.insert(schema.qualificationRules).values(data).returning();
}

// ─── CERTIFICATE QUERIES ──────────────────────────────────────────────────────

export async function getCertificateCount() {
  const result = await db
    .select({ count: schema.certificates.id })
    .from(schema.certificates);
  return result.length;
}

export async function getRegistrationsNeedingCertificates() {
  return db.query.registrations.findMany({
    where: and(
      eq(schema.registrations.status, "VERIFIED"),
      eq(schema.registrations.scoringFinalized, true)
    ),
    columns: { id: true, registrationId: true },
  });
}

export async function getRegistrationForCertificateNotification(registrationId: string) {
  return db.query.registrations.findFirst({
    where: eq(schema.registrations.id, registrationId),
    with: {
      student: true,
      competitionCategory: {
        with: {
          category: true,
        },
      },
    },
  });
}

export async function createCertificateBulk(data: (typeof schema.certificates.$inferInsert)[]) {
  return db.insert(schema.certificates).values(data).returning();
}

// ─── TRANSACTION QUERIES ──────────────────────────────────────────────────────

export async function getSuccessfulTransactions() {
  return db.query.transactions.findMany({
    where: eq(schema.transactions.status, "SUCCESS"),
    columns: { amount: true, createdAt: true },
  });
}

export async function getTransactionCount() {
  const result = await db
    .select({ count: schema.transactions.id })
    .from(schema.transactions);
  return result.length;
}

export async function getTransactionsPaginated(limit: number, offset: number) {
  return db.query.transactions.findMany({
    limit,
    offset,
    with: {
      registration: {
        with: {
          student: {
            with: {
              parent: true,
            },
          },
        },
      },
    },
    orderBy: (transactions, { desc }) => [desc(transactions.createdAt)],
  });
}

// ─── SOCIAL METRICS QUERIES ───────────────────────────────────────────────────

export async function getSocialMetricCount() {
  const result = await db
    .select({ count: schema.socialMetrics.id })
    .from(schema.socialMetrics);
  return result.length;
}

export async function getSocialMetricsPaginated(limit: number, offset: number) {
  return db.query.socialMetrics.findMany({
    limit,
    offset,
    with: {
      registration: {
        with: {
          student: true,
          competitionCategory: {
            with: {
              category: true,
            },
          },
        },
      },
    },
    orderBy: (metrics, { desc }) => [desc(metrics.calculatedEngagement)],
  });
}

// ─── JUDGE ASSIGNMENT QUERIES ──────────────────────────────────────────────────

export async function getJudgeAssignmentByRegistrationAndJudge(registrationId: string, judgeId: string) {
  return db.query.judgeAssignments.findFirst({
    where: and(
      eq(schema.judgeAssignments.registrationId, registrationId),
      eq(schema.judgeAssignments.judgeId, judgeId)
    ),
  });
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

export async function getCompetitionCount() {
  const result = await db
    .select({ count: schema.competitions.id })
    .from(schema.competitions);
  return result.length;
}

export async function getCompetitionsPaginated(limit: number, offset: number) {
  return db.query.competitions.findMany({
    limit,
    offset,
    with: {
      categories: {
        with: {
          category: true,
        },
      },
      prizePool: {
        with: {
          items: true,
        },
      },
      panelRequirement: true,
    },
    orderBy: (competitions, { desc }) => [desc(competitions.createdAt)],
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

export async function deleteUnusedPasswordResetTokensByUserId(userId: string) {
  return db
    .delete(schema.passwordResetTokens)
    .where(
      and(
        eq(schema.passwordResetTokens.userId, userId),
        isNull(schema.passwordResetTokens.usedAt)
      )
    );
}

export async function getPasswordResetTokenByTokenWithUser(token: string) {
  return db.query.passwordResetTokens.findFirst({
    where: eq(schema.passwordResetTokens.token, token),
    with: {
      user: true,
    },
  });
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

export async function countRegistrationsByCategoryId(competitionCategoryId: string) {
  const result = await db
    .select({ count: schema.registrations.id })
    .from(schema.registrations)
    .where(eq(schema.registrations.competitionCategoryId, competitionCategoryId));
  return result.length;
}

export async function getParentWithStudentsAndQualifications(userId: string) {
  return db.query.parents.findFirst({
    where: eq(schema.parents.userId, userId),
    with: {
      students: {
        with: {
          qualificationSlots: {
            with: {
              qualificationRule: {
                with: {
                  stateCompetition: {
                    columns: {
                      title: true,
                    },
                  },
                },
              },
              nationalCompetition: {
                columns: {
                  id: true,
                  title: true,
                  entryFeeINR: true,
                  registrationDeadline: true,
                },
              },
              registration: {
                columns: {
                  finalRank: true,
                  finalScore: true,
                  registrationId: true,
                },
              },
            },
            orderBy: (slots, { desc }) => [desc(slots.offeredAt)],
          },
        },
      },
    },
  });
}

export async function expireOverdueQualificationSlots(parentId: string) {
  const now = new Date();
  return db
    .update(schema.qualificationSlots)
    .set({ status: "EXPIRED" as any })
    .where(
      and(
        eq(schema.qualificationSlots.status, "OFFERED" as any),
        lt(schema.qualificationSlots.expiresAt, now)
      )
    );
}

// ─── EXTERNAL ACHIEVEMENT QUERIES ────────────────────────────────────────

export async function getExternalAchievementById(id: string) {
  return db.query.externalAchievements.findFirst({
    where: eq(schema.externalAchievements.id, id),
  });
}

export async function createExternalAchievement(data: typeof schema.externalAchievements.$inferInsert) {
  return db.insert(schema.externalAchievements).values(data).returning();
}

export async function updateExternalAchievement(
  id: string,
  data: Partial<typeof schema.externalAchievements.$inferInsert>
) {
  return db
    .update(schema.externalAchievements)
    .set(data)
    .where(eq(schema.externalAchievements.id, id))
    .returning();
}

export async function deleteExternalAchievement(id: string) {
  return db
    .delete(schema.externalAchievements)
    .where(eq(schema.externalAchievements.id, id));
}

export async function getStudentWithParentUser(studentId: string) {
  return db.query.students.findFirst({
    where: eq(schema.students.id, studentId),
    columns: {
      id: true,
      parentId: true,
    },
    with: {
      parent: {
        columns: {
          userId: true,
        },
      },
    },
  });
}

export async function getVerifiedRegistrationsByStudentId(studentId: string) {
  return db.query.registrations.findMany({
    where: and(
      eq(schema.registrations.studentId, studentId),
      eq(schema.registrations.status, "VERIFIED" as any)
    ),
    columns: {
      id: true,
      isFeatured: true,
      isHidden: true,
      createdAt: true,
    },
    with: {
      competitionCategory: {
        columns: {},
        with: {
          competition: {
            columns: {
              title: true,
              startDate: true,
            },
          },
          category: {
            columns: {
              name: true,
            },
          },
        },
      },
      prizeAward: {
        columns: {
          rank: true,
        },
      },
    },
    orderBy: (registrations, { desc }) => [desc(registrations.createdAt)],
  });
}

export async function getUserForAdminProfile(userId: string) {
  return db.query.users.findFirst({
    where: eq(schema.users.id, userId),
    columns: {
      email: true,
      role: true,
      profileImageUrl: true,
      passwordHash: true,
    },
  });
}

// ─── SYSTEM SETTINGS QUERIES ─────────────────────────────────────────

export async function getSystemSettingByKey(key: string) {
  return db.query.systemSettings.findFirst({
    where: eq(schema.systemSettings.key, key),
  });
}

export async function upsertSystemSetting(key: string, value: any) {
  const existing = await getSystemSettingByKey(key);
  if (existing) {
    return db
      .update(schema.systemSettings)
      .set({ value })
      .where(eq(schema.systemSettings.key, key))
      .returning();
  } else {
    return db.insert(schema.systemSettings).values({ key, value }).returning();
  }
}

// ─── CATEGORY QUERIES ────────────────────────────────────────────────

export async function getAllCategories() {
  return db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.name)],
  });
}

export async function getCategoryByNameOrSlug(name: string, slug: string) {
  return db.query.categories.findFirst({
    where: (categories, { eq, or }) => or(
      eq(categories.name, name),
      eq(categories.slug, slug)
    ),
  });
}

export async function getCategoryById(id: string) {
  return db.query.categories.findFirst({
    where: eq(schema.categories.id, id),
  });
}

export async function createCategory(data: typeof schema.categories.$inferInsert) {
  return db.insert(schema.categories).values(data).returning();
}

export async function updateCategory(
  id: string,
  data: Partial<typeof schema.categories.$inferInsert>
) {
  return db
    .update(schema.categories)
    .set(data)
    .where(eq(schema.categories.id, id))
    .returning();
}

export async function deleteCategory(id: string) {
  return db.delete(schema.categories).where(eq(schema.categories.id, id));
}

export async function countCompetitionCategoriesForCategory(categoryId: string) {
  const result = await db
    .select({ count: schema.competitionCategories.id })
    .from(schema.competitionCategories)
    .where(eq(schema.competitionCategories.categoryId, categoryId));
  return result.length;
}

// ─── ADDITIONAL HELPERS ───────────────────────────────────────────────────

export async function getEmailVerificationTokenByTokenWithUser(token: string) {
  return db.query.emailVerificationTokens.findFirst({
    where: eq(schema.emailVerificationTokens.token, token),
    with: { user: true },
  });
}

// ─── ADDITIONAL ACCOUNT QUERIES ───────────────────────────────────────────

export async function getStudentBySlug(slug: string) {
  return db.query.students.findFirst({
    where: eq(schema.students.slug, slug),
  });
}

export async function getStudentByIdWithAchievements(studentId: string) {
  return db.query.students.findFirst({
    where: eq(schema.students.id, studentId),
    with: {
      externalAchievements: true,
    },
  });
}

export async function getRegistrationWithRelations(registrationId: string) {
  return db.query.registrations.findFirst({
    where: eq(schema.registrations.id, registrationId),
    with: {
      competitionCategory: {
        with: {
          competition: true,
          category: true,
        },
      },
      certificate: true,
    },
  });
}

export async function getRegistrationsByStudentIdWithDetails(studentId: string) {
  return db.query.registrations.findMany({
    where: eq(schema.registrations.studentId, studentId),
    with: {
      competitionCategory: {
        with: {
          competition: true,
          category: true,
        },
      },
      certificate: true,
    },
  });
}

export async function getParentWithStudentsAndRegistrations(userId: string) {
  return db.query.parents.findFirst({
    where: eq(schema.parents.userId, userId),
    with: {
      students: {
        with: {
          registrations: {
            with: {
              competitionCategory: {
                with: {
                  competition: true,
                  category: true,
                },
              },
              certificate: true,
            },
          },
        },
      },
    },
  });
}

export async function getParentWithUserEmail(userId: string) {
  return db.query.parents.findFirst({
    where: eq(schema.parents.userId, userId),
    with: {
      user: {
        columns: {
          email: true,
        },
      },
    },
  });
}

export async function getUnusedProfileSetupToken(userId: string) {
  return db.query.profileSetupTokens.findFirst({
    where: and(
      eq(schema.profileSetupTokens.userId, userId),
      isNull(schema.profileSetupTokens.usedAt),
      gt(schema.profileSetupTokens.expiresAt, new Date())
    ),
    orderBy: (tokens, { desc }) => [desc(tokens.createdAt)],
  });
}

export async function getRegistrationWithFullDetails(registrationId: string) {
  return db.query.registrations.findFirst({
    where: eq(schema.registrations.id, registrationId),
    with: {
      student: true,
      competitionCategory: {
        with: {
          competition: true,
          category: true,
        },
      },
      judgeAssignments: {
        with: {
          judge: true,
          score: true,
        },
        orderBy: (assignments, { asc }) => [asc(assignments.assignedAt)],
      },
      certificate: true,
      prizeAward: {
        with: {
          prizeItem: true,
          physicalOrder: true,
        },
      },
    },
  });
}

export async function getParentWithStudentsAndPrizes(userId: string) {
  return db.query.parents.findFirst({
    where: eq(schema.parents.userId, userId),
    with: {
      students: {
        with: {
          registrations: {
            with: {
              competitionCategory: {
                with: {
                  competition: {
                    columns: {
                      title: true,
                      scope: true,
                    },
                  },
                },
              },
              prizeAward: {
                with: {
                  prizeItem: {
                    columns: {
                      title: true,
                      type: true,
                      isPhysical: true,
                    },
                  },
                  certificate: {
                    columns: {
                      certificateId: true,
                      certificateUrl: true,
                    },
                  },
                  physicalOrder: {
                    columns: {
                      status: true,
                      awbNumber: true,
                      courierName: true,
                      estimatedDelivery: true,
                      dispatchedAt: true,
                      deliveredAt: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function getActiveBannerTemplates() {
  return db.query.bannerTemplates.findMany({
    where: eq(schema.bannerTemplates.isActive, true),
    orderBy: (templates, { asc }) => [asc(templates.name)],
  });
}

export async function getBannerTemplateBySlug(slug: string) {
  return db.query.bannerTemplates.findFirst({
    where: eq(schema.bannerTemplates.slug, slug),
  });
}

export async function createBannerTemplate(data: {
  name: string;
  slug: string;
  imageUrl: string;
  description?: string | null;
  tags?: string[];
  isActive: boolean;
}) {
  return db.insert(schema.bannerTemplates).values(data).returning();
}

export async function getActiveCompetitionsCount() {
  const result = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(schema.competitions)
    .where(eq(schema.competitions.isActive, true));
  return result[0]?.count ?? 0;
}

export async function getPendingJudgingCount() {
  const result = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(schema.judgeAssignments)
    .where(eq(schema.judgeAssignments.isSubmitted, false));
  return result[0]?.count ?? 0;
}

export async function getRegistrationsPostedTodayCount() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const result = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(schema.registrations)
    .where(gte(schema.registrations.createdAt, startOfToday));
  return result[0]?.count ?? 0;
}

export async function getPendingPaymentsCount() {
  const result = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(schema.registrations)
    .where(eq(schema.registrations.paymentStatus, "PENDING"));
  return result[0]?.count ?? 0;
}

export async function getCertificatesCount() {
  const result = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(schema.certificates);
  return result[0]?.count ?? 0;
}

export async function getCourierPendingCount() {
  const result = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(schema.registrations)
    .leftJoin(schema.certificates, eq(schema.registrations.id, schema.certificates.registrationId))
    .where(
      and(
        eq(schema.registrations.scoringFinalized, true),
        isNull(schema.certificates.id)
      )
    );
  return result[0]?.count ?? 0;
}

export async function getSuccessfulTransactionsLast7Days() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  return db
    .select({
      amount: schema.transactions.amount,
      createdAt: schema.transactions.createdAt,
    })
    .from(schema.transactions)
    .where(
      and(
        eq(schema.transactions.status, "SUCCESS"),
        gte(schema.transactions.createdAt, sevenDaysAgo)
      )
    );
}

export async function getEndedCompetitions(limit: number = 3) {
  return db
    .select({ title: schema.competitions.title })
    .from(schema.competitions)
    .where(lt(schema.competitions.endDate, new Date()))
    .limit(limit);
}

export async function getParentsByState() {
  const result = await db
    .select({
      state: schema.parents.state,
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(schema.parents)
    .groupBy(schema.parents.state)
    .orderBy((fields) => desc(fields.count))
    .limit(4);
  return result;
}

export async function getPendingAssignmentsByJudge() {
  const result = await db
    .select({
      judgeId: schema.judgeAssignments.judgeId,
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(schema.judgeAssignments)
    .where(eq(schema.judgeAssignments.isSubmitted, false))
    .groupBy(schema.judgeAssignments.judgeId);
  return result;
}

export async function getJudgesByIds(judgeIds: string[]) {
  return db
    .select({
      id: schema.judges.id,
      name: schema.judges.name,
    })
    .from(schema.judges)
    .where(inArray(schema.judges.id, judgeIds));
}

export async function getRegistrationsForAdminList(params: {
  limit: number;
  offset: number;
  search?: string;
  filter?: "ALL" | "PENDING" | "PAID" | "UNASSIGNED";
}) {
  const { limit, offset, search, filter } = params;

  let registrations = await db.query.registrations.findMany({
    with: {
      student: {
        with: {
          parent: true,
        },
      },
      competitionCategory: {
        with: {
          competition: true,
          category: true,
        },
      },
      judgeAssignments: {
        with: {
          judge: true,
          score: true,
        },
      },
    },
    orderBy: (reg, { desc }) => [desc(reg.createdAt)],
  });

  let filtered = registrations;

  if (filter === "PENDING") {
    filtered = filtered.filter((r) => r.status === "PENDING_VERIFICATION");
  } else if (filter === "PAID") {
    filtered = filtered.filter((r) => r.paymentStatus === "SUCCESS");
  } else if (filter === "UNASSIGNED") {
    filtered = filtered.filter((r) => r.judgeAssignments.length === 0);
  }

  if (search?.trim()) {
    const searchPattern = search.trim().toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.registrationId.toLowerCase().includes(searchPattern) ||
        r.student.name.toLowerCase().includes(searchPattern) ||
        (r.student.parent.phone?.toLowerCase() ?? "").includes(searchPattern) ||
        r.competitionCategory.category.name.toLowerCase().includes(searchPattern) ||
        r.judgeAssignments.some((a) =>
          a.judge.name.toLowerCase().includes(searchPattern)
        )
    );
  }

  const totalCount = filtered.length;
  const paginatedRegistrations = filtered.slice(offset, offset + limit);

  return { registrations: paginatedRegistrations, totalCount };
}

export async function getRegistrationCountsForMetrics() {
  const totalCount = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(schema.registrations);

  const pendingCount = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(schema.registrations)
    .where(eq(schema.registrations.status, "PENDING_VERIFICATION"));

  const paidCount = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(schema.registrations)
    .where(eq(schema.registrations.paymentStatus, "SUCCESS"));

  const unassignedCount = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(schema.registrations)
    .leftJoin(
      schema.judgeAssignments,
      eq(schema.registrations.id, schema.judgeAssignments.registrationId)
    )
    .where(isNull(schema.judgeAssignments.id));

  return {
    total: totalCount[0]?.count ?? 0,
    pending: pendingCount[0]?.count ?? 0,
    paid: paidCount[0]?.count ?? 0,
    unassigned: unassignedCount[0]?.count ?? 0,
  };
}

export async function getRegistrationWithDetailsForNotification(registrationId: string) {
  return db.query.registrations.findFirst({
    where: eq(schema.registrations.id, registrationId),
    with: {
      student: true,
      competitionCategory: {
        with: {
          category: true,
        },
      },
    },
  });
}

export async function getParentByStudentId(studentId: string) {
  return db.query.parents.findFirst({
    with: {
      user: true,
    },
  });
}

export async function getPhysicalPrizeOrderStatusCounts() {
  return db
    .select({
      status: schema.physicalPrizeOrders.status,
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(schema.physicalPrizeOrders)
    .groupBy(schema.physicalPrizeOrders.status);
}

export async function getRecentShipmentBatches(limit: number = 10) {
  return db.query.shipmentBatches.findMany({
    orderBy: (batches, { desc }) => [desc(batches.createdAt)],
    limit,
  });
}

export async function getRecentPhysicalPrizeOrders(limit: number = 50) {
  return db.query.physicalPrizeOrders.findMany({
    with: {
      prizeAward: {
        with: {
          registration: {
            with: {
              student: {
                columns: {
                  name: true,
                },
              },
            },
          },
          prizeItem: {
            columns: {
              title: true,
            },
          },
        },
      },
    },
    orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    limit,
  });
}

export async function getPhysicalPrizeAwardsForCompetition(competitionId: string) {
  const allAwards = await db.query.prizeAwards.findMany({
    with: {
      prizeItem: true,
      physicalOrder: true,
      registration: {
        with: {
          competitionCategory: {
            with: {
              competition: true,
            },
          },
          student: {
            with: {
              parent: true,
            },
          },
        },
      },
    },
  });

  return allAwards.filter(
    (award) =>
      award.prizeItem.isPhysical &&
      !award.physicalOrder &&
      award.registration.competitionCategory.competition.id === competitionId
  );
}

export async function createPhysicalPrizeOrders(orders: Array<{
  prizeAwardId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientCity: string;
  recipientState: string;
  recipientPostalCode: string;
  recipientCountry: string;
  packageSKU: string;
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  status: string;
}>) {
  return db.insert(schema.physicalPrizeOrders).values(orders as any);
}

export async function getJudgePayoutsPaginated(judgeId: string, limit: number, offset: number) {
  const [payouts, total] = await Promise.all([
    db
      .select({
        id: schema.judgePayouts.id,
        amount: schema.judgePayouts.amount,
        status: schema.judgePayouts.status,
        transactionRef: schema.judgePayouts.transactionRef,
        createdAt: schema.judgePayouts.createdAt,
        paymentDate: schema.judgePayouts.paymentDate,
      })
      .from(schema.judgePayouts)
      .where(eq(schema.judgePayouts.judgeId, judgeId))
      .orderBy(desc(schema.judgePayouts.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(schema.judgePayouts)
      .where(eq(schema.judgePayouts.judgeId, judgeId)),
  ]);

  return {
    payouts: payouts.map((p) => ({
      id: p.id,
      amount: parseFloat(p.amount.toString()),
      status: (p.status.toLowerCase()) as "pending" | "completed" | "failed",
      invoiceNumber: p.transactionRef || p.id.substring(0, 8),
      createdAt: p.createdAt.toISOString(),
      completedAt: p.paymentDate?.toISOString() ?? null,
    })),
    total: total[0]?.count ?? 0,
  };
}

export async function getJudgeRevenueMetadata(judgeId: string) {
  const [payouts, judge] = await Promise.all([
    db
      .select({
        amount: schema.judgePayouts.amount,
        status: schema.judgePayouts.status,
      })
      .from(schema.judgePayouts)
      .where(eq(schema.judgePayouts.judgeId, judgeId)),
    db.query.judges.findFirst({
      where: eq(schema.judges.id, judgeId),
      columns: {
        paymentPerEvaluation: true,
      },
    }),
  ]);

  if (!judge) {
    return null;
  }

  const totalEarned = payouts
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

  const totalPending = payouts
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

  const perEvaluationRate = judge.paymentPerEvaluation ? parseFloat(judge.paymentPerEvaluation.toString()) : 150;
  const hourlyRate = perEvaluationRate * 4;

  const lastPayout = await db
    .select({
      paymentDate: schema.judgePayouts.paymentDate,
    })
    .from(schema.judgePayouts)
    .where(and(eq(schema.judgePayouts.judgeId, judgeId), eq(schema.judgePayouts.status, "PAID")))
    .orderBy(desc(schema.judgePayouts.paymentDate))
    .limit(1);

  return {
    totalEarned,
    totalPending,
    hourlyRate,
    perEvaluationRate,
    lastPaymentDate: lastPayout[0]?.paymentDate?.toISOString() ?? null,
  };
}

export async function getJudgeSettings(judgeId: string) {
  return db.query.judges.findFirst({
    where: eq(schema.judges.id, judgeId),
    columns: {
      id: true,
      paymentPerEvaluation: true,
      revenueShareLOCAL: true,
      revenueShareREGIONAL: true,
      revenueShareNATIONAL: true,
      revenueShareEXPERT: true,
      specializations: true,
    },
  });
}

export async function updateJudgeSettings(judgeId: string, data: {
  specializations?: string[];
  paymentPerEvaluation?: string;
  revenueShareLOCAL?: string | null;
  revenueShareREGIONAL?: string | null;
  revenueShareNATIONAL?: string | null;
  revenueShareEXPERT?: string | null;
}) {
  const updateData: any = {};

  if (data.specializations !== undefined) {
    updateData.specializations = data.specializations;
  }
  if (data.paymentPerEvaluation !== undefined) {
    updateData.paymentPerEvaluation = data.paymentPerEvaluation;
  }
  if (data.revenueShareLOCAL !== undefined) {
    updateData.revenueShareLOCAL = data.revenueShareLOCAL;
  }
  if (data.revenueShareREGIONAL !== undefined) {
    updateData.revenueShareREGIONAL = data.revenueShareREGIONAL;
  }
  if (data.revenueShareNATIONAL !== undefined) {
    updateData.revenueShareNATIONAL = data.revenueShareNATIONAL;
  }
  if (data.revenueShareEXPERT !== undefined) {
    updateData.revenueShareEXPERT = data.revenueShareEXPERT;
  }

  return db
    .update(schema.judges)
    .set(updateData)
    .where(eq(schema.judges.id, judgeId))
    .returning();
}

export async function getCompetitionPanelData(competitionId: string) {
  return db.query.competitions.findFirst({
    where: eq(schema.competitions.id, competitionId),
    with: {
      categories: {
        with: {
          registrations: {
            with: {
              judgeAssignments: {
                with: {
                  judge: {
                    columns: {
                      id: true,
                      name: true,
                      tier: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function getCompetitionParticipantsPaginated(params: {
  competitionId: string;
  limit: number;
  offset: number;
  filter?: string;
  search?: string;
}) {
  const { competitionId, limit, offset, filter, search } = params;

  let registrations = await db.query.registrations.findMany({
    where: (reg, { eq: eqOp }) =>
      eqOp(schema.competitionCategories.competitionId, competitionId),
    with: {
      student: {
        columns: {
          name: true,
        },
      },
      competitionCategory: {
        with: {
          category: {
            columns: {
              name: true,
            },
          },
        },
      },
      judgeAssignments: {
        with: {
          judge: {
            columns: {
              id: true,
              name: true,
            },
          },
          score: {
            columns: {
              totalScore: true,
            },
          },
        },
      },
    },
  });

  registrations = registrations.filter(
    (r) => r.competitionCategory.competitionId === competitionId
  );

  if (filter && filter !== "ALL") {
    registrations = registrations.filter((r) => r.status === filter);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    registrations = registrations.filter(
      (r) =>
        r.registrationId.toLowerCase().includes(searchLower) ||
        r.student.name.toLowerCase().includes(searchLower)
    );
  }

  const totalCount = registrations.length;
  const paginatedRegistrations = registrations
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(offset, offset + limit);

  return { registrations: paginatedRegistrations, totalCount };
}

export async function getStudentsForAdminList(params: {
  limit: number;
  offset: number;
  search?: string;
  filter?: "ALL" | "HAS_AWARDS" | "PENDING_PAYMENT";
}) {
  const { limit, offset, search, filter } = params;

  const students = await db.query.students.findMany({
    with: {
      parent: {
        columns: {
          id: true,
          name: true,
          phone: true,
        },
      },
      registrations: {
        with: {
          prizeAward: true,
        },
        orderBy: (reg, { desc }) => [desc(reg.createdAt)],
      },
    },
    orderBy: (s, { desc }) => [desc(s.createdAt)],
  });

  let filtered = students;

  if (search?.trim()) {
    const searchPattern = search.trim().toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(searchPattern) ||
        s.parent.name.toLowerCase().includes(searchPattern) ||
        (s.parent.phone?.toLowerCase() ?? "").includes(searchPattern)
    );
  }

  if (filter === "HAS_AWARDS") {
    filtered = filtered.filter((s) =>
      s.registrations.some((reg) => reg.prizeAward)
    );
  } else if (filter === "PENDING_PAYMENT") {
    filtered = filtered.filter((s) =>
      s.registrations.some((reg) => reg.paymentStatus === "PENDING")
    );
  }

  const totalCount = filtered.length;
  const paginatedStudents = filtered.slice(offset, offset + limit);

  return { students: paginatedStudents, totalCount };
}

export async function getAllPrizePools() {
  return db.query.prizePools.findMany({
    with: {
      competition: {
        columns: {
          id: true,
          title: true,
          scope: true,
        },
      },
      items: {
        with: {
          awards: {
            columns: {
              id: true,
              registrationId: true,
              rank: true,
              isDispatched: true,
            },
          },
        },
        orderBy: (items, { asc }) => [asc(items.createdAt)],
      },
    },
    orderBy: (pools, { desc }) => [desc(pools.createdAt)],
  });
}

export async function getPrizePoolByCompetitionId(competitionId: string) {
  return db.query.prizePools.findFirst({
    where: eq(schema.prizePools.competitionId, competitionId),
  });
}

export async function createPrizePoolWithItems(data: {
  competitionId: string;
  title: string;
  description?: string | null;
  isPublished: boolean;
  items: Array<{
    rank: string;
    type: any;
    title: string;
    description?: string | null;
    estimatedValue?: string | null;
    isPhysical: boolean;
    imageUrl?: string | null;
    perCategory: boolean;
  }>;
}) {
  const { competitionId, title, description, isPublished, items } = data;

  return db.transaction(async (tx) => {
    const prizePool = await tx
      .insert(schema.prizePools)
      .values({
        competitionId,
        title,
        description,
        isPublished,
      })
      .returning();

    if (items.length > 0) {
      const prizeItemValues = items.map((item) => ({
        prizePoolId: prizePool[0].id,
        rank: item.rank as any,
        type: item.type as any,
        title: item.title,
        description: item.description,
        estimatedValue: item.estimatedValue,
        isPhysical: item.isPhysical,
        imageUrl: item.imageUrl,
        perCategory: item.perCategory,
      }));
      await tx.insert(schema.prizeItems).values(prizeItemValues);
    }

    return prizePool[0];
  });
}

export async function getCompetitionJudges(competitionId: string) {
  const judges = await db.query.competitionJudges.findMany({
    where: eq(schema.competitionJudges.competitionId, competitionId),
    with: {
      judge: {
        columns: {
          id: true,
          name: true,
          tier: true,
          specializations: true,
          profileImageUrl: true,
          isVerified: true,
        },
      },
    },
    orderBy: desc(schema.competitionJudges.assignedAt),
  });

  return judges.map((cj) => ({
    id: cj.judge.id,
    name: cj.judge.name,
    tier: cj.judge.tier,
    specializations: cj.judge.specializations,
    profileImageUrl: cj.judge.profileImageUrl,
    isVerified: cj.judge.isVerified,
    assignedAt: cj.assignedAt,
  }));
}

export async function createCompetitionJudge(competitionId: string, judgeId: string) {
  const existing = await db.query.competitionJudges.findFirst({
    where: and(
      eq(schema.competitionJudges.competitionId, competitionId),
      eq(schema.competitionJudges.judgeId, judgeId)
    ),
  });

  if (existing) {
    throw new Error("Judge already assigned to this competition");
  }

  const assignment = await db
    .insert(schema.competitionJudges)
    .values({ competitionId, judgeId })
    .returning();

  const judge = await db.query.judges.findFirst({
    where: eq(schema.judges.id, judgeId),
    columns: {
      id: true,
      name: true,
      tier: true,
      isVerified: true,
    },
  });

  return {
    id: judge!.id,
    name: judge!.name,
    tier: judge!.tier,
    isVerified: judge!.isVerified,
  };
}

export async function deleteCompetitionJudge(competitionId: string, judgeId: string) {
  const existing = await db.query.competitionJudges.findFirst({
    where: and(
      eq(schema.competitionJudges.competitionId, competitionId),
      eq(schema.competitionJudges.judgeId, judgeId)
    ),
  });

  if (!existing) {
    throw new Error("Judge not assigned to this competition");
  }

  await db.delete(schema.competitionJudges).where(eq(schema.competitionJudges.id, existing.id));
}

export async function getCertificatesByCompetition(competitionId: string, status?: string, limit?: number, offset?: number) {
  const competitionCategories = await db
    .select({ id: schema.competitionCategories.id })
    .from(schema.competitionCategories)
    .where(eq(schema.competitionCategories.competitionId, competitionId));

  const categoryIds = competitionCategories.map((cc) => cc.id);

  const whereConditions = [inArray(schema.registrations.competitionCategoryId, categoryIds)];
  if (status && status !== "ALL") {
    whereConditions.push(eq(schema.certificates.status, status as any));
  }

  const certs = await db.query.certificates.findMany({
    where: and(...whereConditions),
    with: {
      registration: {
        columns: { registrationId: true },
        with: {
          student: {
            columns: { name: true },
          },
        },
      },
    },
    orderBy: desc(schema.certificates.issuedAt),
    limit: limit || 10,
    offset: offset || 0,
  });

  const countResult = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(schema.certificates)
    .innerJoin(schema.registrations, eq(schema.certificates.registrationId, schema.registrations.id))
    .where(and(...whereConditions));

  return {
    certificates: certs.map((cert) => ({
      id: cert.id,
      registrationId: cert.registration.registrationId,
      studentName: cert.registration.student.name,
      type: cert.type,
      status: cert.status || "PENDING",
      certificateId: cert.certificateId,
      qrCodeUrl: cert.qrCodeUrl,
      generatedAt: cert.issuedAt,
    })),
    totalCount: countResult[0]?.count || 0,
  };
}

export async function getCertificateStatsByCompetition(competitionId: string) {
  const competitionCategories = await db
    .select({ id: schema.competitionCategories.id })
    .from(schema.competitionCategories)
    .where(eq(schema.competitionCategories.competitionId, competitionId));

  const categoryIds = competitionCategories.map((cc) => cc.id);

  const certs = await db
    .select({ status: schema.certificates.status, type: schema.certificates.type })
    .from(schema.certificates)
    .innerJoin(schema.registrations, eq(schema.certificates.registrationId, schema.registrations.id))
    .where(inArray(schema.registrations.competitionCategoryId, categoryIds));

  const byStatus: Record<string, number> = {
    PENDING: 0,
    GENERATED: 0,
    SHARED: 0,
    REVOKED: 0,
  };

  const byType: Record<string, number> = {
    PARTICIPATION: 0,
    MERIT_1: 0,
    MERIT_2: 0,
    MERIT_3: 0,
    SPECIAL_MENTION: 0,
  };

  certs.forEach((cert) => {
    if (cert.status && cert.status in byStatus) {
      byStatus[cert.status]++;
    }
    if (cert.type && cert.type in byType) {
      byType[cert.type]++;
    }
  });

  return { byStatus, byType };
}

export async function getEligibleRegistrationsForCertificateGeneration(competitionId: string) {
  const competitionCategories = await db
    .select({ id: schema.competitionCategories.id })
    .from(schema.competitionCategories)
    .where(eq(schema.competitionCategories.competitionId, competitionId));

  const categoryIds = competitionCategories.map((cc) => cc.id);

  return db.query.registrations.findMany({
    where: and(
      inArray(schema.registrations.competitionCategoryId, categoryIds),
      eq(schema.registrations.status, "VERIFIED")
    ),
    with: {
      student: {
        with: {
          parent: {
            columns: { userId: true },
          },
        },
      },
      certificate: true,
    },
  });
}

export async function updateOrCreateCertificate(
  registrationId: string,
  data: {
    certificateId: string;
    certificateUrl: string;
    qrCodeUrl: string;
    type: string;
    status: string;
  }
) {
  const existing = await db.query.certificates.findFirst({
    where: eq(schema.certificates.registrationId, registrationId),
  });

  if (existing) {
    await db
      .update(schema.certificates)
      .set({
        certificateUrl: data.certificateUrl,
        qrCodeUrl: data.qrCodeUrl,
        type: data.type as any,
        status: data.status as any,
      })
      .where(eq(schema.certificates.id, existing.id));
  } else {
    await db.insert(schema.certificates).values({
      registrationId,
      certificateId: data.certificateId,
      certificateUrl: data.certificateUrl,
      qrCodeUrl: data.qrCodeUrl,
      type: data.type as any,
      status: data.status as any,
    });
  }
}

export async function getGeneratedCertificatesByCompetition(competitionId: string) {
  const competitionCategories = await db
    .select({ id: schema.competitionCategories.id })
    .from(schema.competitionCategories)
    .where(eq(schema.competitionCategories.competitionId, competitionId));

  const categoryIds = competitionCategories.map((cc) => cc.id);

  return db.query.certificates.findMany({
    where: and(
      inArray(schema.registrations.competitionCategoryId, categoryIds),
      eq(schema.certificates.status, "GENERATED")
    ),
    with: {
      registration: {
        with: {
          student: {
            with: {
              parent: {
                columns: { userId: true },
              },
            },
          },
        },
      },
    },
  });
}

export async function updateCertificateStatus(certificateId: string, status: string) {
  await db
    .update(schema.certificates)
    .set({ status: status as any })
    .where(eq(schema.certificates.id, certificateId));
}

export async function getCertificateWithCompetition(certificateId: string) {
  return db.query.certificates.findFirst({
    where: eq(schema.certificates.id, certificateId),
    with: {
      registration: {
        with: {
          competitionCategory: true,
        },
      },
    },
  });
}

export async function revokeCertificate(certificateId: string, revokedBy: string) {
  const updated = await db
    .update(schema.certificates)
    .set({
      status: "REVOKED" as any,
      revokedAt: new Date(),
      revokedBy,
    })
    .where(eq(schema.certificates.id, certificateId))
    .returning();

  return updated[0];
}

export async function updateCertificateStatusOnly(certificateId: string, status: string) {
  const updated = await db
    .update(schema.certificates)
    .set({ status: status as any })
    .where(eq(schema.certificates.id, certificateId))
    .returning();

  return updated[0];
}

export async function getJudgeParticipantsPaginated(judgeId: string, search?: string, limit?: number, offset?: number) {
  const whereConditions: any[] = [eq(schema.judgeAssignments.judgeId, judgeId)];

  if (search) {
    whereConditions.push(
      sql`EXISTS (SELECT 1 FROM ${schema.students} WHERE ${schema.students.name} ILIKE ${'%' + search + '%'} AND ${schema.students.id} = (SELECT "studentId" FROM ${schema.registrations} WHERE ${schema.registrations.id} = ${schema.judgeAssignments.registrationId}))`
    );
  }

  const assignments = await db.query.judgeAssignments.findMany({
    where: and(...whereConditions),
    with: {
      registration: {
        columns: { id: true, finalScore: true },
        with: {
          student: {
            columns: { id: true, name: true },
          },
          competitionCategory: {
            columns: {},
            with: {
              category: {
                columns: { id: true, name: true },
              },
            },
          },
        },
      },
      score: {
        columns: { totalScore: true },
      },
    },
    limit: limit || 20,
    offset: offset || 0,
  });

  const total = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(schema.judgeAssignments)
    .where(and(...whereConditions));

  return {
    data: assignments.map((a) => ({
      id: a.id,
      participantId: a.registration.student.id,
      participantName: a.registration.student.name,
      categoryId: a.registration.competitionCategory.category.id,
      categoryName: a.registration.competitionCategory.category.name,
      submissionScore: a.score?.totalScore ? parseFloat(a.score.totalScore.toString()) : (a.registration.finalScore ? parseFloat(a.registration.finalScore.toString()) : null),
      evaluationStatus: (a.submittedAt ? "completed" : "pending") as "pending" | "in-progress" | "completed",
      submittedAt: a.submittedAt ? new Date(a.submittedAt).toISOString() : "",
    })),
    totalCount: total[0]?.count || 0,
  };
}

export async function getCompetitionWithPrizePoolAndRankedRegistrations(competitionId: string) {
  return db.query.competitions.findFirst({
    where: eq(schema.competitions.id, competitionId),
    with: {
      prizePool: {
        with: {
          items: true,
        },
      },
      categories: {
        with: {
          registrations: {
            where: and(
              eq(schema.registrations.scoringFinalized, true),
              sql`${schema.registrations.finalRank} IS NOT NULL`
            ),
            with: {
              certificate: {
                columns: { id: true },
              },
            },
            orderBy: asc(schema.registrations.finalRank),
          },
        },
      },
    },
  });
}

export async function checkExistingPrizeAward(registrationId: string) {
  return db.query.prizeAwards.findFirst({
    where: eq(schema.prizeAwards.registrationId, registrationId),
  });
}

export async function getPrizePoolWithItems(prizePoolId: string) {
  return db.query.prizePools.findFirst({
    where: eq(schema.prizePools.id, prizePoolId),
    with: { items: true },
  });
}

export async function getActiveQualificationRules(stateCompetitionId: string) {
  return db.query.qualificationRules.findMany({
    where: and(
      eq(schema.qualificationRules.stateCompetitionId, stateCompetitionId),
      eq(schema.qualificationRules.isActive, true)
    ),
    with: {
      nationalCompetition: {
        columns: { id: true, title: true, registrationDeadline: true },
      },
    },
  });
}

export async function getCategoriesWithFinalizedRegistrations(stateCompetitionId: string) {
  return db.query.competitionCategories.findMany({
    where: eq(schema.competitionCategories.competitionId, stateCompetitionId),
    with: {
      registrations: {
        where: and(
          eq(schema.registrations.scoringFinalized, true),
          sql`${schema.registrations.finalRank} IS NOT NULL`
        ),
        orderBy: asc(schema.registrations.finalRank),
      },
    },
  });
}

export async function getExistingQualificationSlots(qualificationRuleId: string) {
  const slots = await db
    .select({ registrationId: schema.qualificationSlots.registrationId })
    .from(schema.qualificationSlots)
    .where(eq(schema.qualificationSlots.qualificationRuleId, qualificationRuleId));

  return new Set(slots.map((s) => s.registrationId));
}

export async function createQualificationSlots(slots: Array<{
  qualificationRuleId: string;
  registrationId: string;
  studentId: string;
  nationalCompetitionId: string;
  status: string;
  expiresAt: Date;
  isWildCard: boolean;
}>) {
  if (slots.length === 0) return [];

  return db.insert(schema.qualificationSlots).values(
    slots.map((s) => ({
      qualificationRuleId: s.qualificationRuleId,
      registrationId: s.registrationId,
      studentId: s.studentId,
      nationalCompetitionId: s.nationalCompetitionId,
      status: s.status as any,
      expiresAt: s.expiresAt,
      isWildCard: s.isWildCard,
    }))
  );
}

export async function getRegistrationForNotification(registrationId: string) {
  return db.query.registrations.findFirst({
    where: eq(schema.registrations.id, registrationId),
    with: {
      student: true,
      competitionCategory: {
        with: {
          category: true,
        },
      },
    },
  });
}

export async function getParentById(parentId: string) {
  return db.query.parents.findFirst({
    where: eq(schema.parents.id, parentId),
    with: {
      user: {
        columns: { email: true },
      },
    },
  });
}

export async function publishPrizePool(prizePoolId: string) {
  const updated = await db
    .update(schema.prizePools)
    .set({ isPublished: true })
    .where(eq(schema.prizePools.id, prizePoolId))
    .returning({ id: schema.prizePools.id });

  return updated[0];
}

export async function getVerifiedRegistrationsWithAssignments() {
  return db.query.registrations.findMany({
    where: and(
      eq(schema.registrations.status, "VERIFIED" as any),
      sql`EXISTS (SELECT 1 FROM ${schema.judgeAssignments} WHERE ${schema.judgeAssignments.registrationId} = ${schema.registrations.id})`
    ),
    with: {
      student: true,
      competitionCategory: {
        with: {
          category: true,
        },
      },
      judgeAssignments: {
        with: {
          judge: {
            columns: { id: true, name: true },
          },
          score: {
            columns: { totalScore: true },
          },
        },
      },
    },
  });
}

export async function getJudgeAssignmentsByRegistration(registrationId: string) {
  return db.query.judgeAssignments.findMany({
    where: eq(schema.judgeAssignments.registrationId, registrationId),
  });
}

export async function deleteScoresByAssignment(assignmentId: string) {
  return db.delete(schema.scores).where(eq(schema.scores.judgeAssignmentId, assignmentId));
}

export async function updateJudgeAssignmentSubmission(
  assignmentId: string,
  data: { isSubmitted: boolean; submittedAt: Date | null }
) {
  const updated = await db
    .update(schema.judgeAssignments)
    .set(data)
    .where(eq(schema.judgeAssignments.id, assignmentId))
    .returning();

  return updated[0];
}

export async function updateRegistrationStatus(
  registrationId: string,
  data: { scoringFinalized?: boolean; conflictResolved?: boolean }
) {
  const updated = await db
    .update(schema.registrations)
    .set(data)
    .where(eq(schema.registrations.id, registrationId))
    .returning();

  return updated[0];
}

export async function getRegistrationWithAssignmentsAndScores(registrationId: string) {
  return db.query.registrations.findFirst({
    where: eq(schema.registrations.id, registrationId),
    with: {
      student: true,
      competitionCategory: {
        with: {
          category: true,
        },
      },
      judgeAssignments: {
        with: {
          score: {
            columns: { totalScore: true },
          },
        },
      },
    },
  });
}

export async function getCategoryCount() {
  const result = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(schema.categories);

  return result[0]?.count || 0;
}

export async function createCategories(categories: Array<{
  name: string;
  slug: string;
  grouping: string;
}>) {
  return db.insert(schema.categories).values(categories).returning();
}

export async function getCompetitionWithFinalizedRegistrations(competitionId: string) {
  return db.query.competitions.findFirst({
    where: eq(schema.competitions.id, competitionId),
    with: {
      prizePool: {
        with: { items: true },
      },
      categories: {
        with: {
          registrations: {
            where: and(
              eq(schema.registrations.status, "VERIFIED" as any),
              eq(schema.registrations.scoringFinalized, true)
            ),
            with: {
              certificate: {
                columns: { id: true, status: true, certificateUrl: true },
              },
              prizeAward: {
                columns: { id: true },
              },
              student: {
                columns: { id: true, name: true, parentId: true },
              },
            },
          },
        },
      },
    },
  });
}

export async function getParentsByIds(parentIds: string[]) {
  return db.query.parents.findMany({
    where: inArray(schema.parents.id, parentIds),
    columns: { id: true, userId: true },
  });
}

export async function getUsersByIds(userIds: string[]) {
  return db.query.users.findMany({
    where: inArray(schema.users.id, userIds),
    columns: { id: true, email: true },
  });
}

export async function updateCertificateUrl(
  certificateId: string,
  data: {
    certificateId: string;
    certificateUrl: string;
    qrCodeUrl: string;
    type: string;
    status: string;
  }
) {
  const updated = await db
    .update(schema.certificates)
    .set({
      certificateId: data.certificateId,
      certificateUrl: data.certificateUrl,
      qrCodeUrl: data.qrCodeUrl,
      type: data.type as any,
      status: data.status as any,
    })
    .where(eq(schema.certificates.id, certificateId))
    .returning({ id: schema.certificates.id });

  return updated[0];
}

export async function getStudentWithRegistrationsForStats(studentId: string) {
  return db.query.students.findFirst({
    where: eq(schema.students.id, studentId),
    with: {
      registrations: {
        with: {
          competitionCategory: {
            with: {
              category: {
                columns: { id: true, name: true },
              },
            },
          },
          judgeAssignments: {
            with: {
              score: {
                columns: { totalScore: true },
              },
            },
          },
          prizeAward: {
            columns: { id: true },
          },
        },
      },
    },
  });
}

export async function getStudentCompetitionsPaginated(
  studentId: string,
  filter: string,
  limit: number,
  offset: number
) {
  const whereConditions: any[] = [eq(schema.registrations.studentId, studentId)];

  if (filter === "VERIFIED") {
    whereConditions.push(eq(schema.registrations.status, "VERIFIED" as any));
  } else if (filter === "PENDING") {
    whereConditions.push(eq(schema.registrations.status, "PENDING_VERIFICATION" as any));
  } else if (filter === "PAID") {
    whereConditions.push(eq(schema.registrations.paymentStatus, "SUCCESS" as any));
  } else if (filter === "AWARDED") {
    whereConditions.push(
      sql`EXISTS (SELECT 1 FROM ${schema.prizeAwards} WHERE ${schema.prizeAwards.registrationId} = ${schema.registrations.id})`
    );
  }

  const registrations = await db.query.registrations.findMany({
    where: and(...whereConditions),
    with: {
      competitionCategory: {
        with: {
          competition: {
            columns: { id: true, title: true },
          },
          category: {
            columns: { id: true, name: true },
          },
        },
      },
      judgeAssignments: {
        with: {
          judge: {
            columns: { id: true, name: true },
          },
          score: {
            columns: { totalScore: true },
          },
        },
      },
      prizeAward: {
        columns: { id: true },
      },
    },
    orderBy: desc(schema.registrations.createdAt),
    limit,
    offset,
  });

  const total = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(schema.registrations)
    .where(and(...whereConditions));

  return {
    registrations,
    totalCount: total[0]?.count || 0,
  };
}

export async function getStudentWithCertificatesAndAwards(studentId: string) {
  return db.query.students.findFirst({
    where: eq(schema.students.id, studentId),
    with: {
      registrations: {
        with: {
          competitionCategory: {
            with: {
              competition: {
                columns: { id: true, title: true },
              },
              category: {
                columns: { id: true, name: true },
              },
            },
          },
          prizeAward: {
            with: {
              prizeItem: {
                columns: { id: true, rank: true },
              },
            },
          },
          certificate: {
            columns: {
              id: true,
              type: true,
              status: true,
              certificateUrl: true,
              qrCodeUrl: true,
              issuedAt: true,
            },
          },
        },
      },
    },
  });
}

export async function createPrizeAwardWithNewCertificate(
  registrationId: string,
  prizeItemId: string,
  prizeRank: string,
  certificateData: {
    certificateId: string;
    certificateUrl: string;
    qrCodeUrl: string;
    type: string;
    status: string;
  }
) {
  // Create certificate first
  const cert = await db
    .insert(schema.certificates)
    .values({
      ...certificateData,
      registrationId,
      status: certificateData.status as any,
      type: certificateData.type as any,
    })
    .returning();

  // Then create prize award
  const award = await db
    .insert(schema.prizeAwards)
    .values({
      registrationId,
      prizeItemId,
      rank: prizeRank as any,
    })
    .returning();

  return {
    certificate: cert[0],
    award: award[0],
  };
}

export async function createPrizeAwardWithCertificate(
  registrationId: string,
  prizeItemId: string,
  rank: string,
  certificateData?: {
    certificateId: string;
    certificateUrl: string;
    qrCodeUrl: string;
    type: string;
  }
) {
  if (certificateData) {
    // Create certificate first, then link to award
    await db.insert(schema.certificates).values({
      registrationId,
      certificateId: certificateData.certificateId,
      certificateUrl: certificateData.certificateUrl,
      qrCodeUrl: certificateData.qrCodeUrl,
      type: certificateData.type as any,
    });
  }

  const award = await db
    .insert(schema.prizeAwards)
    .values({
      registrationId,
      prizeItemId,
      rank: rank as any,
    })
    .returning();

  return award[0];
}

export async function verifyJudge(judgeId: string, tier?: string) {
  const updated = await db
    .update(schema.judges)
    .set({
      isVerified: true,
      ...(tier ? { tier: tier as any } : {}),
    })
    .where(eq(schema.judges.id, judgeId))
    .returning({
      id: schema.judges.id,
      name: schema.judges.name,
      tier: schema.judges.tier,
      isVerified: schema.judges.isVerified,
    });

  return updated[0];
}

export async function getVotingLeaderboard(competitionId: string) {
  const competitionCategories = await db
    .select({ id: schema.competitionCategories.id })
    .from(schema.competitionCategories)
    .where(eq(schema.competitionCategories.competitionId, competitionId));

  const categoryIds = competitionCategories.map((cc) => cc.id);

  const registrations = await db.query.registrations.findMany({
    where: and(
      inArray(schema.registrations.competitionCategoryId, categoryIds),
      sql`(SELECT COUNT(*) FROM ${schema.judgeAssignments} WHERE "judgeAssignments"."registrationId" = ${schema.registrations.id} AND "judgeAssignments"."scoreId" IS NOT NULL) > 0`
    ),
    with: {
      student: {
        columns: { name: true },
      },
      competitionCategory: {
        columns: {},
        with: {
          category: {
            columns: { name: true },
          },
        },
      },
      judgeAssignments: {
        columns: {},
        where: sql`"judgeAssignments"."scoreId" IS NOT NULL`,
        with: {
          score: {
            columns: { totalScore: true },
          },
        },
      },
    },
  });

  const leaderboardData = registrations
    .map((reg) => {
      const scores = reg.judgeAssignments
        .map((ja) => ja.score?.totalScore ? parseFloat(ja.score.totalScore.toString()) : 0)
        .filter((s) => s >= 0);
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      return {
        registrationId: reg.id,
        participantName: reg.student.name,
        categoryName: reg.competitionCategory.category.name,
        scoresReceived: scores.length,
        averageScore: Math.round(avgScore * 100) / 100,
        totalScore: Math.round(scores.reduce((a, b) => a + b, 0)),
      };
    })
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 10);

  return leaderboardData;
}

export async function getRecentVotingActivity(competitionId: string, limit?: number) {
  const competitionCategories = await db
    .select({ id: schema.competitionCategories.id })
    .from(schema.competitionCategories)
    .where(eq(schema.competitionCategories.competitionId, competitionId));

  const categoryIds = competitionCategories.map((cc) => cc.id);

  const recentScores = await db.query.scores.findMany({
    where: inArray(schema.registrations.competitionCategoryId, categoryIds),
    with: {
      assignment: {
        columns: {},
        with: {
          judge: {
            columns: { id: true, name: true },
          },
          registration: {
            columns: { id: true },
            with: {
              student: {
                columns: { name: true },
              },
              competitionCategory: {
                columns: {},
                with: {
                  category: {
                    columns: { name: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: desc(schema.scores.createdAt),
    limit: limit || 20,
  });

  return recentScores.map((score) => ({
    id: score.id,
    judgeId: score.assignment.judge.id,
    judgeName: score.assignment.judge.name,
    participantName: score.assignment.registration.student.name,
    categoryName: score.assignment.registration.competitionCategory.category.name,
    scores: {
      criteria1: score.criteria1 ? parseFloat(score.criteria1.toString()) : 0,
      criteria2: score.criteria2 ? parseFloat(score.criteria2.toString()) : 0,
      criteria3: score.criteria3 ? parseFloat(score.criteria3.toString()) : 0,
      criteria4: score.criteria4 ? parseFloat(score.criteria4.toString()) : 0,
      total: score.totalScore ? parseFloat(score.totalScore.toString()) : 0,
    },
    submittedAt: score.createdAt,
  }));
}

export async function getPendingShipmentsForCompetition(competitionId: string, shipmentIds?: string[]) {
  const competitionCategories = await db
    .select({ id: schema.competitionCategories.id })
    .from(schema.competitionCategories)
    .where(eq(schema.competitionCategories.competitionId, competitionId));

  const categoryIds = competitionCategories.map((cc) => cc.id);

  const whereConditions = [
    inArray(schema.registrations.competitionCategoryId, categoryIds),
    eq(schema.physicalPrizeOrders.status, "PENDING" as any),
  ];

  if (shipmentIds && shipmentIds.length > 0) {
    whereConditions.push(inArray(schema.physicalPrizeOrders.id, shipmentIds));
  }

  return db.query.physicalPrizeOrders.findMany({
    where: and(...whereConditions),
    columns: { id: true, packageSKU: true },
  });
}

export async function updateShipmentWithLabel(
  shipmentId: string,
  data: {
    awbNumber: string;
    shiprocketLabelUrl: string;
    courierName: string;
    estimatedDelivery: Date;
    weightGrams: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  }
) {
  await db
    .update(schema.physicalPrizeOrders)
    .set({
      status: "LABEL_GENERATED" as any,
      awbNumber: data.awbNumber,
      shiprocketLabelUrl: data.shiprocketLabelUrl,
      courierName: data.courierName,
      estimatedDelivery: data.estimatedDelivery,
      weightGrams: data.weightGrams as any,
      lengthCm: data.lengthCm as any,
      widthCm: data.widthCm as any,
      heightCm: data.heightCm as any,
      labelGeneratedAt: new Date(),
    })
    .where(eq(schema.physicalPrizeOrders.id, shipmentId));
}

export async function getCompetitionShipments(competitionId: string, status?: string, limit?: number, offset?: number) {
  const competitionCategories = await db
    .select({ id: schema.competitionCategories.id })
    .from(schema.competitionCategories)
    .where(eq(schema.competitionCategories.competitionId, competitionId));

  const categoryIds = competitionCategories.map((cc) => cc.id);

  const statusMap: Record<string, string> = {
    PENDING: "PENDING",
    LABEL_GENERATED: "LABEL_GENERATED",
    PICKED_UP: "PICKUP_SCHEDULED",
    IN_TRANSIT: "IN_TRANSIT",
    DELIVERED: "DELIVERED",
  };

  const whereConditions = [inArray(schema.registrations.competitionCategoryId, categoryIds)];
  if (status && status !== "ALL" && statusMap[status]) {
    whereConditions.push(eq(schema.physicalPrizeOrders.status, statusMap[status] as any));
  }

  const shipments = await db.query.physicalPrizeOrders.findMany({
    where: and(...whereConditions),
    with: {
      prizeAward: {
        columns: {},
        with: {
          registration: {
            columns: { registrationId: true },
            with: {
              student: {
                columns: { name: true },
              },
            },
          },
        },
      },
    },
    orderBy: desc(schema.physicalPrizeOrders.createdAt),
    limit: limit || 10,
    offset: offset || 0,
  });

  const totalCount = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(schema.physicalPrizeOrders)
    .innerJoin(schema.prizeAwards, eq(schema.physicalPrizeOrders.prizeAwardId, schema.prizeAwards.id))
    .innerJoin(schema.registrations, eq(schema.prizeAwards.registrationId, schema.registrations.id))
    .where(and(...whereConditions));

  const reverseStatusMap: Record<string, string> = {
    PENDING: "PENDING",
    LABEL_GENERATED: "LABEL_GENERATED",
    PICKUP_SCHEDULED: "PICKED_UP",
    IN_TRANSIT: "IN_TRANSIT",
    OUT_FOR_DELIVERY: "IN_TRANSIT",
    DELIVERED: "DELIVERED",
    DELIVERY_FAILED: "DELIVERED",
    RETURNED: "DELIVERED",
  };

  return {
    data: shipments.map((ship) => ({
      id: ship.id,
      registrationId: ship.prizeAward.registration.registrationId,
      studentName: ship.prizeAward.registration.student.name,
      shipmentId: ship.awbNumber,
      status: reverseStatusMap[ship.status] || ship.status,
      carrier: ship.courierName,
      trackingUrl: ship.shiprocketLabelUrl,
      estimatedDelivery: ship.estimatedDelivery ? new Date(ship.estimatedDelivery).toISOString() : null,
    })),
    totalCount: totalCount[0]?.count || 0,
  };
}

export async function getCompetitionJudgesWithVotingStats(competitionId: string, limit?: number, offset?: number) {
  const competitionCategories = await db
    .select({ id: schema.competitionCategories.id })
    .from(schema.competitionCategories)
    .where(eq(schema.competitionCategories.competitionId, competitionId));

  const categoryIds = competitionCategories.map((cc) => cc.id);

  const registrationIds = await db
    .select({ id: schema.registrations.id })
    .from(schema.registrations)
    .where(inArray(schema.registrations.competitionCategoryId, categoryIds));

  const regIds = registrationIds.map((r) => r.id);

  const judgesData = await db.query.competitionJudges.findMany({
    where: eq(schema.competitionJudges.competitionId, competitionId),
    with: {
      judge: {
        columns: { id: true, name: true, tier: true },
        with: {
          assignments: {
            columns: { isSubmitted: true },
            where: inArray(schema.judgeAssignments.registrationId, regIds),
            with: {
              score: {
                columns: { totalScore: true },
              },
            },
          },
        },
      },
    },
    limit: limit || 10,
    offset: offset || 0,
  });

  const totalCount = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(schema.competitionJudges)
    .where(eq(schema.competitionJudges.competitionId, competitionId));

  const votingData = judgesData.map((cj) => {
    const assignments = cj.judge.assignments;
    const submitted = assignments.filter((a) => a.isSubmitted);
    const scores = submitted.map((a) => a.score?.totalScore ?? 0).map(s => parseFloat(s.toString()));
    const averageScore =
      scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : undefined;

    return {
      judgeId: cj.judge.id,
      judgeName: cj.judge.name,
      tier: cj.judge.tier,
      assignmentCount: assignments.length,
      submittedCount: submitted.length,
      averageScore: averageScore ? Math.round(averageScore * 10) / 10 : undefined,
      isOutlier: false,
      completionPercentage:
        assignments.length > 0
          ? Math.round((submitted.length / assignments.length) * 100)
          : 0,
    };
  });

  return {
    data: votingData,
    totalCount: totalCount[0]?.count || 0,
  };
}
