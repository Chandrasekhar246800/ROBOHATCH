/**
 * ROBOHATCH PHASE 7C: SERVER-AUTHORITATIVE PRICING & TAX TYPES
 *
 * All monetary amounts are strictly maintained as non-negative integer paise.
 * Zero floating-point representations for financial calculations.
 */

export interface TaxCalculationParams {
  inclusiveAmountInPaise: number | bigint;
  taxRatePercent: number | null | undefined;
  isInterState?: boolean;
  hsnCode?: string;
  taxCategory?: string;
}

export interface TaxCalculationResult {
  inclusiveAmountInPaise: number;
  taxableAmountInPaise: number;
  taxAmountInPaise: number;
  taxRatePercent: number;
  taxRateBps: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  isInterState: boolean;
  hsnCode?: string;
  taxCategory?: string;
}

export type ShippingStatus =
  | "UNCONFIGURED" // Shipping not yet commercially finalized (default)
  | "CONFIGURED" // Shipping successfully calculated
  | "RESTRICTED" // Delivery not available for destination PIN code
  | "CONFIGURATION_ERROR"; // Invalid shipping parameters

export interface ShippingDetails {
  status: ShippingStatus;
  isConfigured: boolean;
  amountInPaise: number | null;
  methodName?: string;
  estimatedDays?: string;
  message: string;
}

export type TaxVerificationStatus = "UNVERIFIED" | "PENDING_REVIEW" | "VERIFIED";

export interface ServerPricingLineItem {
  id: string;
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  variantName?: string;
  color?: string;
  image?: string;
  quantity: number;
  unitPriceInPaise: number;
  lineTotalInPaise: number;
  taxRatePercent: number;
  taxVerificationStatus: TaxVerificationStatus;
  taxableAmountInPaise: number;
  taxAmountInPaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  hsnCode?: string;
  taxCategory?: string;
}

export interface PricingValidationError {
  code:
    | "UNAUTHENTICATED"
    | "PRODUCT_NOT_FOUND"
    | "PRODUCT_INACTIVE"
    | "VARIANT_NOT_FOUND"
    | "VARIANT_MISMATCH"
    | "PRODUCT_OUT_OF_STOCK"
    | "INVALID_QUANTITY"
    | "EMPTY_CART"
    | "TAX_RATE_UNCONFIGURED"
    | "TAX_CONFIGURATION_UNVERIFIED"
    | "MISSING_HSN_CODE"
    | "SELLER_ORIGIN_UNCONFIGURED"
    | "INVALID_DESTINATION_STATE"
    | "INVALID_TAX_RATE"
    | "SHIPPING_UNCONFIGURED"
    | "INVALID_INPUT"
    | "INTERNAL_ERROR";
  message: string;
  productId?: string;
  variantId?: string;
  field?: string;
}

export interface CheckoutPricingResult {
  success: boolean;
  items: ServerPricingLineItem[];
  itemCount: number;
  subtotalInPaise: number;
  taxableAmountInPaise: number;
  gstAmountInPaise: number;
  taxBreakdown: {
    cgstTotalPaise: number;
    sgstTotalPaise: number;
    igstTotalPaise: number;
    isInterState: boolean;
    hasUnconfiguredTax: boolean;
    sellerStateCode?: string;
    destinationStateCode?: string;
  };
  shipping: ShippingDetails;
  isPayable: boolean;
  payableAmountInPaise: number | null;
  validationErrors: PricingValidationError[];
  isGstInclusive: true;
  disclosures: {
    gstNotice: string;
    shippingNotice: string;
  };
}

export interface CheckoutPricingItemInput {
  productId: string;
  variantId?: string;
  color?: string;
  quantity: number;
}

export interface CalculateCheckoutPricingInput {
  userId?: string;
  items: CheckoutPricingItemInput[];
  deliveryAddressId?: string;
  destinationState?: string;
  shippingCalculatorOverride?: import("../lib/shipping-calculation").ShippingCalculator;
  taxRateOverrides?: Record<string, number | null>;
  taxVerificationOverrides?: Record<string, TaxVerificationStatus>;
  hsnCodeOverrides?: Record<string, string | null>;
  sellerOriginOverride?: {
    sellerStateCode: string;
    sellerStateName: string;
    country: string;
    isConfigured: boolean;
  };
}
