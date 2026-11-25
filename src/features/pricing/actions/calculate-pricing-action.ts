"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { calculateCheckoutPricing } from "../services/pricing-service";
import type { CheckoutPricingResult } from "../types/pricing-types";

// Zod Schema for Checkout Pricing Request
const pricingItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().optional(),
  color: z.string().optional(),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(10, "Quantity cannot exceed 10 units per line"),
});

const pricingRequestSchema = z.object({
  items: z.array(pricingItemSchema).min(1, "Cart cannot be empty"),
  deliveryAddressId: z.string().optional(),
});

export type CalculatePricingActionResponse =
  | { success: true; pricing: CheckoutPricingResult }
  | { success: false; error: string; pricing?: CheckoutPricingResult };

/**
 * Server Action: Calculates authoritative checkout pricing for the authenticated customer.
 *
 * Security:
 * - Requires active customer session.
 * - Validates input via Zod.
 * - Masks internal database errors.
 */
export async function calculateCheckoutPricingAction(
  rawInput: unknown
): Promise<CalculatePricingActionResponse> {
  try {
    // 1. Session verification (safely handling standalone CLI contexts)
    let session = null;
    try {
      session = await auth();
    } catch {
      session = null;
    }

    // 2. Input validation via Zod
    const parseResult = pricingRequestSchema.safeParse(rawInput);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join(", ");
      return {
        success: false,
        error: `Validation error: ${errorMsg}`,
      };
    }

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required to calculate checkout pricing.",
      };
    }

    const { items, deliveryAddressId } = parseResult.data;

    // 3. Authoritative pricing calculation
    const pricing = await calculateCheckoutPricing({
      userId: session.user.id,
      items,
      deliveryAddressId,
    });

    if (!pricing.success && pricing.validationErrors.length > 0) {
      return {
        success: false,
        error: pricing.validationErrors[0].message,
        pricing,
      };
    }

    return {
      success: true,
      pricing,
    };
  } catch (err) {
    // Mask internal details; log server-side
    console.error("[CalculatePricingAction] Unexpected error:", err);
    return {
      success: false,
      error:
        "An unexpected error occurred while calculating checkout pricing. Please try again.",
    };
  }
}
