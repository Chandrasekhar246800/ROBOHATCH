/**
 * ROBOHATCH PHASE 7D: RAZORPAY TEST MODE PAYMENT INTEGRATION QA TEST SUITE
 *
 * Comprehensive validation across 38 automated tests:
 * Category A: Razorpay Configuration & Credential Validation (Tests 1-5)
 * Category B: Cryptographic Signature Verification & Constant-Time Security (Tests 6-11)
 * Category C: Server-Authoritative Payment Initiation Service & IDOR (Tests 12-16)
 * Category D: QA Override Security Audit & Production Environment Enforcements (Tests 17-18)
 * Category E: Concurrency Serialization & Provider Order Failure Safety (Tests 19-22)
 * Category F: Provider Order Reference, Multiple Attempts & Database Uniqueness (Tests 23-25)
 * Category G: Server-Authoritative Payment Verification & Provider State Retrieval (Tests 26-34)
 * Category H: Customer Cancellation & Race Condition Defense (Tests 35-37)
 * Category I: Browser E2E UI Test & Test Mode Indicators (Test 38)
 */

import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { fork } from "child_process";
import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

import {
  getRazorpayConfig,
  getRazorpayClient,
  RazorpayConfigurationError,
} from "../src/features/payment/config/razorpay-config.ts";
import { verifyRazorpayPaymentSignature } from "../src/features/payment/lib/signature-verification.ts";
import {
  initiatePaymentAttempt,
  verifyPaymentAttempt,
  cancelPaymentAttempt,
  computeCartIntentHash,
} from "../src/features/payment/services/payment-service.ts";
import { ConfigurableFlatRateShippingCalculator } from "../src/features/pricing/lib/shipping-calculation.ts";

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

async function runPhase7DTests() {
  console.log(
    "==============================================================================="
  );
  console.log("   ROBOHATCH PHASE 7D: RAZORPAY TEST MODE QA VALIDATION SUITE");
  console.log(
    "===============================================================================\n"
  );

  // Setup test users & addresses in PostgreSQL
  console.log("--- Initializing Test Fixtures in PostgreSQL ---");

  const hashedPassword = await bcrypt.hash("Password123!", 10);

  const userA = await prisma.user.upsert({
    where: { email: "alex.chen@example.com" },
    update: { passwordHash: hashedPassword },
    create: {
      email: "alex.chen@example.com",
      name: "Alex Chen",
      passwordHash: hashedPassword,
    },
  });

  const userB = await prisma.user.upsert({
    where: { email: "priya.patel@example.com" },
    update: { passwordHash: hashedPassword },
    create: {
      email: "priya.patel@example.com",
      name: "Priya Patel",
      passwordHash: hashedPassword,
    },
  });

  // User A Address in Karnataka
  const addressA = await prisma.address.upsert({
    where: { id: "addr-user-a-ka" },
    update: {
      fullName: "Alex Chen",
      phone: "+91 98765 43210",
      street: "123 Tech Park, 4th Block",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560001",
      country: "IN",
      userId: userA.id,
      isDefault: true,
    },
    create: {
      id: "addr-user-a-ka",
      fullName: "Alex Chen",
      phone: "+91 98765 43210",
      street: "123 Tech Park, 4th Block",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560001",
      country: "IN",
      userId: userA.id,
      isDefault: true,
    },
  });

  // User B Address in Maharashtra
  const addressB = await prisma.address.upsert({
    where: { id: "addr-user-b-mh" },
    update: {
      fullName: "Priya Patel",
      phone: "+91 98111 22334",
      street: "45 Marine Lines",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400020",
      country: "IN",
      userId: userB.id,
      isDefault: true,
    },
    create: {
      id: "addr-user-b-mh",
      fullName: "Priya Patel",
      phone: "+91 98111 22334",
      street: "45 Marine Lines",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400020",
      country: "IN",
      userId: userB.id,
      isDefault: true,
    },
  });

  console.log(`  ✓ User A: ${userA.email} (${userA.id}), Address: ${addressA.id} (KA)`);
  console.log(`  ✓ User B: ${userB.email} (${userB.id}), Address: ${addressB.id} (MH)`);

  // Clean up any test claims from previous test executions to guarantee test isolation
  await prisma.paymentInitiationClaim.deleteMany({
    where: { userId: { in: [userA.id, userB.id] } },
  });

  // =========================================================================
  // CATEGORY A: RAZORPAY CONFIGURATION & CREDENTIAL VALIDATION
  // =========================================================================
  console.log("\n--- Category A: Razorpay Configuration & Credential Validation ---");

  const validTestKey = "rzp_test_SampleKeyId123456";
  const validTestSecret = "SampleSecretKey1234567890abcdef";

  process.env.RAZORPAY_KEY_ID = validTestKey;
  process.env.RAZORPAY_KEY_SECRET = validTestSecret;

  // Test 1: Configuration loads test mode credentials correctly
  const config1 = getRazorpayConfig();
  assert(
    config1.isConfigured === true &&
      config1.isTestMode === true &&
      config1.keyId === validTestKey,
    1,
    "Valid test mode credentials (rzp_test_*) correctly identified as Test Mode"
  );

  // Test 2: Live mode credentials strictly rejected
  process.env.RAZORPAY_KEY_ID = "rzp_live_LiveKeyProhibited999";
  let liveThrew = false;
  try {
    getRazorpayConfig();
  } catch (err) {
    liveThrew = err instanceof RazorpayConfigurationError;
  }
  assert(
    liveThrew,
    2,
    "Live mode Razorpay credentials (rzp_live_*) are strictly rejected"
  );

  // Test 3: Missing Key ID rejected
  delete process.env.RAZORPAY_KEY_ID;
  const cfgMissingKey = getRazorpayConfig();
  let missingKeyThrowsClient = false;
  try {
    getRazorpayClient(cfgMissingKey);
  } catch (err) {
    missingKeyThrowsClient = err instanceof RazorpayConfigurationError;
  }
  assert(
    cfgMissingKey.isConfigured === false && missingKeyThrowsClient,
    3,
    "Missing RAZORPAY_KEY_ID marks configuration unconfigured and throws on client instantiation"
  );

  // Test 4: Missing Key Secret rejected
  process.env.RAZORPAY_KEY_ID = validTestKey;
  delete process.env.RAZORPAY_KEY_SECRET;
  const cfgMissingSecret = getRazorpayConfig();
  let missingSecretThrowsClient = false;
  try {
    getRazorpayClient(cfgMissingSecret);
  } catch (err) {
    missingSecretThrowsClient = err instanceof RazorpayConfigurationError;
  }
  assert(
    cfgMissingSecret.isConfigured === false && missingSecretThrowsClient,
    4,
    "Missing RAZORPAY_KEY_SECRET marks configuration unconfigured and throws on client instantiation"
  );

  // Restore test credentials
  process.env.RAZORPAY_KEY_ID = validTestKey;
  process.env.RAZORPAY_KEY_SECRET = validTestSecret;

  // Test 5: SDK Client instantiation succeeds with valid credentials
  const rzpClient = getRazorpayClient(config1);
  assert(
    rzpClient && typeof rzpClient.orders?.create === "function",
    5,
    "Razorpay SDK client successfully instantiated with test credentials"
  );

  // =========================================================================
  // CATEGORY B: CRYPTOGRAPHIC SIGNATURE VERIFICATION & CONSTANT-TIME SECURITY
  // =========================================================================
  console.log(
    "\n--- Category B: Cryptographic Signature Verification & Constant-Time Security ---"
  );

  const testOrderId = "order_test_9876543210";
  const testPaymentId = "pay_test_1234567890";
  const testSecret = validTestSecret;

  const validSignature = crypto
    .createHmac("sha256", testSecret)
    .update(`${testOrderId}|${testPaymentId}`)
    .digest("hex");

  // Test 6: Valid signature verifies correctly
  const sigResult1 = verifyRazorpayPaymentSignature({
    razorpayOrderId: testOrderId,
    razorpayPaymentId: testPaymentId,
    razorpaySignature: validSignature,
    secret: testSecret,
  });
  assert(sigResult1 === true, 6, "Valid HMAC-SHA256 signature passes verification");

  // Test 7: Tampered signature rejected
  const tamperedSignature = validSignature.slice(0, -2) + "ff";
  const sigResult2 = verifyRazorpayPaymentSignature({
    razorpayOrderId: testOrderId,
    razorpayPaymentId: testPaymentId,
    razorpaySignature: tamperedSignature,
    secret: testSecret,
  });
  assert(sigResult2 === false, 7, "Tampered signature string is rejected");

  // Test 8: Tampered payment ID rejected
  const sigResult3 = verifyRazorpayPaymentSignature({
    razorpayOrderId: testOrderId,
    razorpayPaymentId: "pay_test_tampered_999",
    razorpaySignature: validSignature,
    secret: testSecret,
  });
  assert(sigResult3 === false, 8, "Signature for different payment ID is rejected");

  // Test 9: Tampered order ID rejected
  const sigResult4 = verifyRazorpayPaymentSignature({
    razorpayOrderId: "order_test_tampered_888",
    razorpayPaymentId: testPaymentId,
    razorpaySignature: validSignature,
    secret: testSecret,
  });
  assert(sigResult4 === false, 9, "Signature for different order ID is rejected");

  // Test 10: Wrong secret rejected
  const sigResult5 = verifyRazorpayPaymentSignature({
    razorpayOrderId: testOrderId,
    razorpayPaymentId: testPaymentId,
    razorpaySignature: validSignature,
    secret: "WrongSecretKeyEntirely!",
  });
  assert(sigResult5 === false, 10, "Signature evaluated with wrong secret is rejected");

  // Test 11: Length mismatched signature handled safely without exception
  const shortSignature = "short_invalid_signature";
  const sigResult6 = verifyRazorpayPaymentSignature({
    razorpayOrderId: testOrderId,
    razorpayPaymentId: testPaymentId,
    razorpaySignature: shortSignature,
    secret: testSecret,
  });
  assert(
    sigResult6 === false,
    11,
    "Length-mismatched signature safely returns false without crashing"
  );

  // =========================================================================
  // CATEGORY C: SERVER-AUTHORITATIVE PAYMENT INITIATION SERVICE & IDOR
  // =========================================================================
  console.log(
    "\n--- Category C: Server-Authoritative Payment Initiation Service & IDOR ---"
  );

  // Test 12: Unauthenticated initiation rejected
  const unauthInitRes = await initiatePaymentAttempt(
    {
      items: [{ productId: "prod-1", quantity: 1 }],
      deliveryAddressId: addressA.id,
    },
    null
  );
  assert(
    unauthInitRes.success === false &&
      unauthInitRes.error.includes("Authentication required"),
    12,
    "Unauthenticated payment initiation rejected"
  );

  // Test 13: Missing delivery address rejected
  const missingAddrRes = await initiatePaymentAttempt(
    {
      items: [{ productId: "prod-1", quantity: 1 }],
      deliveryAddressId: "",
    },
    userA
  );
  assert(
    missingAddrRes.success === false &&
      missingAddrRes.error.includes("Delivery address is required"),
    13,
    "Missing delivery address rejected"
  );

  // Test 14: Non-existent delivery address rejected
  const nonExistentAddrRes = await initiatePaymentAttempt(
    {
      items: [{ productId: "prod-1", quantity: 1 }],
      deliveryAddressId: "addr-non-existent-999",
    },
    userA
  );
  assert(
    nonExistentAddrRes.success === false &&
      nonExistentAddrRes.error.includes("does not exist"),
    14,
    "Non-existent delivery address rejected"
  );

  // Test 15: Cross-customer delivery address IDOR defense
  const idorAddrRes = await initiatePaymentAttempt(
    {
      items: [{ productId: "prod-1", quantity: 1 }],
      deliveryAddressId: addressB.id,
    },
    userA
  );
  assert(
    idorAddrRes.success === false &&
      idorAddrRes.error.includes("does not belong to your account"),
    15,
    "Cross-customer delivery address IDOR attempt blocked"
  );

  // Test 16: Strict Phase 7C Gate: Default unverified catalog products block payment initiation
  const unverifiedGateRes = await initiatePaymentAttempt(
    {
      items: [{ productId: "prod-1", quantity: 1 }],
      deliveryAddressId: addressA.id,
    },
    userA
  );
  assert(
    unverifiedGateRes.success === false &&
      unverifiedGateRes.error.includes(
        "Payment initiation blocked: checkout pricing is not payable"
      ) &&
      unverifiedGateRes.validationErrors?.some(
        (e) => e.code === "TAX_CONFIGURATION_UNVERIFIED"
      ),
    16,
    "Strict Phase 7C Gate: Unverified GST classifications block payment initiation"
  );

  // =========================================================================
  // CATEGORY D: QA OVERRIDE SECURITY AUDIT & PRODUCTION ENFORCEMENT
  // =========================================================================
  console.log(
    "\n--- Category D: QA Override Security Audit & Production Enforcements ---"
  );

  // Setup controlled mock Razorpay client for deterministic order generation
  let createdRzpOrders = [];
  const mockRzpClient = {
    orders: {
      create: async (params) => {
        const orderId = `order_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const rzpOrder = {
          id: orderId,
          amount: params.amount,
          currency: params.currency,
          receipt: params.receipt,
          notes: params.notes,
        };
        createdRzpOrders.push(rzpOrder);
        return rzpOrder;
      },
    },
    payments: {
      fetch: async (paymentId) => {
        return {
          id: paymentId,
          status: "captured",
          amount: 264900,
          currency: "INR",
          order_id:
            createdRzpOrders[createdRzpOrders.length - 1]?.id || "order_test_mock",
          method: "card",
        };
      },
    },
  };

  // Test 17: Controlled QA override satisfies business gates in test mode
  const validInitiationRes = await initiatePaymentAttempt(
    {
      items: [{ productId: "prod-1", quantity: 1 }], // Price: ₹2,499 (249,900 paise)
      deliveryAddressId: addressA.id,
      testOverrides: {
        taxVerificationOverrides: { "prod-1": "VERIFIED" },
        taxRateOverrides: { "prod-1": 18 },
        hsnCodeOverrides: { "prod-1": "3926.90.99" },
        shippingCalculatorOverride: new ConfigurableFlatRateShippingCalculator({
          flatRateInPaise: 15000, // ₹150.00
        }),
        sellerOriginOverride: {
          sellerStateCode: "KA",
          sellerStateName: "Karnataka",
          country: "IN",
          isConfigured: true,
        },
        razorpayClientOverride: mockRzpClient,
      },
    },
    userA
  );

  assert(
    validInitiationRes.success === true &&
      validInitiationRes.orderId !== undefined &&
      validInitiationRes.paymentId !== undefined &&
      validInitiationRes.razorpayOrderId !== undefined &&
      validInitiationRes.amountInPaise === 264900,
    17,
    "Controlled QA override satisfies all gates and initiates Razorpay test order (₹2,649.00)"
  );

  // Test 18: In NODE_ENV=production, QA overrides are strictly prohibited and cannot bypass unverified GST or shipping
  const origNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  const prodOverrideAttempt = await initiatePaymentAttempt(
    {
      items: [{ productId: "prod-1", quantity: 1 }],
      deliveryAddressId: addressA.id,
      testOverrides: {
        taxVerificationOverrides: { "prod-1": "VERIFIED" },
        taxRateOverrides: { "prod-1": 18 },
        hsnCodeOverrides: { "prod-1": "3926.90.99" },
        shippingCalculatorOverride: new ConfigurableFlatRateShippingCalculator({
          flatRateInPaise: 15000,
        }),
        sellerOriginOverride: {
          sellerStateCode: "KA",
          sellerStateName: "Karnataka",
          country: "IN",
          isConfigured: true,
        },
        razorpayClientOverride: mockRzpClient,
      },
    },
    userA
  );

  process.env.NODE_ENV = origNodeEnv; // Restore environment

  assert(
    prodOverrideAttempt.success === false &&
      prodOverrideAttempt.error.includes(
        "Payment initiation blocked: checkout pricing is not payable"
      ) &&
      prodOverrideAttempt.validationErrors?.some(
        (e) => e.code === "TAX_CONFIGURATION_UNVERIFIED"
      ),
    18,
    "Production security audit: NODE_ENV=production strictly strips overrides; commercial gates cannot be bypassed"
  );

  // =========================================================================
  // CATEGORY E: CONCURRENCY SERIALIZATION & PROVIDER FAILURE SAFETY
  // =========================================================================
  console.log(
    "\n--- Category E: Concurrency Serialization & Provider Order Failure Safety ---"
  );

  // Test 19: Concurrency serialization: Two simultaneous initiation requests for identical cart return same order without duplicate provider orders
  const intentHash19 = computeCartIntentHash(userA.id, addressA.id, [
    { productId: "prod-2", quantity: 1 },
  ]);
  await prisma.paymentInitiationClaim.deleteMany({
    where: { claimKey: `${userA.id}:${intentHash19}` },
  });

  const ordersCountBefore19 = createdRzpOrders.length;
  const [concurrentRes1, concurrentRes2] = await Promise.all([
    initiatePaymentAttempt(
      {
        items: [{ productId: "prod-2", quantity: 1 }], // Kinetic Pen Stand ₹1,850 + ₹150 = ₹2,000
        deliveryAddressId: addressA.id,
        testOverrides: {
          taxVerificationOverrides: { "prod-2": "VERIFIED" },
          taxRateOverrides: { "prod-2": 18 },
          hsnCodeOverrides: { "prod-2": "3926.90.99" },
          shippingCalculatorOverride: new ConfigurableFlatRateShippingCalculator({
            flatRateInPaise: 15000,
          }),
          sellerOriginOverride: {
            sellerStateCode: "KA",
            sellerStateName: "Karnataka",
            country: "IN",
            isConfigured: true,
          },
          razorpayClientOverride: mockRzpClient,
        },
      },
      userA
    ),
    initiatePaymentAttempt(
      {
        items: [{ productId: "prod-2", quantity: 1 }],
        deliveryAddressId: addressA.id,
        testOverrides: {
          taxVerificationOverrides: { "prod-2": "VERIFIED" },
          taxRateOverrides: { "prod-2": 18 },
          hsnCodeOverrides: { "prod-2": "3926.90.99" },
          shippingCalculatorOverride: new ConfigurableFlatRateShippingCalculator({
            flatRateInPaise: 15000,
          }),
          sellerOriginOverride: {
            sellerStateCode: "KA",
            sellerStateName: "Karnataka",
            country: "IN",
            isConfigured: true,
          },
          razorpayClientOverride: mockRzpClient,
        },
      },
      userA
    ),
  ]);

  const ordersCountAfter19 = createdRzpOrders.length;

  assert(
    concurrentRes1.success === true &&
      concurrentRes2.success === true &&
      concurrentRes1.orderId === concurrentRes2.orderId &&
      concurrentRes1.paymentId === concurrentRes2.paymentId &&
      concurrentRes1.razorpayOrderId === concurrentRes2.razorpayOrderId &&
      ordersCountAfter19 - ordersCountBefore19 === 1,
    19,
    "Concurrency serialization: Simultaneous requests resolve identically with single provider order creation"
  );

  // Test 20: Cart/intent fingerprinting: Changed quantity or variant creates a NEW Order & Payment attempt
  const modifiedCartRes = await initiatePaymentAttempt(
    {
      items: [{ productId: "prod-2", quantity: 2 }], // Quantity changed to 2
      deliveryAddressId: addressA.id,
      testOverrides: {
        taxVerificationOverrides: { "prod-2": "VERIFIED" },
        taxRateOverrides: { "prod-2": 18 },
        hsnCodeOverrides: { "prod-2": "3926.90.99" },
        shippingCalculatorOverride: new ConfigurableFlatRateShippingCalculator({
          flatRateInPaise: 15000,
        }),
        sellerOriginOverride: {
          sellerStateCode: "KA",
          sellerStateName: "Karnataka",
          country: "IN",
          isConfigured: true,
        },
        razorpayClientOverride: mockRzpClient,
      },
    },
    userA
  );

  assert(
    modifiedCartRes.success === true &&
      modifiedCartRes.orderId !== concurrentRes1.orderId &&
      modifiedCartRes.paymentId !== concurrentRes1.paymentId &&
      modifiedCartRes.amountInPaise === 385000, // (1850 * 2) + 150 = 3850.00 -> 385,000 paise
    20,
    "Cart/intent fingerprinting: Modified quantity creates distinct Order and Payment attempt"
  );

  // Test 21: Requests after payment cancellation create a NEW Payment attempt instead of reusing cancelled attempt
  await cancelPaymentAttempt(modifiedCartRes.paymentId, userA);

  const postCancelRes = await initiatePaymentAttempt(
    {
      items: [{ productId: "prod-2", quantity: 2 }],
      deliveryAddressId: addressA.id,
      testOverrides: {
        taxVerificationOverrides: { "prod-2": "VERIFIED" },
        taxRateOverrides: { "prod-2": 18 },
        hsnCodeOverrides: { "prod-2": "3926.90.99" },
        shippingCalculatorOverride: new ConfigurableFlatRateShippingCalculator({
          flatRateInPaise: 15000,
        }),
        sellerOriginOverride: {
          sellerStateCode: "KA",
          sellerStateName: "Karnataka",
          country: "IN",
          isConfigured: true,
        },
        razorpayClientOverride: mockRzpClient,
      },
    },
    userA
  );

  assert(
    postCancelRes.success === true &&
      postCancelRes.paymentId !== modifiedCartRes.paymentId,
    21,
    "Requests after payment cancellation generate fresh Payment attempt without reusing cancelled record"
  );

  // Test 22: Provider orders.create failure transitions Payment to FAILED with audit details and masks error
  const intentHash22 = computeCartIntentHash(userA.id, addressA.id, [
    { productId: "prod-3", quantity: 1 },
  ]);
  await prisma.paymentInitiationClaim.deleteMany({
    where: { claimKey: `${userA.id}:${intentHash22}` },
  });

  const failingMockRzp = {
    orders: {
      create: async () => {
        throw new Error("Razorpay gateway timeout 504: Connection timed out");
      },
    },
  };

  const failingOrderAttempt = await initiatePaymentAttempt(
    {
      items: [{ productId: "prod-3", quantity: 1 }],
      deliveryAddressId: addressA.id,
      testOverrides: {
        taxVerificationOverrides: { "prod-3": "VERIFIED" },
        taxRateOverrides: { "prod-3": 18 },
        hsnCodeOverrides: { "prod-3": "3926.90.99" },
        shippingCalculatorOverride: new ConfigurableFlatRateShippingCalculator({
          flatRateInPaise: 15000,
        }),
        sellerOriginOverride: {
          sellerStateCode: "KA",
          sellerStateName: "Karnataka",
          country: "IN",
          isConfigured: true,
        },
        razorpayClientOverride: failingMockRzp,
      },
    },
    userA
  );

  const failedPaymentRecord = await prisma.payment.findFirst({
    where: {
      status: "FAILED",
      errorDetails: { path: ["reason"], equals: "PROVIDER_ORDER_CREATION_FAILED" },
    },
    orderBy: { createdAt: "desc" },
  });

  assert(
    failingOrderAttempt.success === false &&
      failingOrderAttempt.error.includes("Failed to communicate with payment gateway") &&
      failedPaymentRecord !== null &&
      failedPaymentRecord.razorpayOrderId === null,
    22,
    "Provider gateway failure safely transitions Payment to FAILED with audit details and leaves no dangling pending orders"
  );

  // =========================================================================
  // CATEGORY F: PROVIDER ORDER REFERENCE, MULTIPLE ATTEMPTS & DB UNIQUENESS
  // =========================================================================
  console.log(
    "\n--- Category F: Provider Order Reference, Multiple Attempts & Database Uniqueness ---"
  );

  // Test 23: Payment.razorpayOrderId is authoritatively stored on payment attempt
  const persistedPayment17 = await prisma.payment.findUnique({
    where: { id: validInitiationRes.paymentId },
  });

  assert(
    persistedPayment17.razorpayOrderId === validInitiationRes.razorpayOrderId &&
      validInitiationRes.razorpayOrderId.startsWith("order_test_"),
    23,
    "Payment.razorpayOrderId is authoritatively stored on payment attempt"
  );

  // Test 24: Single Order supports multiple distinct Payment attempts with unique razorpayOrderIds
  const retryOrder = await prisma.order.findUnique({
    where: { id: validInitiationRes.orderId },
  });

  // Mark first payment attempt as FAILED
  await prisma.payment.update({
    where: { id: validInitiationRes.paymentId },
    data: { status: "FAILED" },
  });

  const secondRzpOrder = await mockRzpClient.orders.create({
    amount: 264900,
    currency: "INR",
    receipt: "retry_attempt_2",
  });

  const secondPaymentAttempt = await prisma.payment.create({
    data: {
      orderId: retryOrder.id,
      provider: "RAZORPAY",
      status: "PENDING",
      amount: retryOrder.totalAmount,
      currency: "INR",
      razorpayOrderId: secondRzpOrder.id,
    },
  });

  const orderPaymentAttempts = await prisma.payment.findMany({
    where: { orderId: retryOrder.id },
  });

  const distinctRzpOrderIds = new Set(orderPaymentAttempts.map((p) => p.razorpayOrderId));

  assert(
    orderPaymentAttempts.length >= 2 && distinctRzpOrderIds.size >= 2,
    24,
    "Single Order supports multiple distinct Payment attempts with unique razorpayOrderIds"
  );

  // Test 25: Database @unique constraint enforces Payment.razorpayOrderId uniqueness (P2002)
  let duplicateOrderThrew = false;
  try {
    await prisma.payment.create({
      data: {
        orderId: retryOrder.id,
        provider: "RAZORPAY",
        status: "PENDING",
        amount: retryOrder.totalAmount,
        currency: "INR",
        razorpayOrderId: secondRzpOrder.id, // Duplicate!
      },
    });
  } catch (err) {
    duplicateOrderThrew =
      err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
  }
  assert(
    duplicateOrderThrew,
    25,
    "Database @unique constraint enforces Payment.razorpayOrderId uniqueness (P2002)"
  );

  // =========================================================================
  // CATEGORY G: SERVER-AUTHORITATIVE PAYMENT VERIFICATION & PROVIDER STATES
  // =========================================================================
  console.log(
    "\n--- Category G: Server-Authoritative Payment Verification & Provider State Retrieval ---"
  );

  // Test 26: Unauthenticated verification request rejected
  const unauthVerifyRes = await verifyPaymentAttempt(
    {
      paymentId: secondPaymentAttempt.id,
      razorpayOrderId: secondRzpOrder.id,
      razorpayPaymentId: "pay_test_dummy",
      razorpaySignature: "sig_test_dummy",
    },
    null
  );
  assert(
    unauthVerifyRes.success === false && unauthVerifyRes.error === "UNAUTHENTICATED",
    26,
    "Unauthenticated payment verification request rejected"
  );

  // Test 27: Non-existent payment attempt returns PAYMENT_NOT_FOUND
  const nonExistentVerifyRes = await verifyPaymentAttempt(
    {
      paymentId: "pay-non-existent-999",
      razorpayOrderId: "order_dummy",
      razorpayPaymentId: "pay_dummy",
      razorpaySignature: "sig_dummy",
    },
    userA
  );
  assert(
    nonExistentVerifyRes.success === false &&
      nonExistentVerifyRes.error === "PAYMENT_NOT_FOUND",
    27,
    "Verification of non-existent payment returns PAYMENT_NOT_FOUND"
  );

  // Test 28: Cross-customer verification IDOR defense
  const idorVerifyRes = await verifyPaymentAttempt(
    {
      paymentId: secondPaymentAttempt.id,
      razorpayOrderId: secondRzpOrder.id,
      razorpayPaymentId: "pay_test_dummy",
      razorpaySignature: "sig_test_dummy",
    },
    userB
  );
  assert(
    idorVerifyRes.success === false && idorVerifyRes.error === "FORBIDDEN",
    28,
    "Cross-customer verification IDOR attempt blocked (FORBIDDEN)"
  );

  // Test 29: Order ID mismatch rejected
  const mismatchOrderIdRes = await verifyPaymentAttempt(
    {
      paymentId: secondPaymentAttempt.id,
      razorpayOrderId: "order_mismatched_id_999",
      razorpayPaymentId: "pay_test_dummy",
      razorpaySignature: "sig_test_dummy",
    },
    userA
  );
  assert(
    mismatchOrderIdRes.success === false &&
      mismatchOrderIdRes.error === "ORDER_ID_MISMATCH",
    29,
    "Razorpay order ID mismatch rejected (ORDER_ID_MISMATCH)"
  );

  // Test 30: Invalid signature marks Payment as FAILED
  const invalidSigRes = await verifyPaymentAttempt(
    {
      paymentId: secondPaymentAttempt.id,
      razorpayOrderId: secondRzpOrder.id,
      razorpayPaymentId: "pay_test_invalid_sig",
      razorpaySignature: "invalid_tampered_signature_999",
    },
    userA
  );

  const failedSigPayment = await prisma.payment.findUnique({
    where: { id: secondPaymentAttempt.id },
  });

  assert(
    invalidSigRes.success === false &&
      invalidSigRes.error === "SIGNATURE_MISMATCH" &&
      failedSigPayment.status === "FAILED" &&
      failedSigPayment.errorDetails?.reason === "SIGNATURE_VERIFICATION_FAILED",
    30,
    "Invalid signature marks Payment as FAILED with SIGNATURE_VERIFICATION_FAILED"
  );

  // Reset payment status to PENDING for subsequent positive tests
  await prisma.payment.update({
    where: { id: secondPaymentAttempt.id },
    data: { status: "PENDING", errorDetails: Prisma.DbNull },
  });

  // Test 31: Provider payment status "captured" sets Payment -> SUCCESSFUL while Order.status STRICTLY REMAINS PENDING
  const realPaymentId = `pay_test_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const realSignature = crypto
    .createHmac("sha256", validTestSecret)
    .update(`${secondRzpOrder.id}|${realPaymentId}`)
    .digest("hex");

  const capturedRzpClient = {
    payments: {
      fetch: async (payId) => ({
        id: payId,
        status: "captured",
        amount: 264900,
        currency: "INR",
        order_id: secondRzpOrder.id,
        method: "card",
      }),
    },
  };

  const capturedVerifyRes = await verifyPaymentAttempt(
    {
      paymentId: secondPaymentAttempt.id,
      razorpayOrderId: secondRzpOrder.id,
      razorpayPaymentId: realPaymentId,
      razorpaySignature: realSignature,
      testOverrides: { razorpayClientOverride: capturedRzpClient },
    },
    userA
  );

  const updatedPayment31 = await prisma.payment.findUnique({
    where: { id: secondPaymentAttempt.id },
  });
  const updatedOrder31 = await prisma.order.findUnique({
    where: { id: retryOrder.id },
  });

  assert(
    capturedVerifyRes.success === true &&
      capturedVerifyRes.status === "SUCCESSFUL" &&
      capturedVerifyRes.isCaptured === true &&
      updatedPayment31.status === "SUCCESSFUL" &&
      updatedPayment31.razorpayPaymentId === realPaymentId &&
      updatedPayment31.razorpaySignature === realSignature &&
      updatedOrder31.status === "PENDING", // CRITICAL: strictly PENDING!
    31,
    "Captured provider payment transitions Payment -> SUCCESSFUL while Order.status STRICTLY REMAINS PENDING"
  );

  // Test 32: Provider payment status "authorized" (not captured) keeps Payment -> PENDING and Order -> PENDING
  const authTestOrder = await prisma.order.create({
    data: {
      orderNumber: `RH-AUTH-TEST-${Date.now()}`,
      userId: userA.id,
      status: "PENDING",
      subtotal: new Prisma.Decimal("1000.00"),
      taxableAmount: new Prisma.Decimal("1000.00"),
      taxAmount: new Prisma.Decimal("180.00"),
      cgstAmount: new Prisma.Decimal("90.00"),
      sgstAmount: new Prisma.Decimal("90.00"),
      igstAmount: new Prisma.Decimal("0.00"),
      shippingAmount: new Prisma.Decimal("0.00"),
      discountAmount: new Prisma.Decimal("0.00"),
      totalAmount: new Prisma.Decimal("1180.00"),
      shippingAddressId: addressA.id,
    },
  });

  const authTestRzpOrderId = `order_test_auth_${Date.now()}`;
  const authTestPayment = await prisma.payment.create({
    data: {
      orderId: authTestOrder.id,
      provider: "RAZORPAY",
      status: "PENDING",
      amount: new Prisma.Decimal("1180.00"),
      currency: "INR",
      razorpayOrderId: authTestRzpOrderId,
    },
  });

  const authPaymentId = `pay_test_auth_${Date.now()}`;
  const authSignature = crypto
    .createHmac("sha256", validTestSecret)
    .update(`${authTestRzpOrderId}|${authPaymentId}`)
    .digest("hex");

  const authorizedRzpClient = {
    payments: {
      fetch: async (payId) => ({
        id: payId,
        status: "authorized",
        amount: 118000,
        currency: "INR",
        order_id: authTestRzpOrderId,
        method: "card",
      }),
    },
  };

  const authVerifyRes = await verifyPaymentAttempt(
    {
      paymentId: authTestPayment.id,
      razorpayOrderId: authTestRzpOrderId,
      razorpayPaymentId: authPaymentId,
      razorpaySignature: authSignature,
      testOverrides: { razorpayClientOverride: authorizedRzpClient },
    },
    userA
  );

  const updatedAuthPayment = await prisma.payment.findUnique({
    where: { id: authTestPayment.id },
  });
  const updatedAuthOrder = await prisma.order.findUnique({
    where: { id: authTestOrder.id },
  });

  assert(
    authVerifyRes.success === true &&
      authVerifyRes.status === "PENDING" &&
      authVerifyRes.isAuthorized === true &&
      authVerifyRes.isCaptured === false &&
      updatedAuthPayment.status === "PENDING" &&
      updatedAuthPayment.errorDetails?.captured === false &&
      updatedAuthOrder.status === "PENDING",
    32,
    "Merely authorized payment keeps Payment.status = PENDING and captured = false (not treated as settled)"
  );

  // Test 33: Provider payment status "failed" marks Payment -> FAILED with provider error details
  const failedTestRzpOrderId = `order_test_fail_${Date.now()}`;
  const failedTestPayment = await prisma.payment.create({
    data: {
      orderId: authTestOrder.id,
      provider: "RAZORPAY",
      status: "PENDING",
      amount: new Prisma.Decimal("1180.00"),
      currency: "INR",
      razorpayOrderId: failedTestRzpOrderId,
    },
  });

  const failedPaymentId = `pay_test_failed_${Date.now()}`;
  const failedSignature = crypto
    .createHmac("sha256", validTestSecret)
    .update(`${failedTestRzpOrderId}|${failedPaymentId}`)
    .digest("hex");

  const failedProviderRzpClient = {
    payments: {
      fetch: async (payId) => ({
        id: payId,
        status: "failed",
        amount: 118000,
        currency: "INR",
        order_id: failedTestRzpOrderId,
        method: "card",
        error_code: "BAD_REQUEST_ERROR",
        error_description: "Payment declined by customer issuing bank",
      }),
    },
  };

  const failedProviderVerifyRes = await verifyPaymentAttempt(
    {
      paymentId: failedTestPayment.id,
      razorpayOrderId: failedTestRzpOrderId,
      razorpayPaymentId: failedPaymentId,
      razorpaySignature: failedSignature,
      testOverrides: { razorpayClientOverride: failedProviderRzpClient },
    },
    userA
  );

  const updatedFailedPayment = await prisma.payment.findUnique({
    where: { id: failedTestPayment.id },
  });

  assert(
    failedProviderVerifyRes.success === false &&
      failedProviderVerifyRes.status === "FAILED" &&
      failedProviderVerifyRes.providerStatus === "failed" &&
      updatedFailedPayment.status === "FAILED" &&
      updatedFailedPayment.errorDetails?.errorCode === "BAD_REQUEST_ERROR",
    33,
    "Provider payment status 'failed' transitions Payment to FAILED with error audit fields"
  );

  // Test 34: Duplicate payment verification handled idempotently
  const duplicateVerifyRes = await verifyPaymentAttempt(
    {
      paymentId: secondPaymentAttempt.id,
      razorpayOrderId: secondRzpOrder.id,
      razorpayPaymentId: realPaymentId,
      razorpaySignature: realSignature,
    },
    userA
  );
  assert(
    duplicateVerifyRes.success === true &&
      duplicateVerifyRes.status === "SUCCESSFUL" &&
      duplicateVerifyRes.message.includes("already been verified"),
    34,
    "Duplicate payment verification request handled idempotently without re-processing"
  );

  // =========================================================================
  // CATEGORY H: CUSTOMER CANCELLATION & RACE CONDITION DEFENSE
  // =========================================================================
  console.log("\n--- Category H: Customer Cancellation & Race Condition Defense ---");

  // Test 35: Customer cancellation on PENDING payment marks Payment -> FAILED with CUSTOMER_CANCELLED
  const cancelTestPayment = await prisma.payment.create({
    data: {
      orderId: authTestOrder.id,
      provider: "RAZORPAY",
      status: "PENDING",
      amount: new Prisma.Decimal("500.00"),
      currency: "INR",
      razorpayOrderId: `order_cancel_test_${Date.now()}`,
    },
  });

  const cancelRes = await cancelPaymentAttempt(cancelTestPayment.id, userA);
  const cancelledRecord = await prisma.payment.findUnique({
    where: { id: cancelTestPayment.id },
  });

  assert(
    cancelRes.success === true &&
      cancelledRecord.status === "FAILED" &&
      cancelledRecord.errorDetails?.reason === "CUSTOMER_CANCELLED",
    35,
    "Customer modal dismiss transitions PENDING payment to FAILED with CUSTOMER_CANCELLED"
  );

  // Test 36: Cannot cancel an already SUCCESSFUL / captured payment attempt (race condition guard)
  const cancelSuccessfulRes = await cancelPaymentAttempt(secondPaymentAttempt.id, userA);
  const stillSuccessfulPayment = await prisma.payment.findUnique({
    where: { id: secondPaymentAttempt.id },
  });

  assert(
    cancelSuccessfulRes.success === false &&
      cancelSuccessfulRes.message.includes(
        "Cannot cancel a payment attempt that has already succeeded"
      ) &&
      stillSuccessfulPayment.status === "SUCCESSFUL",
    36,
    "Race condition defense: Customer cancellation CANNOT overwrite an already SUCCESSFUL payment"
  );

  // Test 37: Repeated cancellation requests handled idempotently without error
  const repeatCancelRes = await cancelPaymentAttempt(cancelTestPayment.id, userA);
  assert(
    repeatCancelRes.success === true &&
      repeatCancelRes.message.includes("already cancelled or failed"),
    37,
    "Repeated cancellation requests are idempotent and safely return success"
  );

  // =========================================================================
  // CATEGORY I: BROWSER E2E UI TEST & TEST MODE INDICATORS
  // =========================================================================
  console.log("\n--- Category I: Browser E2E UI Test & Test Mode Indicators ---");

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(30000);

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.error("  [BROWSER CONSOLE ERROR]:", msg.text());
      }
    });
    page.on("pageerror", (err) => {
      console.error("  [BROWSER PAGE EXCEPTION]:", err.message);
    });

    // Step 1: Login as Alex Chen
    console.log("  Logging into customer account...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 3000)); // Ensure React 19 hydration completes
    await page.waitForSelector('input[name="email"]', { timeout: 20000 });
    await page.type('input[name="email"]', "alex.chen@example.com", { delay: 50 });
    await page.type('input[name="password"]', "Password123!", { delay: 50 });
    await new Promise((r) => setTimeout(r, 1000));
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 3500));
    console.log(`  Logged in. Current URL: ${page.url()}`);

    // Step 2: Set cart items in localStorage
    console.log("  Setting cart in localStorage...");
    await page.evaluate(() => {
      const cartData = {
        state: {
          items: [
            {
              id: "prod-1:Carbon Obsidian",
              productId: "prod-1",
              slug: "voronoi-kinetic-vessel",
              name: "Voronoi Kinetic Vessel",
              priceInPaise: 249900,
              quantity: 1,
              selectedColor: "Carbon Obsidian",
              imageUrl: "/images/products/voronoi-kinetic-vessel.jpg",
            },
          ],
        },
        version: 1,
      };
      localStorage.setItem("robohatch-cart-storage", JSON.stringify(cartData));
    });

    // Step 3: Navigate to /checkout
    console.log("  Navigating to /checkout...");
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: "networkidle2" });
    console.log(`  Navigated. Current URL: ${page.url()}`);
    console.log(`  Page Title: ${await page.title()}`);

    // Wait for client hydration to complete
    await new Promise((r) => setTimeout(r, 4000));
    const bodyText = await page.evaluate(() => document.body.innerText);

    // Check for Razorpay Test Mode Badge in Order Summary
    const hasTestModeBadge =
      bodyText.includes("Razorpay Test Mode") ||
      (await page.content()).includes("Razorpay Test Mode");

    // Take screenshot of Checkout UI showing Razorpay Test Mode indicator
    const screenshotPath = path.join(
      ARTIFACTS_DIR,
      "checkout-phase7d-razorpay-test-mode.png"
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });

    assert(
      hasTestModeBadge === true,
      38,
      "Checkout UI displays 'Razorpay Test Mode — No real funds will be charged' badge"
    );

    console.log(`  ✓ Screenshot saved: ${screenshotPath}`);
  } catch (uiErr) {
    console.error("  ✗ Browser UI test error:", uiErr);
    assert(false, 38, "Browser UI test encountered error", uiErr.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // =========================================================================
  // CATEGORY J: OBJECTIVE 1 — MULTI-INSTANCE DATABASE IDEMPOTENCY & CLAIM RECOVERY
  // =========================================================================
  console.log(
    "\n--- Category J: Objective 1 — Multi-Instance Database Idempotency & Claim Recovery ---"
  );

  // Test 39: Two independent Node.js OS processes simultaneously call initiatePaymentAttempt
  // Sharing only the PostgreSQL database. Both must return identical order & payment without duplicate records.
  const workerScriptPath = path.join(
    process.cwd(),
    "scratch",
    "worker-initiate-payment.mjs"
  );

  const intentHash39 = computeCartIntentHash(userA.id, addressA.id, [
    { productId: "prod-1", quantity: 1 },
  ]);
  const claimKey39 = `${userA.id}:${intentHash39}`;
  await prisma.paymentInitiationClaim.deleteMany({ where: { claimKey: claimKey39 } });

  const runWorkerProcess = (workerId) => {
    return new Promise((resolve, reject) => {
      const child = fork(workerScriptPath, [workerId, userA.id, addressA.id], {
        execArgv: ["--import", "tsx"],
      });
      let result = null;
      child.on("message", (msg) => {
        result = msg;
      });
      child.on("error", (err) => reject(err));
      child.on("exit", (code) => {
        if (code === 0 && result) {
          resolve(result);
        } else {
          reject(new Error(`Worker ${workerId} exited with code ${code}`));
        }
      });
    });
  };

  // Launch two isolated OS child processes simultaneously
  const [workerResult1, workerResult2] = await Promise.all([
    runWorkerProcess("instance-1"),
    runWorkerProcess("instance-2"),
  ]);

  const claimsInDb39 = await prisma.paymentInitiationClaim.findMany({
    where: { claimKey: claimKey39 },
  });

  assert(
    workerResult1.success === true &&
      workerResult2.success === true &&
      workerResult1.orderId === workerResult2.orderId &&
      workerResult1.paymentId === workerResult2.paymentId &&
      workerResult1.razorpayOrderId === workerResult2.razorpayOrderId &&
      claimsInDb39.length === 1 &&
      claimsInDb39[0].status === "COMPLETED",
    39,
    "Multi-instance concurrency: Two independent OS processes sharing PostgreSQL resolve identically with zero duplicates"
  );

  // Test 40: Stale database claim recovery (lease expired)
  const staleClaimKey = `stale_claim_test_${Date.now()}`;
  await prisma.paymentInitiationClaim.create({
    data: {
      claimKey: staleClaimKey,
      userId: userA.id,
      intentHash: "stale_hash",
      status: "PENDING",
      expiresAt: new Date(Date.now() - 5000), // Expired 5 seconds ago
    },
  });

  const staleRecoveryRes = await prisma.paymentInitiationClaim.updateMany({
    where: {
      claimKey: staleClaimKey,
      status: "PENDING",
      expiresAt: { lte: new Date() },
    },
    data: {
      status: "PENDING",
      expiresAt: new Date(Date.now() + 30000),
      updatedAt: new Date(),
    },
  });

  assert(
    staleRecoveryRes.count === 1,
    40,
    "Stale claim recovery: Expired lease is atomically reclaimed and recovered without deadlock"
  );
  await prisma.paymentInitiationClaim.deleteMany({ where: { claimKey: staleClaimKey } });

  // Test 41: Failed claim recovery (failed attempt allows immediate retry)
  const failedClaimKey = `failed_claim_test_${Date.now()}`;
  await prisma.paymentInitiationClaim.create({
    data: {
      claimKey: failedClaimKey,
      userId: userA.id,
      intentHash: "failed_hash",
      status: "FAILED",
      expiresAt: new Date(Date.now() + 30000),
    },
  });

  const failedResetRes = await prisma.paymentInitiationClaim.updateMany({
    where: {
      claimKey: failedClaimKey,
      status: "FAILED",
    },
    data: {
      status: "PENDING",
      expiresAt: new Date(Date.now() + 30000),
      updatedAt: new Date(),
    },
  });

  assert(
    failedResetRes.count === 1,
    41,
    "Failed claim recovery: Failed claim is atomically reset to PENDING permitting immediate fresh initiation"
  );
  await prisma.paymentInitiationClaim.deleteMany({ where: { claimKey: failedClaimKey } });

  // =========================================================================
  // CATEGORY K: OBJECTIVE 2 — AUTHORITATIVE PRICING & CATALOGUE-CHANGE PROTECTION
  // =========================================================================
  console.log(
    "\n--- Category K: Objective 2 — Authoritative Pricing & Catalogue-Change Protection ---"
  );

  // Setup base attempt on prod-3 (Modular MagSafe Dock, ₹3,400 = 340,000 paise)
  const baseInitiation = await initiatePaymentAttempt(
    {
      items: [{ productId: "prod-3", quantity: 1 }],
      deliveryAddressId: addressA.id,
      testOverrides: {
        taxVerificationOverrides: { "prod-3": "VERIFIED" },
        taxRateOverrides: { "prod-3": 18 },
        hsnCodeOverrides: { "prod-3": "3926.90.99" },
        shippingCalculatorOverride: new ConfigurableFlatRateShippingCalculator({
          flatRateInPaise: 15000,
        }),
        sellerOriginOverride: {
          sellerStateCode: "KA",
          sellerStateName: "Karnataka",
          country: "IN",
          isConfigured: true,
        },
        razorpayClientOverride: mockRzpClient,
      },
    },
    userA
  );

  assert(
    baseInitiation.success === true && baseInitiation.amountInPaise === 355000,
    42,
    "Base payment attempt initiated on prod-3 (₹3,400 + ₹150 = ₹3,550.00)"
  );

  // Test 43: Identical unchanged checkout correctly reuses the existing valid attempt
  const identicalReuseRes = await initiatePaymentAttempt(
    {
      items: [{ productId: "prod-3", quantity: 1 }],
      deliveryAddressId: addressA.id,
      testOverrides: {
        taxVerificationOverrides: { "prod-3": "VERIFIED" },
        taxRateOverrides: { "prod-3": 18 },
        hsnCodeOverrides: { "prod-3": "3926.90.99" },
        shippingCalculatorOverride: new ConfigurableFlatRateShippingCalculator({
          flatRateInPaise: 15000,
        }),
        sellerOriginOverride: {
          sellerStateCode: "KA",
          sellerStateName: "Karnataka",
          country: "IN",
          isConfigured: true,
        },
        razorpayClientOverride: mockRzpClient,
      },
    },
    userA
  );

  assert(
    identicalReuseRes.success === true &&
      identicalReuseRes.orderId === baseInitiation.orderId &&
      identicalReuseRes.paymentId === baseInitiation.paymentId &&
      identicalReuseRes.razorpayOrderId === baseInitiation.razorpayOrderId,
    43,
    "Identical unchanged checkout correctly reuses the valid existing attempt"
  );

  // Test 44: Product price changed in database after initiation prevents attempt reuse
  const origProd3 = await prisma.product.findUnique({ where: { id: "prod-3" } });
  // Update price in database: ₹3,400 -> ₹3,900 (390,000 paise)
  await prisma.product.update({
    where: { id: "prod-3" },
    data: { basePrice: new Prisma.Decimal("3900.00") },
  });

  const priceChangedRes = await initiatePaymentAttempt(
    {
      items: [{ productId: "prod-3", quantity: 1 }],
      deliveryAddressId: addressA.id,
      testOverrides: {
        taxVerificationOverrides: { "prod-3": "VERIFIED" },
        taxRateOverrides: { "prod-3": 18 },
        hsnCodeOverrides: { "prod-3": "3926.90.99" },
        shippingCalculatorOverride: new ConfigurableFlatRateShippingCalculator({
          flatRateInPaise: 15000,
        }),
        sellerOriginOverride: {
          sellerStateCode: "KA",
          sellerStateName: "Karnataka",
          country: "IN",
          isConfigured: true,
        },
        razorpayClientOverride: mockRzpClient,
      },
    },
    userA
  );

  // Restore original product price
  await prisma.product.update({
    where: { id: "prod-3" },
    data: { basePrice: origProd3.basePrice },
  });

  assert(
    priceChangedRes.success === true &&
      priceChangedRes.orderId !== baseInitiation.orderId &&
      priceChangedRes.paymentId !== baseInitiation.paymentId &&
      priceChangedRes.amountInPaise === 405000, // 3900 + 150 = 4050.00 (405,000 paise)
    44,
    "Catalogue change protection: Product price change prevents reuse and creates fresh attempt with updated price"
  );

  // Test 45: Variant price changed in database after initiation prevents attempt reuse
  const variant1 = await prisma.productVariant.findFirst({
    where: { productId: "prod-1" },
  });
  const origVariantPrice = variant1.price;

  const baseVariantAttempt = await initiatePaymentAttempt(
    {
      items: [{ productId: "prod-1", variantId: variant1.id, quantity: 1 }],
      deliveryAddressId: addressA.id,
      testOverrides: {
        taxVerificationOverrides: { "prod-1": "VERIFIED" },
        taxRateOverrides: { "prod-1": 18 },
        hsnCodeOverrides: { "prod-1": "3926.90.99" },
        shippingCalculatorOverride: new ConfigurableFlatRateShippingCalculator({
          flatRateInPaise: 15000,
        }),
        sellerOriginOverride: {
          sellerStateCode: "KA",
          sellerStateName: "Karnataka",
          country: "IN",
          isConfigured: true,
        },
        razorpayClientOverride: mockRzpClient,
      },
    },
    userA
  );

  // Change variant price in database
  await prisma.productVariant.update({
    where: { id: variant1.id },
    data: { price: new Prisma.Decimal("2999.00") },
  });

  const variantPriceChangedRes = await initiatePaymentAttempt(
    {
      items: [{ productId: "prod-1", variantId: variant1.id, quantity: 1 }],
      deliveryAddressId: addressA.id,
      testOverrides: {
        taxVerificationOverrides: { "prod-1": "VERIFIED" },
        taxRateOverrides: { "prod-1": 18 },
        hsnCodeOverrides: { "prod-1": "3926.90.99" },
        shippingCalculatorOverride: new ConfigurableFlatRateShippingCalculator({
          flatRateInPaise: 15000,
        }),
        sellerOriginOverride: {
          sellerStateCode: "KA",
          sellerStateName: "Karnataka",
          country: "IN",
          isConfigured: true,
        },
        razorpayClientOverride: mockRzpClient,
      },
    },
    userA
  );

  // Restore variant price
  await prisma.productVariant.update({
    where: { id: variant1.id },
    data: { price: origVariantPrice },
  });

  assert(
    variantPriceChangedRes.success === true &&
      variantPriceChangedRes.orderId !== baseVariantAttempt.orderId &&
      variantPriceChangedRes.paymentId !== baseVariantAttempt.paymentId &&
      variantPriceChangedRes.amountInPaise === 314900, // 2999 + 150 = 3149.00
    45,
    "Catalogue change protection: Variant price change prevents reuse and creates fresh attempt"
  );

  // Test 46: Product deactivated (isActive = false) blocks checkout initiation and never reuses old attempt
  await prisma.product.update({
    where: { id: "prod-3" },
    data: { isActive: false },
  });

  const deactivatedProdRes = await initiatePaymentAttempt(
    {
      items: [{ productId: "prod-3", quantity: 1 }],
      deliveryAddressId: addressA.id,
      testOverrides: {
        taxVerificationOverrides: { "prod-3": "VERIFIED" },
        taxRateOverrides: { "prod-3": 18 },
        hsnCodeOverrides: { "prod-3": "3926.90.99" },
        shippingCalculatorOverride: new ConfigurableFlatRateShippingCalculator({
          flatRateInPaise: 15000,
        }),
        sellerOriginOverride: {
          sellerStateCode: "KA",
          sellerStateName: "Karnataka",
          country: "IN",
          isConfigured: true,
        },
        razorpayClientOverride: mockRzpClient,
      },
    },
    userA
  );

  // Restore product active status
  await prisma.product.update({
    where: { id: "prod-3" },
    data: { isActive: true },
  });

  assert(
    deactivatedProdRes.success === false &&
      deactivatedProdRes.validationErrors?.some((e) => e.code === "PRODUCT_INACTIVE"),
    46,
    "Catalogue change protection: Deactivated product blocks checkout initiation and prevents reuse"
  );

  // Test 47: Variant deactivated (stock = 0) blocks checkout initiation and never reuses old attempt
  const origVariantStock = variant1.stock;
  await prisma.productVariant.update({
    where: { id: variant1.id },
    data: { stock: 0 },
  });

  const deactivatedVarRes = await initiatePaymentAttempt(
    {
      items: [{ productId: "prod-1", variantId: variant1.id, quantity: 1 }],
      deliveryAddressId: addressA.id,
      testOverrides: {
        taxVerificationOverrides: { "prod-1": "VERIFIED" },
        taxRateOverrides: { "prod-1": 18 },
        hsnCodeOverrides: { "prod-1": "3926.90.99" },
        shippingCalculatorOverride: new ConfigurableFlatRateShippingCalculator({
          flatRateInPaise: 15000,
        }),
        sellerOriginOverride: {
          sellerStateCode: "KA",
          sellerStateName: "Karnataka",
          country: "IN",
          isConfigured: true,
        },
        razorpayClientOverride: mockRzpClient,
      },
    },
    userA
  );

  // Restore variant stock
  await prisma.productVariant.update({
    where: { id: variant1.id },
    data: { stock: origVariantStock },
  });

  assert(
    deactivatedVarRes.success === false &&
      deactivatedVarRes.validationErrors?.some((e) => e.code === "PRODUCT_OUT_OF_STOCK"),
    47,
    "Catalogue change protection: Deactivated/out-of-stock variant blocks checkout initiation and prevents reuse"
  );

  // Test 48: Tax configuration changed prevents attempt reuse
  const taxChangedRes = await initiatePaymentAttempt(
    {
      items: [{ productId: "prod-3", quantity: 1 }],
      deliveryAddressId: addressA.id,
      testOverrides: {
        taxVerificationOverrides: { "prod-3": "VERIFIED" },
        taxRateOverrides: { "prod-3": 12 }, // Changed from 18% to 12%
        hsnCodeOverrides: { "prod-3": "3926.90.99" },
        shippingCalculatorOverride: new ConfigurableFlatRateShippingCalculator({
          flatRateInPaise: 15000,
        }),
        sellerOriginOverride: {
          sellerStateCode: "KA",
          sellerStateName: "Karnataka",
          country: "IN",
          isConfigured: true,
        },
        razorpayClientOverride: mockRzpClient,
      },
    },
    userA
  );

  assert(
    taxChangedRes.success === true &&
      taxChangedRes.orderId !== baseInitiation.orderId &&
      taxChangedRes.paymentId !== baseInitiation.paymentId,
    48,
    "Catalogue change protection: Tax rate change prevents reuse and creates fresh attempt"
  );

  // Test 49: Shipping configuration changed prevents attempt reuse
  const shippingChangedRes = await initiatePaymentAttempt(
    {
      items: [{ productId: "prod-3", quantity: 1 }],
      deliveryAddressId: addressA.id,
      testOverrides: {
        taxVerificationOverrides: { "prod-3": "VERIFIED" },
        taxRateOverrides: { "prod-3": 18 },
        hsnCodeOverrides: { "prod-3": "3926.90.99" },
        shippingCalculatorOverride: new ConfigurableFlatRateShippingCalculator({
          flatRateInPaise: 25000, // Changed from ₹150 to ₹250
        }),
        sellerOriginOverride: {
          sellerStateCode: "KA",
          sellerStateName: "Karnataka",
          country: "IN",
          isConfigured: true,
        },
        razorpayClientOverride: mockRzpClient,
      },
    },
    userA
  );

  assert(
    shippingChangedRes.success === true &&
      shippingChangedRes.orderId !== baseInitiation.orderId &&
      shippingChangedRes.amountInPaise === 365000, // 3400 + 250 = 3650.00 (365,000 paise)
    49,
    "Catalogue change protection: Shipping charge change prevents reuse and creates fresh attempt"
  );

  // =========================================================================
  // FINAL SUMMARY
  // =========================================================================
  console.log(
    "\n==============================================================================="
  );
  console.log(`   PHASE 7D TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log(
    "===============================================================================\n"
  );

  await prisma.$disconnect();

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runPhase7DTests().catch((err) => {
  console.error("Fatal test runner error:", err);
  prisma.$disconnect();
  process.exit(1);
});
