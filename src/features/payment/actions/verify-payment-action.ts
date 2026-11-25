"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { verifyPaymentAttempt } from "../services/payment-service";
import type { VerifyPaymentResult } from "../types/payment-types";

const verifyPaymentSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
  razorpayOrderId: z.string().min(1, "Razorpay Order ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay Payment ID is required"),
  razorpaySignature: z.string().min(1, "Razorpay Signature is required"),
});

/**
 * Server Action: Verifies Razorpay payment signature and updates payment state.
 *
 * Security Mandates:
 * - Requires active customer session.
 * - IDOR defense: verified against authenticated user.
 * - Constant-time HMAC-SHA256 comparison.
 * - Idempotency guard for repeated verification requests.
 */
export async function verifyPaymentAction(
  rawInput: unknown
): Promise<VerifyPaymentResult> {
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
        paymentId: "",
        orderId: "",
        orderNumber: "",
        status: "FAILED",
        message: "Authentication required to verify payment.",
        error: "UNAUTHENTICATED",
      };
    }

    // 2. Input validation
    const parseResult = verifyPaymentSchema.safeParse(rawInput);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join(", ");
      return {
        success: false,
        paymentId: "",
        orderId: "",
        orderNumber: "",
        status: "FAILED",
        message: `Validation error: ${errorMsg}`,
        error: "INVALID_INPUT",
      };
    }

    // 3. Delegate to payment service
    return await verifyPaymentAttempt(parseResult.data, session.user);
  } catch (err) {
    console.error("[VerifyPaymentAction] Unexpected error:", err);
    return {
      success: false,
      paymentId: "",
      orderId: "",
      orderNumber: "",
      status: "FAILED",
      message:
        "An unexpected error occurred while verifying your payment. Please contact support.",
      error: "INTERNAL_ERROR",
    };
  }
}
