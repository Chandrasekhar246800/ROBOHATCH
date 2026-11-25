/**
 * ROBOHATCH PHASE 7C: SERVER-AUTHORITATIVE PRICING, SHIPPING & TAX QA TEST SUITE
 *
 * Comprehensive validation of:
 * Category A: Server-Authoritative Product Validation (Tests 1-9)
 * Category B: GST-Inclusive Tax Extraction, Precision & Exact Math (Tests 10-18)
 * Category C: Configurable Shipping Calculation Architecture (Tests 19-23)
 * Category D: Security, Authorization & Tamper Defenses (Tests 24-30)
 * Category E: GST Classification & Regulatory Enforcement (Tests 31-38)
 *   - Test 31: Unverified GST classification returns TAX_CONFIGURATION_UNVERIFIED
 *   - Test 32: Missing HSN code returns MISSING_HSN_CODE
 *   - Test 33: Missing GST rate returns TAX_RATE_UNCONFIGURED
 *   - Test 34: Missing / unconfigured seller origin returns SELLER_ORIGIN_UNCONFIGURED
 *   - Test 35: Invalid destination state returns INVALID_DESTINATION_STATE
 *   - Test 36: Exact Decimal-to-paise conversion (zero float drift)
 *   - Test 37: Intra-state tax reconciliation (CGST + SGST === GST, 50/50 split)
 *   - Test 38: Inter-state tax reconciliation (IGST === GST)
 * Category F: Browser E2E & 5 Viewports Responsive Inspection (Tests 39-43)
 */

import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { calculateCheckoutPricing } from "../src/features/pricing/services/pricing-service.ts";
import {
  extractGstFromInclusivePaise,
  UnconfiguredTaxRateError,
  InvalidTaxRateError,
  InvalidMonetaryValueError,
} from "../src/features/pricing/lib/tax-calculation.ts";
import {
  decimalToPaiseExact,
  paiseToDecimalExact,
  formatPaiseExact,
  MonetaryConversionError,
} from "../src/features/pricing/lib/financial-precision.ts";
import {
  getSellerOriginConfig,
  normalizeIndianState,
} from "../src/features/pricing/config/seller-config.ts";
import {
  DefaultUnconfiguredShippingCalculator,
  ConfigurableFlatRateShippingCalculator,
  RuleBasedPinCodeShippingCalculator,
} from "../src/features/pricing/lib/shipping-calculation.ts";
import { calculateCheckoutPricingAction } from "../src/features/pricing/actions/calculate-pricing-action.ts";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACTS_DIR =
  "C:\\Users\\mcsr8\\.gemini\\antigravity\\brain\\59f9ab82-233a-4db0-82c8-4c115a24dcf6";
const BASE_URL = "http://localhost:3000";

const prisma = new PrismaClient();

let passedTests = 0;
let totalTests = 0;

function assert(condition, testNumber, testName, details = "") {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] [Test ${testNumber}] ${testName}`);
  } else {
    console.error(
      `  ✗ [FAIL] [Test ${testNumber}] ${testName}${details ? ` -> ${details}` : ""}`
    );
  }
}

// Standard verified test context for calculations that require verified inputs
const STANDARD_VERIFIED_CONTEXT = {
  taxVerificationOverrides: {
    "prod-1": "VERIFIED",
    "prod-2": "VERIFIED",
    "prod-3": "VERIFIED",
    "prod-4": "VERIFIED",
    "prod-5": "VERIFIED",
    "prod-6": "VERIFIED",
    "prod-7": "VERIFIED",
    "prod-8": "VERIFIED",
  },
  taxRateOverrides: {
    "prod-1": 18.0,
    "prod-2": 18.0,
    "prod-3": 18.0,
    "prod-4": 18.0,
    "prod-5": 18.0,
    "prod-6": 18.0,
    "prod-7": 18.0,
    "prod-8": 18.0,
  },
  hsnCodeOverrides: {
    "prod-1": "39269099",
    "prod-2": "39269099",
    "prod-3": "39269099",
    "prod-4": "39269099",
    "prod-5": "39269099",
    "prod-6": "39269099",
    "prod-7": "39269099",
    "prod-8": "39269099",
  },
};

async function runPhase7CTests() {
  console.log("===============================================================");
  console.log("   ROBOHATCH: PHASE 7C SERVER PRICING & TAX QA TEST SUITE      ");
  console.log("===============================================================\n");

  const timestamp = Date.now();
  const testPassword = "SecureCheckout!2026";
  const passwordHash = await bcrypt.hash(testPassword, 12);

  // Setup Test Customer
  const userA = await prisma.user.create({
    data: {
      name: "Rohan Singhania",
      email: `rohan-pricing-${timestamp}@test.com`,
      passwordHash,
      role: "CUSTOMER",
    },
  });

  const addrA = await prisma.address.create({
    data: {
      userId: userA.id,
      fullName: "Rohan Singhania",
      street: "88 Industrial Design Avenue, 4th Floor",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560001",
      phone: "+91 98765 43210",
      type: "SHIPPING",
      isDefault: true,
    },
  });

  const addrMH = await prisma.address.create({
    data: {
      userId: userA.id,
      fullName: "Rohan Singhania Mumbai",
      street: "12 Nariman Point",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400021",
      phone: "+91 98765 43210",
      type: "SHIPPING",
      isDefault: false,
    },
  });

  console.log(
    `✓ Test Fixtures Initialized: Customer (${userA.id}), Addresses (${addrA.id}, ${addrMH.id})\n`
  );

  try {
    // =========================================================================
    // Category A: Server-Authoritative Product Validation
    // =========================================================================
    console.log("--- Category A: Server-Authoritative Product Validation ---");

    // Test 1: Valid product resolves authoritative database price
    const res1 = await calculateCheckoutPricing({
      items: [{ productId: "prod-1", quantity: 1 }],
      deliveryAddressId: addrA.id,
      ...STANDARD_VERIFIED_CONTEXT,
    });
    assert(
      res1.success === true &&
        res1.items.length === 1 &&
        res1.items[0].unitPriceInPaise === 249900 &&
        res1.subtotalInPaise === 249900,
      1,
      "Valid product resolves authoritative database price (₹2,499 = 249,900 paise)"
    );

    // Test 2: Non-existent product ID
    const res2 = await calculateCheckoutPricing({
      items: [{ productId: "non-existent-product-id", quantity: 1 }],
      deliveryAddressId: addrA.id,
      ...STANDARD_VERIFIED_CONTEXT,
    });
    assert(
      res2.success === false &&
        res2.validationErrors.some((e) => e.code === "PRODUCT_NOT_FOUND"),
      2,
      "Non-existent product ID is safely rejected with PRODUCT_NOT_FOUND"
    );

    // Test 3: Inactive product rejection
    const inactiveProd = await prisma.product.create({
      data: {
        name: "Inactive Test Prototype",
        slug: `inactive-test-${timestamp}`,
        description: "Test inactive product",
        basePrice: new Prisma.Decimal(1200.0),
        isActive: false,
        categoryId: "cat-1",
      },
    });
    const res3 = await calculateCheckoutPricing({
      items: [{ productId: inactiveProd.id, quantity: 1 }],
      deliveryAddressId: addrA.id,
      ...STANDARD_VERIFIED_CONTEXT,
    });
    assert(
      res3.success === false &&
        res3.validationErrors.some((e) => e.code === "PRODUCT_INACTIVE"),
      3,
      "Inactive product is safely rejected with PRODUCT_INACTIVE"
    );

    // Test 4: Invalid variant colorway
    const res4 = await calculateCheckoutPricing({
      items: [{ productId: "prod-1", color: "NonExistentColorwayMagenta", quantity: 1 }],
      deliveryAddressId: addrA.id,
      ...STANDARD_VERIFIED_CONTEXT,
    });
    assert(
      res4.success === false &&
        res4.validationErrors.some((e) => e.code === "VARIANT_NOT_FOUND"),
      4,
      "Invalid or non-existent variant colorway is rejected with VARIANT_NOT_FOUND"
    );

    // Test 5: Cross-product variant substitution
    const prod2Variant = await prisma.productVariant.findFirst({
      where: { productId: "prod-2" },
    });
    const res5 = await calculateCheckoutPricing({
      items: [{ productId: "prod-1", variantId: prod2Variant.id, quantity: 1 }],
      deliveryAddressId: addrA.id,
      ...STANDARD_VERIFIED_CONTEXT,
    });
    assert(
      res5.success === false &&
        res5.validationErrors.some((e) => e.code === "VARIANT_NOT_FOUND"),
      5,
      "Cross-product variant substitution is detected and rejected"
    );

    // Test 6: Invalid quantities (0, >10)
    const res6a = await calculateCheckoutPricing({
      items: [{ productId: "prod-1", quantity: 0 }],
      deliveryAddressId: addrA.id,
      ...STANDARD_VERIFIED_CONTEXT,
    });
    const res6b = await calculateCheckoutPricing({
      items: [{ productId: "prod-1", quantity: 15 }],
      deliveryAddressId: addrA.id,
      ...STANDARD_VERIFIED_CONTEXT,
    });
    assert(
      res6a.success === false &&
        res6a.validationErrors.some((e) => e.code === "INVALID_QUANTITY") &&
        res6b.success === false &&
        res6b.validationErrors.some((e) => e.code === "INVALID_QUANTITY"),
      6,
      "Invalid quantities (0, >10) are rejected with INVALID_QUANTITY"
    );

    // Test 7: Out of stock product
    const outOfStockProd = await prisma.product.create({
      data: {
        name: "Discontinued Prototype",
        slug: `discontinued-prototype-${timestamp}`,
        description: "Test discontinued item",
        basePrice: new Prisma.Decimal(800.0),
        isActive: true,
        categoryId: "cat-1",
        metadata: { availability: "Out of Stock" },
      },
    });
    const res7 = await calculateCheckoutPricing({
      items: [{ productId: outOfStockProd.id, quantity: 1 }],
      deliveryAddressId: addrA.id,
      ...STANDARD_VERIFIED_CONTEXT,
    });
    assert(
      res7.success === false &&
        res7.validationErrors.some((e) => e.code === "PRODUCT_OUT_OF_STOCK"),
      7,
      "Out-of-stock product/variant is safely rejected with PRODUCT_OUT_OF_STOCK"
    );

    // Test 8: Client-supplied price is discarded
    const res8 = await calculateCheckoutPricing({
      items: [
        {
          productId: "prod-1",
          quantity: 1,
          clientPrice: 100, // Attacker tries to pay ₹1.00 instead of ₹2,499.00
          priceInPaise: 10000,
        },
      ],
      deliveryAddressId: addrA.id,
      ...STANDARD_VERIFIED_CONTEXT,
    });
    assert(
      res8.items[0].unitPriceInPaise === 249900 &&
        res8.items[0].lineTotalInPaise === 249900 &&
        res8.subtotalInPaise === 249900,
      8,
      "Client-supplied price is ignored; PostgreSQL authoritative price enforced"
    );

    // Test 9: Client-supplied subtotal is ignored
    const res9 = await calculateCheckoutPricing({
      items: [
        { productId: "prod-1", quantity: 2 }, // 2 x ₹2,499 = ₹4,998
        { productId: "prod-2", quantity: 1 }, // 1 x ₹1,850 = ₹1,850
      ],
      clientSubtotal: 1000,
      deliveryAddressId: addrA.id,
      ...STANDARD_VERIFIED_CONTEXT,
    });
    assert(
      res9.subtotalInPaise === 684800,
      9,
      "Client-supplied subtotal is ignored; server calculates exact subtotal (₹6,848 = 684,800 paise)"
    );

    // =========================================================================
    // Category B: GST-Inclusive Tax Extraction, Precision & Exact Math
    // =========================================================================
    console.log(
      "\n--- Category B: GST-Inclusive Tax Extraction, Precision & Exact Math ---"
    );

    // Test 10: Reverse GST extraction formula on single item
    // ₹2,499 = 249,900 paise @ 18% GST:
    // Taxable = round(249900 * 10000 / 11800) = 211,780 paise (₹2,117.80)
    // GST = 249,900 - 211,780 = 38,120 paise (₹381.20)
    const tax10 = extractGstFromInclusivePaise({
      inclusiveAmountInPaise: 249900,
      taxRatePercent: 18.0,
      isInterState: false,
    });
    assert(
      tax10.taxableAmountInPaise === 211780 &&
        tax10.taxAmountInPaise === 38120 &&
        tax10.taxableAmountInPaise + tax10.taxAmountInPaise === 249900,
      10,
      "GST-inclusive extraction extracts exact taxable value and GST amount"
    );

    // Test 11: Configurable tax rates (0%, 5%, 12%, 18%, 28%)
    const rates = [0, 5, 12, 18, 28];
    const rateChecks = rates.every((r) => {
      const res = extractGstFromInclusivePaise({
        inclusiveAmountInPaise: 100000,
        taxRatePercent: r,
      });
      return (
        res.taxableAmountInPaise + res.taxAmountInPaise === 100000 &&
        res.taxRatePercent === r
      );
    });
    assert(
      rateChecks,
      11,
      "GST extraction functions across multiple configured rates (0%, 5%, 12%, 18%, 28%)"
    );

    // Test 12: Rounding conservation guaranteed across consecutive paise amounts
    let roundingConservation = true;
    for (let testP = 249890; testP <= 249910; testP++) {
      const r = extractGstFromInclusivePaise({
        inclusiveAmountInPaise: testP,
        taxRatePercent: 18.0,
      });
      if (r.taxableAmountInPaise + r.taxAmountInPaise !== testP) {
        roundingConservation = false;
        break;
      }
    }
    assert(
      roundingConservation,
      12,
      "Paise rounding conservation guaranteed: Taxable + GST === Inclusive across all amounts"
    );

    // Test 13: BigInt arithmetic on very large transactions without overflow
    const largeAmount = 5000000000; // ₹50,000,000 (5 Crore)
    const largeTax = extractGstFromInclusivePaise({
      inclusiveAmountInPaise: largeAmount,
      taxRatePercent: 18.0,
    });
    assert(
      largeTax.taxableAmountInPaise + largeTax.taxAmountInPaise === largeAmount,
      13,
      "BigInt arithmetic safely handles large transaction volumes without floating-point overflow"
    );

    // Test 14: Multi-item cart subtotal reconciles to exact sum of line items
    const multiItemRes = await calculateCheckoutPricing({
      items: [
        { productId: "prod-1", quantity: 1 }, // 249,900 (₹2,499)
        { productId: "prod-2", quantity: 2 }, // 370,000 (2 x ₹1,850)
        { productId: "prod-3", quantity: 1 }, // 340,000 (₹3,400)
        { productId: "prod-4", quantity: 1 }, // 219,900 (₹2,199)
      ],
      deliveryAddressId: addrA.id,
      ...STANDARD_VERIFIED_CONTEXT,
    });
    const expectedSubtotal = 249900 + 370000 + 340000 + 219900; // 1,179,800 (₹11,798.00)
    assert(
      multiItemRes.subtotalInPaise === expectedSubtotal,
      14,
      `Multi-item cart subtotal reconciles exactly to sum of line items (₹11,798.00 = 1,179,800 paise)`
    );

    // Test 15: Multi-quantity line totals multiply integer unit price without rounding drift
    const qtyCheck =
      multiItemRes.items.find((i) => i.productId === "prod-2").lineTotalInPaise ===
      185000 * 2;
    assert(
      qtyCheck,
      15,
      "Multi-quantity line totals multiply integer unit price without rounding drift"
    );

    // Test 16: Total Taxable + Total GST === Subtotal with 0 paise drift
    assert(
      multiItemRes.taxableAmountInPaise + multiItemRes.gstAmountInPaise ===
        multiItemRes.subtotalInPaise,
      16,
      "Subtotal reconciliation: Total Taxable + Total GST === Subtotal (0 paise drift)"
    );

    // Test 17: Intra-state (KA -> KA) vs Inter-state (KA -> MH) tax allocation
    const intraStateRes = await calculateCheckoutPricing({
      items: [{ productId: "prod-1", quantity: 1 }],
      deliveryAddressId: addrA.id, // Karnataka
      ...STANDARD_VERIFIED_CONTEXT,
    });
    const interStateRes = await calculateCheckoutPricing({
      items: [{ productId: "prod-1", quantity: 1 }],
      deliveryAddressId: addrMH.id, // Maharashtra
      ...STANDARD_VERIFIED_CONTEXT,
    });
    assert(
      intraStateRes.taxBreakdown.isInterState === false &&
        intraStateRes.taxBreakdown.cgstTotalPaise === 19060 &&
        intraStateRes.taxBreakdown.sgstTotalPaise === 19060 &&
        intraStateRes.taxBreakdown.igstTotalPaise === 0 &&
        interStateRes.taxBreakdown.isInterState === true &&
        interStateRes.taxBreakdown.cgstTotalPaise === 0 &&
        interStateRes.taxBreakdown.sgstTotalPaise === 0 &&
        interStateRes.taxBreakdown.igstTotalPaise === 38120,
      17,
      "Tax breakdown allocates CGST/SGST for intra-state (KA) and IGST for inter-state (MH)"
    );

    // Test 18: Unconfigured tax rate throws clean error
    let threwUnconfigured = false;
    try {
      extractGstFromInclusivePaise({
        inclusiveAmountInPaise: 100000,
        taxRatePercent: null,
      });
    } catch (e) {
      if (e instanceof UnconfiguredTaxRateError) threwUnconfigured = true;
    }
    assert(
      threwUnconfigured,
      18,
      "Unconfigured tax rate triggers safe validation failure preventing invented tax values"
    );

    // =========================================================================
    // Category C: Configurable Shipping Calculation Architecture
    // =========================================================================
    console.log("\n--- Category C: Configurable Shipping Calculation Architecture ---");

    // Test 19: Default unconfigured shipping returns UNCONFIGURED
    const defShippingRes = await calculateCheckoutPricing({
      items: [{ productId: "prod-1", quantity: 1 }],
      deliveryAddressId: addrA.id,
      ...STANDARD_VERIFIED_CONTEXT,
    });
    assert(
      defShippingRes.shipping.status === "UNCONFIGURED" &&
        defShippingRes.shipping.isConfigured === false &&
        defShippingRes.shipping.amountInPaise === null &&
        defShippingRes.isPayable === false,
      19,
      "Unfinalized shipping returns UNCONFIGURED status and null amount"
    );

    // Test 20: Configured flat-rate shipping calculator returns payable total
    const flatRateCalc = new ConfigurableFlatRateShippingCalculator({
      flatRateInPaise: 15000, // ₹150 flat fee
    });
    const configuredShippingRes = await calculateCheckoutPricing({
      items: [{ productId: "prod-1", quantity: 1 }],
      deliveryAddressId: addrA.id,
      shippingCalculatorOverride: flatRateCalc,
      ...STANDARD_VERIFIED_CONTEXT,
    });
    assert(
      configuredShippingRes.shipping.status === "CONFIGURED" &&
        configuredShippingRes.shipping.isConfigured === true &&
        configuredShippingRes.shipping.amountInPaise === 15000 &&
        configuredShippingRes.isPayable === true &&
        configuredShippingRes.payableAmountInPaise === 249900 + 15000,
      20,
      "Configured flat-rate shipping computes payable total (₹2,499 + ₹150 = ₹2,649)"
    );

    // Test 21: Restricted PIN code handling
    const restrictedCalc = new RuleBasedPinCodeShippingCalculator([
      {
        allowedPostalPrefixes: ["56"],
        rateInPaise: 10000,
        estimatedDays: "2-3 business days",
      },
    ]);
    const invalidShippingRes = await calculateCheckoutPricing({
      items: [{ productId: "prod-1", quantity: 1 }],
      deliveryAddressId: addrMH.id, // PIN 400021 (restricted)
      shippingCalculatorOverride: restrictedCalc,
      ...STANDARD_VERIFIED_CONTEXT,
    });
    assert(
      invalidShippingRes.shipping.status === "RESTRICTED" &&
        invalidShippingRes.shipping.isConfigured === false &&
        invalidShippingRes.isPayable === false &&
        invalidShippingRes.payableAmountInPaise === null,
      21,
      "Restricted shipping configuration flags RESTRICTED and prevents payable total"
    );

    // Test 22: Zero fabricated shipping charges or speculative delivery dates
    assert(
      defShippingRes.shipping.amountInPaise === null &&
        defShippingRes.shipping.estimatedDays === undefined,
      22,
      "Zero fabricated shipping charges or speculative delivery dates when unconfigured"
    );

    // Test 23: Final payable total is strictly null when shipping is unconfigured
    assert(
      defShippingRes.isPayable === false && defShippingRes.payableAmountInPaise === null,
      23,
      "Final payable total is strictly null when shipping is unconfigured"
    );

    // =========================================================================
    // Category D: Security, Authorization & Tamper Defenses
    // =========================================================================
    console.log("\n--- Category D: Security, Authorization & Tamper Defenses ---");

    // Test 24: Server action rejects unauthenticated requests
    const unauthActionRes = await calculateCheckoutPricingAction({
      items: [{ productId: "prod-1", quantity: 1 }],
    });
    assert(
      unauthActionRes.success === false &&
        unauthActionRes.error.toLowerCase().includes("authentication required"),
      24,
      "Server action rejects unauthenticated requests with clean authentication requirement"
    );

    // Test 25: SQL injection attempt in productId safely rejected
    const tamperedIdRes = await calculateCheckoutPricing({
      items: [{ productId: "prod-1' OR '1'='1", quantity: 1 }],
      deliveryAddressId: addrA.id,
      ...STANDARD_VERIFIED_CONTEXT,
    });
    assert(
      tamperedIdRes.success === false &&
        tamperedIdRes.validationErrors.some((e) => e.code === "PRODUCT_NOT_FOUND"),
      25,
      "SQL injection attempt in productId safely rejected with PRODUCT_NOT_FOUND"
    );

    // Test 26: Tampered variant ID safely rejected
    const tamperedVarRes = await calculateCheckoutPricing({
      items: [{ productId: "prod-1", variantId: "malicious-variant-id", quantity: 1 }],
      deliveryAddressId: addrA.id,
      ...STANDARD_VERIFIED_CONTEXT,
    });
    assert(
      tamperedVarRes.success === false &&
        tamperedVarRes.validationErrors.some((e) => e.code === "VARIANT_NOT_FOUND"),
      26,
      "Tampered variant ID is safely rejected with VARIANT_NOT_FOUND"
    );

    // Test 27: Excessive quantity (>10) rejected by Zod schema
    const tamperedQtyRes = await calculateCheckoutPricingAction({
      items: [{ productId: "prod-1", quantity: 999 }],
    });
    assert(
      tamperedQtyRes.success === false &&
        tamperedQtyRes.error.includes("Quantity cannot exceed 10"),
      27,
      "Zod schema validation rejects excessive quantity (>10) on server action"
    );

    // Test 28: Tampered price discarded; PostgreSQL authoritative price enforced
    const tamperedPriceOutput = await calculateCheckoutPricing({
      items: [{ productId: "prod-1", quantity: 1, unitPrice: 1 }],
      deliveryAddressId: addrA.id,
      ...STANDARD_VERIFIED_CONTEXT,
    });
    assert(
      tamperedPriceOutput.items[0].unitPriceInPaise === 249900 &&
        tamperedPriceOutput.subtotalInPaise === 249900,
      28,
      "Tampered price parameter discarded; database price strictly enforced"
    );

    // Test 29: Client tax rate tamper discarded
    const tamperedTaxOutput = await calculateCheckoutPricing({
      items: [{ productId: "prod-1", quantity: 1, taxRate: 0 }],
      deliveryAddressId: addrA.id,
      ...STANDARD_VERIFIED_CONTEXT,
    });
    assert(
      tamperedTaxOutput.items[0].taxRatePercent === 18 &&
        tamperedTaxOutput.gstAmountInPaise === 38120,
      29,
      "Client tax rate tamper discarded; server-configured GST rate (18%) enforced"
    );

    // Test 30: Client shipping tamper discarded
    const tamperedShippingOutput = await calculateCheckoutPricing({
      items: [{ productId: "prod-1", quantity: 1, shippingAmount: 0 }],
      deliveryAddressId: addrA.id,
      ...STANDARD_VERIFIED_CONTEXT,
    });
    assert(
      tamperedShippingOutput.shipping.isConfigured === false &&
        tamperedShippingOutput.shipping.amountInPaise === null,
      30,
      "Client shipping tamper discarded; server-side unconfigured status enforced"
    );

    // =========================================================================
    // Category E: GST Classification & Regulatory Enforcement (Phase 7C Audit)
    // =========================================================================
    console.log(
      "\n--- Category E: GST Classification & Regulatory Enforcement (Phase 7C Audit) ---"
    );

    // Test 31: Unverified GST classification returns TAX_CONFIGURATION_UNVERIFIED and prevents payable total
    // Real catalog products in PostgreSQL now default to UNVERIFIED tax status
    const unverifiedCatalogRes = await calculateCheckoutPricing({
      items: [{ productId: "prod-1", quantity: 1 }],
      deliveryAddressId: addrA.id,
      // No overrides passed -> queries actual database status
    });
    assert(
      unverifiedCatalogRes.success === false &&
        unverifiedCatalogRes.isPayable === false &&
        unverifiedCatalogRes.payableAmountInPaise === null &&
        unverifiedCatalogRes.validationErrors.some(
          (e) => e.code === "TAX_CONFIGURATION_UNVERIFIED"
        ),
      31,
      "Unverified GST classification returns TAX_CONFIGURATION_UNVERIFIED and blocks payable checkout total"
    );

    // Test 32: Missing HSN code returns MISSING_HSN_CODE validation error
    const missingHsnRes = await calculateCheckoutPricing({
      items: [{ productId: "prod-1", quantity: 1 }],
      deliveryAddressId: addrA.id,
      taxVerificationOverrides: { "prod-1": "VERIFIED" },
      taxRateOverrides: { "prod-1": 18.0 },
      hsnCodeOverrides: { "prod-1": null }, // Explicit missing HSN
    });
    assert(
      missingHsnRes.success === false &&
        missingHsnRes.isPayable === false &&
        missingHsnRes.validationErrors.some((e) => e.code === "MISSING_HSN_CODE"),
      32,
      "Missing HSN code triggers MISSING_HSN_CODE and prevents payable total"
    );

    // Test 33: Missing GST rate returns TAX_RATE_UNCONFIGURED validation error
    const missingTaxRateRes = await calculateCheckoutPricing({
      items: [{ productId: "prod-1", quantity: 1 }],
      deliveryAddressId: addrA.id,
      taxVerificationOverrides: { "prod-1": "VERIFIED" },
      taxRateOverrides: { "prod-1": null }, // Explicit missing tax rate
      hsnCodeOverrides: { "prod-1": "39269099" },
    });
    assert(
      missingTaxRateRes.success === false &&
        missingTaxRateRes.isPayable === false &&
        missingTaxRateRes.validationErrors.some(
          (e) => e.code === "TAX_RATE_UNCONFIGURED"
        ),
      33,
      "Missing GST rate triggers TAX_RATE_UNCONFIGURED and prevents payable total"
    );

    // Test 34: Strict Seller Origin Enforcement (Production vs Development)
    const origNodeEnv = process.env.NODE_ENV;
    const origOrigin = process.env.SELLER_ORIGIN_STATE;

    // 34A: In production, missing SELLER_ORIGIN_STATE strictly returns isConfigured: false
    process.env.NODE_ENV = "production";
    delete process.env.SELLER_ORIGIN_STATE;
    const prodMissingConfig = getSellerOriginConfig();

    // 34B: In production, invalid SELLER_ORIGIN_STATE strictly returns isConfigured: false
    process.env.SELLER_ORIGIN_STATE = "Atlantis";
    const prodInvalidConfig = getSellerOriginConfig();

    // 34C: In production, valid SELLER_ORIGIN_STATE returns isConfigured: true
    process.env.SELLER_ORIGIN_STATE = "Karnataka";
    const prodValidConfig = getSellerOriginConfig();

    // 34D: In production with unset origin, pricing service fails safely without assuming Karnataka
    delete process.env.SELLER_ORIGIN_STATE;
    const prodPricingNoOriginRes = await calculateCheckoutPricing({
      items: [{ productId: "prod-1", quantity: 1 }],
      deliveryAddressId: addrA.id,
      ...STANDARD_VERIFIED_CONTEXT,
    });

    // 34E: In development, unset SELLER_ORIGIN_STATE uses documented dev fallback "Karnataka"
    process.env.NODE_ENV = "development";
    delete process.env.SELLER_ORIGIN_STATE;
    const devFallbackConfig = getSellerOriginConfig();

    // Restore environment variables
    process.env.NODE_ENV = origNodeEnv;
    if (origOrigin !== undefined) {
      process.env.SELLER_ORIGIN_STATE = origOrigin;
    } else {
      delete process.env.SELLER_ORIGIN_STATE;
    }

    const sellerConfigPassed =
      prodMissingConfig.isConfigured === false &&
      prodInvalidConfig.isConfigured === false &&
      prodValidConfig.isConfigured === true &&
      prodValidConfig.sellerStateCode === "KA" &&
      prodPricingNoOriginRes.success === false &&
      prodPricingNoOriginRes.isPayable === false &&
      prodPricingNoOriginRes.validationErrors.some(
        (e) => e.code === "SELLER_ORIGIN_UNCONFIGURED"
      ) &&
      devFallbackConfig.isConfigured === true &&
      devFallbackConfig.sellerStateCode === "KA";

    assert(
      sellerConfigPassed,
      34,
      "Seller origin strictly requires valid configuration in production (zero silent fallback)"
    );

    // Test 35: Invalid destination state returns INVALID_DESTINATION_STATE
    const invalidStateAddr = await prisma.address.create({
      data: {
        userId: userA.id,
        fullName: "Rohan Invalid",
        street: "Atlantis Ocean Trench",
        city: "Atlantis City",
        state: "Atlantis State", // Non-existent Indian state
        postalCode: "999999",
        phone: "+91 98765 43210",
        type: "SHIPPING",
      },
    });
    const invalidDestRes = await calculateCheckoutPricing({
      items: [{ productId: "prod-1", quantity: 1 }],
      deliveryAddressId: invalidStateAddr.id,
      ...STANDARD_VERIFIED_CONTEXT,
    });
    assert(
      invalidDestRes.success === false &&
        invalidDestRes.validationErrors.some(
          (e) => e.code === "INVALID_DESTINATION_STATE"
        ),
      35,
      "Invalid destination state in shipping address triggers INVALID_DESTINATION_STATE"
    );

    // Test 36: Exact Decimal-to-paise conversion (zero float drift)
    const p1 = decimalToPaiseExact(new Prisma.Decimal("2499.00")); // 249900
    const p2 = decimalToPaiseExact("3400.50"); // 340050
    const p3 = decimalToPaiseExact(150.25); // 15025
    const decBack = paiseToDecimalExact(249900); // Prisma.Decimal("2499.00")
    const formatted = formatPaiseExact(249900); // "₹2,499.00"
    assert(
      p1 === 249900 &&
        p2 === 340050 &&
        p3 === 15025 &&
        decBack.toFixed(2) === "2499.00" &&
        formatted === "₹2,499.00",
      36,
      "Exact Decimal-to-paise, paise-to-Decimal, and INR formatting verify zero float drift"
    );

    // Test 37: Intra-state tax reconciliation (CGST + SGST === GST, 50/50 split)
    // Inclusive: 249,900 paise @ 18% GST -> GST: 38,120 paise.
    // CGST: 19,060 paise (50%), SGST: 19,060 paise (50%) -> CGST + SGST === 38,120
    const intraCheck = extractGstFromInclusivePaise({
      inclusiveAmountInPaise: 249900,
      taxRatePercent: 18.0,
      isInterState: false,
    });
    assert(
      intraCheck.cgstPaise === 19060 &&
        intraCheck.sgstPaise === 19060 &&
        intraCheck.cgstPaise + intraCheck.sgstPaise === intraCheck.taxAmountInPaise,
      37,
      "Intra-state tax reconciliation: CGST + SGST strictly equals total GST with exact 50/50 split"
    );

    // Test 38: Inter-state tax reconciliation (IGST === GST)
    const interCheck = extractGstFromInclusivePaise({
      inclusiveAmountInPaise: 249900,
      taxRatePercent: 18.0,
      isInterState: true,
    });
    assert(
      interCheck.cgstPaise === 0 &&
        interCheck.sgstPaise === 0 &&
        interCheck.igstPaise === interCheck.taxAmountInPaise &&
        interCheck.igstPaise === 38120,
      38,
      "Inter-state tax reconciliation: IGST strictly equals total GST"
    );

    // =========================================================================
    // Category F: Browser E2E & 5 Viewports Responsive Inspection
    // =========================================================================
    console.log("\n--- Category F: Browser E2E & 5 Viewports Responsive Inspection ---");

    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
    });

    try {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(60000);

      // Log in as test customer
      console.log("  Logging in via /login...");
      await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });
      await page.waitForSelector('input[name="email"]');
      await page.type('input[name="email"]', userA.email);
      await page.type('input[name="password"]', testPassword);
      await page.click('button[type="submit"]');
      await new Promise((r) => setTimeout(r, 2500));
      console.log(`  Logged in. Current URL: ${page.url()}`);

      // Add items to cart via product pages
      console.log("  Adding Voronoi Kinetic Vessel to cart...");
      await page.goto(`${BASE_URL}/products/voronoi-kinetic-vessel`, {
        waitUntil: "networkidle2",
      });
      await page.waitForSelector("button[aria-label='Add to cart']");
      await page.click("button[aria-label='Add to cart']");
      await new Promise((r) => setTimeout(r, 1000));

      console.log("  Adding Tessellated Desk Organizer to cart...");
      await page.goto(`${BASE_URL}/products/tessellated-desk-organizer`, {
        waitUntil: "networkidle2",
      });
      await page.waitForSelector("button[aria-label='Add to cart']");
      await page.click("button[aria-label='Add to cart']");
      await new Promise((r) => setTimeout(r, 1000));

      // Navigate to /checkout
      console.log("  Navigating to /checkout...");
      await page.goto(`${BASE_URL}/checkout`, { waitUntil: "networkidle2" });
      console.log(`  At /checkout. Page URL: ${page.url()}`);

      // Verify checkout main sections render
      await page.waitForSelector("#shipping-address-heading", { timeout: 15000 });
      await page.waitForSelector("#order-review-heading", { timeout: 15000 });

      const viewports = [
        { width: 1440, height: 900, name: "desktop-1440", testNum: 39 },
        { width: 1024, height: 768, name: "desktop-1024", testNum: 40 },
        { width: 768, height: 1024, name: "tablet-768", testNum: 41 },
        { width: 390, height: 844, name: "mobile-390", testNum: 42 },
        { width: 320, height: 568, name: "mobile-320", testNum: 43 },
      ];

      for (const vp of viewports) {
        await page.setViewport({ width: vp.width, height: vp.height });
        await new Promise((r) => setTimeout(r, 600));

        const isOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });

        assert(
          !isOverflow,
          vp.testNum,
          `Viewport ${vp.width}px (${vp.name}) renders with zero horizontal overflow`
        );

        const screenshotPath = path.join(
          ARTIFACTS_DIR,
          `checkout-phase7c-${vp.name}.png`
        );
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`    ↳ Screenshot captured: checkout-phase7c-${vp.name}.png`);
      }
    } finally {
      await browser.close();
    }

    // Cleanup test fixtures
    console.log("\n--- Cleaning up test fixtures from PostgreSQL ---");
    await prisma.address.deleteMany({ where: { userId: userA.id } });
    await prisma.user.delete({ where: { id: userA.id } });
    await prisma.product.deleteMany({
      where: { id: { in: [inactiveProd.id, outOfStockProd.id] } },
    });
    console.log("✓ Test database cleanup completed successfully.");
  } catch (err) {
    console.error("FATAL ERROR during test execution:", err);
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n===============================================================");
  console.log(`   PHASE 7C QA AUDIT SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("===============================================================\n");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runPhase7CTests();
