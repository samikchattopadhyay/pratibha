import { pgTable, text, timestamp, boolean, integer, unique, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { notificationTypeEnum, notificationChannelEnum, deliveryStatusEnum, deliveryErrorTypeEnum } from "./enums";
import { users } from "./users";

export const notifications = pgTable("Notification", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull(),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  read: boolean("read").default(false).notNull(),
  readAt: timestamp("readAt", { precision: 3 }),
  actionUrl: text("actionUrl"),
  registrationId: text("registrationId"),
  assignmentId: text("assignmentId"),
  certificateId: text("certificateId"),
  qualificationId: text("qualificationId"),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
}, (table) => [
  index("Notification_userId_read_idx").on(table.userId, table.read),
  index("Notification_userId_createdAt_idx").on(table.userId, table.createdAt),
]);

export const notificationPreferences = pgTable("NotificationPreference", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull(),
  type: notificationTypeEnum("type").notNull(),
  channel: notificationChannelEnum("channel").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).defaultNow().notNull(),
}, (table) => [
  unique("NotificationPreference_userId_type_channel_key").on(table.userId, table.type, table.channel),
  index("NotificationPreference_userId_idx").on(table.userId),
]);

export const telegramMessageDeliveries = pgTable("TelegramMessageDelivery", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  notificationId: text("notificationId").notNull().unique(),
  chatId: text("chatId").notNull(),
  messageId: text("messageId"),
  status: deliveryStatusEnum("status").default("QUEUED").notNull(),
  errorType: deliveryErrorTypeEnum("errorType"),
  errorCode: text("errorCode"),
  errorMessage: text("errorMessage"),
  sentAt: timestamp("sentAt", { precision: 3 }),
  failureCount: integer("failureCount").default(0).notNull(),
  lastAttemptAt: timestamp("lastAttemptAt", { precision: 3 }),
  nextRetryAt: timestamp("nextRetryAt", { precision: 3 }),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).defaultNow().notNull(),
}, (table) => [
  index("TelegramMessageDelivery_status_idx").on(table.status),
  index("TelegramMessageDelivery_status_nextRetryAt_idx").on(table.status, table.nextRetryAt),
  index("TelegramMessageDelivery_chatId_idx").on(table.chatId),
  index("TelegramMessageDelivery_createdAt_idx").on(table.createdAt),
]);

// Relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  telegramDelivery: one(telegramMessageDeliveries, {
    fields: [notifications.id],
    references: [telegramMessageDeliveries.notificationId],
  }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}));

export const telegramMessageDeliveriesRelations = relations(telegramMessageDeliveries, ({ one }) => ({
  notification: one(notifications, {
    fields: [telegramMessageDeliveries.notificationId],
    references: [notifications.id],
  }),
}));
