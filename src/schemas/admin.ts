import { z } from "zod";

// Judge Form Modal Schema
export const judgeSchema = z.object({
  name: z
    .string()
    .min(1, "Judge name is required")
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name is too long"),
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required"),
  tier: z
    .string()
    .min(1, "Please select a tier"),
  specializations: z
    .array(z.string())
    .min(1, "Select at least one specialization")
    .max(20, "Cannot select more than 20 specializations"),
  bio: z
    .string()
    .min(1, "Bio is required")
    .min(10, "Bio must be at least 10 characters")
    .max(2000, "Bio is too long"),
  credentials: z
    .string()
    .min(1, "Credentials are required")
    .min(10, "Credentials must be at least 10 characters")
    .max(2000, "Credentials are too long"),
  stateOfResidence: z
    .string()
    .min(1, "State of residence is required"),
  states: z
    .array(z.string())
    .min(1, "Select at least one state")
    .max(28, "Cannot select more than 28 states"),
  languages: z
    .array(z.string())
    .min(1, "Select at least one language")
    .max(20, "Cannot select more than 20 languages"),
  yearsOfExperience: z
    .number()
    .min(0, "Years must be 0 or greater")
    .max(70, "Years cannot exceed 70")
    .nullable()
    .optional(),
  isVerified: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
});

export type JudgeFormData = z.infer<typeof judgeSchema>;

// Competition Creation Wizard Schema
export const competitionSchema = z.object({
  // Step 1 — Basic Details
  title: z
    .string()
    .min(1, "Competition title is required")
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description is too long"),
  scope: z
    .enum(["STATE", "NATIONAL"])
    .refine((val) => val, "Please select a valid scope"),
  eligibleStates: z
    .array(z.string())
    .min(1, "Select at least one eligible state"),
  registrationDeadline: z
    .string()
    .min(1, "Registration deadline is required")
    .refine((date) => new Date(date) > new Date(), "Deadline must be in the future"),
  startDate: z
    .string()
    .min(1, "Start date is required")
    .refine((date) => new Date(date) > new Date(), "Start date must be in the future"),
  endDate: z
    .string()
    .min(1, "End date is required"),
  resultDate: z
    .string()
    .min(1, "Result date is required"),

  // Step 2 — Categories & Eligibility
  categoryId: z
    .string()
    .min(1, "Please select a category"),
  categoryName: z
    .string()
    .min(1, "Category name is required"),
  minAge: z
    .number()
    .min(0, "Minimum age must be 0 or greater")
    .max(120, "Invalid age"),
  maxAge: z
    .number()
    .min(1, "Maximum age must be at least 1")
    .max(120, "Invalid age"),
  language: z
    .string()
    .min(1, "Please select a language"),

  // Step 3 — Entry Details
  entryFeeINR: z
    .number()
    .min(0, "Entry fee must be 0 or greater")
    .max(100000, "Entry fee cannot exceed 100,000"),
  maxEntriesPerStudent: z
    .number()
    .min(1, "Must allow at least 1 entry")
    .max(100, "Cannot exceed 100 entries"),

  // Step 4 — Judging Criteria
  scoringCriteria: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
        max: z.number().min(1).max(100),
        description: z.string().optional(),
      })
    )
    .min(1, "Add at least one scoring criterion"),

  // Step 5 — Prizes
  prizes: z
    .array(
      z.object({
        rank: z.string(),
        type: z.string(),
        title: z.string(),
        description: z.string().optional(),
        estimatedValue: z.string().optional(),
      })
    )
    .min(1, "Add at least one prize"),

  // Step 6 — Banner & Media
  bannerTemplateId: z
    .string()
    .min(1, "Please select a banner template"),

  // Step 7 & 8 — Additional
  judgeIds: z
    .array(z.string())
    .min(1, "Assign at least one judge"),
  tags: z
    .array(z.string())
    .max(20, "Cannot add more than 20 tags")
    .optional()
    .default([]),
  isActive: z.boolean().default(true),
  difficultyLevel: z
    .number()
    .min(1, "Difficulty level must be at least 1")
    .max(5, "Difficulty level cannot exceed 5")
    .default(1),
  capacity: z
    .number()
    .min(1, "Capacity must be at least 1")
    .nullable()
    .optional(),
  facebookGroupUrl: z
    .string()
    .url("Invalid Facebook Group URL")
    .or(z.literal(""))
    .nullable()
    .optional(),
  rules: z
    .string()
    .min(10, "Rules must be at least 10 characters")
    .or(z.literal(""))
    .nullable()
    .optional(),
});

export type CompetitionFormData = z.infer<typeof competitionSchema>;

// Admin Settings Tab Schema
export const settingsSchema = z.object({
  whatsappUrl: z
    .string()
    .url("Invalid URL")
    .optional()
    .or(z.literal("")),
  contactEmail: z
    .string()
    .email("Invalid email")
    .min(1, "Contact email is required"),
  allowNewRegistrations: z.boolean().default(true),
  bannerTemplates: z
    .array(z.string())
    .min(1, "Select at least one banner template"),
  categoryGrouping: z
    .array(z.string())
    .min(1, "Select at least one category grouping"),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

// External Achievement Modal Schema
export const achievementSchema = z.object({
  title: z
    .string()
    .min(1, "Achievement title is required")
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title is too long"),
  eventName: z
    .string()
    .min(1, "Event name is required")
    .min(3, "Event name must be at least 3 characters")
    .max(255, "Event name is too long"),
  category: z
    .string()
    .min(1, "Please select a category"),
  year: z
    .string()
    .min(4, "Year must be valid")
    .max(4, "Year must be 4 digits")
    .refine(
      (year) => {
        const y = parseInt(year);
        const currentYear = new Date().getFullYear();
        return y >= 1900 && y <= currentYear;
      },
      "Year must be between 1900 and current year"
    ),
  rank: z
    .string()
    .min(1, "Please select a rank/position"),
  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description is too long"),
  proofUrl: z
    .string()
    .url("Invalid URL")
    .min(1, "Proof URL is required"),
});

export type AchievementFormData = z.infer<typeof achievementSchema>;

// Contact Form Schema
export const contactSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name is too long"),
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .min(3, "Subject must be at least 3 characters")
    .max(255, "Subject is too long"),
  message: z
    .string()
    .min(1, "Message is required")
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message is too long"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
