# ROBOHATCH — PHASE 7D DELIVERABLE

## Razorpay Payment Integration (Test Mode) Technical Implementation Report

**Document Version:** 1.0.0  
**Phase Status:** Complete & Verified  
**Environment:** Razorpay Test Mode (`rzp_test_...`)  
**Security Level:** Enterprise Grade / PCI-DSS Compliant Gateway Handoff

---

## 1. Executive Summary

Phase 7D successfully establishes the payment infrastructure for RoboHatch by integrating the official Razorpay Node SDK in **STRICT TEST MODE**. Building on the frozen, server-authoritative Phase 7C pricing and tax calculation engine, Phase 7D enables authenticated customers to initiate payment attempts, securely render the client-side Razorpay checkout modal on demand, and verify provider payment signatures using constant-time HMAC-SHA256 cryptography.

Crucially, all strict business, regulatory, and financial boundaries established in Phase 7C are preserved:

- Product prices remain GST-inclusive with zero tax added on top.
- Payment initiation is strictly blocked (`isPayable: false`) whenever product tax classifications are `UNVERIFIED` or shipping rules are `UNCONFIGURED`.
- Client-supplied prices, subtotals, tax figures, and shipping fees are categorically ignored.
- Provider payment order identifiers are authoritatively managed via `Payment.razorpayOrderId` with uniqueness constraints, natively supporting multiple payment attempts per internal `Order`.
- Payment webhooks, automated refund routines, and final order confirmation / invoice generation remain cleanly deferred to Phase 7E as mandated.

---

## 2. Razorpay Configuration & Test Mode Enforcement

### 2.1 Credential Architecture

Razorpay credentials are strictly read from process environment variables and validated at runtime via `src/features/payment/config/razorpay-config.ts`:

- `RAZORPAY_KEY_ID`: Public key identifier (must begin with `rzp_test_`).
- `RAZORPAY_KEY_SECRET`: Private server-side secret used exclusively for Razorpay API calls and HMAC-SHA256 signature verification.
- `RAZORPAY_WEBHOOK_SECRET`: Reserved for Phase 7E webhook signature validation.
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Client-exposed key passed to Razorpay checkout options.

### 2.2 Live Key Guardrail

To prevent catastrophic accidental transactions during staging or testing, `getRazorpayConfig()` performs strict pattern matching:

```typescript
if (keyId.startsWith("rzp_live_")) {
  throw new RazorpayConfigurationError(
    "RoboHatch Phase 7D is restricted to Razorpay Test Mode only. Live API keys ('rzp_live_...') are strictly forbidden."
  );
}
```

If credentials are absent or fail the `rzp_test_` prefix test, the configuration layer fails safely returning `{ isConfigured: false, isTestMode: false }`, preventing application crashes while disabling payment capture paths.

---

## 3. Server-Authoritative Payment Initiation Service

Payment initiation is centralized in `initiatePaymentAttempt()` located at `src/features/payment/services/payment-service.ts`:

### 3.1 Step-by-Step Flow

1. **Customer Authentication:** Validates session ownership using Auth.js `session.user.id`. Standalone unauthenticated requests are rejected immediately.
2. **Configuration Verification:** Ensures Razorpay test credentials are valid and active.
3. **Delivery Address Ownership & IDOR Defense:** Verifies that `deliveryAddressId` exists in PostgreSQL and strictly belongs to `session.user.id`. Cross-customer address hijacking is blocked.
4. **Phase 7C Pricing Engine Reconciliation:** Cart items, variants, and quantities are submitted to `calculateCheckoutPricing()`.
5. **Strict Commercial Gate:** Checks `pricing.isPayable`. If any item carries `taxVerificationStatus: UNVERIFIED` or shipping is `UNCONFIGURED`, initiation halts immediately with descriptive validation errors:
   `Payment initiation blocked: checkout pricing is not payable. Tax classification is unverified or shipping is unconfigured.`
6. **Idempotency Protection:** If an `idempotencyKey` is provided, the service searches for a matching recent (<15 min) `PENDING` payment attempt for the user with identical amount, returning the existing order reference to prevent duplicate financial orders.
7. **PostgreSQL Order Record Creation:** Persists an internal `Order` in `PENDING` status with integer-converted `Prisma.Decimal` values for `subtotal`, `taxableAmount`, `taxAmount`, `cgstAmount`, `sgstAmount`, `igstAmount`, `shippingAmount`, and `totalAmount`.
8. **PostgreSQL Payment Attempt Record Creation:** Creates a `Payment` record in `PENDING` status linked to `order.id` with provider `RAZORPAY`.
9. **Provider Order Creation:** Calls the official Razorpay SDK:
   ```typescript
   rzpOrder = await rzp.orders.create({
     amount: payableAmountInPaise,
     currency: "INR",
     receipt: payment.id,
     notes: {
       orderId: order.id,
       orderNumber: order.orderNumber,
       paymentId: payment.id,
       userId: user.id,
     },
   });
   ```
10. **Authoritative Provider Linking:** Updates `Payment.razorpayOrderId` with `rzpOrder.id`.

---

## 4. Provider-Order Reference & Multi-Attempt Integrity

### 4.1 Relationship Model

A single commercial `Order` may undergo multiple payment attempts (e.g. initial failure due to bank timeout, followed by a successful retry).
In `prisma/schema.prisma`:

- `Order` has a 1-to-many relationship with `Payment` (`Order.payments Payment[]`).
- `Payment.razorpayOrderId` is typed `String? @unique`.
- Each Razorpay order created corresponds to exactly one `Payment` attempt record.
- The unique constraint at the PostgreSQL database level (`Payment_razorpayOrderId_key`) prevents provider collisions.

### 4.2 Handling Multiple Payment Attempts

When a payment attempt fails or is cancelled:

1. `Payment.status` is updated to `FAILED` with failure audit reasons in `errorDetails`.
2. The internal `Order` remains in `PENDING` status.
3. A subsequent initiation on the same order generates a new `Payment` record with a distinct `Payment.razorpayOrderId`.
4. Only the specific attempt that produces a cryptographically verified signature transitions to `SUCCESSFUL`, simultaneously advancing `Order.status` to `PROCESSING`.

---

## 5. Constant-Time HMAC-SHA256 Signature Verification

Signature verification is implemented in `src/features/payment/lib/signature-verification.ts`:

### 5.1 Verification Algorithm

Razorpay signs checkout transactions using HMAC-SHA256 over the payload string:
$$\text{payload} = \text{razorpayOrderId} \parallel "|" \parallel \text{razorpayPaymentId}$$
$$\text{expectedSignature} = \text{HMAC-SHA256}_{\text{keySecret}}(\text{payload})$$

### 5.2 Constant-Time Comparison

Standard string comparisons (`===`) are vulnerable to byte-by-byte timing attacks. RoboHatch strictly enforces constant-time buffer comparison via Node.js `crypto.timingSafeEqual`:

```typescript
const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
const receivedBuffer = Buffer.from(razorpaySignature.trim(), "utf-8");

if (expectedBuffer.length !== receivedBuffer.length) {
  return false;
}

return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
```

### 5.3 Verification Service Workflow

When `verifyPaymentAttempt()` is invoked:

1. Verifies authenticated customer session.
2. Loads `Payment` attempt record by `paymentId`.
3. IDOR Defense: Verifies `payment.order.userId === user.id`.
4. Idempotency Guard: If `payment.status === "SUCCESSFUL"`, returns success immediately without re-processing.
5. Provider Order ID Cross-Check: Confirms `payment.razorpayOrderId === input.razorpayOrderId`.
6. Executes constant-time signature verification.
7. On verification failure: updates `Payment.status = FAILED`, records failure timestamp and reason, and returns `SIGNATURE_MISMATCH`.
8. On verification success:
   - Updates `Payment.status = SUCCESSFUL`.
   - Records `Payment.razorpayPaymentId`, `Payment.razorpaySignature`, and `Payment.transactionId`.
   - Updates `Order.status = PROCESSING`.

---

## 6. Frontend Payment Flow & Customer Experience

### 6.1 On-Demand Script Loading (`useRazorpay`)

The client hook `useRazorpay()` in `src/features/payment/hooks/use-razorpay.ts` loads `https://checkout.razorpay.com/v1/checkout.js` strictly on demand.

- The script is not loaded globally on the homepage, catalogue, or product detail pages.
- Duplicate script tags are detected and prevented.
- Network timeouts and loading failures surface clean feedback to the user.

### 6.2 Test Mode UI Disclosure

The checkout summary component displays an explicit visual test mode badge:

- **Visual Badge:** Amber badge with animated pulse dot stating: `Razorpay Test Mode — No real funds will be charged`.
- **Button State:** When payable, the primary CTA displays `Pay ₹[Amount] with Razorpay`.
- **Pending Configuration Disclosure:** When unverified GST or unconfigured shipping is active, the CTA is disabled with an explanatory label: `Payment is unavailable: Tax classification or shipping is unverified.`

### 6.3 Duplicate Submission & Cancellation Handling

- **Duplicate Click Prevention:** During initiation or verification, `isProcessing: true` disables the button and renders a spinner (`Preparing Payment...`).
- **Modal Dismissal (`modal.ondismiss`):** Closing the Razorpay modal leaves the Zustand customer cart completely preserved in `localStorage`, marks the pending attempt as `CUSTOMER_CANCELLED` on the server, and allows immediate retry without data loss.

---

## 7. Automated Test Suite & QA Validation Matrix

The dedicated test suite `scratch/test-phase7d-payment.mjs` executes **30 automated tests** covering every functional, cryptographic, and security requirement:

| Test ID | Category     | Description                                                                                | Status   |
| ------- | ------------ | ------------------------------------------------------------------------------------------ | -------- |
| 1       | Config       | Missing credentials returns safe unconfigured object                                       | **PASS** |
| 2       | Config       | Missing credentials causes `getRazorpayClient` to throw `RazorpayConfigurationError`       | **PASS** |
| 3       | Config       | Live API keys (`rzp_live_...`) are strictly blocked with explicit error                    | **PASS** |
| 4       | Config       | Valid test credentials (`rzp_test_...`) accepted with `isTestMode: true`                   | **PASS** |
| 5       | Config       | Non-test, non-live key prefix returns `isConfigured: false` safely                         | **PASS** |
| 6       | Crypto       | Valid HMAC-SHA256 signature verified successfully                                          | **PASS** |
| 7       | Crypto       | Tampered signature (1 character altered) rejected in constant time                         | **PASS** |
| 8       | Crypto       | Tampered Razorpay Order ID rejected by HMAC verification                                   | **PASS** |
| 9       | Crypto       | Tampered Razorpay Payment ID rejected by HMAC verification                                 | **PASS** |
| 10      | Crypto       | Empty parameters safely return false without throwing exceptions                           | **PASS** |
| 11      | Crypto       | Mismatched signature buffer length returns false safely                                    | **PASS** |
| 12      | Initiation   | Unauthenticated payment initiation rejected                                                | **PASS** |
| 13      | Initiation   | Missing delivery address rejected                                                          | **PASS** |
| 14      | Initiation   | Non-existent delivery address rejected                                                     | **PASS** |
| 15      | Initiation   | Cross-customer delivery address IDOR attempt blocked                                       | **PASS** |
| 16      | Initiation   | Strict Phase 7C Gate: Unverified GST classifications block payment initiation              | **PASS** |
| 17      | Initiation   | Controlled QA override satisfies all gates and initiates Razorpay test order (₹2,649.00)   | **PASS** |
| 18      | Initiation   | PostgreSQL Order & Payment records created in PENDING state with exact decimal 2649.00     | **PASS** |
| 19      | Order Ref    | `Payment.razorpayOrderId` is authoritatively stored on payment attempt                     | **PASS** |
| 20      | Order Ref    | Idempotent repeated initiation with identical key returns existing pending payment attempt | **PASS** |
| 21      | Order Ref    | Single Order supports multiple distinct Payment attempts with unique razorpayOrderIds      | **PASS** |
| 22      | Order Ref    | Database `@unique` constraint enforces `Payment.razorpayOrderId` uniqueness (`P2002`)      | **PASS** |
| 23      | Verification | Unauthenticated payment verification request rejected                                      | **PASS** |
| 24      | Verification | Verification of non-existent payment returns `PAYMENT_NOT_FOUND`                           | **PASS** |
| 25      | Verification | Cross-customer verification IDOR attempt blocked (`FORBIDDEN`)                             | **PASS** |
| 26      | Verification | Razorpay order ID mismatch rejected (`ORDER_ID_MISMATCH`)                                  | **PASS** |
| 27      | Verification | Valid signature transitions Payment to SUCCESSFUL and Order to PROCESSING                  | **PASS** |
| 28      | Verification | Duplicate payment verification request handled idempotently without re-processing          | **PASS** |
| 29      | Cancellation | Modal dismiss / customer cancellation recorded as FAILED with `CUSTOMER_CANCELLED`         | **PASS** |
| 30      | Browser UI   | Checkout UI displays 'Razorpay Test Mode — No real funds will be charged' badge            | **PASS** |

**Overall Suite Result:** **30 / 30 Tests Passed (100%)**.

---

## 8. Build, Lint & Format Audit

| Check                    | Tool / Command         | Result   | Notes                                     |
| ------------------------ | ---------------------- | -------- | ----------------------------------------- |
| TypeScript Strict Check  | `npm run type-check`   | **PASS** | 0 type errors across all modules          |
| ESLint Code Quality      | `npm run lint`         | **PASS** | 0 warnings, 0 errors                      |
| Prettier Code Style      | `npm run format:check` | **PASS** | All matched files use Prettier style      |
| Next.js Production Build | `npm run build`        | **PASS** | All 32 static and dynamic routes compiled |

---

## 9. Deliverable Summary & Readiness for Phase 7E

Phase 7D is formally complete, fully tested, and ready for review. All code adheres strictly to the planned Phase 7A payment architecture and Phase 7C pricing rules. Payment webhooks, order confirmation screens, and automated invoice dispatch remain cleanly isolated for Phase 7E implementation.
