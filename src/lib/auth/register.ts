import { prisma } from "../prisma";
import { registerSchema, type RegisterInput } from "../validations/auth";
import { hashPassword } from "./password";
import type { Role } from "@prisma/client";

export interface SanitizedUser {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  createdAt: Date;
}

export interface RegisterResult {
  success: boolean;
  user?: SanitizedUser;
  error?: string;
}

/**
 * Server-side user registration service.
 * Enforces input validation, duplicate email checks, password hashing, and returns
 * a strictly sanitized user record with zero sensitive credentials exposed.
 *
 * @param input Raw registration payload from client/form.
 */
export async function registerCustomer(input: RegisterInput): Promise<RegisterResult> {
  // 1. Strict server-side Zod validation
  const validation = registerSchema.safeParse(input);
  if (!validation.success) {
    const firstError = validation.error.issues[0]?.message || "Invalid registration data";
    return {
      success: false,
      error: firstError,
    };
  }

  const { name, email, password } = validation.data;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    // 2. Check for duplicate email registration
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email address already exists.",
      };
    }

    // 3. Securely hash password with bcrypt (12 rounds)
    const passwordHash = await hashPassword(password);

    // 4. Create new customer user record
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "CUSTOMER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      user: newUser,
    };
  } catch (error) {
    // Catch database errors without exposing internal driver details or stack traces
    console.error(
      "[Registration] Database error during registration:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return {
      success: false,
      error:
        "Unable to complete registration at this time. Please ensure the database is connected or try again later.",
    };
  }
}
