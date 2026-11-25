"use server";

import { registerCustomer, type RegisterResult } from "./register";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

/**
 * Server Action for user registration.
 * Validates input on the server, hashes the password, and creates the customer record.
 */
export async function registerUserAction(input: RegisterInput): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message || "Invalid registration data";
    return {
      success: false,
      error: firstIssue,
    };
  }

  return await registerCustomer(parsed.data);
}
