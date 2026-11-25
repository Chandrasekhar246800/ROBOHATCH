/**
 * ROBOHATCH PHASE 7D: RAZORPAY TEST MODE PAYMENT INTEGRATION
 */

// Configuration
export {
  getRazorpayConfig,
  getRazorpayClient,
  RazorpayConfigurationError,
} from "./config/razorpay-config";
export type { RazorpayConfig } from "./config/razorpay-config";

// Types
export type {
  InitiatePaymentItemInput,
  InitiatePaymentInput,
  InitiatePaymentResult,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "./types/payment-types";

// Signature Verification
export { verifyRazorpayPaymentSignature } from "./lib/signature-verification";
export type { VerifySignatureParams } from "./lib/signature-verification";

// Server Services
export {
  initiatePaymentAttempt,
  verifyPaymentAttempt,
  cancelPaymentAttempt,
  PaymentInitiationError,
} from "./services/payment-service";

// Server Actions
export { initiatePaymentAction } from "./actions/initiate-payment-action";
export { verifyPaymentAction } from "./actions/verify-payment-action";
export { cancelPaymentAction } from "./actions/cancel-payment-action";

// Client Hook
export { useRazorpay } from "./hooks/use-razorpay";
export type {
  RazorpayOptions,
  RazorpayInstance,
  UseRazorpayProps,
} from "./hooks/use-razorpay";
