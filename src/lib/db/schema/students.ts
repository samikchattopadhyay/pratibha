import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { users } from "./users";
import { registrations } from "./registrations";
import { qualificationSlots } from "./qualifications";

export const parents = pgTable("Parent", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postalCode"),
  country: text("country").default("India").notNull(),
  profileImageUrl: text("profileImageUrl"),
  preferredState: text("preferredState"),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).defaultNow().notNull(),
});

export const students = pgTable("Student", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  parentId: text("parentId").notNull(),
  name: text("name").notNull(),
  dateOfBirth: timestamp("dateOfBirth", { precision: 3 }).notNull(),
  gender: text("gender").notNull(),
  disciplineInterests: text("disciplineInterests").array().notNull().default(sql`'{}'::text[]`),
  slug: text("slug").unique(),
  profileImageUrl: text("profileImageUrl"),
  bio: text("bio"),
  city: text("city"),
  state: text("state"),
  heightCm: integer("heightCm"),
  hairColor: text("hairColor"),
  eyeColor: text("eyeColor"),
  trainingInstitutes: text("trainingInstitutes").array().notNull().default(sql`'{}'::text[]`),
  languages: text("languages").array().notNull().default(sql`'{}'::text[]`),
  specialSkills: text("specialSkills").array().notNull().default(sql`'{}'::text[]`),
  isPublic: boolean("isPublic").default(false).notNull(),
  schoolClass: text("schoolClass"),
  schoolName: text("schoolName"),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).defaultNow().notNull(),
});

export const externalAchievements = pgTable("ExternalAchievement", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studentId: text("studentId").notNull(),
  title: text("title").notNull(),
  eventName: text("eventName").notNull(),
  category: text("category"),
  year: integer("year").notNull(),
  rank: text("rank"),
  description: text("description"),
  proofUrl: text("proofUrl"),
  displayOrder: integer("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt", { precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).defaultNow().notNull(),
});

// Relations
export const parentsRelations = relations(parents, ({ one, many }) => ({
  user: one(users, {
    fields: [parents.userId],
    references: [users.id],
  }),
  students: many(students),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  parent: one(parents, {
    fields: [students.parentId],
    references: [parents.id],
  }),
  externalAchievements: many(externalAchievements),
  registrations: many(registrations),
  qualificationSlots: many(qualificationSlots),
}));

export const externalAchievementsRelations = relations(externalAchievements, ({ one }) => ({
  student: one(students, {
    fields: [externalAchievements.studentId],
    references: [students.id],
  }),
}));
