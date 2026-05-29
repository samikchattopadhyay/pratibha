import { pgTable, text, timestamp, integer, boolean, numeric, jsonb, unique, index } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { competitionScopeEnum } from "./enums";
import { registrations } from "./registrations";
import { prizePools } from "./prizes";
import { judgePanelRequirements, competitionJudges } from "./judges";
import { qualificationRules, qualificationSlots } from "./qualifications";

export const competitions = pgTable("Competition", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  bannerUrl: text("bannerUrl"),
  entryFeeINR: numeric("entryFeeINR", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("startDate", { precision: 3 }).notNull(),
  endDate: timestamp("endDate", { precision: 3 }).notNull(),
  registrationDeadline: timestamp("registrationDeadline", { precision: 3 }).notNull(),
  resultDate: timestamp("resultDate", { precision: 3 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  scope: competitionScopeEnum("scope").default("STATE").notNull(),
  eligibleStates: text("eligibleStates").array().notNull().default(sql`'{}'::text[]`),
  hostState: text("hostState"),
  difficultyLevel: integer("difficultyLevel").default(1).notNull(),
  minJudgesRequired: integer("minJudgesRequired").default(2).notNull(),
  rules: text("rules"),
  facebookGroupUrl: text("facebookGroupUrl"),
  capacity: integer("capacity"),
  criteriaConfig: jsonb("criteriaConfig"),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).defaultNow().notNull(),
});

export const categories = pgTable("Category", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").unique().notNull(),
  slug: text("slug").unique().notNull(),
  icon: text("icon"),
  grouping: text("grouping"),
});

export const bannerTemplates = pgTable("BannerTemplate", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").unique().notNull(),
  slug: text("slug").unique().notNull(),
  imageUrl: text("imageUrl").notNull(),
  description: text("description"),
  tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).defaultNow().notNull(),
});

export const competitionCategories = pgTable("CompetitionCategory", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  competitionId: text("competitionId").notNull(),
  categoryId: text("categoryId").notNull(),
  minAge: integer("minAge").notNull(),
  maxAge: integer("maxAge").notNull(),
  language: text("language"),
}, (table) => [
  unique("CompetitionCategory_competitionId_categoryId_minAge_maxAge_key")
    .on(table.competitionId, table.categoryId, table.minAge, table.maxAge)
]);

// Relations
export const competitionsRelations = relations(competitions, ({ one, many }) => ({
  categories: many(competitionCategories),
  prizePool: one(prizePools, {
    fields: [competitions.id],
    references: [prizePools.competitionId],
  }),
  panelRequirement: one(judgePanelRequirements, {
    fields: [competitions.id],
    references: [judgePanelRequirements.competitionId],
  }),
  qualificationRulesAsState: many(qualificationRules, { relationName: "StateComp" }),
  qualificationRulesAsNational: many(qualificationRules, { relationName: "NationalComp" }),
  qualificationSlotsAsNational: many(qualificationSlots, { relationName: "QualSlotNational" }),
  assignedJudges: many(competitionJudges),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  competitions: many(competitionCategories),
}));

export const competitionCategoriesRelations = relations(competitionCategories, ({ one, many }) => ({
  competition: one(competitions, {
    fields: [competitionCategories.competitionId],
    references: [competitions.id],
  }),
  category: one(categories, {
    fields: [competitionCategories.categoryId],
    references: [categories.id],
  }),
  registrations: many(registrations),
}));
