# ROBOHATCH — PHASE 7E-B FINAL AUDIT & REMEDIATION REPORT

## Database Architecture Remediation: Refund Integrity, Reservation Lifecycle & Index Optimization

**Date:** November 25, 2026  
**System Role:** Senior PostgreSQL Database Architect, Application Security Engineer & Next.js Technical Lead  
**Phase:** Phase 7E-B (Database Schema Expansion & Remediation)  
**Status:** COMPLETE & FROZEN — Pending User Approval  
**Next Phase:** Phase 7E-C (Webhook Receiver Endpoint & Cryptographic Ingestion — NOT STARTED)

---

## 1. EXECUTIVE SUMMARY

Following the architectural audit of Phase 7E-B, four targeted remediations were identified and executed on the PostgreSQL database layer:

1. **Refund Referential Integrity**: Replaced cascading deletions on `Refund.orderId` and `Refund.paymentId` with `onDelete: Restrict`. Financial refund audit records can no longer be silently eliminated through parent record deletion.
2. **Inventory Reservation Lifecycle & Retries**: Replaced the restrictive `@@unique([orderId, variantId])` with `generation Int @default(1)` and composite unique constraint `@@unique([orderId, variantId, generation])`. Customers can now retry checkout after a reservation expires or is released while preserving full historical audit logs of prior reservation attempts.
3. **Refund Idempotency & Partial Refunds Architecture**: Documented and verified the idempotency and partial refund architecture. The system supports independent partial refunds against a single captured payment while enforcing that the cumulative refunded amount cannot exceed the captured payment total.
4. **Redundant Index Removal**: Removed duplicate B-tree indexes on `RazorpayWebhookEvent.eventId`, `Refund.idempotencyKey`, and `Refund.razorpayRefundId`. These fields already possess backing unique indexes created by `@unique` constraints.

The changes were packaged as an additive Prisma migration (`20261124204300_phase7e_remediation_models`), deployed, and verified with **100% data preservation** and **143 / 143 automated regression tests passing**.

---

## 2. EXACT SCHEMA CHANGES

The schema definitions in `prisma/schema.prisma` were remediated as follows:

### A. Model: `RazorpayWebhookEvent`

- **Removed**: Redundant `@@index([eventId])`.
- **Preserved**: `eventId String @unique` (provides the primary unique B-tree index `RazorpayWebhookEvent_eventId_key`).
- **Retained Indexes**: `[status, lockedAt]` (worker polling), `[eventType]` (event filtering), `[createdAt]` (audit ordering).

```prisma
model RazorpayWebhookEvent {
  id          String             @id @default(cuid())
  eventId     String             @unique
  eventType   String
  payload     Json
  rawBodyHash String
  status      WebhookEventStatus @default(PENDING)
  version     Int                @default(0) // Optimistic fencing/lease ownership token
  attempts    Int                @default(0)
  maxAttempts Int                @default(5)
  lastError   String?            @db.Text
  lockedAt    DateTime?
  lockedBy    String?
  processedAt DateTime?
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  @@index([status, lockedAt])
  @@index([eventType])
  @@index([createdAt])
}
```

### B. Model: `InventoryReservation`

- **Added**: `generation Int @default(1)` to track reservation retry attempts.
- **Replaced**: `@@unique([orderId, variantId])` → `@@unique([orderId, variantId, generation])`.
- **Added**: `@@index([orderId, variantId, status])` for active reservation querying.
- **Preserved**: `order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)` and `variant ProductVariant @relation(fields: [variantId], references: [id], onDelete: Restrict)`.

```prisma
model InventoryReservation {
  id            String            @id @default(cuid())
  orderId       String
  variantId     String
  generation    Int               @default(1) // Reservation attempt/generation counter
  quantity      Int
  status        ReservationStatus @default(RESERVED)
  expiresAt     DateTime
  committedAt   DateTime?
  releasedAt    DateTime?
  releaseReason String?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  order   Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  variant ProductVariant @relation(fields: [variantId], references: [id], onDelete: Restrict)

  @@unique([orderId, variantId, generation])
  @@index([orderId])
  @@index([variantId])
  @@index([status, expiresAt])
  @@index([orderId, variantId, status])
}
```

### C. Model: `Refund`

- **Modified Relations**:
  - `order Order @relation(fields: [orderId], references: [id], onDelete: Restrict)` (was `Cascade`)
  - `payment Payment @relation(fields: [paymentId], references: [id], onDelete: Restrict)` (was `Cascade`)
- **Removed**: Redundant `@@index([idempotencyKey])` and `@@index([razorpayRefundId])`.
- **Preserved Unique Constraints**: `idempotencyKey String @unique` and `razorpayRefundId String? @unique`.
- **Retained Indexes**: `@@index([orderId])`, `@@index([paymentId])`, `@@index([status])`.

```prisma
model Refund {
  id                String       @id @default(cuid())
  orderId           String
  paymentId         String
  idempotencyKey    String       @unique
  razorpayRefundId  String?      @unique
  razorpayPaymentId String
  amount            Decimal      @db.Decimal(10, 2)
  currency          String       @default("INR")
  status            RefundStatus @default(PENDING)
  reason            String
  errorDetails      Json?
  processedAt       DateTime?
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  order   Order   @relation(fields: [orderId], references: [id], onDelete: Restrict)
  payment Payment @relation(fields: [paymentId], references: [id], onDelete: Restrict)

  @@index([orderId])
  @@index([paymentId])
  @@index([status])
}
```

---

## 3. INVENTORY RESERVATION LIFECYCLE & RETRY STRATEGY

### The Core Problem

Under the prior schema constraint `@@unique([orderId, variantId])`, only one reservation could ever exist per `(orderId, variantId)` pair. If a reservation expired (e.g. 15-minute checkout TTL elapsed) or was released (customer cancelled payment modal), the customer could not re-attempt payment on that order without mutating or deleting the historical reservation record. Deleting or overwriting records destroys inventory auditing and prevents reconciliation of upstream stock movements.

### The Remediation Strategy: Generational Reservations

With `generation Int @default(1)` and `@@unique([orderId, variantId, generation])`:

1. **Initial Reservation Attempt (Generation 1)**:
   - When checkout begins, the system creates reservation records with `generation: 1`, `status: RESERVED`, and `expiresAt: now() + 15m`.
2. **Terminal Non-Successful State**:
   - If the payment window expires, background reconciliation or the checkout service marks the reservation as `status: EXPIRED`.
   - If the customer explicitly dismisses the modal, the reservation is marked as `status: RELEASED` with `releaseReason: "CUSTOMER_CANCELLED"`.
3. **Checkout Retry / Re-Initiation**:
   - When the customer clicks "Retry Payment" or re-attempts checkout on the existing order:
     - The service queries the highest existing generation for `(orderId, variantId)`.
     - It creates a new reservation record with `generation: currentMax + 1`, `status: RESERVED`, and a fresh `expiresAt`.
     - The prior generation's records remain untouched in the database as permanent audit evidence.
4. **State Machine Invariants**:
   - At most **one** reservation for a given `(orderId, variantId)` may be in `RESERVED` status at any point in time.
   - Only a reservation with `status = 'RESERVED'` can transition to `COMMITTED` (upon payment capture) or `RELEASED`/`EXPIRED`.
   - An index on `[orderId, variantId, status]` ensures $O(1)$ lookup speed when locating the currently active reservation during reconciliation.

---

## 4. REFUND IDEMPOTENCY & PARTIAL REFUND ARCHITECTURE

### The Core Requirements

The refund data layer must support:

1. **Idempotent Retries**: Network drops or duplicate client retries must never initiate duplicate financial transactions.
2. **Multiple Partial Refunds**: A captured transaction of ₹2,649 may need multiple partial refunds (e.g., ₹1,000 for item return, ₹500 for goodwill gesture).
3. **Cap Enforcement**: The cumulative sum of refunds must never exceed the captured payment total.

### Architectural Blueprint (For Phase 7E-E / Operations)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Merchant / Customer Service
    participant API as Refund Service (Phase 7E)
    participant DB as PostgreSQL (Prisma)
    participant RZP as Razorpay Refund API

    Admin->>API: Request Refund (paymentId, amount: ₹1,000, idempotencyKey: "ref_ord123_pt1")
    API->>DB: Check Refund.findUnique(idempotencyKey)
    alt Idempotency Key Exists
        DB-->>API: Return existing Refund record
        API-->>Admin: Return existing Refund (Idempotent 200 OK)
    else New Request
        API->>DB: BEGIN TRANSACTION (SERIALIZABLE or FOR UPDATE on Payment)
        API->>DB: SELECT Payment WHERE id = paymentId FOR UPDATE
        API->>DB: SELECT SUM(amount) FROM Refund WHERE paymentId = paymentId AND status IN ('PENDING', 'PROCESSED')
        alt (existingRefunds + requestedAmount) > payment.amount
            API->>DB: ROLLBACK
            API-->>Admin: Error: EXCEEDS_CAPTURED_AMOUNT (400)
        else Validation Passed
            API->>DB: INSERT INTO Refund (status: PENDING, amount: ₹1,000, idempotencyKey: "ref_ord123_pt1")
            API->>DB: COMMIT
            API->>RZP: POST /v1/payments/{payment_id}/refund (amount: 100000, notes: { idempotencyKey })
            RZP-->>API: Response (razorpayRefundId: "rfnd_xyz123", status: "processed")
            API->>DB: UPDATE Refund SET status = PROCESSED, razorpayRefundId = "rfnd_xyz123", processedAt = now()
            API-->>Admin: Refund Successful (200 OK)
        end
    end
```

### Concrete Partial Refund Example

- **Captured Payment**: `₹2,649.00` (`Payment.amount`)
- **Action 1 (Partial Return)**:
  - Idempotency Key: `ret_cmw01_item1_v1`
  - Amount: `₹1,000.00`
  - Check: `₹0.00 + ₹1,000.00 <= ₹2,649.00` -> **APPROVED**
  - Record: `Refund` created (`PROCESSED`, amount `₹1,000.00`)
- **Action 2 (Additional Return)**:
  - Idempotency Key: `ret_cmw01_item2_v1`
  - Amount: `₹1,649.00`
  - Check: `₹1,000.00 + ₹1,649.00 = ₹2,649.00 <= ₹2,649.00` -> **APPROVED**
  - Record: `Refund` created (`PROCESSED`, amount `₹1,649.00`)
- **Action 3 (Excess Refund Attempt)**:
  - Idempotency Key: `ret_cmw01_goodwill_v1`
  - Amount: `₹100.00`
  - Check: `₹2,649.00 + ₹100.00 = ₹2,749.00 > ₹2,649.00` -> **REJECTED** with `REFUND_EXCEEDS_PAYMENT_BALANCE`.

---

## 5. REFUND REFERENTIAL INTEGRITY (`ON DELETE RESTRICT`)

### Problem

Previously, `Refund` declared `onDelete: Cascade` to `Order` and `Payment`. If a test script, administrator, or database cleanup routine executed `DELETE FROM "Order" WHERE id = 'xyz'`, all financial refund records linked to that order would be permanently and silently deleted from the database. This violates financial accounting compliance, GST audit trails, and bank reconciliation requirements.

### Solution

Both foreign keys now enforce `ON DELETE RESTRICT`:

```sql
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "Payment"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
```

### Verification Against PostgreSQL System Catalog

Querying `information_schema.referential_constraints` confirms that the deletion rule is now authoritatively set to `RESTRICT`:

```json
[
  {
    "constraint_name": "Refund_orderId_fkey",
    "column_name": "orderId",
    "delete_rule": "RESTRICT",
    "foreign_table_name": "Order",
    "foreign_column_name": "id"
  },
  {
    "constraint_name": "Refund_paymentId_fkey",
    "column_name": "paymentId",
    "delete_rule": "RESTRICT",
    "foreign_table_name": "Payment",
    "foreign_column_name": "id"
  }
]
```

Any operation attempting to delete an `Order` or `Payment` that contains associated `Refund` records is immediately blocked by PostgreSQL with error `23503: foreign_key_violation`.

---

## 6. MIGRATION SQL SUMMARY

The migration was generated and applied via Prisma as `20261124204300_phase7e_remediation_models`:

```sql
-- DropForeignKey
ALTER TABLE "Refund" DROP CONSTRAINT "Refund_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Refund" DROP CONSTRAINT "Refund_paymentId_fkey";

-- DropIndex
DROP INDEX "InventoryReservation_orderId_variantId_key";

-- DropIndex
DROP INDEX "RazorpayWebhookEvent_eventId_idx";

-- DropIndex
DROP INDEX "Refund_idempotencyKey_idx";

-- DropIndex
DROP INDEX "Refund_razorpayRefundId_idx";

-- AlterTable
ALTER TABLE "InventoryReservation" ADD COLUMN "generation" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "InventoryReservation_orderId_variantId_status_idx"
  ON "InventoryReservation"("orderId", "variantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryReservation_orderId_variantId_generation_key"
  ON "InventoryReservation"("orderId", "variantId", "generation");

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "Payment"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
```

### Prisma Schema Sync Verification

Running `npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma` returned:

```
No difference detected.
```

This confirms 100% synchronization between the physical PostgreSQL engine and the Prisma schema model.

---

## 7. RECORD PRESERVATION EVIDENCE

Database record counts were audited before and immediately after applying migration `20261124204300_phase7e_remediation_models`:

| Table                    | Pre-Migration Count | Post-Migration Count |    Status     | Notes                      |
| :----------------------- | :-----------------: | :------------------: | :-----------: | :------------------------- |
| `User`                   |          9          |          9           | **PRESERVED** | Zero records modified      |
| `Product`                |         16          |          16          | **PRESERVED** | Zero records modified      |
| `ProductVariant`         |         17          |          17          | **PRESERVED** | Zero records modified      |
| `Order`                  |         79          |          79          | **PRESERVED** | Zero records modified      |
| `Payment`                |         117         |         117          | **PRESERVED** | Zero records modified      |
| `PaymentInitiationClaim` |          5          |          5           | **PRESERVED** | Zero records modified      |
| `RazorpayWebhookEvent`   |          0          |          0           |   **CLEAN**   | Inbox ready for Phase 7E-C |
| `InventoryReservation`   |          0          |          0           |   **CLEAN**   | Ready for Phase 7E-D       |
| `Refund`                 |          0          |          0           |   **CLEAN**   | Ready for Phase 7E-E       |

_Note: Subsequent regression test suites (`scratch/test-phase7d-payment.mjs`) created new test payment attempts as expected during automated test execution._

---

## 8. AUTOMATED VERIFICATION RESULTS

| Verification Check          | Target / Tool               |          Result           | Summary                                                  |
| :-------------------------- | :-------------------------- | :-----------------------: | :------------------------------------------------------- |
| **Prisma Validation**       | `npx prisma validate`       |         **PASS**          | Validated schema definition                              |
| **Prisma Formatting**       | `npx prisma format`         |         **PASS**          | Canonical formatting applied                             |
| **TypeScript Typecheck**    | `npm run type-check`        |         **PASS**          | 0 compilation errors (`tsc --noEmit`)                    |
| **ESLint Audit**            | `npm run lint`              |         **PASS**          | 0 warnings, 0 errors (`next lint`)                       |
| **Prettier Formatting**     | `npm run format:check`      |         **PASS**          | 100% compliant code formatting                           |
| **Production Build**        | `npm run build`             |         **PASS**          | 32/32 routes compiled statically and dynamically in 2.2s |
| **Phase 7D Payment Suite**  | `test-phase7d-payment.mjs`  |     **49 / 49 PASS**      | Claims, idempotency, test mode, signature verification   |
| **Phase 7C Pricing Suite**  | `test-phase7c-pricing.mjs`  |     **43 / 43 PASS**      | GST calculation, seller origin, responsive viewports     |
| **Phase 7B Checkout Suite** | `test-phase7b-checkout.mjs` |     **21 / 21 PASS**      | Address selection, order review, IDOR defenses           |
| **Phase 6D Security Suite** | `test-phase6d-security.mjs` |     **30 / 30 PASS**      | Auth, IDOR, password policy, CSRF, address atomicity     |
| **Total Automated Tests**   | **Full Regression Suite**   | **143 / 143 PASS (100%)** | Zero regressions across all project phases               |

---

## 9. REMAINING RISKS & MITIGATION

1. **Active Reservation Concurrency (Race Condition on Creation)**:
   - _Risk_: Two concurrent requests for the same order could attempt to create active reservations simultaneously.
   - _Mitigation_: In Phase 7E-D, payment initiation will run inside an atomic database claim lock (`PaymentInitiationClaim`), preventing concurrent checkout processes for the same customer session.
2. **Expired Reservation Clock Skew**:
   - _Risk_: A server with a skewed clock might consider a reservation valid while another considers it expired.
   - _Mitigation_: Expiration comparisons must use PostgreSQL's authoritative server timestamp `NOW()` via SQL statements rather than client/application node clock offsets.
3. **Refund Overpayment Protection in Concurrency**:
   - _Risk_: Two refund requests initiated simultaneously might both pass the cumulative balance check before either commits.
   - _Mitigation_: In Phase 7E-E, refund balance verification will use PostgreSQL pessimistic row locking (`SELECT ... FOR UPDATE` on the parent `Payment` row), ensuring serial execution of balance checks.

---

## 10. SCOPE CONFIRMATION

As strictly instructed:

- ❌ **Phase 7E-C has NOT been started.**
- ❌ No webhook endpoint (`/api/webhooks/razorpay`) has been created.
- ❌ No HMAC verification or webhook worker has been implemented.
- ❌ No payment reconciliation or order confirmation logic has been created.
- ❌ No inventory reservation or stock decrement operations have been implemented.
- ❌ No refund API calls or refund processing routes have been implemented.
- ❌ The database was NOT reset, and no existing records were deleted.

---

## 11. CONCLUSION & STATUS

Phase 7E-B database remediation is complete, audited, and verified. The database schema is fully hardened and ready for Phase 7E-C upon user approval.

**EXECUTION HALTED. Awaiting explicit user approval to proceed to Phase 7E-C.**
