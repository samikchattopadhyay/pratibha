import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name is too long"),
  phone: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^(\+91|0)?[6-9]\d{9}$/, "Invalid Indian phone number"),
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const verifyEmailSchema = z.object({
  code: z
    .string()
    .min(1, "Verification code is required")
    .length(6, "Code must be 6 characters"),
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

export const setupOnboardingSchema = z.object({
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^(\+91|0)?[6-9]\d{9}$/, "Invalid Indian phone number"),
  address: z
    .string()
    .min(1, "Address is required")
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address is too long"),
});

export type SetupOnboardingFormData = z.infer<typeof setupOnboardingSchema>;

export const setupPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SetupPasswordFormData = z.infer<typeof setupPasswordSchema>;

export const setupPhoneSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^(\+91|0)?[6-9]\d{9}$/, "Invalid Indian phone number"),
});

export type SetupPhoneFormData = z.infer<typeof setupPhoneSchema>;

export const setupAddressSchema = z.object({
  address: z
    .string()
    .min(1, "Street address is required")
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
  postalCode: z
    .string()
    .min(1, "PIN Code is required")
    .regex(/^\d{6}$/, "PIN Code must be exactly 6 digits"),
  preferredState: z
    .string()
    .optional()
    .or(z.literal("")),
});

export type SetupAddressFormData = z.infer<typeof setupAddressSchema>;

