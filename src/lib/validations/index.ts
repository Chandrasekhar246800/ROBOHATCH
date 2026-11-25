import { z } from "zod";

/**
 * Server-side Environment Variables Schema
 */
export const serverEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL must be a valid PostgreSQL connection string"),
  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET should be at least 32 characters long")
    .optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
});

/**
 * Common query params schema
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  search: z.string().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "featured"]).optional(),
});

/**
 * Generic CUID / UUID validation
 */
export const idParamSchema = z.object({
  id: z.string().min(1, "Identifier is required"),
});

export * from "./auth";
export * from "./account";
