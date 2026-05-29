import { z } from "zod";

// Entry Registration Schema (for RegisterEntry form)
export const entryRegistrationSchema = z.object({
  studentId: z
    .string()
    .min(1, "Please select a student profile"),
  categoryId: z
    .string()
    .min(1, "Please select a competition category"),
  fbUrl: z
    .string()
    .min(1, "Please paste the Facebook video URL")
    .regex(
      /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch|fb\.gg)\/.+$/i,
      "Invalid link structure. Make sure you copy a valid Facebook post or video URL."
    ),
});

export type EntryRegistrationFormData = z.infer<typeof entryRegistrationSchema>;

// Student Profile Creation Schema (for AddStudentWizard)
export const studentFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name is too long"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const dobDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - dobDate.getFullYear();
      return age >= 3 && age <= 25;
    }, "Student must be between 3 and 25 years old"),
  gender: z
    .string()
    .min(1, "Please select a gender"),
  slug: z
    .string()
    .or(z.literal(""))
    .optional()
    .refine((val) => !val || (val.length >= 3 && val.length <= 50 && /^[a-z0-9-]+$/.test(val)), {
      message: "Slug must be between 3 and 50 characters and contain only lowercase letters, numbers, and hyphens",
    }),
  schoolClass: z
    .string()
    .or(z.literal(""))
    .optional(),
  schoolName: z
    .string()
    .or(z.literal(""))
    .optional()
    .refine((val) => !val || val.length >= 2, {
      message: "School name must be at least 2 characters",
    }),
  city: z
    .string()
    .min(1, "City is required")
    .min(2, "City must be at least 2 characters")
    .max(100, "City name is too long"),
  state: z
    .string()
    .min(1, "State is required"),
  profileImageUrl: z
    .string()
    .or(z.literal(""))
    .optional()
    .default(""),
  bio: z
    .string()
    .max(1000, "Bio is too long")
    .optional()
    .default(""),
  disciplineInterests: z
    .array(z.string())
    .min(1, "Select at least one discipline interest")
    .max(10, "Cannot select more than 10 disciplines"),
  languages: z
    .array(z.string())
    .min(1, "Select at least one language")
    .max(10, "Cannot select more than 10 languages"),
  categoryGrouping: z
    .array(z.string())
    .default([]),
  trainingInstitutes: z
    .array(z.string())
    .max(20, "Cannot add more than 20 training institutes")
    .default([]),
  specialSkills: z
    .array(z.string())
    .max(20, "Cannot add more than 20 special skills")
    .default([]),
});

export type StudentFormData = z.infer<typeof studentFormSchema>;

// Email Verification Schema
export const emailVerificationSchema = z.object({
  code: z
    .string()
    .min(1, "Verification code is required")
    .length(6, "Code must be 6 characters"),
});

export type EmailVerificationFormData = z.infer<typeof emailVerificationSchema>;

// Profile Completion Modal Schema
// Note: Field mapping in component is: profileImageUrl→address, bio→preferredState
export const profileCompletionSchema = z.object({
  profileImageUrl: z
    .string()
    .min(1, "Address is required")
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address is too long"),
  city: z
    .string()
    .min(1, "City is required")
    .min(2, "City must be at least 2 characters")
    .max(100, "City name is too long"),
  state: z
    .string()
    .min(1, "State is required"),
  bio: z
    .string()
    .max(1000, "Preferred state information is too long")
    .optional(),
});

export type ProfileCompletionFormData = z.infer<typeof profileCompletionSchema>;
