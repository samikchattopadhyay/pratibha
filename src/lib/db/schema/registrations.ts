import { pgTable, text, timestamp, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { paymentStatusEnum, entryStatusEnum } from "./enums";
import { students } from "./students";
import { competitionCategories } from "./competitions";
import { judgeAssignments } from "./judges";
import { socialMetrics } from "./scoring";
import { certificates } from "./certificates";
import { prizeAwards } from "./prizes";
import { qualificationSlots } from "./qualifications";

export const registrations = pgTable("Registration", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studentId: text("studentId").notNull(),
  competitionCategoryId: text("competitionCategoryId").notNull(),
  fbPostUrl: text("fbPostUrl").unique().notNull(),
  paymentStatus: paymentStatusEnum("paymentStatus").default("PENDING").notNull(),
  registrationId: text("registrationId").unique().notNull(),
  status: entryStatusEnum("status").default("PENDING_VERIFICATION").notNull(),
  scoringFinalized: boolean("scoringFinalized").default(false).notNull(),
  conflictResolved: boolean("conflictResolved").default(false).notNull(),
  finalRank: integer("finalRank"),
  finalScore: numeric("finalScore", { precision: 8, scale: 4 }),
  discountApplied: numeric("discountApplied", { precision: 5, scale: 2 }),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  isHidden: boolean("isHidden").default(false).notNull(),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).defaultNow().notNull(),
});

export const transactions = pgTable("Transaction", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  registrationId: text("registrationId").notNull(),
  razorpayOrderId: text("razorpayOrderId").unique().notNull(),
  razorpayPaymentId: text("razorpayPaymentId").unique(),
  razorpaySignature: text("razorpaySignature"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").default("PENDING").notNull(),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
});

// Relations
export const registrationsRelations = relations(registrations, ({ one, many }) => ({
  student: one(students, {
    fields: [registrations.studentId],
    references: [students.id],
  }),
  competitionCategory: one(competitionCategories, {
    fields: [registrations.competitionCategoryId],
    references: [competitionCategories.id],
  }),
  transactions: many(transactions),
  judgeAssignments: many(judgeAssignments),
  socialMetrics: one(socialMetrics, {
    fields: [registrations.id],
    references: [socialMetrics.registrationId],
  }),
  certificate: one(certificates, {
    fields: [registrations.id],
    references: [certificates.registrationId],
  }),
  prizeAward: one(prizeAwards, {
    fields: [registrations.id],
    references: [prizeAwards.registrationId],
  }),
  qualificationSlotEarned: one(qualificationSlots, {
    relationName: "EarnedSlot",
    fields: [registrations.id],
    references: [qualificationSlots.registrationId],
  }),
  qualificationSlotUsed: one(qualificationSlots, {
    relationName: "UsedSlot",
    fields: [registrations.id],
    references: [qualificationSlots.nationalRegistrationId],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  registration: one(registrations, {
    fields: [transactions.registrationId],
    references: [registrations.id],
  }),
}));
