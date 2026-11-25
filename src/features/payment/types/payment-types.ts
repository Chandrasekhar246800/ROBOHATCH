/**
 * ROBOHATCH PHASE 7D: PAYMENT INTEGRATION TYPES (RAZORPAY TEST MODE)
 */

export interface InitiatePaymentItemInput {
  productId: string;
  variantId?: string;
  color?: string;
  quantity: number;
}

export interface InitiatePaymentInput {
  items: InitiatePaymentItemInput[];
  deliveryAddressId: string;
  notes?: string;
  idempotencyKey?: string;
  // Test overrides for controlled QA test harness
  testOverrides?: {
    taxVerificationOverrides?: Record<
      string,
      "UNVERIFIED" | "PENDING_REVIEW" | "VERIFIED"
    >;
    taxRateOverrides?: Record<string, number | null>;
    hsnCodeOverrides?: Record<string, string | null>;
    shippingCalculatorOverride?: import("@/features/pricing").ShippingCalculator;
    sellerOriginOverride?: {
      sellerStateCode: string;
      sellerStateName: string;
      country: string;
      isConfigured: boolean;
    };
    razorpayClientOverride?: {
      orders: {
        create: (params: {
          amount: number;
          currency: string;
          receipt: string;
          notes?: Record<string, string>;
        }) => Promise<{ id: string; amount: number; currency: string; receipt: string }>;
      };
      payments?: {
        fetch: (paymentId: string) => Promise<{
          id: string;
          status: "authorized" | "captured" | "failed";
          amount: number;
          currency: string;
          order_id: string;
          method?: string;
          error_code?: string | null;
          error_description?: string | null;
        }>;
      };
    };
  };
}

export interface InitiatePaymentResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  paymentId?: string;
  razorpayOrderId?: string;
  amountInPaise?: number;
  currency?: string;
  keyId?: string;
  customer?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  disclosures?: {
    isTestMode: boolean;
    message: string;
  };
  error?: string;
  validationErrors?: Array<{
    code: string;
    message: string;
    productId?: string;
  }>;
}

export interface VerifyPaymentInput {
  paymentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  testOverrides?: {
    razorpayClientOverride?: {
      payments?: {
        fetch: (paymentId: string) => Promise<{
          id: string;
          status: "authorized" | "captured" | "failed";
          amount: number;
          currency: string;
          order_id: string;
          method?: string;
          error_code?: string | null;
          error_description?: string | null;
        }>;
      };
    };
  };
}

export interface VerifyPaymentResult {
  success: boolean;
  paymentId: string;
  orderId: string;
  orderNumber: string;
  status: "PENDING" | "SUCCESSFUL" | "FAILED";
  providerStatus?: "authorized" | "captured" | "failed" | "unknown";
  isAuthorized?: boolean;
  isCaptured?: boolean;
  message: string;
  error?: string;
}
