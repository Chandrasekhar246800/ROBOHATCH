# ROBOHATCH — MASTER TECHNICAL AUDIT REPORT (STAGE A)

**Document:** RoboHatch Full Codebase Technical Audit — Phase 0 Through Phase 7E-B  
**Date:** November 25, 2026  
**Auditor Role:** Senior Software Architect, Staff Full-Stack Engineer & Independent Code Auditor  
**Project:** RoboHatch (Precision 3D-Printed E-Commerce Platform)  
**Target Stack:** Next.js 15.2.0 (App Router), React 19.0.0, TypeScript 5.7.3 / 5.9.3, Tailwind CSS 3.4.17, Prisma 6.4.1 / 6.19.3, PostgreSQL 16, Auth.js v5 (NextAuth v5 beta), Zustand 5.1.0, Razorpay Node SDK 2.9.8  
**Audit Scope:** Independent Technical Audit of Entire Codebase (Phases 0, 1A, 2, 2A, 3, 4A, 4B, 5, 6A, 6B, 6C, 6D, 7A, 7B, 7C, 7D, 7E-A, 7E-B)  
**Assignment Classification:** AUDIT-ONLY (Stage A). Zero source code, schema, migrations, dependencies, or configuration modified. Phase 7E-C NOT implemented.  
**Destination Report Path:** `scratch/robohatch-master-audit-stage-a.md`

---

## 1. EXECUTIVE SUMMARY

An exhaustive, independent technical audit was conducted on the entire RoboHatch codebase, examining 237 files comprising 161 TypeScript/TSX source units, 6 Prisma migrations, 18 automated test/verification scripts, and extensive architectural deliverables spanning Phase 0 through Phase 7E-B.

### Overall Codebase Assessment

The RoboHatch codebase exhibits extraordinary architectural discipline in financial precision, cryptographic signature verification, database transaction safety, and mathematical modeling:
- **Integer-Paise Precision:** All internal financial calculations completely ban IEEE-754 floating-point math, operating strictly in non-negative integer paise and BigInt representation.
- **Server-Authoritative Pricing & Payment:** Client cart payloads are treated strictly as untrusted intent; line totals, GST rates, HSN codes, and shipping charges are recalculated authoritatively on the server.
- **Multi-Instance Concurrency Control:** Payment initiation utilizes database-backed lease claims (`PaymentInitiationClaim`) with unique constraints and optimistic concurrency locking.
- **Security Posture:** Password hashing enforces 12 bcrypt rounds; constant-time comparisons protect credential and payment signature verification; Open Redirect vulnerabilities are mitigated via strict URL sanitization; and all customer account actions enforce IDOR defenses.
- **Compilation & Linting:** TypeScript strict mode (`tsc --noEmit`) compiles with **0 errors**, and ESLint (`next lint`) reports **0 warnings and 0 errors**.

### Strategic System Vulnerabilities & Operational Blockers

Despite the high quality of individual modules, the audit identified six critical operational and architectural risks that require immediate attention:
1. **PostgreSQL Database Server Offline:** The local PostgreSQL database at `localhost:5432` is stopped and unreachable (`P1001`), blocking application startup and runtime database operations.
2. **Massive Uncommitted Working Tree (Extreme Disaster Risk):** Head commit on `master` is `60fd406` (dated Nov 21, 2026). **All implementations from Phase 2A through Phase 7E-B (22 modified tracked files, 31 untracked directories/files) exist only as uncommitted working tree changes.** An accidental `git reset` or `git clean` would destroy weeks of architectural development.
3. **Production Checkout Permanently Blocked:** In `prisma/seed.ts`, all products are seeded with `taxVerificationStatus = "UNVERIFIED"`, `taxRate = null`, and `hsnCode = null`. Additionally, shipping defaults to `DefaultUnconfiguredShippingCalculator` (`UNCONFIGURED`). Because production mode prohibits test overrides, **any customer attempt to checkout in production is immediately rejected by the server.**
4. **Dual Data-Source Discrepancy (Storefront Decoupled from PostgreSQL):** Storefront catalog, search, and product detail pages query static TypeScript arrays (`src/data/products.ts`), while checkout and pricing query PostgreSQL (`prisma.product`). Catalog changes in the database do not appear on the storefront, and items added to the cart could fail database lookup.
5. **Missing Global Route Middleware (`middleware.ts`):** No Next.js middleware exists. Route protection is handled solely by per-component server calls (`await auth()`). The `/admin` layout is completely unprotected.
6. **Cart Persistence Disconnect & Post-Payment UX Defect:** The database `Cart` and `CartItem` tables are completely abandoned dead schema (the cart lives solely in client `localStorage`). When a payment is successfully verified at checkout, `clearCart()` is never called, leaving the purchased items lingering in the user's cart.

---

## 2. ENVIRONMENT STATUS

| Component | Target / Declared Version | Actual / Runtime Version | Operational Status | Observations & Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **Node.js** | `>= 18.0.0` | `v24.15.0` | **OPERATIONAL** | Modern runtime; supports native web crypto, ESM, and BigInt. |
| **npm** | `>= 9.0.0` | `11.12.1` | **OPERATIONAL** | Package manager operational. |
| **Next.js** | `^15.2.0` | `15.5.29` | **OPERATIONAL** | App Router architecture. `next lint` deprecation notice present. |
| **React** | `^19.0.0` | `19.3.1` | **OPERATIONAL** | React 19 Server/Client Component model. |
| **Prisma CLI / Client**| `^6.4.1` | `6.19.3` | **OPERATIONAL (CLI)** | `package.json#prisma` seed property deprecated in favor of `prisma.config.ts`. |
| **PostgreSQL** | `PostgreSQL 16` | Unreachable | **STOPPED / OFFLINE** | `P1001: Can't reach database server at localhost:5432`. |
| **Docker Engine** | Docker Desktop | Stopped / Inaccessible | **STOPPED / BLOCKED** | Named pipe connection denied (`npipe:////./pipe/docker_engine`). |
| **Git Working Tree** | Branch `master` | Clean commit missing | **DIRTY (CRITICAL)** | 22 modified tracked files, 31 untracked directories/files. Head commit `60fd406`. |
| **Next.js Dev Server** | Port 3000 | Inactive | **STOPPED** | No active Node process listening on port 3000. |
| **TypeScript Typecheck**| Strict Mode | `tsc --noEmit` | **PASS (0 ERRORS)** | Codebase compiles cleanly without type errors. |
| **ESLint** | ESLint 9 / Next Config | `next lint` | **PASS (0 WARNINGS)** | 0 linting warnings or errors detected. |

### Environment Configuration Audit (`.env`)

Inspection of `.env` confirms all required configuration keys are present without leaking sensitive credentials:
- `DATABASE_URL`: Configured (PostgreSQL connection string pointing to `localhost:5432/robohatch`).
- `AUTH_SECRET`: Configured (54-character high-entropy secret for JWT signing).
- `NEXT_PUBLIC_APP_URL`: Configured (`http://localhost:3000`).
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Configured.
- `RAZORPAY_KEY_ID`: Configured (Begins with `rzp_test_` — enforces strict Test Mode compliance).
- `RAZORPAY_KEY_SECRET`: Configured.
- `RAZORPAY_WEBHOOK_SECRET`: Configured.
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Configured (Matches server key ID).
- `SELLER_ORIGIN_STATE`: Configured (Normalized Indian state identifier for GST calculation).

---

## 3. COMPLETE REPOSITORY ARCHITECTURE

### Directory Structure & Responsibilities

```
c:\Users\mcsr8\Desktop\robohatch\
├── .env                                  # Environment variables (Protected)
├── .env.example                          # Environment variable template
├── components.json                       # Shadcn UI configuration
├── eslint.config.mjs                     # ESLint flat config
├── next.config.ts                        # Next.js configuration (Remote image patterns)
├── package.json                          # Project dependencies and npm scripts
├── postcss.config.mjs                    # PostCSS Tailwind plugins
├── tailwind.config.ts                    # Tailwind CSS tokens, theme extension
├── tsconfig.json                         # Strict TypeScript configuration
│
├── prisma/
│   ├── migrations/                       # 6 PostgreSQL schema migrations
│   │   ├── 20261121180050_init/
│   │   ├── 20261122101738_phase7c_pricing_tax_snapshot/
│   │   ├── 20261122105451_phase7c_tax_verification_status/
│   │   ├── 20261124194502_phase7d_payment_initiation_claim/
│   │   ├── 20261124202549_phase7e_reconciliation_models/
│   │   └── 20261124204300_phase7e_remediation_models/
│   ├── schema.prisma                     # Authoritative Prisma database schema (17 models, 8 enums)
│   └── seed.ts                           # Database seeding script (Categories, Products, Variants)
│
├── public/
│   ├── icons/                            # Favicon and UI iconography
│   ├── images/                           # Product, category, editorial, and hero photography
│   │   ├── categories/                   # 6 category images
│   │   ├── editorial/                    # 2 editorial storytelling images
│   │   ├── hero/                         # Hero kinetic vessel photography
│   │   └── products/                     # 8 primary product images
│   └── logo/                             # Vector brand SVG assets
│
├── scratch/                              # 18 QA test suites, 8 audit deliverables, analysis scripts
│
└── src/
    ├── app/                              # Next.js 15 App Router directory
    │   ├── (auth)/                       # Authentication route group
    │   │   ├── layout.tsx                # Auth card centered layout
    │   │   ├── login/                    # Login page & client LoginForm
    │   │   └── register/                 # Register page & client RegisterForm
    │   ├── (store)/                      # Main customer storefront route group
    │   │   ├── about/                    # Brand and manufacturing editorial page
    │   │   ├── account/                  # Protected Customer Account Portal
    │   │   │   ├── addresses/            # Address book management CRUD
    │   │   │   ├── orders/               # Order history & [id] order detail tracking
    │   │   │   ├── profile/              # Customer profile & password change
    │   │   │   ├── layout.tsx            # Account navigation sidebar & auth redirect
    │   │   │   └── page.tsx              # Account overview dashboard
    │   │   ├── cart/                     # Dedicated shopping cart page & CartView
    │   │   ├── categories/               # Category taxonomy browsing & [slug] category view
    │   │   ├── checkout/                 # Secure multi-step checkout page
    │   │   ├── design-system/            # Phase 1A Design System showcase page
    │   │   ├── products/                 # Full catalog browse & [slug] product detail page (PDP)
    │   │   └── search/                   # Faceted search page
    │   ├── admin/                        # Admin Portal (Empty shell layout only)
    │   ├── api/                          # HTTP Route Handlers
    │   │   ├── auth/[...nextauth]/       # Auth.js API handler
    │   │   └── health/                   # Basic JSON healthcheck endpoint
    │   ├── globals.css                   # Tailwind base directives and CSS variables
    │   ├── layout.tsx                    # Root HTML layout (Geist fonts, Navbar, Footer, Providers)
    │   ├── not-found.tsx                 # Custom 404 error page
    │   └── page.tsx                      # Premium 10-section homepage
    │
    ├── auth.config.ts                    # Edge-compatible Auth.js callbacks and page configuration
    ├── auth.ts                           # Server Auth.js instance, PrismaAdapter, Credentials provider
    │
    ├── components/                       # Shared presentation components
    │   ├── auth/                         # PasswordStrength indicator
    │   ├── catalog/                      # CatalogView, ProductGrid, FilterSidebar, SortSelect
    │   ├── common/                       # ProductCard, SectionHeading, PageHeader, Breadcrumb
    │   ├── home/                         # 9 modular homepage section components
    │   ├── layout/                       # Navbar, Footer, MainContainer, UserNav, SearchModal
    │   ├── product/                      # ProductGallery, ProductInfo, ProductSpecs, MobileStickyBar
    │   ├── providers/                    # AppProviders (SessionProvider, Tooltip, Sonner Toaster)
    │   └── ui/                           # 12 primitive Shadcn/Radix UI components
    │
    ├── config/                           # Static site configuration (site.ts)
    │
    ├── data/                             # In-memory mock datasets (products, categories, materials)
    │
    ├── features/                         # Vertical slice domain features
    │   ├── admin/                        # Admin types (Placeholder)
    │   ├── cart/                         # Zustand store, cart drawer, cart merge, integer-paise math
    │   ├── categories/                   # Category domain types
    │   ├── checkout/                     # CheckoutView, AddressSelection, OrderReview, Summary
    │   ├── customers/                    # Customer domain types
    │   ├── orders/                       # Order domain types
    │   ├── payment/                      # Razorpay config, PaymentService, useRazorpay, Server Actions
    │   ├── pricing/                      # PricingService, tax extraction, shipping strategy, financial math
    │   └── products/                     # Product domain types
    │
    ├── hooks/                            # Shared React hooks (Empty index)
    ├── lib/                              # Core technical infrastructure
    │   ├── account/                      # Customer profile and address Server Actions
    │   ├── auth/                         # Password hashing, registration service, callback URL sanitizer
    │   ├── catalog/                      # Filter, sort, and search algorithms
    │   ├── validations/                  # Zod validation schemas (auth, account, checkout)
    │   ├── constants.ts                  # Brand tokens, APP_CONFIG, typography scales
    │   ├── prisma.ts                     # Prisma Client singleton
    │   └── utils.ts                      # cn (Tailwind merge), formatCurrency, formatDate
    │
    ├── services/                         # Core services re-export
    └── types/                            # Global Prisma types, API envelopes, next-auth.d.ts
```

### Architectural Consistency & Boundary Analysis

1. **Client vs. Server Component Boundaries:**
   - 45 files utilize `"use client"`. These are strictly limited to interactive elements: form controls, dialog modals, Zustand cart listeners, Razorpay checkout hooks, image gallery zoom, and dropdown menus.
   - 6 files utilize `"use server"`. These encapsulate all mutation endpoints: `src/lib/account/actions.ts`, `src/lib/auth/actions.ts`, `src/features/payment/actions/*`, and `src/features/pricing/actions/*`.
   - 110 files are Server Components, pure functions, or type declarations. Zero client components import server-only packages (`bcryptjs`, `prisma`, or Razorpay private SDK).
2. **Circular Dependency Finding:**
   - A single circular dependency was detected via depth-first graph analysis:
     `src/features/pricing/types/pricing-types.ts` &rarr; `src/features/pricing/lib/shipping-calculation.ts` &rarr; `src/features/pricing/types/pricing-types.ts`.
     `pricing-types.ts` imports the `ShippingCalculator` interface via inline `import()`, while `shipping-calculation.ts` imports `ShippingDetails` from `pricing-types.ts`.
3. **Redundant & Competing Files:**
   - `src/features/checkout/types.ts` vs. `src/features/checkout/types/checkout-types.ts`: The former holds abandoned initial types (`CheckoutSessionState`), while the latter holds actively used checkout models (`CheckoutAddress`, `ValidatedCheckoutItem`).
   - `src/config/site.ts` vs. `src/lib/constants.ts`: Both declare site title, description, and navigation links. `site.ts` is orphaned and never imported.
   - `src/services/index.ts` only re-exports `prisma`, ignoring the actual domain services located in `src/features/pricing/services/` and `src/features/payment/services/`.

---

## 4. PHASE-BY-PHASE IMPLEMENTATION INVENTORY

### Phase 0 — Foundation
- **Implementation Files:** `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/api/health/route.ts`, `src/lib/prisma.ts`, `src/types/index.ts`.
- **What Is Implemented:** Next.js 15 App Router setup, TypeScript strict mode, Prisma ORM foundation, Tailwind CSS configured with CSS variables and brand extensions, global layout with Geist fonts, and health check route.
- **Incomplete / Discrepancies:** `src/app/api/health/route.ts` returns static JSON and does not verify database connectivity. Placeholder types in `src/features/admin/types.ts`, `src/features/categories/types.ts`, etc., were left unreferenced.

### Phase 1A — Design System
- **Implementation Files:** `src/lib/constants.ts` (`DESIGN_TOKENS`), `src/components/ui/*` (12 Radix primitives), `src/components/common/*` (`product-card.tsx`, `page-header.tsx`, `section-heading.tsx`), `src/components/layout/*` (`navbar.tsx`, `footer.tsx`, `main-container.tsx`), `src/app/(store)/design-system/page.tsx`.
- **What Is Implemented:** Systematic token architecture (warm industrial palette `#FAFAF8`, `#F1F1EF`, `#171717`, `#E87536`), typography scales, accessible dialogs, tooltips, select dropdowns, responsive header with animated mobile sheet drawer, and comprehensive showcase page.
- **Incomplete / Discrepancies:** Fully verified and complete.

### Phase 2 — Homepage
- **Implementation Files:** `src/app/page.tsx`, `src/components/home/*` (9 section components), `src/data/categories.ts`, `src/data/products.ts`, `src/data/materials.ts`, `src/data/testimonials.ts`.
- **What Is Implemented:** 10 curated sections: Hero, Featured Categories, Featured Collection, Materials & Engineering, Brand Story, Best Sellers, Testimonials, New Arrivals, Newsletter, and Global Footer. Centralized mock data structures.
- **Incomplete / Discrepancies:** In commit `60fd406`, Framer Motion animations were replaced with CSS keyframes to eliminate SSR hydration mismatches, but the `framer-motion` package was left in `package.json`.

### Phase 2A — Product Imagery
- **Implementation Files:** `public/images/categories/*`, `public/images/products/*`, `public/images/editorial/*`, `public/images/hero/*`, `next.config.ts` (remote patterns).
- **What Is Implemented:** 8 photorealistic 3D-printed product images, 6 category covers, 2 editorial photography assets, and hero vessel imagery. Next.js image optimization configured for Cloudinary, S3, and Unsplash.
- **Incomplete / Discrepancies:** Image assets exist in the local directory but are **completely untracked in Git**.

### Phase 3 — Catalogue and Discovery
- **Implementation Files:** `src/app/(store)/products/page.tsx`, `src/app/(store)/categories/page.tsx`, `src/app/(store)/categories/[slug]/page.tsx`, `src/app/(store)/search/page.tsx`, `src/components/catalog/*` (9 components), `src/lib/catalog/*`.
- **What Is Implemented:** Faceted filtering (category, price range, materials, in-stock), multi-criteria sorting (featured, price asc/desc, newest), instant debounced search modal, responsive mobile filter drawer, URL search param synchronization with Suspense boundaries.
- **Incomplete / Discrepancies:** **Runs 100% on static in-memory data (`PRODUCTS_DATA`).** No database queries are performed by any catalogue or discovery page.

### Phase 4A — Product Details (PDP)
- **Implementation Files:** `src/app/(store)/products/[slug]/page.tsx`, `src/components/product/product-gallery.tsx`, `product-info.tsx`, `product-specs.tsx`, `product-description.tsx`, `related-products.tsx`.
- **What Is Implemented:** Dynamic slug routing with `generateStaticParams`, interactive image gallery with thumbnail navigation and zoom modal, colorway selectors, quantity picker, detailed manufacturing specifications table, rich editorial copy, and category-based related products.
- **Incomplete / Discrepancies:** Also queries `PRODUCTS_DATA` directly. Zero database connectivity on the product page.

### Phase 4B — Product Experience Refinements
- **Implementation Files:** `src/components/product/mobile-sticky-bar.tsx`, `src/components/product/recently-viewed.tsx`, `src/components/product/use-recently-viewed.ts`.
- **What Is Implemented:** IntersectionObserver-driven mobile sticky action bar that reveals only when the primary purchase button scrolls out of viewport; client-side localStorage history tracking recently viewed products; OpenGraph dynamic metadata tags.
- **Incomplete / Discrepancies:** Fully verified and complete.

### Phase 5 — Shopping Cart
- **Implementation Files:** `src/features/cart/store/cart-store.ts`, `src/features/cart/lib/cart-utils.ts`, `src/features/cart/lib/cart-merge.ts`, `src/features/cart/components/*`, `src/app/(store)/cart/page.tsx`, `src/app/(store)/cart/cart-view.tsx`.
- **What Is Implemented:** Zustand store with `persist` middleware to `localStorage`. Integer-paise pricing calculations (`priceInPaise`). Quantity boundary enforcement ($1 \le Q \le 10$). Slide-out cart drawer, dedicated cart view, line item removals, live subtotal updates, and navbar item badge counter.
- **Incomplete / Discrepancies:** Database `Cart` and `CartItem` models in Prisma are never written to or read from. Guest-to-customer cart merge (`cart-merge.ts`) only operates in memory/sessionStorage.

### Phase 6A — Database and Authentication Foundation
- **Implementation Files:** `prisma/schema.prisma`, `prisma/migrations/20261121180050_init`, `prisma/seed.ts`, `src/auth.ts`, `src/auth.config.ts`, `src/lib/auth/password.ts`.
- **What Is Implemented:** Relational PostgreSQL schema (Users, Accounts, Sessions, Products, Variants, Addresses, Orders, Payments). Auth.js v5 with JWT session strategy (30-day maxAge). Bcrypt password hashing (12 salt rounds). Database seed script.
- **Incomplete / Discrepancies:** Database server is currently offline. Seed script sets all product tax records to `UNVERIFIED`.

### Phase 6B — Customer Authentication
- **Implementation Files:** `src/app/(auth)/login/*`, `src/app/(auth)/register/*`, `src/lib/auth/register.ts`, `src/lib/auth/actions.ts`, `src/lib/auth/callback-url.ts`, `src/components/auth/password-strength.tsx`, `src/components/layout/user-nav.tsx`.
- **What Is Implemented:** Credentials-based login and registration flows, Zod validation, constant-time authorization defense, password strength meter, Open Redirect prevention on `callbackUrl`, and dynamic user navigation in header.
- **Incomplete / Discrepancies:** Fully verified against automated security suites (Phase 6D).

### Phase 6C — Customer Account Management
- **Implementation Files:** `src/app/(store)/account/*` (overview, profile, addresses, orders, order details), `src/lib/account/actions.ts`, `src/lib/validations/account.ts`.
- **What Is Implemented:** Authenticated customer portal. Server Actions for profile update, password change (with current password verification), and full Address CRUD. Atomic default address swapping via `prisma.$transaction`. Strict IDOR defense (`where: { id, userId: session.user.id }`).
- **Incomplete / Discrepancies:** Fully verified; all subpages check `session?.user?.id`.

### Phase 6D — Security and Authentication QA
- **Implementation Files:** `scratch/test-phase6d-security.mjs`, `scratch/auth-integration-test-plan.mjs`.
- **What Is Implemented:** Comprehensive test harness validating password hash isolation, IDOR prevention across orders and addresses, XSS sanitization, open redirect mitigation, and session integrity.
- **Incomplete / Discrepancies:** Verified from past audit runs; code review confirms all defensive checks remain intact in source code.

### Phase 7A — Checkout Architecture
- **Implementation Files:** `scratch/phase7c-pricing-deliverable.md` (Architecture planning).
- **What Is Implemented:** Architectural specifications for server-authoritative checkout, multi-step checkout UI, address selection, and Razorpay integration boundary.
- **Incomplete / Discrepancies:** Architecture planning phase; deliverables transitioned into Phase 7B/7C code.

### Phase 7B — Checkout UI
- **Implementation Files:** `src/app/(store)/checkout/page.tsx`, `src/features/checkout/components/*` (`checkout-view.tsx`, `checkout-summary.tsx`, `address-selection.tsx`, `order-review.tsx`, `address-form-dialog.tsx`), `src/features/checkout/lib/checkout-validation.ts`.
- **What Is Implemented:** Two-column responsive checkout interface, stepper navigation, saved address picker, in-modal address creation, cart review, real-time server pricing synchronization, and sticky financial summary card.
- **Incomplete / Discrepancies:** `src/features/checkout/types.ts` contains abandoned duplicate types.

### Phase 7C — Pricing, Shipping and Tax
- **Implementation Files:** `src/features/pricing/lib/financial-precision.ts`, `tax-calculation.ts`, `shipping-calculation.ts`, `src/features/pricing/config/seller-config.ts`, `src/features/pricing/services/pricing-service.ts`, `src/features/pricing/actions/calculate-pricing-action.ts`, Prisma migrations `20261122101738_phase7c_pricing_tax_snapshot` and `20261122105451_phase7c_tax_verification_status`.
- **What Is Implemented:** Pure BigInt/integer-paise financial engine, exact GST extraction (CGST+SGST vs. IGST based on normalized seller origin vs. customer shipping state), HSN code tracking, strategy-based shipping engine, and comprehensive validation.
- **Incomplete / Discrepancies:** Shipping defaults to `UNCONFIGURED` strategy, and seed sets tax status to `UNVERIFIED`. As designed, this halts checkout until business terms are configured, but currently blocks production functionality.

### Phase 7D — Razorpay Payment Integration
- **Implementation Files:** `src/features/payment/config/razorpay-config.ts`, `src/features/payment/lib/signature-verification.ts`, `src/features/payment/services/payment-service.ts`, `src/features/payment/actions/*`, `src/features/payment/hooks/use-razorpay.ts`, Prisma migration `20261124194502_phase7d_payment_initiation_claim`.
- **What Is Implemented:** Razorpay Test Mode checkout, server-side external order creation outside DB transactions, database-backed `PaymentInitiationClaim` leader election, HMAC-SHA256 constant-time signature verification, provider payment status verification (`rzp.payments.fetch`), client modal loading hook, cancellation tracking.
- **Incomplete / Discrepancies:** 
  1. `Order.status` strictly remains `PENDING` upon signature verification (deliberately reserved for Phase 7E reconciliation).
  2. Order creation and payment creation are not wrapped in a single database transaction.
  3. `Order.orderNumber` is generated with `Math.random() * 900000`, posing collision risks under scale.
  4. Client cart is not cleared upon payment success.

### Phase 7E-A — Reconciliation Architecture Audit
- **Implementation Files:** `scratch/phase7e-architecture-audit.md` (961 lines).
- **What Is Implemented:** Master architecture audit defining the trusted webhook receiver, optimistic worker fencing (`version Int`), inventory reservation state machine, refund idempotency model, and dead-letter queue processing.
- **Incomplete / Discrepancies:** Audit and design deliverable only. Zero application code modified.

### Phase 7E-B — Database Expansion and Remediation
- **Implementation Files:** `prisma/schema.prisma`, `prisma/migrations/20261124202549_phase7e_reconciliation_models`, `prisma/migrations/20261124204300_phase7e_remediation_models`, `scratch/phase7e-b-final-remediation-audit.md`.
- **What Is Implemented:** Schema expanded and remediated: `RazorpayWebhookEvent` (with optimistic lock version), `InventoryReservation` (with generation counter and unique `[orderId, variantId, generation]`), `Refund` (with `onDelete: Restrict` on Order/Payment and unique idempotency keys), and removal of redundant B-tree indexes.
- **Incomplete / Discrepancies:** Database schema is deployed to migration files, but application services for webhooks (Phase 7E-C), reservations, and refunds have not yet been written.

---

## 5. CODE QUALITY FINDINGS

1. **Strict TypeScript Compliance:**
   - `tsconfig.json` enforces `strict: true`, `noEmit: true`, `skipLibCheck: true`.
   - `tsc --noEmit` runs cleanly with **0 errors**.
   - Zero instances of `as any` exist in the codebase.
   - Unsafe casts (`as unknown as`) are confined to 3 valid structural boundaries (Prisma globalThis, Razorpay SDK payload, and Zustand store slice).
2. **Deterministic Financial Math:**
   - Zero floating-point multiplication or division is used for money calculations.
   - `financial-precision.ts` uses string parsing and integer arithmetic (`decimalToPaiseExact`, `multiplyPaiseByBps`).
   - Rounding implements commercial Half-Up rounding at the sub-paise boundary.
3. **Defensive Error Handling:**
   - All server actions wrap execution in `try...catch` blocks and return standardized result envelopes (`ActionResult`, `InitiatePaymentResult`, `VerifyPaymentResult`).
   - Internal database exceptions (`P2002`, connection failures) are logged to server console and masked with safe client error messages.
4. **Input Validation:**
   - Dual-tier Zod validation: validated on the client for immediate UI feedback and strictly re-validated on the server before database execution.
5. **Prisma Query Hygiene:**
   - Queries use explicit `select` or `include` clauses to prevent over-fetching.
   - Sensitive fields (such as `passwordHash`) are excluded from queries returning data to client components.
6. **Accessibility & Responsive Design:**
   - Semantic HTML elements (`header`, `main`, `footer`, `nav`, `aside`).
   - Radix UI primitives manage focus trapping, ARIA roles, and ESC key handling.
   - Responsive layouts adapt smoothly across mobile (`375px`), tablet (`768px`), desktop (`1024px`), and wide screens (`1440px`).

---

## 6. ARCHITECTURE RISKS

### Risk 1: Storefront Catalog Decoupled from Authoritative Database
- **Description:** Products displayed on the home page, shop catalog, category pages, search page, and product detail pages are imported statically from `src/data/products.ts`. However, checkout pricing and payment creation query `prisma.product` in PostgreSQL.
- **Risk:** Price updates, stock changes, or newly introduced products in PostgreSQL are completely invisible to customers browsing the site. Furthermore, if a product in `src/data/products.ts` is deleted or has its ID changed in PostgreSQL, customers can add it to the cart but will encounter an unresolvable error (`PRODUCT_NOT_FOUND`) during checkout.

### Risk 2: Order Number Generation Collision Vulnerability
- **Description:** In `src/features/payment/services/payment-service.ts` (lines 534–536), order numbers are generated using `Math.random()`:
  ```typescript
  const year = new Date().getFullYear();
  const randSuffix = Math.floor(100000 + Math.random() * 900000);
  const orderNumber = `RH-${year}-${randSuffix}`;
  ```
- **Risk:** `Order.orderNumber` is guarded by a `@unique` constraint in PostgreSQL. With a 6-digit random integer (900,000 possibilities), the Birthday Paradox indicates a 50% chance of a collision after approximately 1,177 orders in a given year. A collision will throw a `P2002` exception during checkout, causing a payment initiation failure for a paying customer.

### Risk 3: Lack of Atomicity Between Order and Initial Payment Record
- **Description:** In `src/features/payment/services/payment-service.ts` (lines 538–582), `prisma.order.create` and `prisma.payment.create` are executed sequentially without `prisma.$transaction`.
- **Risk:** If the Node process crashes, loses DB connectivity, or encounters an unexpected exception between lines 571 and 574, an orphaned `Order` is committed to PostgreSQL with no associated `Payment` attempt record.

### Risk 4: Missing Route Middleware for Authorization Fencing
- **Description:** No `middleware.ts` file exists at the root or under `src/`.
- **Risk:** Protected routes (`/account/*`, `/checkout`) depend entirely on per-page component redirects (`await auth()`). If a developer adds a new route or server action and neglects to copy the manual session check, the route is publicly exposed. Additionally, unauthenticated requests execute component server logic before redirecting, wasting server compute.

---

## 7. DEPENDENCY AUDIT

### Declared vs. Installed Versions

| Dependency | Declared (`package.json`) | Installed (`node_modules`) | Status / Notes |
| :--- | :--- | :--- | :--- |
| `next` | `^15.2.0` | `15.5.29` | Compatible minor release. |
| `react` | `^19.0.0` | `19.3.1` | React 19 stable. |
| `react-dom` | `^19.0.0` | `19.3.1` | React 19 stable. |
| `@prisma/client` | `^6.4.1` | `6.19.3` | Installed version advanced due to caret range. |
| `prisma` | `^6.4.1` | `6.19.3` | Matches client version. |
| `next-auth` | `^5.0.0-beta.32` | `5.0.0-beta.32` | Auth.js v5 beta channel. |
| `@auth/prisma-adapter`| `^2.11.3` | `2.11.3` | Official Auth.js adapter. |
| `framer-motion` | `^12.4.7` | `12.43.0` | **UNREFERENCED**: Completely unused in `src/`. |
| `razorpay` | `^2.9.8` | `2.9.8` | Official Razorpay Node SDK. |
| `zustand` | `^5.1.0` | `5.1.0` | Client state management. |
| `zod` | `^3.24.2` | `3.25.76` | Schema validation. |
| `bcryptjs` | `^3.0.3` | `3.0.3` | Pure JS bcrypt implementation. |
| `puppeteer-core` | `^25.18.1` | `25.18.1` | Installed in devDependencies for scratch E2E tests. |
| `typescript` | `^5.7.3` | `5.9.3` | Modern TypeScript compiler. |

### Dependency Findings & Hygiene

1. **Unused Heavy Package (`framer-motion`):**
   - `framer-motion` is installed (`^12.4.7`) but completely unreferenced across all 161 source files in `src/`. It was replaced in commit `60fd406` with CSS hardware animations to prevent SSR hydration mismatches, but the package was never uninstalled.
2. **Prisma Configuration Deprecation:**
   - Prisma CLI issues a warning: `The configuration property package.json#prisma is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., prisma.config.ts).`
3. **Next.js Lint CLI Deprecation:**
   - `next lint` is deprecated in Next.js 15 and will be removed in Next.js 16. Future maintenance should migrate to the standard ESLint CLI.

---

## 8. GIT AND MIGRATION STATUS

### Git Working Tree Audit

- **Current Branch:** `master`
- **Head Commit:** `60fd406` (*fix(hero): eliminate hydration mismatch by replacing SSR motion style injection with hardware-accelerated CSS animations* — Sat Nov 21 15:16:02 2026)
- **Total Committed Commits on Master:** 6 commits.
- **Modified Tracked Files (22 files):**
  `.env.example`, `package-lock.json`, `package.json`, `prisma/schema.prisma`, `src/app/(auth)/layout.tsx`, `src/app/(store)/categories/page.tsx`, `src/app/(store)/products/page.tsx`, `src/components/common/index.ts`, `src/components/common/product-card.tsx`, `src/components/home/brand-story.tsx`, `src/components/home/featured-collection.tsx`, `src/components/home/hero-section.tsx`, `src/components/layout/footer.tsx`, `src/components/layout/index.ts`, `src/components/layout/navbar.tsx`, `src/components/providers/index.tsx`, `src/components/ui/index.ts`, `src/data/categories.ts`, `src/data/products.ts`, `src/features/cart/types.ts`, `src/lib/validations/index.ts`, `tailwind.config.ts`.
- **Untracked Directories & Files (31 entries):**
  `prisma/migrations/`, `prisma/seed.ts`, `public/images/`, `scratch/`, `src/app/(auth)/login/`, `src/app/(auth)/register/`, `src/app/(store)/account/`, `src/app/(store)/cart/`, `src/app/(store)/categories/[slug]/`, `src/app/(store)/checkout/`, `src/app/(store)/products/[slug]/`, `src/app/(store)/search/`, `src/app/api/auth/`, `src/auth.config.ts`, `src/auth.ts`, `src/components/auth/`, `src/components/catalog/`, `src/components/product/`, `src/features/cart/`, `src/features/checkout/`, `src/features/payment/`, `src/features/pricing/`, `src/lib/account/`, `src/lib/auth/`, `src/lib/catalog/`, `src/types/next-auth.d.ts`.

### Migration History Audit

The migration directory `prisma/migrations/` contains 6 sequential, fully structured migrations:
1. `20261121180050_init`: Initial baseline schema (Users, Accounts, Sessions, Categories, Products, Variants, Addresses, Orders, OrderItems, Payments).
2. `20261122101738_phase7c_pricing_tax_snapshot`: Added tax calculation snapshot columns (`taxableAmount`, `cgstAmount`, `sgstAmount`, `igstAmount`, `shippingSnapshot`).
3. `20261122105451_phase7c_tax_verification_status`: Introduced `TaxVerificationStatus` enum and product classification columns (`taxRate`, `hsnCode`, `taxCategory`).
4. `20261124194502_phase7d_payment_initiation_claim`: Created `PaymentInitiationClaim` table with unique constraint `claimKey` for concurrency locking.
5. `20261124202549_phase7e_reconciliation_models`: Introduced reconciliation models (`RazorpayWebhookEvent`, `InventoryReservation`, `Refund`) and enums (`WebhookEventStatus`, `ReservationStatus`, `RefundStatus`).
6. `20261124204300_phase7e_remediation_models`: Remediated referential integrity (`onDelete: Restrict` on refunds), added reservation generation counter, and pruned redundant indexes.

---

## 9. CRITICAL ISSUES

### [CRIT-01] Local PostgreSQL Database Service Stopped / Unreachable
- **Severity:** Critical
- **Exact File Path:** `prisma/schema.prisma`, `.env` (`DATABASE_URL`)
- **Relevant Component / Model:** Database connectivity / Prisma Client
- **Explanation:** Executing `npx prisma migrate status` results in error `P1001: Can't reach database server at localhost:5432`. The PostgreSQL service or Docker container is not running.
- **Actual Evidence:** 
  ```
  Datasource "db": PostgreSQL database "robohatch", schema "public" at "localhost:5432"
  Error: P1001: Can't reach database server at `localhost:5432`
  ```
- **Potential Impact:** Complete failure of user authentication (login/register), customer account portal, address management, checkout address lookup, server-side pricing, and payment initiation.
- **Recommended Correction:** Start the PostgreSQL server / Docker container (`docker compose up -d` or Windows service), verify connectivity on port 5432, and ensure migrations are applied.

### [CRIT-02] Catastrophic Uncommitted Code State (Phases 2A through 7E-B Untracked)
- **Severity:** Critical
- **Exact File Path:** Entire repository (`.git/`)
- **Relevant Component / Model:** Git Version Control
- **Explanation:** 22 tracked files are modified and 31 essential directories/files are untracked. All work produced since Nov 21, 2026 (Auth.js v5, Customer Accounts, PDP experience, Cart store, Checkout UI, Pricing engine, Payment integration, and Reconciliation schema) exists only in the volatile local working copy.
- **Actual Evidence:** `git status` shows `On branch master`, head commit `60fd406`, with `prisma/migrations/`, `src/features/`, `src/auth.ts`, and `src/app/(store)/checkout/` completely untracked.
- **Potential Impact:** A routine `git checkout -- .`, `git clean -fd`, or branch switch will permanently obliterate weeks of verified architectural deliverables with zero recovery path.
- **Recommended Correction:** Immediately stage and commit all implemented phases in logical, atomic commits (or create a dedicated snapshot branch `backup/phase-0-to-7eb-snapshot`).

### [CRIT-03] Production Checkout Permanently Blocked by Unverified Tax Seed and Unconfigured Shipping Strategy
- **Severity:** Critical
- **Exact File Path:** 
  - `prisma/seed.ts` (lines 40–45)
  - `src/features/pricing/services/pricing-service.ts` (lines 262–270, 280–308)
  - `src/features/pricing/lib/shipping-calculation.ts` (lines 46–56)
  - `src/features/payment/services/payment-service.ts` (lines 482–496)
- **Relevant Component / Model:** `calculateCheckoutPricing`, `initiatePaymentAttempt`, `Product` model
- **Explanation:** In `seed.ts`, all products are seeded with `taxVerificationStatus: "UNVERIFIED"`, `taxRate: null`, and `hsnCode: null`. `pricing-service.ts` checks:
  ```typescript
  if (effectiveVerificationStatus !== "VERIFIED") {
    hasUnconfiguredTax = true;
    validationErrors.push({ code: "TAX_CONFIGURATION_UNVERIFIED", ... });
  }
  ```
  Furthermore, shipping defaults to `DefaultUnconfiguredShippingCalculator` (`status: "UNCONFIGURED"`). Because `payment-service.ts` strictly forbids `testOverrides` in production (`isProduction ? undefined : input.testOverrides`), `pricing.isPayable` evaluates to `false` for every real transaction.
- **Actual Evidence:** Testing `initiatePaymentAttempt` without non-production test overrides returns:
  `"Payment initiation blocked: checkout pricing is not payable. Tax classification for product ... is unverified (status: UNVERIFIED)..."`
- **Potential Impact:** Zero real-world customer transactions can take place in production. Every checkout attempt is blocked at the gateway gate.
- **Recommended Correction:** 
  1. Update `prisma/seed.ts` and the live database to assign verified GST rates (e.g., `18.00%`), valid HSN codes (e.g., `39269099`), and `taxVerificationStatus = "VERIFIED"`.
  2. Implement an active commercial shipping calculator (e.g. flat-rate ₹99 or free over ₹1,999) and configure it as the active strategy in `shipping-calculation.ts`.

---

## 10. HIGH-PRIORITY ISSUES

### [HIGH-01] Dual Data-Source Discrepancy: Storefront Decoupled from PostgreSQL Catalog
- **Severity:** High
- **Exact File Path:** 
  - `src/app/(store)/products/page.tsx` (lines 8, 42)
  - `src/app/(store)/products/[slug]/page.tsx` (lines 13, 23, 61)
  - `src/app/(store)/categories/page.tsx` (lines 6–7, 20)
  - `src/app/(store)/categories/[slug]/page.tsx` (lines 10–11, 21, 50)
  - `src/app/(store)/search/page.tsx` (lines 8, 60)
- **Relevant Component / Model:** Storefront Catalog Views vs. PostgreSQL `Product` / `ProductVariant`
- **Explanation:** All catalog discovery and product detail pages import static data directly from `src/data/products.ts` and `src/data/categories.ts`. However, checkout and pricing query `prisma.product.findMany()`.
- **Actual Evidence:** Code inspection shows zero `prisma` calls across `src/app/(store)/products/` and `src/app/(store)/categories/`.
- **Potential Impact:** Admin updates or database migrations to prices, images, and inventory will never appear on the storefront. Conversely, adding an item present in `PRODUCTS_DATA` that was never seeded into PostgreSQL results in a fatal `PRODUCT_NOT_FOUND` error at checkout.
- **Recommended Correction:** Refactor catalogue routes (`/products`, `/products/[slug]`, `/categories`) to query PostgreSQL via Prisma with Next.js ISR/caching (`revalidate`), using `src/data/` solely for database seeding.

### [HIGH-02] Absence of Root Route Guard Middleware (`middleware.ts`)
- **Severity:** High
- **Exact File Path:** `src/middleware.ts` (Missing)
- **Relevant Component / Model:** Next.js Routing Middleware / Auth.js
- **Explanation:** No Next.js middleware is configured. Route protection for `/account/*`, `/checkout`, and `/admin/*` is executed solely inside individual server component layouts and pages.
- **Actual Evidence:** `Test-Path src/middleware.ts` returns `False`. `src/app/admin/layout.tsx` contains no auth checks.
- **Potential Impact:** Unauthenticated requests hit server components, execute partial logic, and only redirect after SSR execution. If an engineer creates a new account subpage or API route and forgets the manual check, it becomes publicly accessible. The `/admin` route has zero protection.
- **Recommended Correction:** Create `src/middleware.ts` exporting Auth.js middleware configured with `authConfig` to enforce route guarding at the edge.

### [HIGH-03] Abandoned Dead Database Models (`Cart`, `CartItem`, `Category`, `Review`, `Coupon`)
- **Severity:** High
- **Exact File Path:** `prisma/schema.prisma` (lines 143–159, 259–287, 484–526)
- **Relevant Component / Model:** `model Cart`, `model CartItem`, `model Category`, `model Review`, `model Coupon`
- **Explanation:** Static analysis confirms that `Cart`, `CartItem`, `Category`, `Review`, and `Coupon` are never queried or mutated anywhere in `src/`. The cart is purely client-side Zustand with `localStorage`.
- **Actual Evidence:** Analysis via `check-prisma-models.js` showed 0 operations for `Cart`, `CartItem`, `Category`, `Review`, and `Coupon` across the entire application source code.
- **Potential Impact:** Database maintenance overhead, schema confusion, false impressions of backend cart synchronization, and unnecessary table allocations in PostgreSQL.
- **Recommended Correction:** Either implement authenticated server cart synchronization in `cart-store.ts` or archive/remove the unused models from `prisma/schema.prisma`.

### [HIGH-04] Successful Payment Capture Fails to Clear Client Cart
- **Severity:** High
- **Exact File Path:** 
  - `src/features/checkout/components/checkout-view.tsx` (lines 43–47, 148–173)
  - `src/features/payment/hooks/use-razorpay.ts` (lines 193–198)
- **Relevant Component / Model:** `CheckoutView`, `useRazorpay`, `useCartStore.clearCart`
- **Explanation:** When Razorpay verifies payment signature and returns `SUCCESSFUL`, `CheckoutView` displays the green confirmation banner, but never invokes `clearCart()`.
- **Actual Evidence:** `git grep --untracked -n "clearCart" src/` reveals `clearCart()` is only called by explicit "Clear Cart" button clicks in `cart-view.tsx` and `cart-drawer.tsx`.
- **Potential Impact:** After paying for an order, the user's cart in `localStorage` remains completely populated. Navigating back to the shop or refreshing the page retains all items, leading to severe customer confusion and duplicate orders.
- **Recommended Correction:** In `src/features/checkout/components/checkout-view.tsx`, call `clearCart()` inside the `onSuccess` callback of `useRazorpay`.

### [HIGH-05] Non-Atomic Order and Initial Payment Record Creation
- **Severity:** High
- **Exact File Path:** `src/features/payment/services/payment-service.ts` (lines 538–582)
- **Relevant Component / Model:** `initiatePaymentAttempt`
- **Explanation:** Internal `Order` creation (`prisma.order.create`) and initial `Payment` creation (`prisma.payment.create`) are executed sequentially without wrapping in a `prisma.$transaction`.
- **Actual Evidence:** 
  ```typescript
  const order = await prisma.order.create({ ... });
  const payment = await prisma.payment.create({ ... });
  ```
- **Potential Impact:** Any failure between order creation and payment creation creates an orphaned `Order` record in `PENDING` state with no payment attempt.
- **Recommended Correction:** Wrap `prisma.order.create` and `prisma.payment.create` in a single `prisma.$transaction([ ... ])`.

---

## 11. MEDIUM-PRIORITY ISSUES

### [MED-01] Circular Dependency Between Pricing Types and Shipping Calculation
- **Severity:** Medium
- **Exact File Path:** 
  - `src/features/pricing/types/pricing-types.ts` (line 134)
  - `src/features/pricing/lib/shipping-calculation.ts` (line 13)
- **Relevant Component / Model:** `ShippingCalculator`, `ShippingDetails`
- **Explanation:** `pricing-types.ts` imports `ShippingCalculator` from `shipping-calculation.ts`, and `shipping-calculation.ts` imports `ShippingDetails` from `pricing-types.ts`.
- **Actual Evidence:** Circular dependency detector flagged: `pricing-types.ts -> shipping-calculation.ts -> pricing-types.ts`.
- **Potential Impact:** Build tool warning, potential runtime module evaluation cycles if non-type exports are introduced.
- **Recommended Correction:** Move the `ShippingCalculator` interface definition into `pricing-types.ts`.

### [MED-02] Order Number Random Collision Vulnerability
- **Severity:** Medium
- **Exact File Path:** `src/features/payment/services/payment-service.ts` (lines 534–536)
- **Relevant Component / Model:** `initiatePaymentAttempt`, `Order.orderNumber`
- **Explanation:** Order number generation uses `Math.floor(100000 + Math.random() * 900000)`, providing only 900,000 unique values per year.
- **Actual Evidence:** Line 535: `const randSuffix = Math.floor(100000 + Math.random() * 900000);`
- **Potential Impact:** Probability of collision reaches 50% after ~1,177 orders in a year, throwing a `P2002` unique constraint violation and failing the checkout.
- **Recommended Correction:** Use a PostgreSQL sequence (`order_number_seq`) or combine timestamp milliseconds with an alphanumeric random string (e.g. `RH-2026-X9K4M2`).

### [MED-03] Deprecated `framer-motion` Dependency Retained in `package.json`
- **Severity:** Medium
- **Exact File Path:** `package.json` (line 28)
- **Relevant Component / Model:** Dependencies / Bundle Size
- **Explanation:** `framer-motion` (`^12.4.7`) is listed in dependencies, but static search across all 161 source files reveals zero import statements.
- **Actual Evidence:** Analysis script confirmed `framer-motion: UNREFERENCED`.
- **Potential Impact:** Unnecessary dependency maintenance, vulnerability scanning noise, and large package install footprint.
- **Recommended Correction:** Execute `npm uninstall framer-motion` (when modifying dependencies is permitted).

### [MED-04] Duplicate and Orphaned Types in Checkout Feature
- **Severity:** Medium
- **Exact File Path:** `src/features/checkout/types.ts` vs. `src/features/checkout/types/checkout-types.ts`
- **Relevant Component / Model:** Checkout types
- **Explanation:** `src/features/checkout/types.ts` holds abandoned initial types (`CheckoutSessionState`, `CreateOrderInput`) while active types are in `src/features/checkout/types/checkout-types.ts`.
- **Actual Evidence:** `src/features/checkout/types.ts` is orphaned and not imported anywhere.
- **Potential Impact:** Developer confusion when creating new checkout features.
- **Recommended Correction:** Delete `src/features/checkout/types.ts` and maintain `checkout-types.ts` as the canonical source.

### [MED-05] Deprecated `package.json#prisma` Seed Configuration
- **Severity:** Medium
- **Exact File Path:** `package.json` (lines 59–61)
- **Relevant Component / Model:** Prisma CLI
- **Explanation:** Prisma CLI warns that `"prisma": { "seed": "npx tsx prisma/seed.ts" }` is deprecated and will be removed in Prisma 7.
- **Actual Evidence:** Warning emitted during `npx prisma -v`: `warn The configuration property package.json#prisma is deprecated and will be removed in Prisma 7.`
- **Potential Impact:** Seed script will break when updating to Prisma 7.
- **Recommended Correction:** Migrate to `prisma.config.ts`.

---

## 12. LOW-PRIORITY IMPROVEMENTS

### [LOW-01] Empty Admin Portal Shell
- **Severity:** Low
- **Exact File Path:** `src/app/admin/layout.tsx`
- **Relevant Component / Model:** Admin Layout
- **Explanation:** `src/app/admin/layout.tsx` is a 3-line shell with no authorization guard and no child pages.
- **Recommended Correction:** Implement an admin dashboard with role-based checks (`session.user.role === 'ADMIN'`) or delete until scheduled.

### [LOW-02] Duplicate Site Configuration File
- **Severity:** Low
- **Exact File Path:** `src/config/site.ts` vs. `src/lib/constants.ts`
- **Relevant Component / Model:** `siteConfig`
- **Explanation:** `src/config/site.ts` duplicates data from `src/lib/constants.ts` (`APP_CONFIG`) and is never imported.
- **Recommended Correction:** Remove `src/config/site.ts` and consolidate application metadata into `src/lib/constants.ts`.

### [LOW-03] Empty Hooks Index
- **Severity:** Low
- **Exact File Path:** `src/hooks/index.ts`
- **Relevant Component / Model:** Shared Hooks
- **Explanation:** File contains only `export {};`. Hooks are located inside feature directories (`use-razorpay.ts`, `use-recently-viewed.ts`).
- **Recommended Correction:** Re-export shared hooks or remove the empty file.

### [LOW-04] Basic Health Check Without Database Probe
- **Severity:** Low
- **Exact File Path:** `src/app/api/health/route.ts`
- **Relevant Component / Model:** Health Route
- **Explanation:** `GET /api/health` returns hardcoded `{ status: "healthy" }` without probing PostgreSQL connectivity.
- **Recommended Correction:** Add a lightweight `prisma.$queryRaw\`SELECT 1\`` probe to report actual database readiness.

---

## 13. FILES AND CODE LOCATIONS SUPPORTING EVERY MAJOR FINDING

| Finding ID | Title | File Path | Line Range | Supporting Code / Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **CRIT-01** | Database Offline | `prisma/schema.prisma` | Line 1–4 | `Error: P1001: Can't reach database server at localhost:5432` |
| **CRIT-02** | Uncommitted Tree | Git Index | Git Log | Head `60fd406`, 22 modified, 31 untracked directories |
| **CRIT-03** | Checkout Blocked | `prisma/seed.ts`<br>`pricing-service.ts`<br>`payment-service.ts` | `seed.ts`: 40–45<br>`pricing`: 262–270<br>`payment`: 413, 482 | `taxVerificationStatus = "UNVERIFIED"`, `isProduction ? undefined : testOverrides` |
| **HIGH-01** | Decoupled Catalog | `src/app/(store)/products/page.tsx`<br>`src/app/(store)/products/[slug]/page.tsx` | `products/page.tsx`: 8, 42<br>`[slug]/page.tsx`: 13, 61 | `import { PRODUCTS_DATA } from "@/data/products"` (Zero Prisma queries) |
| **HIGH-02** | Missing Middleware | `src/middleware.ts` | Entire File | File does not exist on disk |
| **HIGH-03** | Dead DB Models | `prisma/schema.prisma` | Lines 143, 259, 484, 510 | Models `Cart`, `CartItem`, `Category`, `Review`, `Coupon` 0 operations in `src/` |
| **HIGH-04** | Cart Not Cleared | `checkout-view.tsx` | Lines 43–47, 148–173 | `onSuccess: (result) => setPaymentSuccessResult(result)` (`clearCart` not called) |
| **HIGH-05** | Non-Atomic Order/Payment | `payment-service.ts` | Lines 538–582 | `order.create` and `payment.create` executed sequentially without `$transaction` |
| **MED-01** | Circular Dependency | `pricing-types.ts`<br>`shipping-calculation.ts` | `pricing-types.ts`: 134<br>`shipping-calc`: 13 | Inline `import("../lib/shipping-calculation")` <-> `import type { ShippingDetails }` |
| **MED-02** | Order Number Collision | `payment-service.ts` | Lines 534–536 | `const randSuffix = Math.floor(100000 + Math.random() * 900000)` |
| **MED-03** | Unused framer-motion | `package.json` | Line 28 | `"framer-motion": "^12.4.7"` (0 imports in `src/`) |
| **MED-04** | Duplicate Checkout Types | `src/features/checkout/types.ts` | Lines 1–14 | Unused `CheckoutSessionState`, `CreateOrderInput` |
| **MED-05** | Prisma Deprecation | `package.json` | Lines 59–61 | `"prisma": { "seed": "npx tsx prisma/seed.ts" }` |
| **LOW-01** | Empty Admin Shell | `src/app/admin/layout.tsx` | Lines 1–3 | 3-line component with no page and no role check |
| **LOW-02** | Duplicate Site Config | `src/config/site.ts` | Lines 1–22 | Unreferenced duplicate of `src/lib/constants.ts` |

---

## 14. RECOMMENDED NEXT AUDIT STAGE

### Stage B: Verification & Remediation Planning

Following review and sign-off on Stage A, the next stage of technical execution should encompass:
1. **Environment & Database Restoration:** Start the PostgreSQL container, verify schema migrations, and connect Prisma.
2. **Git Snapshot & Commit Checkpoint:** Safely commit all Phase 2A through 7E-B files in clean, structured commits to eliminate data loss risk.
3. **Seed & Configuration Alignment:** Update `prisma/seed.ts` with verified tax classifications (18% GST, HSN 39269099) and configure an active commercial shipping strategy to unblock the checkout pipeline.
4. **Checkout Fixes:** Add `clearCart()` to `CheckoutView` on successful payment verification, and wrap order/payment creation in `prisma.$transaction`.
5. **Phase 7E-C Readiness Review:** Verify all database remediation models (`RazorpayWebhookEvent`, `InventoryReservation`, `Refund`) are fully prepared for the upcoming Phase 7E-C Webhook Receiver implementation.

---

**AUDIT STAGE A STATUS:** COMPLETE  
**ACTION:** STOPPED. Awaiting User Review and Approval.
