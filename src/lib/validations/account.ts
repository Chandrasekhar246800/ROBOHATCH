import { z } from "zod";
import { passwordSchema } from "./auth";

/**
 * Customer Profile Update Schema
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must not exceed 100 characters"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Customer Password Change Schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Customer Address Validation Schema
 */
export const addressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters long")
    .max(100, "Full name must not exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 characters")
    .regex(
      /^[0-9+\-\s()]{10,15}$/,
      "Please provide a valid phone number (digits, optional +, spaces, hyphens)"
    ),
  street: z
    .string()
    .trim()
    .min(3, "Street address must be at least 3 characters long")
    .max(200, "Street address must not exceed 200 characters"),
  apartment: z
    .string()
    .trim()
    .max(100, "Apartment/suite must not exceed 100 characters")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters long")
    .max(100, "City must not exceed 100 characters"),
  state: z
    .string()
    .trim()
    .min(2, "State/Province must be at least 2 characters long")
    .max(100, "State/Province must not exceed 100 characters"),
  postalCode: z
    .string()
    .trim()
    .min(4, "Postal/PIN code must be at least 4 characters")
    .max(10, "Postal/PIN code must not exceed 10 characters")
    .regex(/^[A-Za-z0-9\s-]{4,10}$/, "Please provide a valid postal/PIN code"),
  country: z
    .string()
    .trim()
    .length(2, "Country code must be a 2-letter ISO code (e.g., IN)")
    .default("IN"),
  isDefault: z.boolean().default(false),
  type: z.enum(["SHIPPING", "BILLING"]).default("SHIPPING"),
});

export type AddressInput = z.infer<typeof addressSchema>;
