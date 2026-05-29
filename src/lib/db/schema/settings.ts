import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const systemSettings = pgTable("SystemSetting", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).defaultNow().notNull(),
});
