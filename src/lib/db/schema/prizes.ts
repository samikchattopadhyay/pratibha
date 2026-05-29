import { pgTable, text, timestamp, boolean, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { prizeRankEnum, prizeTypeEnum } from "./enums";
import { competitions } from "./competitions";
import { registrations } from "./registrations";
import { certificates } from "./certificates";
import { physicalPrizeOrders } from "./courier";

export const prizePools = pgTable("PrizePool", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  competitionId: text("competitionId").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).defaultNow().notNull(),
});

export const prizeItems = pgTable("PrizeItem", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  prizePoolId: text("prizePoolId").notNull(),
  rank: prizeRankEnum("rank").notNull(),
  type: prizeTypeEnum("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  estimatedValue: numeric("estimatedValue", { precision: 10, scale: 2 }),
  isPhysical: boolean("isPhysical").default(false).notNull(),
  imageUrl: text("imageUrl"),
  perCategory: boolean("perCategory").default(false).notNull(),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
});

export const prizeAwards = pgTable("PrizeAward", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  prizeItemId: text("prizeItemId").notNull(),
  registrationId: text("registrationId").notNull().unique(),
  rank: prizeRankEnum("rank").notNull(),
  awardedAt: timestamp("awardedAt", { precision: 3 }).defaultNow().notNull(),
  isDispatched: boolean("isDispatched").default(false).notNull(),
  dispatchedAt: timestamp("dispatchedAt", { precision: 3 }),
  courierTrackingId: text("courierTrackingId"),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
});

// Relations
export const prizePoolsRelations = relations(prizePools, ({ one, many }) => ({
  competition: one(competitions, {
    fields: [prizePools.competitionId],
    references: [competitions.id],
  }),
  items: many(prizeItems),
}));

export const prizeItemsRelations = relations(prizeItems, ({ one, many }) => ({
  prizePool: one(prizePools, {
    fields: [prizeItems.prizePoolId],
    references: [prizePools.id],
  }),
  awards: many(prizeAwards),
}));

export const prizeAwardsRelations = relations(prizeAwards, ({ one }) => ({
  prizeItem: one(prizeItems, {
    fields: [prizeAwards.prizeItemId],
    references: [prizeItems.id],
  }),
  registration: one(registrations, {
    fields: [prizeAwards.registrationId],
    references: [registrations.id],
  }),
  certificate: one(certificates, {
    fields: [prizeAwards.id],
    references: [certificates.prizeAwardId],
  }),
  physicalOrder: one(physicalPrizeOrders, {
    fields: [prizeAwards.id],
    references: [physicalPrizeOrders.prizeAwardId],
  }),
}));
