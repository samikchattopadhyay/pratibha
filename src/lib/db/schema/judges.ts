import { pgTable, text, timestamp, integer, boolean, numeric, jsonb, unique, index } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { judgeTierEnum, payoutStatusEnum } from "./enums";
import { users } from "./users";
import { registrations } from "./registrations";
import { competitions } from "./competitions";
import { scores } from "./scoring";

export const judges = pgTable("Judge", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  specializations: text("specializations").array().notNull().default(sql`'{}'::text[]`),
  profileImageUrl: text("profileImageUrl"),
  tier: judgeTierEnum("tier").default("LOCAL").notNull(),
  bio: text("bio"),
  credentials: text("credentials"),
  stateOfResidence: text("stateOfResidence"),
  states: text("states").array().notNull().default(sql`'{}'::text[]`),
  languages: text("languages").array().notNull().default(sql`'{}'::text[]`),
  yearsOfExperience: integer("yearsOfExperience"),
  isVerified: boolean("isVerified").default(false).notNull(),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  totalEvaluations: integer("totalEvaluations").default(0).notNull(),
  averageScoreGiven: numeric("averageScoreGiven", { precision: 5, scale: 2 }),
  bankAccountDetails: jsonb("bankAccountDetails"),
  paymentPerEvaluation: numeric("paymentPerEvaluation", { precision: 8, scale: 2 }),
  revenueShareLOCAL: numeric("revenueShareLOCAL", { precision: 5, scale: 2 }),
  revenueShareREGIONAL: numeric("revenueShareREGIONAL", { precision: 5, scale: 2 }),
  revenueShareNATIONAL: numeric("revenueShareNATIONAL", { precision: 5, scale: 2 }),
  revenueShareEXPERT: numeric("revenueShareEXPERT", { precision: 5, scale: 2 }),
  telegramChatId: text("telegramChatId"),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).defaultNow().notNull(),
});

export const judgePayouts = pgTable("JudgePayout", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  judgeId: text("judgeId").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: payoutStatusEnum("status").default("PENDING").notNull(),
  assignedCount: integer("assignedCount").notNull(),
  paymentDate: timestamp("paymentDate", { precision: 3 }),
  transactionRef: text("transactionRef"),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).defaultNow().notNull(),
});

export const judgeAssignments = pgTable("JudgeAssignment", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  registrationId: text("registrationId").notNull(),
  judgeId: text("judgeId").notNull(),
  isSubmitted: boolean("isSubmitted").default(false).notNull(),
  assignedAt: timestamp("assignedAt", { precision: 3 }).defaultNow().notNull(),
  submittedAt: timestamp("submittedAt", { precision: 3 }),
  conflictChecked: boolean("conflictChecked").default(false).notNull(),
  conflictFlagged: boolean("conflictFlagged").default(false).notNull(),
  conflictReason: text("conflictReason"),
}, (table) => [
  unique("JudgeAssignment_registrationId_judgeId_key").on(table.registrationId, table.judgeId)
]);

export const judgePanelRequirements = pgTable("JudgePanelRequirement", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  competitionId: text("competitionId").notNull().unique(),
  minJudges: integer("minJudges").default(2).notNull(),
  minNationalTierJudges: integer("minNationalTierJudges").default(0).notNull(),
  requireCrossCategory: boolean("requireCrossCategory").default(false).notNull(),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
});

export const competitionJudges = pgTable("CompetitionJudge", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  competitionId: text("competitionId").notNull(),
  judgeId: text("judgeId").notNull(),
  assignedAt: timestamp("assignedAt", { precision: 3 }).defaultNow().notNull(),
}, (table) => [
  unique("CompetitionJudge_competitionId_judgeId_key").on(table.competitionId, table.judgeId),
  index("CompetitionJudge_competitionId_idx").on(table.competitionId),
  index("CompetitionJudge_judgeId_idx").on(table.judgeId)
]);

// Relations
export const judgesRelations = relations(judges, ({ one, many }) => ({
  user: one(users, {
    fields: [judges.userId],
    references: [users.id],
  }),
  payouts: many(judgePayouts),
  assignments: many(judgeAssignments),
  competitionAssignments: many(competitionJudges),
}));

export const judgePayoutsRelations = relations(judgePayouts, ({ one }) => ({
  judge: one(judges, {
    fields: [judgePayouts.judgeId],
    references: [judges.id],
  }),
}));

export const judgeAssignmentsRelations = relations(judgeAssignments, ({ one }) => ({
  registration: one(registrations, {
    fields: [judgeAssignments.registrationId],
    references: [registrations.id],
  }),
  judge: one(judges, {
    fields: [judgeAssignments.judgeId],
    references: [judges.id],
  }),
  score: one(scores, {
    fields: [judgeAssignments.id],
    references: [scores.judgeAssignmentId],
  }),
}));

export const judgePanelRequirementsRelations = relations(judgePanelRequirements, ({ one }) => ({
  competition: one(competitions, {
    fields: [judgePanelRequirements.competitionId],
    references: [competitions.id],
  }),
}));

export const competitionJudgesRelations = relations(competitionJudges, ({ one }) => ({
  competition: one(competitions, {
    fields: [competitionJudges.competitionId],
    references: [competitions.id],
  }),
  judge: one(judges, {
    fields: [competitionJudges.judgeId],
    references: [judges.id],
  }),
}));
