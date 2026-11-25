"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import {
  updateProfileSchema,
  changePasswordSchema,
  addressSchema,
  type UpdateProfileInput,
  type ChangePasswordInput,
  type AddressInput,
} from "@/lib/validations/account";

export interface ActionResult<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

/**
 * Updates the authenticated customer's profile name.
 * Strictly verifies authenticated session and applies Zod validation.
 */
export async function updateProfileAction(
  data: UpdateProfileInput
): Promise<ActionResult<{ id: string; name: string | null; email: string | null }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required to update profile." };
    }

    const validation = updateProfileSchema.safeParse(data);
    if (!validation.success) {
      const firstIssue = validation.error.issues[0]?.message || "Invalid profile data";
      return { success: false, error: firstIssue };
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validation.data.name.trim(),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    revalidatePath("/account");
    revalidatePath("/account/profile");

    return {
      success: true,
      message: "Profile updated successfully.",
      data: updatedUser,
    };
  } catch {
    return {
      success: false,
      error: "Unable to update profile at this time. Please try again.",
    };
  }
}

/**
 * Changes the authenticated customer's password.
 * Verifies current password against bcrypt hash, validates new password complexity,
 * and updates hash using 12 salt rounds.
 */
export async function changePasswordAction(
  data: ChangePasswordInput
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required to change password." };
    }

    const validation = changePasswordSchema.safeParse(data);
    if (!validation.success) {
      const firstIssue = validation.error.issues[0]?.message || "Invalid password data";
      return { success: false, error: firstIssue };
    }

    // Retrieve current hash from database (server-only)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return {
        success: false,
        error: "Unable to verify current password credentials.",
      };
    }

    const isCurrentValid = await bcrypt.compare(
      validation.data.currentPassword,
      user.passwordHash
    );

    if (!isCurrentValid) {
      return {
        success: false,
        error: "The current password you entered is incorrect.",
      };
    }

    const newHash = await bcrypt.hash(validation.data.newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        passwordHash: newHash,
      },
    });

    revalidatePath("/account/profile");

    return {
      success: true,
      message: "Password changed successfully. Your account is secured.",
    };
  } catch {
    return {
      success: false,
      error: "Unable to update password at this time. Please try again.",
    };
  }
}

/**
 * Creates a new address for the authenticated customer.
 * Enforces ownership scoping to session.user.id and manages default address toggling atomically.
 */
export async function createAddressAction(data: AddressInput): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required to manage addresses." };
    }

    const validation = addressSchema.safeParse(data);
    if (!validation.success) {
      const firstIssue = validation.error.issues[0]?.message || "Invalid address data";
      return { success: false, error: firstIssue };
    }

    const newAddress = await prisma.$transaction(async (tx) => {
      const existingCount = await tx.address.count({
        where: { userId: session.user.id },
      });

      // If marked default or this is the first address, set as default
      const isDefault = validation.data.isDefault || existingCount === 0;

      if (isDefault && existingCount > 0) {
        await tx.address.updateMany({
          where: { userId: session.user.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          userId: session.user.id,
          fullName: validation.data.fullName.trim(),
          phone: validation.data.phone.trim(),
          street: validation.data.street.trim(),
          apartment: validation.data.apartment?.trim() || null,
          city: validation.data.city.trim(),
          state: validation.data.state.trim(),
          postalCode: validation.data.postalCode.trim(),
          country: validation.data.country.trim(),
          isDefault,
          type: validation.data.type,
        },
      });
    });

    revalidatePath("/account");
    revalidatePath("/account/addresses");

    return {
      success: true,
      message: "Address saved successfully.",
      data: newAddress,
    };
  } catch {
    return {
      success: false,
      error: "Unable to save address at this time. Please try again.",
    };
  }
}

/**
 * Updates an existing address belonging to the authenticated customer.
 * Strictly prevents IDOR by requiring addressId to belong to session.user.id.
 * Executes atomically within a transaction.
 */
export async function updateAddressAction(
  addressId: string,
  data: AddressInput
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required to update address." };
    }

    if (!addressId || typeof addressId !== "string") {
      return { success: false, error: "Valid address identifier is required." };
    }

    const validation = addressSchema.safeParse(data);
    if (!validation.success) {
      const firstIssue = validation.error.issues[0]?.message || "Invalid address data";
      return { success: false, error: firstIssue };
    }

    const updated = await prisma.$transaction(async (tx) => {
      // IDOR Check: Ensure address exists and belongs to the authenticated customer
      const existing = await tx.address.findFirst({
        where: {
          id: addressId,
          userId: session.user.id,
        },
      });

      if (!existing) {
        throw new Error("NOT_FOUND_OR_UNAUTHORIZED");
      }

      const isDefault = validation.data.isDefault;

      if (isDefault) {
        await tx.address.updateMany({
          where: {
            userId: session.user.id,
            isDefault: true,
            id: { not: addressId },
          },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id: addressId },
        data: {
          fullName: validation.data.fullName.trim(),
          phone: validation.data.phone.trim(),
          street: validation.data.street.trim(),
          apartment: validation.data.apartment?.trim() || null,
          city: validation.data.city.trim(),
          state: validation.data.state.trim(),
          postalCode: validation.data.postalCode.trim(),
          country: validation.data.country.trim(),
          isDefault,
          type: validation.data.type,
        },
      });
    });

    revalidatePath("/account");
    revalidatePath("/account/addresses");

    return {
      success: true,
      message: "Address updated successfully.",
      data: updated,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND_OR_UNAUTHORIZED") {
      return {
        success: false,
        error: "Address not found or you do not have permission to modify it.",
      };
    }
    return {
      success: false,
      error: "Unable to update address at this time. Please try again.",
    };
  }
}

/**
 * Deletes an address belonging to the authenticated customer.
 * Strictly prevents IDOR and re-assigns default flag atomically within a transaction.
 */
export async function deleteAddressAction(addressId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required to delete address." };
    }

    if (!addressId || typeof addressId !== "string") {
      return { success: false, error: "Valid address identifier is required." };
    }

    await prisma.$transaction(async (tx) => {
      // IDOR Check
      const existing = await tx.address.findFirst({
        where: {
          id: addressId,
          userId: session.user.id,
        },
      });

      if (!existing) {
        throw new Error("NOT_FOUND_OR_UNAUTHORIZED");
      }

      await tx.address.delete({
        where: { id: addressId },
      });

      // If the deleted address was default, promote the newest remaining address
      if (existing.isDefault) {
        const remaining = await tx.address.findFirst({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
        });
        if (remaining) {
          await tx.address.update({
            where: { id: remaining.id },
            data: { isDefault: true },
          });
        }
      }
    });

    revalidatePath("/account");
    revalidatePath("/account/addresses");

    return {
      success: true,
      message: "Address removed successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND_OR_UNAUTHORIZED") {
      return {
        success: false,
        error: "Address not found or you do not have permission to delete it.",
      };
    }
    return {
      success: false,
      error: "Unable to delete address at this time. Please try again.",
    };
  }
}

/**
 * Sets an address as the default shipping address for the authenticated customer.
 * Strictly prevents IDOR by requiring addressId to belong to session.user.id.
 * Atomic default address swap within a transaction.
 */
export async function setDefaultAddressAction(addressId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required to update default address.",
      };
    }

    if (!addressId || typeof addressId !== "string") {
      return { success: false, error: "Valid address identifier is required." };
    }

    await prisma.$transaction(async (tx) => {
      // IDOR Check
      const existing = await tx.address.findFirst({
        where: {
          id: addressId,
          userId: session.user.id,
        },
      });

      if (!existing) {
        throw new Error("NOT_FOUND_OR_UNAUTHORIZED");
      }

      // Unset all existing defaults
      await tx.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });

      // Set target address as default
      await tx.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      });
    });

    revalidatePath("/account");
    revalidatePath("/account/addresses");

    return {
      success: true,
      message: "Default delivery address updated.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND_OR_UNAUTHORIZED") {
      return {
        success: false,
        error: "Address not found or you do not have permission to modify it.",
      };
    }
    return {
      success: false,
      error: "Unable to update default address at this time. Please try again.",
    };
  }
}
