/**
 * ROBOHATCH PHASE 7D: RAZORPAY PAYMENT SIGNATURE VERIFICATION
 *
 * Security Mandates:
 * 1. HMAC-SHA256 signature generation: HMAC_SHA256(order_id + "|" + payment_id, secret).
 * 2. Constant-time comparison using crypto.timingSafeEqual to eliminate timing attack vectors.
 * 3. Reject empty, malformed, or mismatched signatures.
 */

import crypto from "crypto";

export interface VerifySignatureParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  secret: string;
}

/**
 * Validates a Razorpay payment signature in constant time using HMAC-SHA256.
 */
export function verifyRazorpayPaymentSignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  secret,
}: VerifySignatureParams): boolean {
  if (
    !razorpayOrderId ||
    !razorpayPaymentId ||
    !razorpaySignature ||
    !secret ||
    typeof razorpaySignature !== "string"
  ) {
    return false;
  }

  const payload = `${razorpayOrderId.trim()}|${razorpayPaymentId.trim()}`;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  // Constant-time comparison
  const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
  const receivedBuffer = Buffer.from(razorpaySignature.trim(), "utf-8");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}
