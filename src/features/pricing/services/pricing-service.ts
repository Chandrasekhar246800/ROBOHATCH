/**
 * ROBOHATCH PHASE 7C: SERVER-AUTHORITATIVE CHECKOUT PRICING SERVICE
 *
 * Security, Regulatory & Financial Mandates:
 * 1. NEVER trust client-supplied prices, subtotals, tax rates, or shipping amounts.
 * 2. Fetch authoritative prices, variants, and tax status directly from PostgreSQL via Prisma.
 * 3. Enforce strict quantity bounds (1 to 10 per line item).
 * 4. Verify explicit tax verification status (UNVERIFIED, PENDING_REVIEW, VERIFIED).
 *    Unverified tax configurations strictly PREVENT payable checkout calculations.
 * 5. Require valid HSN codes and configured GST rates; never invent tax parameters.
 * 6. Server-authoritative seller origin state; strictly validate destination states against
 *    official Indian States/UTs from customer's delivery address.
 * 7. Exact Decimal-to-paise arithmetic without floating-point drift.
 */

import { prisma } from "@/lib/prisma";
import { extractGstFromInclusivePaise } from "../lib/tax-calculation";
import { getActiveShippingCalculator } from "../lib/shipping-calculation";
import { decimalToPaiseExact } from "../lib/financial-precision";
import { getSellerOriginConfig, normalizeIndianState } from "../config/seller-config";
import type {
  CalculateCheckoutPricingInput,
  CheckoutPricingResult,
  ServerPricingLineItem,
  PricingValidationError,
  TaxVerificationStatus,
} from "../types/pricing-types";

/**
 * Calculates authoritative checkout pricing using PostgreSQL catalog data.
 */
export async function calculateCheckoutPricing(
  input: CalculateCheckoutPricingInput
): Promise<CheckoutPricingResult> {
  const isProduction = process.env.NODE_ENV === "production";

  // Production Security Hardening: In production mode, all QA overrides are strictly prohibited
  // to ensure zero bypass of GST classification and shipping configuration gates.
  const { items: rawItems, deliveryAddressId } = input;

  const shippingCalculatorOverride = isProduction
    ? undefined
    : input.shippingCalculatorOverride;
  const taxRateOverrides = isProduction ? undefined : input.taxRateOverrides;
  const taxVerificationOverrides = isProduction
    ? undefined
    : input.taxVerificationOverrides;
  const hsnCodeOverrides = isProduction ? undefined : input.hsnCodeOverrides;
  const sellerOriginOverride = isProduction ? undefined : input.sellerOriginOverride;

  const validationErrors: PricingValidationError[] = [];
  const lineItems: ServerPricingLineItem[] = [];

  // 1. Guard against empty cart input
  if (!rawItems || rawItems.length === 0) {
    const unconfiguredShipping = (
      shippingCalculatorOverride || getActiveShippingCalculator()
    ).calculateShipping({
      items: [],
      subtotalInPaise: 0,
      deliveryAddress: null,
    });

    const shippingDetails =
      unconfiguredShipping instanceof Promise
        ? await unconfiguredShipping
        : unconfiguredShipping;

    return {
      success: false,
      items: [],
      itemCount: 0,
      subtotalInPaise: 0,
      taxableAmountInPaise: 0,
      gstAmountInPaise: 0,
      taxBreakdown: {
        cgstTotalPaise: 0,
        sgstTotalPaise: 0,
        igstTotalPaise: 0,
        isInterState: false,
        hasUnconfiguredTax: false,
      },
      shipping: shippingDetails,
      isPayable: false,
      payableAmountInPaise: null,
      validationErrors: [
        {
          code: "EMPTY_CART",
          message: "Cart is empty. Add products to calculate checkout pricing.",
        },
      ],
      isGstInclusive: true,
      disclosures: {
        gstNotice: "Product prices are inclusive of applicable GST.",
        shippingNotice: "Shipping charges are pending commercial finalization.",
      },
    };
  }

  // 2. Server-Authoritative Seller Origin Resolution
  const sellerConfig = sellerOriginOverride || getSellerOriginConfig();
  if (!sellerConfig.isConfigured || !sellerConfig.sellerStateCode) {
    validationErrors.push({
      code: "SELLER_ORIGIN_UNCONFIGURED",
      message:
        "Seller origin state is not configured on the server. Tax jurisdiction breakdown (CGST/SGST vs IGST) cannot be determined.",
    });
  }

  // 3. Destination State Resolution strictly from Customer's Delivery Address in DB
  let resolvedStateCode: string | undefined;
  let resolvedStateName: string | undefined;
  let resolvedPostalCode: string | undefined;
  let isInterState = false;

  if (deliveryAddressId) {
    try {
      const address = await prisma.address.findUnique({
        where: { id: deliveryAddressId },
      });
      if (address) {
        resolvedPostalCode = address.postalCode.trim();
        const normalized = normalizeIndianState(address.state);
        if (!normalized) {
          validationErrors.push({
            code: "INVALID_DESTINATION_STATE",
            message: `Destination state "${address.state}" in delivery address is not a recognized Indian state or Union Territory.`,
          });
        } else {
          resolvedStateCode = normalized.code;
          resolvedStateName = normalized.name;
          if (sellerConfig.isConfigured) {
            isInterState = normalized.code !== sellerConfig.sellerStateCode;
          }
        }
      }
    } catch (dbErr) {
      console.error("[PricingService] Failed to lookup delivery address:", dbErr);
    }
  }

  // 4. Extract unique product IDs from input
  const productIds = Array.from(
    new Set(rawItems.map((i) => i.productId).filter(Boolean))
  );

  // 5. Authoritative fetch from PostgreSQL
  const dbProducts = await prisma.product.findMany({
    where: {
      id: { in: productIds },
    },
    include: {
      variants: true,
      images: { where: { isPrimary: true }, take: 1 },
    },
  });

  const productMap = new Map(dbProducts.map((p) => [p.id, p]));

  let subtotalInPaise = 0;
  let totalTaxableInPaise = 0;
  let totalGstInPaise = 0;
  let totalCgstInPaise = 0;
  let totalSgstInPaise = 0;
  let totalIgstInPaise = 0;
  let totalItemCount = 0;
  let hasUnconfiguredTax = false;

  // 6. Validate each item against PostgreSQL source of truth
  for (let idx = 0; idx < rawItems.length; idx++) {
    const itemInput = rawItems[idx];
    const { productId, variantId, color, quantity } = itemInput;

    // A. Quantity validation
    const numQty = Number(quantity);
    if (!Number.isInteger(numQty) || numQty < 1 || numQty > 10) {
      validationErrors.push({
        code: "INVALID_QUANTITY",
        message: `Invalid quantity for item ${idx + 1}. Must be an integer between 1 and 10.`,
        productId,
        field: "quantity",
      });
      continue;
    }

    // B. Product existence
    const product = productMap.get(productId);
    if (!product) {
      validationErrors.push({
        code: "PRODUCT_NOT_FOUND",
        message: `Product with ID "${productId}" does not exist in catalog.`,
        productId,
      });
      continue;
    }

    // C. Product active status
    if (!product.isActive) {
      validationErrors.push({
        code: "PRODUCT_INACTIVE",
        message: `Product "${product.name}" is currently inactive.`,
        productId,
      });
      continue;
    }

    // D. Variant validation
    let resolvedVariant = null;
    if (variantId && variantId !== "default") {
      resolvedVariant = product.variants.find((v) => v.id === variantId);
      if (!resolvedVariant) {
        validationErrors.push({
          code: "VARIANT_NOT_FOUND",
          message: `Variant ID "${variantId}" does not exist for product "${product.name}".`,
          productId,
          variantId,
        });
        continue;
      }
    } else if (color) {
      resolvedVariant = product.variants.find(
        (v) =>
          v.color?.toLowerCase() === color.toLowerCase() ||
          v.name.toLowerCase() === color.toLowerCase()
      );
      if (!resolvedVariant && product.variants.length > 0) {
        validationErrors.push({
          code: "VARIANT_NOT_FOUND",
          message: `Colorway "${color}" is not available for product "${product.name}".`,
          productId,
        });
        continue;
      }
    }

    // E. Stock Availability
    const isProductOutOfStock =
      (product.metadata as Record<string, unknown>)?.availability === "Out of Stock";
    const isVariantOutOfStock = resolvedVariant && resolvedVariant.stock <= 0;

    if (isProductOutOfStock || isVariantOutOfStock) {
      validationErrors.push({
        code: "PRODUCT_OUT_OF_STOCK",
        message: `Product "${product.name}"${resolvedVariant ? ` (${resolvedVariant.name})` : ""} is currently out of stock.`,
        productId,
        variantId: resolvedVariant?.id,
      });
      continue;
    }

    // F. Authoritative Price Resolution via exact Decimal-to-Paise conversion
    const unitPriceDecimal = resolvedVariant ? resolvedVariant.price : product.basePrice;
    const unitPriceInPaise = decimalToPaiseExact(unitPriceDecimal);
    const lineTotalInPaise = unitPriceInPaise * numQty;

    // G. Tax Verification & Configuration Audit
    const effectiveVerificationStatus: TaxVerificationStatus =
      taxVerificationOverrides && productId in taxVerificationOverrides
        ? taxVerificationOverrides[productId]
        : (product.taxVerificationStatus as TaxVerificationStatus) || "UNVERIFIED";

    if (effectiveVerificationStatus !== "VERIFIED") {
      hasUnconfiguredTax = true;
      validationErrors.push({
        code: "TAX_CONFIGURATION_UNVERIFIED",
        message: `Tax classification for product "${product.name}" (ID: ${product.id}) is unverified (status: ${effectiveVerificationStatus}). In accordance with Indian GST compliance, unverified tax configurations cannot be used to calculate a final payable checkout amount.`,
        productId,
      });
      continue;
    }

    // H. Tax Rate Resolution
    const effectiveTaxRate: number | null | undefined =
      taxRateOverrides && productId in taxRateOverrides
        ? taxRateOverrides[productId]
        : product.taxRate !== null && product.taxRate !== undefined
          ? Number(product.taxRate)
          : null;

    if (
      effectiveTaxRate === null ||
      effectiveTaxRate === undefined ||
      isNaN(effectiveTaxRate)
    ) {
      hasUnconfiguredTax = true;
      validationErrors.push({
        code: "TAX_RATE_UNCONFIGURED",
        message: `GST rate is not configured for product "${product.name}" (ID: ${product.id}). Final tax calculation cannot proceed with an unconfigured rate.`,
        productId,
      });
      continue;
    }

    // I. HSN Code Resolution
    const effectiveHsnCode: string | null | undefined =
      hsnCodeOverrides && productId in hsnCodeOverrides
        ? hsnCodeOverrides[productId]
        : product.hsnCode || null;

    if (!effectiveHsnCode || !effectiveHsnCode.trim()) {
      hasUnconfiguredTax = true;
      validationErrors.push({
        code: "MISSING_HSN_CODE",
        message: `HSN code is not configured for product "${product.name}" (ID: ${product.id}). Tax invoice snapshot cannot be completed without an official HSN classification.`,
        productId,
      });
      continue;
    }

    // J. Perform Exact GST Extraction from Inclusive Price
    let taxResult;
    try {
      taxResult = extractGstFromInclusivePaise({
        inclusiveAmountInPaise: lineTotalInPaise,
        taxRatePercent: effectiveTaxRate,
        isInterState,
        hsnCode: effectiveHsnCode,
        taxCategory: product.taxCategory || undefined,
      });
    } catch (taxErr) {
      validationErrors.push({
        code: "INVALID_TAX_RATE",
        message: `Failed to extract GST for product "${product.name}": ${(taxErr as Error).message}`,
        productId,
      });
      continue;
    }

    // Accumulate totals
    subtotalInPaise += lineTotalInPaise;
    totalTaxableInPaise += taxResult.taxableAmountInPaise;
    totalGstInPaise += taxResult.taxAmountInPaise;
    totalCgstInPaise += taxResult.cgstPaise;
    totalSgstInPaise += taxResult.sgstPaise;
    totalIgstInPaise += taxResult.igstPaise;
    totalItemCount += numQty;

    const primaryImage = product.images[0]?.url || "/images/placeholder.jpg";

    lineItems.push({
      id: `${product.id}__${resolvedVariant?.id || "default"}`,
      productId: product.id,
      variantId: resolvedVariant?.id || "default",
      sku: resolvedVariant?.sku || `RH-${product.id.toUpperCase()}-DEF`,
      name: product.name,
      variantName: resolvedVariant?.name,
      color: resolvedVariant?.color || undefined,
      image: primaryImage,
      quantity: numQty,
      unitPriceInPaise,
      lineTotalInPaise,
      taxRatePercent: effectiveTaxRate,
      taxVerificationStatus: effectiveVerificationStatus,
      taxableAmountInPaise: taxResult.taxableAmountInPaise,
      taxAmountInPaise: taxResult.taxAmountInPaise,
      cgstPaise: taxResult.cgstPaise,
      sgstPaise: taxResult.sgstPaise,
      igstPaise: taxResult.igstPaise,
      hsnCode: effectiveHsnCode,
      taxCategory: product.taxCategory || undefined,
    });
  }

  // 7. Shipping Calculation via Strategy Pattern
  const shippingCalculator = shippingCalculatorOverride || getActiveShippingCalculator();

  const shippingParams = {
    items: lineItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
    subtotalInPaise,
    deliveryAddress: resolvedPostalCode
      ? {
          postalCode: resolvedPostalCode,
          state: resolvedStateName || resolvedStateCode,
        }
      : null,
  };

  const shippingResult = shippingCalculator.calculateShipping(shippingParams);
  const shipping =
    shippingResult instanceof Promise ? await shippingResult : shippingResult;

  // 8. Determine Final Payable Status
  // Conditions for a final payable checkout total:
  // - At least one valid line item
  // - Zero validation errors
  // - No unconfigured / unverified tax rates
  // - Valid seller origin configured
  // - Shipping is configured (isConfigured === true and amountInPaise !== null)
  const isAllValid = lineItems.length > 0 && validationErrors.length === 0;
  const isShippingPayable = shipping.isConfigured && shipping.amountInPaise !== null;
  const isPayable =
    isAllValid && !hasUnconfiguredTax && isShippingPayable && sellerConfig.isConfigured;

  const payableAmountInPaise = isPayable
    ? subtotalInPaise + (shipping.amountInPaise || 0)
    : null;

  return {
    success: isAllValid,
    items: lineItems,
    itemCount: totalItemCount,
    subtotalInPaise,
    taxableAmountInPaise: totalTaxableInPaise,
    gstAmountInPaise: totalGstInPaise,
    taxBreakdown: {
      cgstTotalPaise: totalCgstInPaise,
      sgstTotalPaise: totalSgstInPaise,
      igstTotalPaise: totalIgstInPaise,
      isInterState,
      hasUnconfiguredTax,
      sellerStateCode: sellerConfig.sellerStateCode || undefined,
      destinationStateCode: resolvedStateCode,
    },
    shipping,
    isPayable,
    payableAmountInPaise,
    validationErrors,
    isGstInclusive: true,
    disclosures: {
      gstNotice:
        "All product prices are inclusive of applicable GST (CGST + SGST or IGST).",
      shippingNotice: shipping.isConfigured
        ? shipping.message
        : "Shipping charges are pending commercial finalization.",
    },
  };
}
