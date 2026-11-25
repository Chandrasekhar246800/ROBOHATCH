"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { cancelPaymentAttempt } from "../services/payment-service";

const cancelPaymentSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
});

/**
 * Server Action: Records customer dismissal / cancellation of the Razorpay modal.
 */
export async function cancelPaymentAction(
  rawInput: unknown
): Promise<{ success: boolean; message: string }> {
  try {
    let session = null;
    try {
      session = await auth();
    } catch {
      session = null;
    }

    if (!session?.user?.id) {
      return { success: false, message: "Authentication required." };
    }

    const parseResult = cancelPaymentSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return { success: false, message: "Invalid payment ID." };
    }

    return await cancelPaymentAttempt(parseResult.data.paymentId, session.user);
  } catch (err) {
    console.error("[CancelPaymentAction] Error:", err);
    return { success: false, message: "Failed to record payment cancellation." };
  }
}
