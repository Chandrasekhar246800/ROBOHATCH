"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { initiatePaymentAttempt } from "../services/payment-service";
import type { InitiatePaymentResult } from "../types/payment-types";

const paymentItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().optional(),
  color: z.string().optional(),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(10, "Quantity cannot exceed 10 units per line"),
});

const initiatePaymentSchema = z.object({
  items: z.array(paymentItemSchema).min(1, "Cart cannot be empty"),
  deliveryAddressId: z.string().min(1, "Delivery address is required"),
  notes: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

/**
 * Server Action: Initiates a Razorpay payment attempt for the authenticated customer.
 *
 * Security Mandates:
 * - Requires active customer session.
 * - Strict Zod validation on all inputs.
 * - Server recalculates authoritative totals (tamper-proof).
 * - Masks internal database exceptions from client responses.
 */
export async function initiatePaymentAction(
  rawInput: unknown
): Promise<InitiatePaymentResult> {
  try {
    // 1. Session verification
    let session = null;
    try {
      session = await auth();
    } catch {
      session = null;
    }

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required to initiate checkout payment.",
      };
    }

    // 2. Input validation
    const parseResult = initiatePaymentSchema.safeParse(rawInput);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join(", ");
      return {
        success: false,
        error: `Validation error: ${errorMsg}`,
      };
    }

    const { items, deliveryAddressId, notes, idempotencyKey } = parseResult.data;

    // 3. Delegate to payment service
    return await initiatePaymentAttempt(
      {
        items,
        deliveryAddressId,
        notes,
        idempotencyKey,
      },
      session.user
    );
  } catch (err) {
    console.error("[InitiatePaymentAction] Unexpected error:", err);
    return {
      success: false,
      error:
        "An unexpected error occurred while initiating your payment. Please try again or contact support.",
    };
  }
}
