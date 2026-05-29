import { pgTable, text, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { judgeAssignments } from "./judges";
import { registrations } from "./registrations";

export const scores = pgTable("Score", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  judgeAssignmentId: text("judgeAssignmentId").notNull().unique(),
  criteria1: integer("criteria1").notNull(),
  criteria2: integer("criteria2").notNull(),
  criteria3: integer("criteria3").notNull(),
  criteria4: integer("criteria4"),
  totalScore: integer("totalScore").notNull(),
  remarks: text("remarks"),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
});

export const socialMetrics = pgTable("SocialMetric", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  registrationId: text("registrationId").notNull().unique(),
  likesCount: integer("likesCount").default(0).notNull(),
  commentsCount: integer("commentsCount").default(0).notNull(),
  sharesCount: integer("sharesCount").default(0).notNull(),
  calculatedEngagement: numeric("calculatedEngagement", { precision: 5, scale: 2 }).default("0.00").notNull(),
  lastSyncedAt: timestamp("lastSyncedAt", { precision: 3 }).defaultNow().notNull(),
});

// Relations
export const scoresRelations = relations(scores, ({ one }) => ({
  assignment: one(judgeAssignments, {
    fields: [scores.judgeAssignmentId],
    references: [judgeAssignments.id],
  }),
}));

export const socialMetricsRelations = relations(socialMetrics, ({ one }) => ({
  registration: one(registrations, {
    fields: [socialMetrics.registrationId],
    references: [registrations.id],
  }),
}));
