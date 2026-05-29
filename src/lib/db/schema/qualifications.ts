import { pgTable, text, timestamp, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { qualificationStatusEnum } from "./enums";
import { competitions } from "./competitions";
import { registrations } from "./registrations";
import { students } from "./students";

export const qualificationRules = pgTable("QualificationRule", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  stateCompetitionId: text("stateCompetitionId").notNull(),
  nationalCompetitionId: text("nationalCompetitionId").notNull(),
  slotsPerCategory: integer("slotsPerCategory").default(3).notNull(),
  wildCardSlots: integer("wildCardSlots").default(1).notNull(),
  minScoreThreshold: numeric("minScoreThreshold", { precision: 8, scale: 4 }),
  discountPercent: integer("discountPercent").default(50).notNull(),
  slotExpiryDays: integer("slotExpiryDays").default(14).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
});

export const qualificationSlots = pgTable("QualificationSlot", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  qualificationRuleId: text("qualificationRuleId").notNull(),
  registrationId: text("registrationId").notNull().unique(),
  studentId: text("studentId").notNull(),
  nationalCompetitionId: text("nationalCompetitionId").notNull(),
  status: qualificationStatusEnum("status").default("OFFERED").notNull(),
  offeredAt: timestamp("offeredAt", { precision: 3 }).defaultNow().notNull(),
  expiresAt: timestamp("expiresAt", { precision: 3 }).notNull(),
  acceptedAt: timestamp("acceptedAt", { precision: 3 }),
  nationalRegistrationId: text("nationalRegistrationId").unique(),
  isWildCard: boolean("isWildCard").default(false).notNull(),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
});

// Relations
export const qualificationRulesRelations = relations(qualificationRules, ({ one, many }) => ({
  stateCompetition: one(competitions, {
    relationName: "StateComp",
    fields: [qualificationRules.stateCompetitionId],
    references: [competitions.id],
  }),
  nationalCompetition: one(competitions, {
    relationName: "NationalComp",
    fields: [qualificationRules.nationalCompetitionId],
    references: [competitions.id],
  }),
  slots: many(qualificationSlots),
}));

export const qualificationSlotsRelations = relations(qualificationSlots, ({ one }) => ({
  qualificationRule: one(qualificationRules, {
    fields: [qualificationSlots.qualificationRuleId],
    references: [qualificationRules.id],
  }),
  registration: one(registrations, {
    relationName: "EarnedSlot",
    fields: [qualificationSlots.registrationId],
    references: [registrations.id],
  }),
  student: one(students, {
    fields: [qualificationSlots.studentId],
    references: [students.id],
  }),
  nationalCompetition: one(competitions, {
    relationName: "QualSlotNational",
    fields: [qualificationSlots.nationalCompetitionId],
    references: [competitions.id],
  }),
  nationalRegistration: one(registrations, {
    relationName: "UsedSlot",
    fields: [qualificationSlots.nationalRegistrationId],
    references: [registrations.id],
  }),
}));
