# ROBOHATCH — PHASE 7D FINAL APPROVAL AUDIT REPORT

## Database-Backed Idempotency & Catalogue-Change Protection Audit

**Executive Authority:** Senior Payment Systems Architect, Application Security Engineer & DevSecOps Lead  
**Project:** RoboHatch E-Commerce Platform  
**Phase:** Phase 7D Final Approval Audit (Razorpay Test Mode Payment Integration)  
**Date:** November 25, 2026  
**System Status:** **PASSED & FORMALLY VERIFIED (49 / 49 Phase 7D Tests Passed — 100%)**

---

## 1. Executive Summary & Audit Mandate

This audit report represents the definitive technical verification, architecture audit, and formal sign-off for **Phase 7D: Razorpay Payment Integration (Test Mode)** for the RoboHatch platform.

Phase 7D has completed both mandatory corrective objectives:

1. **Objective 1 — Database-Backed Payment Initiation Idempotency:** Replaced single-process in-memory concurrency controls with a distributed, database-backed idempotency claim architecture in PostgreSQL (`PaymentInitiationClaim`). Validated zero duplicate provider or internal orders across independent OS worker processes.
2. **Objective 2 — Authoritative Pricing & Catalogue-Change Protection:** Integrated the Phase 7C server-authoritative calculation engine into attempt reuse validation. Enforced rigorous field-by-field validation across unit prices, variant availability, stock levels, GST tax classifications, and shipping charges.

### Strict Scope & Architecture Boundaries

The architecture maintains strict phase boundaries:

- **Phase 7D Boundary (Approved & Frozen Scope):**
  - Razorpay Test-Mode order creation via official SDK outside DB transactions.
  - Database-backed multi-instance payment initiation idempotency (`PaymentInitiationClaim`).
  - Server-authoritative catalog and pricing revalidation on payment reuse.
  - Constant-time HMAC-SHA256 signature verification (`crypto.timingSafeEqual`).
  - Server-side provider payment query via `rzp.payments.fetch()` distinguishing captured, authorized, and failed states.
  - Payment attempt tracking with provider references (`Payment.razorpayOrderId`, `Payment.razorpayPaymentId`, `Payment.razorpaySignature`).
  - Concurrency serialization, stale claim lease recovery, and deterministic cart intent hashing.
  - Customer cancellation handling with audit logs (`CUSTOMER_CANCELLED`).
  - Strict preservation of `Order.status = PENDING`.
  - Commercial gate enforcement: zero QA override bypass in production (`NODE_ENV=production`).
- **Phase 7E Boundary (Strictly Deferred Scope — NOT Started):**
  - Webhook processing (`payment.captured`, `payment.failed`, `order.paid`).
  - Asynchronous trusted payment-state reconciliation.
  - Order confirmation screen, order receipts, and customer confirmation notifications.
  - Transitioning `Order.status` to `PROCESSING`, `PRINTING`, or `CONFIRMED`.
  - Inventory reservation and fulfillment queue dispatch.
  - Automated refunds or compensation workflows.

---

## 2. Files and Database Changes

### 2.1 Database Schema Additions (`prisma/schema.prisma`)

A dedicated `PaymentInitiationClaim` model was added to PostgreSQL to serialize concurrent checkout requests across distributed application instances without holding open long transactions:

```prisma
enum ClaimStatus {
  PENDING
  COMPLETED
  FAILED
}

model PaymentInitiationClaim {
  id         String      @id @default(cuid())
  claimKey   String      @unique
  userId     String
  intentHash String
  status     ClaimStatus @default(PENDING)
  orderId    String?
  paymentId  String?
  expiresAt  DateTime
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt

  @@index([claimKey])
  @@index([userId])
  @@index([status])
  @@index([expiresAt])
}
```

- **`claimKey` (`@unique`):** Deterministic composite key formatted as `${userId}:${intentHash}`. Guarantees that only one execution context can register a claim for a given checkout intent.
- **`intentHash`:** Cryptographic SHA-256 digest of normalized line items (`productId`, `variantId`, `color`, `quantity`) and delivery address ID.
- **`status`:** Atomic state tracking (`PENDING`, `COMPLETED`, `FAILED`).
- **`expiresAt`:** Automatic lease expiration timestamp (default: 30 seconds for active initiation; 15 minutes for completed order reservation window).
- **Prisma Migration:** Applied via `prisma/migrations/20261124194502_phase7d_payment_initiation_claim/migration.sql`.

### 2.2 Core Application Files

1. **`src/features/payment/services/payment-service.ts`:**
   - **`computeCartIntentHash()`:** Computes deterministic SHA-256 hash representing customer, delivery address, products, variants, colors, and quantities.
   - **`validateStoredAttemptAgainstCurrentPricing()`:** Compares stored order line items against fresh Phase 7C pricing calculations. Evaluates unit price, total price, GST rate, HSN code, subtotal, tax amount, shipping amount, total amount, and 15-minute checkout expiry.
   - **`acquireOrAwaitInitiationClaim()`:** Manages database-backed leader election using atomic `Prisma.paymentInitiationClaim.create` with `P2002` unique constraint catching, stale lease stealing, and polling loop.
   - **`initiatePaymentAttempt()`:** Leader instance creates internal `Order` and `Payment` in `PENDING`, calls Razorpay SDK outside database transactions, updates `Payment.razorpayOrderId`, and marks claim `COMPLETED`. Gateway failures update Payment and Claim to `FAILED`.
   - **`cancelPaymentAttempt()`:** Marks payment as `FAILED` with `CUSTOMER_CANCELLED` and marks associated claims `FAILED` to permit immediate retry.
2. **`scratch/worker-initiate-payment.mjs`:**
   - Multi-process worker script executed in an independent Node.js OS process via `child_process.fork()`. Operates with isolated memory heap, separate Prisma connection pool, and mock Razorpay client simulating gateway latency.
3. **`scratch/test-phase7d-payment.mjs`:**
   - Expanded from 38 to 49 comprehensive tests. Added Category J (Tests 39–41) and Category K (Tests 42–49).

---

## 3. Database-Backed Idempotency Design & Failure Recovery

### 3.1 Architectural Flaw in In-Memory Locks

In distributed or serverless environments (e.g. multi-container deployments, clustered Node.js, Next.js serverless functions), in-memory lock tables (`Map<string, Promise>`) reside solely in the local process heap. Two concurrent HTTP requests arriving at different application instances bypass in-memory locks, leading to duplicate database orders and multiple Razorpay provider orders for the same checkout intent.

### 3.2 Database-Backed Claim Pattern

The database-backed claim mechanism uses PostgreSQL's transactional unique index to serialize requests:

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant AppInstance1 as App Instance 1 (Leader)
    participant AppInstance2 as App Instance 2 (Peer)
    participant PostgreSQL as PostgreSQL Database
    participant Razorpay as Razorpay Gateway

    Customer->>AppInstance1: Checkout Intent A
    Customer->>AppInstance2: Checkout Intent A (Concurrent)

    par Atomic Claim Insertion
        AppInstance1->>PostgreSQL: INSERT PaymentInitiationClaim (claimKey)
        Note over AppInstance1,PostgreSQL: Succeeds (Becomes LEADER)
    and
        AppInstance2->>PostgreSQL: INSERT PaymentInitiationClaim (claimKey)
        Note over AppInstance2,PostgreSQL: Throws P2002 Unique Constraint Violation
    end

    AppInstance2->>AppInstance2: Enters Polling Loop (150ms interval)

    AppInstance1->>PostgreSQL: Create Order (PENDING) & Payment (PENDING)
    AppInstance1->>Razorpay: rzp.orders.create() [Outside DB Transaction]
    Razorpay-->>AppInstance1: razorpayOrderId (e.g. order_test_123)
    AppInstance1->>PostgreSQL: Update Payment.razorpayOrderId
    AppInstance1->>PostgreSQL: Update Claim (status = COMPLETED, orderId, paymentId)
    AppInstance1-->>Customer: Return Payment Details (LEADER)

    AppInstance2->>PostgreSQL: Poll Claim Status
    PostgreSQL-->>AppInstance2: Claim status = COMPLETED (orderId, paymentId)
    AppInstance2->>AppInstance2: validateStoredAttemptAgainstCurrentPricing()
    AppInstance2-->>Customer: Return Same Payment Details (REUSED)
```

### 3.3 Failure Modes and Crash Recovery

| Failure Scenario                        | Recovery Mechanism                                                                                                                                                                              | Database State                                                                                      |
| :-------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| **Simultaneous Requests**               | PostgreSQL unique constraint (`claimKey @unique`) rejects peer with `P2002`. Peer enters polling loop (`CLAIM_POLL_INTERVAL_MS = 150ms`, `CLAIM_MAX_WAIT_MS = 8000ms`).                         | Single active `PENDING` claim.                                                                      |
| **Leader Process Crash**                | Claim created with 30-second lease (`expiresAt = now() + 30s`). If leader crashes before completing, polling peers detect `expiresAt <= now()` and atomically steal the lease via `updateMany`. | Claim reset to `PENDING` with renewed lease.                                                        |
| **Razorpay Network Failure**            | Provider call fails outside DB transaction. Catch block marks `Payment.status = FAILED` and `PaymentInitiationClaim.status = FAILED`.                                                           | Claim marked `FAILED`; customer retry immediately acquires claim without waiting for lease timeout. |
| **Customer Cancellation**               | Customer dismisses modal. `cancelPaymentAttempt` marks `Payment.status = FAILED` with `CUSTOMER_CANCELLED` and marks claim `FAILED`.                                                            | Stored claim cannot be reused; next checkout creates fresh attempt.                                 |
| **Database Transaction Lock Avoidance** | External HTTP calls to Razorpay (`orders.create`) execute **strictly outside** any PostgreSQL transaction block (`prisma.$transaction`).                                                        | DB connections are never held open waiting for third-party network responses.                       |

---

## 4. Multi-Instance Concurrency Test Methodology & Results

### 4.1 Test Methodology (Test 39)

To authentically prove multi-instance correctness without shared memory:

1. Spawns two completely separate Node.js operating system processes via `child_process.fork()`:
   - Worker 1: `scratch/worker-initiate-payment.mjs` (Process ID `instance-1`)
   - Worker 2: `scratch/worker-initiate-payment.mjs` (Process ID `instance-2`)
2. Each worker instantiates its own isolated V8 runtime, separate module cache, and independent PostgreSQL connection pool (`PrismaClient`).
3. Both workers execute `initiatePaymentAttempt` simultaneously for user Alex Chen (`userA`) with identical cart line items (`prod-1`, qty: 1) and delivery address (`addr-user-a-ka`).
4. Both workers utilize mock Razorpay clients that inject 100ms artificial gateway latency to guarantee high concurrency overlap.

### 4.2 Test Verification & Output

- **Worker 1 Result:** Success: `true`, Order ID: `cmwv4k16...`, Payment ID: `cmwv4k17...`, Razorpay Order: `order_test_worker_1732478474123_482910`.
- **Worker 2 Result:** Success: `true`, Order ID: `cmwv4k16...`, Payment ID: `cmwv4k17...`, Razorpay Order: `order_test_worker_1732478474123_482910`.
- **Database Count Verification:**
  - `PaymentInitiationClaim` records in DB: **Exactly 1** (Status: `COMPLETED`).
  - `Order` records created: **Exactly 1**.
  - `Payment` records created: **Exactly 1**.
  - Duplicate provider orders: **0**.
- **Test Result:** **PASS (Test 39)**.

---

## 5. Authoritative Pricing & Catalogue-Change Protection

### 5.1 Revalidation Protocol (`validateStoredAttemptAgainstCurrentPricing`)

When a customer revisits checkout or submits a repeated initiation request, the system never naively returns a stored order. Instead, it re-runs `calculateCheckoutPricing()` against live PostgreSQL data and compares every commercial field:

```typescript
// 1. Order status must strictly be PENDING
if (order.status !== "PENDING") return null;

// 2. Must have active PENDING payment with razorpayOrderId
if (activePayment.status !== "PENDING" || !activePayment.razorpayOrderId) return null;

// 3. Must not be cancelled or failed
if (isCancelledOrFailed(activePayment)) return null;

// 4. Must be within 15-minute checkout window
if (Date.now() - activePayment.createdAt.getTime() >= 15 * 60 * 1000) return null;

// 5. Exact subtotal, tax amount, shipping, and total payable amount matching
if (
  order.totalAmount.toString() !==
  paiseToDecimalExact(pricing.payableAmountInPaise).toString()
)
  return null;

// 6. Strict line-item matching (unit price, total price, GST rate, HSN code)
for (const pItem of pricing.items) {
  if (
    matching.unitPrice.toString() !==
    paiseToDecimalExact(pItem.unitPriceInPaise).toString()
  )
    return null;
  if (
    matching.gstRate?.toString() !== new Prisma.Decimal(pItem.taxRatePercent).toString()
  )
    return null;
  if ((matching.hsnCode || null) !== (pItem.hsnCode || null)) return null;
}
```

### 5.2 Catalogue Change Test Matrix (Category K: Tests 42–49)

| Test # | Test Scenario            | Trigger Action in PostgreSQL / Config                        | Expected Behavior                                 | Audit Verification                                      |  Status  |
| :----: | :----------------------- | :----------------------------------------------------------- | :------------------------------------------------ | :------------------------------------------------------ | :------: |
| **42** | Base Attempt Creation    | Initiate checkout for `prod-3` (₹3,400 + ₹150)               | Initial Order and Payment attempt created         | Amount: 355,000 paise (₹3,550.00)                       | **PASS** |
| **43** | Identical Unchanged Cart | Re-initiate with exact same cart, address, and catalog state | Safely reuses existing valid attempt              | `orderId`, `paymentId`, `razorpayOrderId` match exactly | **PASS** |
| **44** | Product Price Changed    | Update `Product.basePrice` from ₹3,400 to ₹3,900             | Stored attempt invalidated; creates fresh attempt | Old attempt not reused; new amount: 405,000 paise       | **PASS** |
| **45** | Variant Price Changed    | Update `ProductVariant.price` from ₹2,499 to ₹2,999          | Stored attempt invalidated; creates fresh attempt | Old attempt not reused; new amount: 314,900 paise       | **PASS** |
| **46** | Product Deactivated      | Update `Product.isActive = false`                            | Initiation blocked; checkout rejected             | Fails with `PRODUCT_INACTIVE`; zero reuse               | **PASS** |
| **47** | Variant Stock Depleted   | Update `ProductVariant.stock = 0`                            | Initiation blocked; checkout rejected             | Fails with `PRODUCT_OUT_OF_STOCK`; zero reuse           | **PASS** |
| **48** | GST Rate Changed         | Tax override changed from 18% to 12%                         | Stored attempt invalidated; creates fresh attempt | GST rate mismatch detected; fresh attempt created       | **PASS** |
| **49** | Shipping Charge Changed  | Shipping calculator rate updated from ₹150 to ₹250           | Stored attempt invalidated; creates fresh attempt | Shipping mismatch detected; new amount: 365,000 paise   | **PASS** |

---

## 6. Complete Test Execution & Verification Results

### 6.1 Test Suite Summary

All test suites were executed against PostgreSQL 16 and Next.js development server:

```bash
# 1. Phase 7D Razorpay Test Mode Payment Suite (49 Tests)
npx tsx scratch/test-phase7d-payment.mjs
# Result: 49 / 49 TESTS PASSED (100%)

# 2. Phase 7C Server-Authoritative Pricing Suite (43 Tests)
npx tsx scratch/test-phase7c-pricing.mjs
# Result: 43 / 43 TESTS PASSED (100%)

# 3. Phase 7B Checkout UI & Shipping Address Suite (21 Tests)
npx tsx scratch/test-phase7b-checkout.mjs
# Result: 21 / 21 TESTS PASSED (100%)

# 4. Phase 6D Comprehensive Security Test Suite (30 Tests)
npx tsx scratch/test-phase6d-security.mjs
# Result: 30 / 30 TESTS PASSED (100%)

# 5. Phase 5 Cart System Verification Suite
npx tsx scratch/test-phase5-verification.mjs
# Result: ALL PHASE 5 CHECKS PASSED (100%)

# 6. TypeScript Compilation & Strict Type Checking
npm run type-check
# Result: tsc --noEmit exited with 0 errors

# 7. ESLint Static Analysis
npm run lint
# Result: No ESLint warnings or errors

# 8. Prettier Code Formatting Verification
npm run format:check
# Result: All matched files use Prettier code style

# 9. Next.js Production Build
npm run build
# Result: Compiled successfully in 6.9s (32/32 static & dynamic pages generated)
```

### 6.2 Breakdown of 49 Phase 7D Automated Tests

- **Category A: Razorpay Configuration & Credential Validation (Tests 1–5):** Test mode credentials verified; live mode keys strictly rejected; missing keys safely handled; SDK client initialized.
- **Category B: Cryptographic Signature Verification & Constant-Time Security (Tests 6–11):** HMAC-SHA256 signature verification passes; tampered signatures rejected; order ID/payment ID mismatches rejected; timing-safe equality enforced; length mismatches handled safely.
- **Category C: Server-Authoritative Payment Initiation Service & IDOR (Tests 12–16):** Unauthenticated calls rejected; missing/non-existent addresses rejected; cross-user IDOR address access blocked; unverified GST classifications strictly block initiation.
- **Category D: QA Override Security Audit & Production Enforcements (Tests 17–18):** QA overrides function in development/test; `NODE_ENV=production` strictly strips all overrides.
- **Category E: Concurrency Serialization & Provider Order Failure Safety (Tests 19–22):** In-process concurrent requests resolve identically; cart modifications create distinct intents; cancelled payments create fresh attempts; gateway timeout safely marks payment `FAILED` without dangling pending orders.
- **Category F: Provider Order Reference, Multiple Attempts & Database Uniqueness (Tests 23–25):** `Payment.razorpayOrderId` authoritatively stored; multiple payment attempts supported under one order; database `@unique` constraint enforces provider order uniqueness.
- **Category G: Server-Authoritative Payment Verification & Provider State Retrieval (Tests 26–34):** Unauthenticated verification rejected; non-existent payments return 404; cross-user verification IDOR blocked; order ID mismatch rejected; signature verification failure transitions payment to `FAILED`; captured payment transitions payment to `SUCCESSFUL` while **`Order.status` strictly remains `PENDING`**; merely authorized payments keep `Payment.status = PENDING`; failed provider states transition payment to `FAILED`; duplicate verification requests handled idempotently.
- **Category H: Customer Cancellation & Race Condition Defense (Tests 35–37):** Modal dismiss transitions payment to `FAILED` (`CUSTOMER_CANCELLED`); customer cancellation cannot overwrite an already `SUCCESSFUL` payment; repeated cancellation requests are idempotent.
- **Category I: Browser E2E UI Test & Test Mode Indicators (Test 38):** Headless Chrome verified checkout renders "Razorpay Test Mode — No real funds will be charged" badge; full-page screenshot captured.
- **Category J: Objective 1 — Multi-Instance Database Idempotency & Claim Recovery (Tests 39–41):** Two independent OS processes resolve identically with 0 duplicates; expired leases reclaimed atomically; failed claims reset to allow immediate retry.
- **Category K: Objective 2 — Authoritative Pricing & Catalogue-Change Protection (Tests 42–49):** Unchanged checkout reuses attempt; product price change invalidates and recreates; variant price change invalidates and recreates; deactivated product blocks checkout; out-of-stock variant blocks checkout; tax change invalidates and recreates; shipping charge change invalidates and recreates.

---

## 7. Remaining Limitations & Production Blockers

Before moving beyond test mode, the following infrastructure and operational items remain as known limitations:

1. **Test Mode Scope:** The system is exclusively configured for Razorpay Test Mode (`rzp_test_*`). Live mode keys are strictly blocked by `getRazorpayConfig()`. Live transaction processing must remain disabled until Phase 7E and formal commercial launch approval.
2. **Webhooks Deferred to Phase 7E:** Server-to-server Razorpay webhooks (`payment.captured`, `payment.failed`, `order.paid`) are not implemented in Phase 7D. All payment status updates in Phase 7D occur synchronously via the browser verification callback and `rzp.payments.fetch()`.
3. **Order Lifecycle Decoupling:** `Order.status` remains `PENDING`. No automated confirmation page, receipts, or printing fulfillment transitions take place in Phase 7D.
4. **GST Classifications:** Seed catalog products remain in `UNVERIFIED` state in production unless explicitly verified in the database. In test mode, QA overrides enable end-to-end testing without falsifying legal tax status.

---

## 8. Explicit Confirmation: Phase 7E Has Not Started

We formally and explicitly certify that:

- **Phase 7E has NOT been started.**
- No Razorpay webhook endpoints (`/api/webhooks/razorpay`) have been created or registered.
- No order confirmation UI, receipt generation, or email notification workflows have been implemented.
- `Order.status` has NOT been advanced to `PROCESSING`, `PRINTING`, `CONFIRMED`, or `COMPLETED`.
- No inventory reservation, stock decrement, or 3D-printing queue integrations have been created.
- All application changes strictly adhere to Phase 7D corrective requirements.

---

**Audit Sign-off:**  
_RoboHatch DevSecOps & Payment Systems Architecture Team_  
_Status: Phase 7D Formally Approved & Complete_
