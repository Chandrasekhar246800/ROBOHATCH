# RoboHatch — Phase 7C: Server-Authoritative Pricing, Shipping & Tax Calculation

## Final Architecture, Implementation & Verification Report

**Author:** Senior Full-Stack Engineer & Payment Systems Architect  
**Project:** RoboHatch  
**Phase:** 7C — Server-Authoritative Pricing, Shipping & Tax Calculation  
**Status:** COMPLETE & FULLY VERIFIED (Zero Regressions across Phases 0–7B)  
**Date:** November 22, 2026

---

### Executive Summary

Phase 7C establishes a secure, mathematically sound, server-authoritative calculation engine for RoboHatch. It enforces Indian Goods and Services Tax (GST) compliance under a **GST-inclusive pricing model**, introduces an extensible **Strategy Pattern shipping calculation engine**, and provides an immutable snapshot data model ready for Phase 7D (Razorpay Payment Integration) without premature order creation or payment side effects.

All monetary arithmetic is strictly conducted using integer paise (`BigInt`) and standard commercial Half-Up rounding ($0.5\text{ paise} \to 1\text{ paise}$), completely eliminating floating-point rounding drift. The pricing engine guarantees the fundamental conservation identity:

$$\text{Taxable Value} + \text{GST Amount} \equiv \text{Inclusive Price}$$

All calculations query PostgreSQL directly through Prisma ORM to guarantee that customer-supplied prices, subtotals, tax rates, or shipping fees submitted from the browser are strictly ignored and overridden by authoritative database records.

---

### 1. Implementation Summary

1. **GST-Inclusive Tax Extraction Engine (`src/features/pricing/lib/tax-calculation.ts`):**
   - Implements statutory reverse-extraction formula:
     $$\text{Taxable Value (paise)} = \mathrm{round}\left(\frac{\text{Inclusive Total (paise)} \times 10000}{10000 + (\text{GST Rate} \times 100)}\right)$$
     $$\text{GST Amount (paise)} = \text{Inclusive Total (paise)} - \text{Taxable Value (paise)}$$
   - Computes state-based tax distribution:
     - **Intra-State (Seller KA $\to$ Destination KA):** 50% CGST + 50% SGST (odd paise allocated to CGST to preserve exact penny reconciliation).
     - **Inter-State (Seller KA $\to$ Destination other states/UTs):** 100% IGST.
   - Enforces strict validation: unconfigured tax rates (`null` or missing) reject pricing calculation cleanly.

2. **Extensible Shipping Engine (`src/features/pricing/lib/shipping-calculation.ts`):**
   - Employs Strategy Pattern (`IShippingCalculator`).
   - Default production calculator: `DefaultUnconfiguredShippingCalculator` returns `status: "UNCONFIGURED"`, `shippingAmountInPaise: null`, `isPayable: false`, with user-facing message _"Calculated in the next checkout step."_
   - Plug-and-play production-ready implementations included for future commercial sign-off: `ConfigurableFlatRateShippingCalculator` and `RuleBasedPinCodeShippingCalculator`.

3. **Authoritative Pricing Service (`src/features/pricing/services/pricing-service.ts`):**
   - Validates cart line items against PostgreSQL database (`Product` and `ProductVariant`).
   - Enforces stock availability, active status, and line quantity bounds ($1 \le q \le 10$).
   - Reconstructs cart subtotal exclusively from authoritative database unit prices.
   - Sets `isPayable: false` and `payableAmountInPaise: null` whenever shipping remains unconfigured.

4. **Next.js Server Action (`src/features/pricing/actions/calculate-pricing-action.ts`):**
   - Enforces Auth.js v5 customer session.
   - Validates request payload using Zod schema.
   - Catches and sanitizes database errors without exposing SQL, stack traces, or schema metadata.

5. **Checkout UI Integration (`src/features/checkout/components/checkout-summary.tsx`):**
   - Dynamically renders server-authoritative GST breakdown (`Taxable amount`, `CGST`, `SGST`, `IGST`).
   - Displays clear legal disclosure: _"Inclusive of all taxes (GST)"_.
   - Explains unconfigured shipping gracefully: _"Calculated in the next checkout step"_.
   - Prevents premature checkout commitments: displays _"Final total pending shipping configuration"_.

---

### 2. Files Created and Modified

#### Files Created:

| Path                                                                          | Purpose                                                                                              |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `src/features/pricing/types/pricing-types.ts`                                 | Type definitions, interfaces, status enums, and calculation payloads.                                |
| `src/features/pricing/lib/tax-calculation.ts`                                 | Pure BigInt integer paise GST extraction and distribution engine.                                    |
| `src/features/pricing/lib/shipping-calculation.ts`                            | Extensible Strategy Pattern shipping calculators.                                                    |
| `src/features/pricing/services/pricing-service.ts`                            | Database-backed authoritative checkout pricing service.                                              |
| `src/features/pricing/actions/calculate-pricing-action.ts`                    | Next.js Server Action with Auth.js and Zod protection.                                               |
| `src/features/pricing/index.ts`                                               | Feature public API barrel exports.                                                                   |
| `prisma/seed.ts`                                                              | Database seeder establishing categories, 8 catalog products, variants, HSN codes, and 18% GST rates. |
| `prisma/migrations/20261122101738_phase7c_pricing_tax_snapshot/migration.sql` | Additive non-destructive Prisma database migration.                                                  |
| `scratch/test-phase7c-pricing.mjs`                                            | Automated 35-check test suite covering validation, tax math, shipping, security, and responsive UI.  |
| `scratch/phase7c-pricing-deliverable.md`                                      | Comprehensive deliverable report (this document).                                                    |

#### Files Modified:

| Path                                                    | Changes                                                                                                |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `prisma/schema.prisma`                                  | Added additive nullable fields to `Product`, `OrderItem`, and `Order` for tax snapshot persistence.    |
| `package.json`                                          | Configured `"prisma": { "seed": "tsx prisma/seed.ts" }` and dependencies.                              |
| `tailwind.config.ts`                                    | Converted CommonJS `require("tailwindcss-animate")` to ES import for Node 22 ESM dev server stability. |
| `src/features/checkout/components/checkout-summary.tsx` | Enhanced pricing summary to render GST components, disclosures, and unconfigured shipping statuses.    |
| `src/features/checkout/components/checkout-view.tsx`    | Integrated server action client-side reconciliation hook for dynamic pricing verification.             |

---

### 3. Database / Schema Changes & Audit Snapshot Readiness

To ensure the Order data model is fully prepared to store immutable historical pricing and tax snapshots upon checkout completion in Phase 7D, additive nullable fields were introduced without altering existing relations or risking data loss:

#### Additive Migration (`20261122101738_phase7c_pricing_tax_snapshot`):

```prisma
model Product {
  // Existing fields preserved...
  taxRate     Decimal? @db.Decimal(5, 2) // e.g. 18.00 for 18% GST
  hsnCode     String?                     // e.g. "39269099" (Other articles of plastics)
  taxCategory String?                     // e.g. "STANDARD_GST_18"
}

model OrderItem {
  // Existing fields preserved...
  sku           String?
  gstRate       Decimal? @db.Decimal(5, 2)
  taxableAmount Decimal? @db.Decimal(10, 2)
  taxAmount     Decimal? @db.Decimal(10, 2)
}

model Order {
  // Existing fields preserved...
  taxableAmount Decimal? @db.Decimal(10, 2)
  cgstAmount    Decimal? @db.Decimal(10, 2)
  sgstAmount    Decimal? @db.Decimal(10, 2)
  igstAmount    Decimal? @db.Decimal(10, 2)
}
```

#### Snapshot Audit Field Verification (11/11 Fields Ready):

1. `OrderItem.productName`: Present (`String`).
2. `OrderItem.sku`: Added (`String?`).
3. `OrderItem.quantity`: Present (`Int`).
4. `OrderItem.unitPrice`: Present (`Decimal`).
5. `OrderItem.totalPrice`: Present (`Decimal`).
6. `OrderItem.gstRate`: Added (`Decimal?`).
7. `OrderItem.taxableAmount`: Added (`Decimal?`).
8. `OrderItem.taxAmount`: Added (`Decimal?`).
9. `Order.subtotal`: Present (`Decimal`).
10. `Order.shippingAmount`: Present (`Decimal`).
11. `Order.totalAmount`: Present (`Decimal`).
12. `Order.taxableAmount`: Added (`Decimal?`).
13. `Order.cgstAmount`, `sgstAmount`, `igstAmount`: Added (`Decimal?`).

---

### 4. GST Calculation Methodology

RoboHatch operates on a **GST-Inclusive Pricing Model**. Customers see prices that already include tax. The engine extracts the embedded tax component using integer arithmetic in paise.

#### Mathematical Formulation:

Let:

- $I = \text{Inclusive total in paise}$
- $R = \text{GST rate in percent (e.g., 18.00)}$
- $B_R = \text{Rate in basis points} = \mathrm{round}(R \times 100) = 1800$

$$\text{Taxable Value (paise)} = \left\lfloor \frac{I \times 10000 + \left\lfloor \frac{10000 + B_R}{2} \right\rfloor}{10000 + B_R} \right\rfloor$$
$$\text{GST Amount (paise)} = I - \text{Taxable Value (paise)}$$

#### Identity Conservation:

Because $\text{GST Amount}$ is derived directly by subtracting the rounded $\text{Taxable Value}$ from the gross inclusive amount, the following identity is mathematically guaranteed for every line item and cart total:
$$\text{Taxable Value} + \text{GST Amount} \equiv \text{Inclusive Amount}$$
Zero penny drift is possible across any combination of items, quantities, or tax rates.

#### Example Calculation (Voronoi Kinetic Vessel, ₹2,499.00 = 249,900 paise @ 18% GST):

- $\text{Inclusive Price}: 249,900\text{ paise}$
- $\text{Taxable Value}: \mathrm{round}\left(\frac{249900 \times 10000}{11800}\right) = 211,780\text{ paise } (₹2,117.80)$
- $\text{GST Component}: 249,900 - 211,780 = 38,120\text{ paise } (₹381.20)$
- **Intra-State (Karnataka $\to$ Karnataka):**
  - $\text{CGST (9\%)} = 19,060\text{ paise } (₹190.60)$
  - $\text{SGST (9\%)} = 19,060\text{ paise } (₹190.60)$
- **Inter-State (Karnataka $\to$ Other States):**
  - $\text{IGST (18\%)} = 38,120\text{ paise } (₹381.20)$

---

### 5. Shipping Calculation Architecture

Shipping has not been finalized by the commercial team. In strict accordance with the mandate, the system:

1. Does NOT hardcode a shipping fee.
2. Does NOT fabricate delivery dates or commitments.
3. Implements the **Strategy Pattern** via `IShippingCalculator`:
   ```typescript
   export interface IShippingCalculator {
     readonly id: string;
     readonly name: string;
     calculateShipping(params: ShippingCalculationParams): Promise<ShippingDetails>;
   }
   ```
4. Ships with `DefaultUnconfiguredShippingCalculator` as the active implementation:
   - Status: `"UNCONFIGURED"`
   - Shipping Fee: `null`
   - Estimated Delivery: `null`
   - User Message: `"Calculated in the next checkout step."`
   - Payability: `isPayable: false`, `payableAmountInPaise: null`.
5. Prepared strategy implementations:
   - `ConfigurableFlatRateShippingCalculator`: Demonstrates flat-rate calculation when configured.
   - `RuleBasedPinCodeShippingCalculator`: Supports tiered delivery zones, weight bands, and PIN code lookups.

---

### 6. Security & Tamper Defenses

The pricing service acts as a zero-trust boundary against client tampering:

1. **Client Price Tampering Immunity:**
   Any `price`, `unitPrice`, or `subtotal` supplied by the browser is discarded. The engine queries PostgreSQL `Product.basePrice` and `ProductVariant.priceOverride` directly.
2. **Client Tax Rate Tampering Immunity:**
   Client tax specifications are rejected. Tax rates are queried from `Product.taxRate`.
3. **Client Shipping Tampering Immunity:**
   Client shipping overrides are ignored; server strategy exclusively governs status.
4. **Quantity Bounds Enforcement:**
   Line item quantities are validated and clamped ($1 \le q \le 10$). Zero, negative, or excessively high quantities trigger `INVALID_QUANTITY` validation errors.
5. **Cross-Product Variant Integrity:**
   The service validates that requested `variantId` belongs strictly to the requested `productId`. Cross-product variant substitution attacks are rejected with `VARIANT_NOT_FOUND`.
6. **Authentication & Session Protection:**
   The Server Action requires an active Auth.js session; unauthenticated calls are rejected with `AUTHENTICATION_REQUIRED`.
7. **Database Error Sanitization:**
   Database exceptions are logged internally and masked with generic, customer-safe error messages.

---

### 7. Comprehensive Verification & Test Results

The RoboHatch test harness was executed across all test suites, achieving **100% pass rates across 221 total tests**:

```
======================================================================
  ROBOHATCH COMPREHENSIVE REGRESSION & QUALITY AUDIT SUMMARY
======================================================================
  1. Phase 7C Server Pricing & Tax Suite:       35 / 35 PASSED (100%)
  2. Phase 7B Checkout UI & Address Suite:      21 / 21 PASSED (100%)
  3. Phase 6D Application Security Suite:       30 / 30 PASSED (100%)
  4. Phase 6C Account Management QA Suite:      34 / 34 PASSED (100%)
  5. Phase 6B Customer Authentication QA Suite: 38 / 38 PASSED (100%)
  6. Phase 5 Shopping Cart QA Audit Suite:      63 / 63 PASSED (100%)
----------------------------------------------------------------------
  TOTAL AUDIT SUITE:                           221 / 221 PASSED (100%)
======================================================================
```

#### Detailed Breakdown of Phase 7C Tests (35/35 Passed):

- **Category A: Server-Authoritative Product Validation (Tests 1–9)**
  - `[PASS]` [Test 1] Valid product resolves authoritative database price (₹2,499 = 249,900 paise).
  - `[PASS]` [Test 2] Non-existent product ID safely rejected with `PRODUCT_NOT_FOUND`.
  - `[PASS]` [Test 3] Inactive product safely rejected with `PRODUCT_INACTIVE`.
  - `[PASS]` [Test 4] Invalid or non-existent variant colorway rejected with `VARIANT_NOT_FOUND`.
  - `[PASS]` [Test 5] Cross-product variant substitution detected and rejected.
  - `[PASS]` [Test 6] Invalid quantities (0, >10) rejected with `INVALID_QUANTITY`.
  - `[PASS]` [Test 7] Out-of-stock product/variant safely rejected with `PRODUCT_OUT_OF_STOCK`.
  - `[PASS]` [Test 8] Client-supplied price ignored; PostgreSQL authoritative price enforced.
  - `[PASS]` [Test 9] Client-supplied subtotal ignored; server calculates exact subtotal (₹6,848 = 684,800 paise).

- **Category B: GST-Inclusive Tax Extraction & Exact Math (Tests 10–18)**
  - `[PASS]` [Test 10] GST-inclusive extraction extracts exact taxable value and GST amount.
  - `[PASS]` [Test 11] GST extraction functions across multiple configured rates (0%, 5%, 12%, 18%, 28%).
  - `[PASS]` [Test 12] Paise rounding conservation guaranteed: Taxable + GST === Inclusive across all amounts.
  - `[PASS]` [Test 13] BigInt arithmetic safely handles large transaction volumes without floating-point overflow.
  - `[PASS]` [Test 14] Multi-item cart subtotal reconciles exactly to sum of line items (₹14,597.00).
  - `[PASS]` [Test 15] Multi-quantity line totals multiply integer unit price without rounding drift.
  - `[PASS]` [Test 16] Subtotal reconciliation: Total Taxable + Total GST === Subtotal (0 paise drift).
  - `[PASS]` [Test 17] Tax breakdown allocates CGST/SGST for intra-state (KA) and IGST for inter-state (MH).
  - `[PASS]` [Test 18] Unconfigured tax rate triggers safe validation failure preventing invented tax values.

- **Category C: Configurable Shipping Calculation Architecture (Tests 19–23)**
  - `[PASS]` [Test 19] Unfinalized shipping returns UNCONFIGURED status and null amount.
  - `[PASS]` [Test 20] Configured flat-rate shipping computes payable total (₹2,499 + ₹150 = ₹2,649).
  - `[PASS]` [Test 21] Invalid shipping configuration flags CONFIGURATION_ERROR and prevents payable total.
  - `[PASS]` [Test 22] Zero fabricated shipping charges or speculative delivery dates when unconfigured.
  - `[PASS]` [Test 23] Final payable total is strictly null when shipping is unconfigured.

- **Category D: Security, Authorization & Tamper Defenses (Tests 24–30)**
  - `[PASS]` [Test 24] Server action rejects unauthenticated requests with clean authentication requirement.
  - `[PASS]` [Test 25] SQL injection attempt in productId safely rejected with `PRODUCT_NOT_FOUND`.
  - `[PASS]` [Test 26] Tampered variant ID is safely rejected with `VARIANT_NOT_FOUND`.
  - `[PASS]` [Test 27] Zod schema validation rejects excessive quantity (>10) on server action.
  - `[PASS]` [Test 28] Tampered price parameter discarded; database price strictly enforced.
  - `[PASS]` [Test 29] Client tax rate tamper discarded; database-configured GST rate (18%) enforced.
  - `[PASS]` [Test 30] Client shipping tamper discarded; server-side unconfigured status enforced.

- **Category E: Browser E2E & 5 Viewports Responsive Inspection (Tests 31–35)**
  - `[PASS]` [Test 31] Viewport 1440px (desktop-1440) renders with zero horizontal overflow.
  - `[PASS]` [Test 32] Viewport 1024px (desktop-1024) renders with zero horizontal overflow.
  - `[PASS]` [Test 33] Viewport 768px (tablet-768) renders with zero horizontal overflow.
  - `[PASS]` [Test 34] Viewport 390px (mobile-390) renders with zero horizontal overflow.
  - `[PASS]` [Test 35] Viewport 320px (mobile-320) renders with zero horizontal overflow.

---

### 8. Build and Code Quality Validation

- **TypeScript Type-Check (`npm run type-check`):**  
  `tsc --noEmit` exited with code `0` (Zero type errors).
- **ESLint Validation (`npm run lint`):**  
  Exited with code `0` (`✔ No ESLint warnings or errors`).
- **Prettier Code Formatting (`npm run format:check`):**  
  `prettier --check .` passed with `100%` compliance.
- **Next.js Production Build (`npm run build`):**  
  Compiled cleanly with all 32 static and dynamic routes prerendered / server-rendered without warnings or errors.

---

### 9. Known Limitations & Remaining Business Decisions

1. **Origin State Hardcoded to Karnataka (KA):**  
   The seller warehouse origin is currently configured as Karnataka (`"KA"`). In a future multi-hub rollout, this should be dynamically determined based on fulfillment center inventory.
2. **Commercial Shipping Schedule:**  
   Shipping remains in `UNCONFIGURED` state pending business confirmation of flat rates, delivery tiers, or free shipping thresholds.
3. **Merchant GSTIN Registration Details:**  
   The tax extraction engine is fully operational; the legal GSTIN identifier will be integrated into the invoice generation sub-system during Order confirmation in Phase 7D/7E.

---

### 10. Explicit Confirmation Regarding Phase 7D

**Phase 7D (Razorpay Payment Integration) HAS NOT BEEN STARTED.**

- No Razorpay SDK dependencies installed.
- No Razorpay client-side checkout scripts loaded.
- No Razorpay order creation endpoints or payment capture APIs implemented.
- No payment webhooks or refund handlers created.
- No orders committed to the database in pending payment state.

RoboHatch stands at a clean, mathematically sound, server-authoritative checkpoint awaiting formal approval before Phase 7D commences.
