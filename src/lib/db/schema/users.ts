import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { roleEnum } from "./enums";
import { parents } from "./students";
import { judges } from "./judges";
import { notifications, notificationPreferences } from "./notifications";

export const users = pgTable("User", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").unique().notNull(),
  passwordHash: text("passwordHash"),
  facebookId: text("facebookId").unique(),
  role: roleEnum("role").default("PARENT").notNull(),
  profileImageUrl: text("profileImageUrl"),
  emailVerified: timestamp("emailVerified", { precision: 3 }),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).defaultNow().notNull(),
});

export const passwordSetupTokens = pgTable("PasswordSetupToken", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expiresAt", { precision: 3 }).notNull(),
  usedAt: timestamp("usedAt", { precision: 3 }),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
});

export const passwordResetTokens = pgTable("PasswordResetToken", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expiresAt", { precision: 3 }).notNull(),
  usedAt: timestamp("usedAt", { precision: 3 }),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
});

export const emailVerificationTokens = pgTable("EmailVerificationToken", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expiresAt", { precision: 3 }).notNull(),
  verifiedAt: timestamp("verifiedAt", { precision: 3 }),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
});

export const profileSetupTokens = pgTable("ProfileSetupToken", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expiresAt", { precision: 3 }).notNull(),
  stage: text("stage").notNull(),
  data: jsonb("data"),
  usedAt: timestamp("usedAt", { precision: 3 }),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  parentProfile: one(parents, {
    fields: [users.id],
    references: [parents.userId],
  }),
  judgeProfile: one(judges, {
    fields: [users.id],
    references: [judges.userId],
  }),
  notifications: many(notifications),
  notificationPreferences: many(notificationPreferences),
  passwordSetupTokens: many(passwordSetupTokens),
  passwordResetTokens: many(passwordResetTokens),
  emailVerificationTokens: many(emailVerificationTokens),
  profileSetupTokens: many(profileSetupTokens),
}));

export const passwordSetupTokensRelations = relations(passwordSetupTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordSetupTokens.userId],
    references: [users.id],
  }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const emailVerificationTokensRelations = relations(emailVerificationTokens, ({ one }) => ({
  user: one(users, {
    fields: [emailVerificationTokens.userId],
    references: [users.id],
  }),
}));

export const profileSetupTokensRelations = relations(profileSetupTokens, ({ one }) => ({
  user: one(users, {
    fields: [profileSetupTokens.userId],
    references: [users.id],
  }),
}));
