import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { certificateTypeEnum, certificateStatusEnum } from "./enums";
import { registrations } from "./registrations";
import { prizeAwards } from "./prizes";

export const certificates = pgTable("Certificate", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  registrationId: text("registrationId").notNull().unique(),
  certificateId: text("certificateId").notNull().unique(),
  certificateUrl: text("certificateUrl").notNull(),
  qrCodeUrl: text("qrCodeUrl").notNull(),
  type: certificateTypeEnum("type").default("PARTICIPATION").notNull(),
  status: certificateStatusEnum("status").default("PENDING").notNull(),
  prizeAwardId: text("prizeAwardId").unique(),
  issuedAt: timestamp("issuedAt", { precision: 3 }).defaultNow().notNull(),
  revokedAt: timestamp("revokedAt", { precision: 3 }),
  revokedBy: text("revokedBy"),
});

// Relations
export const certificatesRelations = relations(certificates, ({ one }) => ({
  registration: one(registrations, {
    fields: [certificates.registrationId],
    references: [registrations.id],
  }),
  prizeAward: one(prizeAwards, {
    fields: [certificates.prizeAwardId],
    references: [prizeAwards.id],
  }),
}));
