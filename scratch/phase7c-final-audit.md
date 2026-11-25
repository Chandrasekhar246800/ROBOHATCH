# RoboHatch — Phase 7C Final Audit & Corrections Deliverable

## GST Classification, Financial Integrity & Configuration Audit

**Author:** Senior Full-Stack Engineer, Payment Systems Architect & Financial Compliance Specialist  
**Project:** RoboHatch  
**Phase:** 7C — Server-Authoritative Pricing, Shipping & Tax Calculation (Final Audit)  
**Status:** AUDIT COMPLETE & ALL CORRECTIONS VERIFIED (229/229 Passing Tests)  
**Date:** November 22, 2026

---

### Executive Summary

In response to the Phase 7C final audit directive, a comprehensive audit and correction of GST classifications, seller origin configuration, financial precision, and database snapshot fields was performed.

Key corrections implemented:

1. **Eradication of Assumed GST Classifications:** Removed the universal assumption that all catalog products qualify for HSN `39269099` and `18%` GST. All eight catalog products have been formally categorized as `UNVERIFIED` in PostgreSQL.
2. **Explicit Tax Verification State:** Added an `enum TaxVerificationStatus { UNVERIFIED, PENDING_REVIEW, VERIFIED }` in Prisma. The pricing engine strictly blocks unverified configurations from calculating payable checkout amounts (`isPayable: false`, `payableAmountInPaise: null`), throwing explicit validation errors.
3. **Server-Authoritative Seller Origin & Destination State Validation:** Removed the implicit production fallback (`SELLER_ORIGIN_STATE = "KA"`). In production, an explicitly configured, valid seller origin state is strictly required; missing or invalid configuration returns `SELLER_ORIGIN_UNCONFIGURED`. A development-only fallback to `"Karnataka"` is retained solely for non-production DX. Customer destination states are strictly resolved and validated against the official registry of 28 Indian States and 8 Union Territories; client-controlled origin overrides are completely blocked.
4. **Zero Floating-Point Financial Arithmetic:** Replaced JavaScript float operations (`Math.round(val * 100)`) with deterministic string and `BigInt` parsing (`decimalToPaiseExact`, `paiseToDecimalExact`, `formatPaiseExact`).
5. **Reconciled Order Snapshot Field Inventory:** Corrected snapshot field counts: 10 Order-level financial fields, 5 Order-level tax fields, 7 OrderItem commercial fields, and 7 OrderItem identity/tax fields (total 29 snapshot fields).
6. **Zero Regressions:** 229 of 229 automated tests passed across all six phases (Phase 5, 6B, 6C, 6D, 7B, 7C).

---

### 1. Issues Identified

| Area                      | Issue Description                                                                                                                                                       | Severity     | Risk Assessment                                                                                                                                                                          |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GST Classification**    | Universal assignment of HSN `39269099` and `18%` GST to all eight products without legal or formal tax certification.                                                   | **Critical** | Potential statutory non-compliance under Indian GST law if products fall under different tariff headings (e.g. Chapter 95 for automatons or Chapter 68/90 for acoustic sound diffusers). |
| **Tax Verification**      | No explicit field tracking whether a product's tax parameters have been legally reviewed. Unconfigured or placeholder rates were not distinguished from verified rates. | **High**     | Risk of premature checkout processing with provisional tax numbers.                                                                                                                      |
| **Origin Configuration**  | Seller origin had an implicit production fallback to `"Karnataka"` rather than strictly enforcing explicit environment configuration in production.                     | **Medium**   | Could lead to unintended intra-state tax allocation in production if server configuration was omitted.                                                                                   |
| **Financial Arithmetic**  | Unit prices used `Math.round(Number(Decimal) * 100)` which casts Prisma Decimal to IEEE-754 float before scaling.                                                       | **Medium**   | Potential floating-point representation drift on fractional currency amounts.                                                                                                            |
| **Order Snapshot Fields** | Previous Phase 7C report had typographical field count labels (`6 Fields` instead of `7 Fields` for OrderItem Commercial and Identity/Tax categories).                  | **Low**      | Documentation inventory inaccuracy.                                                                                                                                                      |

---

### 2. Corrections Implemented

1. **Prisma Model & Schema Enhancements:**
   - Introduced `enum TaxVerificationStatus { UNVERIFIED, PENDING_REVIEW, VERIFIED }`.
   - Added `Product.taxVerificationStatus` with `@default(UNVERIFIED)`.
   - Added `OrderItem.hsnCode` (`String?`) to preserve frozen HSN code on purchased line items.
   - Applied via additive migration `20261122105451_phase7c_tax_verification_status` without altering prior migrations.

2. **Database Re-Seeding:**
   - Modified `prisma/seed.ts` to set all eight products to `taxVerificationStatus = 'UNVERIFIED'`, `taxRate = null`, `hsnCode = null`, `taxCategory = null`.
   - Re-seeded PostgreSQL database: confirmed 8 of 8 products now hold `UNVERIFIED` status and null tax values.

3. **Pricing Service Validation Hardening (`src/features/pricing/services/pricing-service.ts`):**
   - Added explicit verification gate: if `product.taxVerificationStatus !== "VERIFIED"`, appends `PricingValidationError` with code `TAX_CONFIGURATION_UNVERIFIED`.
   - Added missing HSN gate: if `!product.hsnCode`, appends `MISSING_HSN_CODE`.
   - Added missing tax rate gate: if `product.taxRate === null`, appends `TAX_RATE_UNCONFIGURED`.
   - Unverified items strictly set `hasUnconfiguredTax = true`, enforcing `isPayable: false` and `payableAmountInPaise: null`.

4. **Server-Authoritative Seller Origin (`src/features/pricing/config/seller-config.ts`):**
   - Removed implicit production fallback: in production (`NODE_ENV === "production"`), missing or invalid `SELLER_ORIGIN_STATE` strictly returns `isConfigured: false` $\implies$ `SELLER_ORIGIN_UNCONFIGURED`.
   - Documented development-only fallback (`"Karnataka"`, code `"KA"`) strictly restricted to non-production environments (`NODE_ENV !== "production"`).
   - Built canonical registry of 28 Indian States and 8 Union Territories (`INDIAN_STATES_AND_UTS`).
   - Destination state is resolved strictly from the customer's delivery address record in PostgreSQL (`deliveryAddressId`), validating against official state codes.
   - If address state is unrecognized (e.g. "Atlantis"), pricing returns `INVALID_DESTINATION_STATE`.

5. **Financial Precision Engine (`src/features/pricing/lib/financial-precision.ts`):**
   - `decimalToPaiseExact`: Converts Prisma Decimal/string to integer paise via string splitting and `BigInt` scaling. Zero floating-point multiplication.
   - `paiseToDecimalExact`: Converts integer paise directly into `new Prisma.Decimal("X.YY")`. Zero floating-point division.
   - `formatPaiseExact`: Deterministic Indian numbering system formatting (e.g. `₹14,597.00`).
   - Guards against `Number.MAX_SAFE_INTEGER` overflow.

---

### 3. Database Migration Details

The correction was applied as an additive, non-destructive migration in compliance with PostgreSQL production safety rules.

**Migration File:** `prisma/migrations/20261122105451_phase7c_tax_verification_status/migration.sql`

```sql
-- CreateEnum
CREATE TYPE "TaxVerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING_REVIEW', 'VERIFIED');

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "hsnCode" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "taxVerificationStatus" "TaxVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED';
```

- **Safety:** Additive only. No tables dropped, no columns deleted, no existing foreign keys or data destroyed.
- **Prisma Client:** Regenerated v6.19.3.

---

### 4. GST Configuration Status for All Eight Products

Inspection of all eight catalog products in PostgreSQL post-seeding:

| Product ID | Product Name                       | Primary Material | Seeded HSN | Seeded GST | Verification Status | Legal / Tax Rationale                                                                    |
| ---------- | ---------------------------------- | ---------------- | ---------- | ---------- | ------------------- | ---------------------------------------------------------------------------------------- |
| `prod-1`   | Voronoi Kinetic Vessel             | Carbon PETG      | `null`     | `null`     | **`UNVERIFIED`**    | Requires CA determination between Chapter 39 (plastics) and decorative artware.          |
| `prod-2`   | Tessellated Hex Desk Organizer     | Matte PLA        | `null`     | `null`     | **`UNVERIFIED`**    | Requires determination between HSN 3926 (plastics) and 8304 (office/desk equipment).     |
| `prod-3`   | Gyroid Acoustic Sound Tile         | Tough Resin      | `null`     | `null`     | **`UNVERIFIED`**    | Requires classification under acoustic/insulation materials vs plastic tiles.            |
| `prod-4`   | Apex Geometric MagSafe Dock        | Carbon PETG      | `null`     | `null`     | **`UNVERIFIED`**    | Composite article holding third-party wireless charger; requires classification review.  |
| `prod-5`   | Articulated Titan Beetle Automaton | Tough Resin      | `null`     | `null`     | **`UNVERIFIED`**    | Potential Chapter 95 classification (toys, models, automata) vs ornamental sculpture.    |
| `prod-6`   | Fibonacci Spiral Planter           | Matte PLA        | `null`     | `null`     | **`UNVERIFIED`**    | Requires review between domestic horticultural containers vs general plastic articles.   |
| `prod-7`   | Parametric Under-Desk Cable Loom   | Industrial ABS   | `null`     | `null`     | **`UNVERIFIED`**    | Potential electrical wiring accessory (Chapter 85) vs general plastic loom (Chapter 39). |
| `prod-8`   | Precision Caliper & Gauge Pedestal | Carbon PETG      | `null`     | `null`     | **`UNVERIFIED`**    | Measuring instrument accessory vs workshop holding fixture.                              |

> **Audit Outcome:** Zero products carry legally unconfirmed assumptions. Checkout is completely protected against premature payable execution until official classifications are entered.

---

### 5. Seller Origin Configuration & Production Verification

- **Configuration Source:** `src/features/pricing/config/seller-config.ts`
- **Environment Variable:** `SELLER_ORIGIN_STATE` (Configured in `.env` and documented in `.env.example`).
- **Production Policy (`NODE_ENV === "production"`):**
  - An explicitly configured, valid Indian State or Union Territory name or code is **strictly required**.
  - If `SELLER_ORIGIN_STATE` is unset, empty, or invalid, `getSellerOriginConfig()` returns `isConfigured: false`.
  - The pricing service catches `!isConfigured` and appends validation error `SELLER_ORIGIN_UNCONFIGURED`, strictly enforcing `isPayable: false` and `payableAmountInPaise: null`.
  - **No silent fallback to Karnataka or any other state is permitted in production.** Verified in Test 34.
- **Development Policy (`NODE_ENV !== "production"`):**
  - If `SELLER_ORIGIN_STATE` is unset (undefined), a documented development fallback to `"Karnataka"` (code `"KA"`) is provided for local DX convenience.
  - If explicitly set to an empty or invalid value in development, it returns `isConfigured: false`.
- **Destination State Validation:**
  - Client-controlled origin overrides are completely prohibited.
  - Destination state is resolved strictly from the customer's selected delivery address record in PostgreSQL (`deliveryAddressId`).
  - Destination state is validated against 28 Indian States and 8 Union Territories.
  - If destination state matches seller state $\implies$ **Intra-State (50% CGST + 50% SGST)**.
  - If destination state $\neq$ seller state $\implies$ **Inter-State (100% IGST)**.
  - If destination state is unrecognized, the pricing service halts with `INVALID_DESTINATION_STATE`.

---

### 6. Financial Precision Audit Results

| Conversion / Arithmetic Operation  | Methodology                                                                                      | Verification Result                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| **Decimal to Integer Paise**       | String splitting + `BigInt` scaling in `decimalToPaiseExact`. No float multiplication.           | **PASS** — Exactly converts `2499.00` $\to$ `249900`, `3400.50` $\to$ `340050`.    |
| **Paise to Decimal (Rupees)**      | Integer division (`p / 100n`) + modulo (`p % 100n`) in `paiseToDecimalExact`. No float division. | **PASS** — Exactly converts `249900` $\to$ `Decimal("2499.00")`.                   |
| **Paise to INR Display String**    | String regex formatting with Indian numbering format (`en-IN`) in `formatPaiseExact`.            | **PASS** — Formats `249900` $\to$ `"₹2,499.00"`.                                   |
| **GST Reverse Extraction**         | BigInt Half-Up: $(N \times 10000 + \lfloor D/2 \rfloor) / D$.                                    | **PASS** — ₹2,499 @ 18% yields exactly 211,780 paise taxable and 38,120 paise GST. |
| **Tax Conservation Identity**      | $\text{Taxable} + \text{GST} \equiv \text{Inclusive Amount}$.                                    | **PASS** — Zero drift ($0\text{ paise}$) across all test ranges.                   |
| **Intra-State Tax Distribution**   | $\text{CGST} + \text{SGST} \equiv \text{GST Amount}$.                                            | **PASS** — Exactly matches 19,060 paise CGST + 19,060 paise SGST = 38,120 paise.   |
| **Inter-State Tax Distribution**   | $\text{IGST} \equiv \text{GST Amount}$.                                                          | **PASS** — Exactly matches 38,120 paise IGST = 38,120 paise.                       |
| **Multi-Item Cart Reconciliation** | Sum of line items in integer paise.                                                              | **PASS** — 4-item cart totals ₹11,798.00 (1,179,800 paise) exactly.                |
| **Large Value Overflow Guard**     | BigInt internal math with `Number.MAX_SAFE_INTEGER` boundary check.                              | **PASS** — ₹50,000,000 (5 Crore) calculates without overflow.                      |

---

### 7. Complete Order Snapshot Field Inventory (Reconciled)

Here is the complete snapshot field inventory categorized by domain with exact field counts:

#### A. Order-Level Financial & Status Fields (10 Fields)

1. `Order.id`: String (`cuid()`), immutable primary key.
2. `Order.orderNumber`: String, unique human-facing reference (`RH-YYYY-XXXXXX`).
3. `Order.userId`: String?, customer linkage (`onDelete: SetNull`).
4. `Order.status`: `OrderStatus` enum.
5. `Order.subtotal`: Decimal(10, 2), frozen gross item subtotal in rupees.
6. `Order.discountAmount`: Decimal(10, 2), frozen promotional discount.
7. `Order.shippingAmount`: Decimal(10, 2), frozen shipping charge.
8. `Order.totalAmount`: Decimal(10, 2), frozen final payable amount.
9. `Order.couponId`: String?, reference to coupon applied.
10. `Order.notes`: String?, delivery instructions.

#### B. Order-Level Tax Snapshot Fields (5 Fields)

11. `Order.taxableAmount`: Decimal(10, 2)?, frozen aggregate taxable base.
12. `Order.taxAmount`: Decimal(10, 2), frozen aggregate GST amount.
13. `Order.cgstAmount`: Decimal(10, 2)?, frozen Central GST total.
14. `Order.sgstAmount`: Decimal(10, 2)?, frozen State GST total.
15. `Order.igstAmount`: Decimal(10, 2)?, frozen Integrated GST total.

#### C. OrderItem-Level Product & Commercial Fields (7 Fields)

16. `OrderItem.id`: String (`cuid()`), primary key.
17. `OrderItem.orderId`: String, parent order foreign key.
18. `OrderItem.productId`: String, catalog product foreign key.
19. `OrderItem.variantId`: String?, catalog variant foreign key.
20. `OrderItem.quantity`: Int, frozen quantity purchased.
21. `OrderItem.unitPrice`: Decimal(10, 2), frozen per-unit price in rupees.
22. `OrderItem.totalPrice`: Decimal(10, 2), frozen line total (`unitPrice * quantity`).

#### D. OrderItem-Level Identity & Tax Snapshot Fields (7 Fields)

23. `OrderItem.productName`: String, frozen product name at purchase.
24. `OrderItem.variantName`: String?, frozen variant name at purchase.
25. `OrderItem.sku`: String?, frozen SKU code.
26. `OrderItem.gstRate`: Decimal(5, 2)?, frozen GST percentage applied (e.g. `18.00`).
27. `OrderItem.hsnCode`: String?, frozen HSN classification code at purchase.
28. `OrderItem.taxableAmount`: Decimal(10, 2)?, frozen line taxable base.
29. `OrderItem.taxAmount`: Decimal(10, 2)?, frozen line tax amount.

#### E. Summary of Snapshot Counts

- **Total Order-Level Snapshot Fields:** 15 (10 Financial/Status + 5 Tax Totals)
- **Total OrderItem-Level Snapshot Fields:** 14 (7 Commercial + 7 Identity/Tax)
- **Total Invariant Snapshot Fields across Schema:** **29 Snapshot Fields**
- **Phase 7D Architectural Recommendation:** When order creation is implemented in Phase 7D, store an immutable address snapshot (`shippingAddressSnapshot Json?`) on the `Order` record so subsequent address updates in `/account/addresses` never mutate historical order records.

---

### 8. Test Results (229 / 229 Tests Passed)

```
======================================================================
  ROBOHATCH COMPREHENSIVE TEST & REGRESSION AUDIT (PHASES 5 - 7C)
======================================================================
  1. Phase 7C Server Pricing & Tax Suite:       43 / 43 PASSED (100%)
  2. Phase 7B Checkout UI & Address Suite:      21 / 21 PASSED (100%)
  3. Phase 6D Application Security Suite:       30 / 30 PASSED (100%)
  4. Phase 6C Account Management QA Suite:      34 / 34 PASSED (100%)
  5. Phase 6B Customer Authentication QA Suite: 38 / 38 PASSED (100%)
  6. Phase 5 Shopping Cart QA Audit Suite:      63 / 63 PASSED (100%)
----------------------------------------------------------------------
  TOTAL SYSTEM AUDIT SUITE:                    229 / 229 PASSED (100%)
======================================================================
```

#### Specific Audit Checks Added in Phase 7C (Tests 31–38):

- `[PASS]` [Test 31] Unverified GST classification returns `TAX_CONFIGURATION_UNVERIFIED` and blocks payable checkout total.
- `[PASS]` [Test 32] Missing HSN code triggers `MISSING_HSN_CODE` and prevents payable total.
- `[PASS]` [Test 33] Missing GST rate triggers `TAX_RATE_UNCONFIGURED` and prevents payable total.
- `[PASS]` [Test 34] Seller origin strictly requires valid configuration in production (zero silent fallback).
  - Verified: Production mode without `SELLER_ORIGIN_STATE` $\implies$ `isConfigured: false`.
  - Verified: Production mode with invalid `SELLER_ORIGIN_STATE` $\implies$ `isConfigured: false`.
  - Verified: Production mode with valid `SELLER_ORIGIN_STATE` $\implies$ `isConfigured: true`.
  - Verified: Production pricing service with unset origin fails safely with `SELLER_ORIGIN_UNCONFIGURED` and `isPayable: false`.
  - Verified: Development mode unset origin applies documented dev fallback `"Karnataka"`.
- `[PASS]` [Test 35] Invalid destination state in shipping address triggers `INVALID_DESTINATION_STATE`.
- `[PASS]` [Test 36] Exact Decimal-to-paise, paise-to-Decimal, and INR formatting verify zero float drift.
- `[PASS]` [Test 37] Intra-state tax reconciliation: CGST + SGST strictly equals total GST with exact 50/50 split.
- `[PASS]` [Test 38] Inter-state tax reconciliation: IGST strictly equals total GST.

---

### 9. Build and Validation Results

- **TypeScript Type-Check (`npm run type-check`):**  
  `tsc --noEmit` exited with code `0` (Zero type errors).
- **ESLint Validation (`npm run lint`):**  
  `next lint` exited with code `0` (`✔ No ESLint warnings or errors`).
- **Prettier Code Formatting (`npm run format:check`):**  
  `prettier --check .` passed with `100%` compliance across all files.
- **Next.js Production Build (`npm run build`):**  
  All 32 routes compiled and generated successfully with zero errors.

---

### 10. Remaining Business & Compliance Decisions

Before products can be purchased in production checkout:

1. **Certified GST Classification:** A certified tax consultant or GST practitioner must review RoboHatch's product specifications and assign verified HSN codes and GST rates for each of the 8 products.
2. **Commercial Shipping Strategy:** Business stakeholders must finalize shipping rate cards (e.g. flat rate, weight-based, or PIN-code zones) and any promotional free-shipping thresholds.
3. **Merchant GSTIN Registration:** Provide the RoboHatch entity's legal GSTIN for inclusion on statutory tax invoices.

---

### Strict Phase Boundary Confirmation

- **Phase 7D (Razorpay Payment Integration) HAS NOT BEEN STARTED.**
- No payment APIs, payment gateways, or webhooks have been created.
- No orders have been committed to the database.
- No invented GST classifications or shipping charges have been introduced.
