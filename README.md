# RoboHatch

> Premium e-commerce platform engineered for bespoke and high-precision 3D-printed products.

---

## 1. Project Overview

**RoboHatch** is a modern, high-performance e-commerce platform designed with a minimal, product-focused aesthetic. Built to showcase and sell premium 3D-printed products, RoboHatch combines modern frontend design systems with an enterprise-ready backend architecture.

This repository currently contains the **Phase 0: Technical Architecture & Foundation**.

---

## 2. Technology Stack

### Frontend

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **UI Library:** [React 19](https://react.dev/)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode)
- **Styling:** [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Component Primitives:** [Shadcn UI](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)

### Backend & API

- **Architecture:** Next.js Route Handlers / REST API
- **ORM:** [Prisma ORM 6](https://www.prisma.io/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Validation:** [Zod](https://zod.dev/)

### Infrastructure & Integrations (Prepared)

- **Authentication:** Auth.js (NextAuth.js v5 architecture)
- **Payment Processing:** Razorpay (Future Phase)
- **Media Storage:** Cloudinary (Product images) & AWS S3 (3D model/file storage)
- **Deployment Target:** Vercel

---

## 3. Installation Instructions

### Prerequisites

- **Node.js**: v20.x or v22+ (tested on Node v24 LTS)
- **npm**: v10+ or v11+
- **PostgreSQL**: v14+ (local or hosted, e.g., Supabase / Neon / RDS)

### Step-by-Step Setup

1. **Clone the repository:**

   ```bash
   git clone <repo-url> robohatch
   cd robohatch
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your PostgreSQL database URL and development credentials.

4. **Generate Prisma Client:**

   ```bash
   npm run prisma:generate
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 4. Environment Configuration

The application uses environment variables defined in `.env.example`:

| Variable                | Description                                        | Example / Default                                               |
| ----------------------- | -------------------------------------------------- | --------------------------------------------------------------- |
| `DATABASE_URL`          | PostgreSQL connection string with schema parameter | `postgresql://user:pass@localhost:5432/robohatch?schema=public` |
| `AUTH_SECRET`           | 32+ character random secret for Auth.js            | `openssl rand -base64 32`                                       |
| `NEXT_PUBLIC_APP_URL`   | Base application URL                               | `http://localhost:3000`                                         |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier for media              | `your-cloudinary-cloud-name`                                    |
| `CLOUDINARY_API_KEY`    | Cloudinary API Key                                 | `your-cloudinary-api-key`                                       |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret                              | `your-cloudinary-api-secret`                                    |
| `RAZORPAY_KEY_ID`       | Razorpay Key ID for payments                       | `rzp_test_xxxxxx`                                               |
| `RAZORPAY_KEY_SECRET`   | Razorpay Secret Key                                | `your-razorpay-key-secret`                                      |

> **Security Note:** Sensitive environment variables must never be prefixed with `NEXT_PUBLIC_` and are strictly accessed on the server side.

---

## 5. Database Setup (Prisma & PostgreSQL)

The database schema is defined in [`prisma/schema.prisma`](prisma/schema.prisma). It models complete e-commerce lifecycle workflows:

### Schema Entities

- **Identity & Auth:** `User`, `Account`, `Session`, `VerificationToken`
- **Catalog:** `Category`, `Product`, `ProductImage`, `ProductVariant`
- **Customer:** `Address`, `Review`
- **Cart & Checkout:** `Cart`, `CartItem`, `Coupon`
- **Fulfillment & Billing:** `Order`, `OrderItem`, `Payment`

### Database Commands

```bash
# Validate Prisma schema syntax
npm run prisma:validate

# Format the schema file
npm run prisma:format

# Generate TypeScript Prisma Client
npm run prisma:generate

# Push schema changes directly to development database (when DB is running)
npx prisma db push

# Create and apply migrations (when database connection is active)
npx prisma migrate dev --name init
```

---

## 6. Development Commands

| Command                   | Action                                                                 |
| ------------------------- | ---------------------------------------------------------------------- |
| `npm run dev`             | Starts the Next.js local development server at `http://localhost:3000` |
| `npm run build`           | Builds the production bundle (`.next`)                                 |
| `npm run start`           | Starts the production server                                           |
| `npm run lint`            | Runs Next.js ESLint checks                                             |
| `npm run type-check`      | Runs TypeScript compiler checks without emitting output                |
| `npm run format`          | Runs Prettier and formats code with Tailwind class sorting             |
| `npm run format:check`    | Verifies code formatting conforms to Prettier rules                    |
| `npm run prisma:generate` | Generates the latest Prisma Client types                               |
| `npm run prisma:validate` | Validates Prisma schema syntax and references                          |

---

## 7. Folder Structure

```
robohatch/
├── prisma/
│   └── schema.prisma              # Comprehensive PostgreSQL schema
├── public/
│   ├── icons/                     # UI icon assets
│   ├── images/                    # Static image assets
│   └── logo/                      # RoboHatch SVG logos
├── src/
│   ├── app/
│   │   ├── (auth)/                # Authentication route group
│   │   ├── (store)/               # Storefront route group
│   │   ├── admin/                 # Admin dashboard route group
│   │   ├── api/
│   │   │   └── health/route.ts    # Service health-check REST route
│   │   ├── globals.css            # Tailwind CSS & design tokens
│   │   ├── layout.tsx             # Root layout with Geist font & providers
│   │   └── page.tsx               # Phase 0 foundation verification page
│   ├── components/
│   │   ├── common/                # Shared reusable components
│   │   ├── layout/                # Headers, footers, navigation
│   │   ├── providers/             # React context providers
│   │   └── ui/
│   │       └── button.tsx         # Shadcn UI button with brand tokens
│   ├── config/
│   │   └── site.ts                # Site configuration and metadata
│   ├── features/
│   │   ├── admin/types.ts         # Admin domain interfaces
│   │   ├── cart/types.ts          # Cart domain interfaces
│   │   ├── categories/types.ts    # Category domain interfaces
│   │   ├── checkout/types.ts      # Checkout domain interfaces
│   │   ├── customers/types.ts     # Customer & address interfaces
│   │   ├── orders/types.ts        # Order & fulfillment interfaces
│   │   └── products/types.ts      # Product & variant interfaces
│   ├── hooks/
│   │   └── index.ts               # Custom React hooks
│   ├── lib/
│   │   ├── constants.ts           # Design tokens, enums, and constants
│   │   ├── prisma.ts              # Global Prisma Client singleton
│   │   ├── utils.ts               # cn helper, currency/date formatters
│   │   └── validations/
│   │       └── index.ts           # Zod validation schemas
│   ├── services/
│   │   └── index.ts               # Core business services layer
│   └── types/
│       └── index.ts               # Common API and data transfer types
├── .env.example                   # Environment variable template
├── .gitignore                     # Git ignore rules
├── components.json                # Shadcn UI configuration
├── eslint.config.mjs              # ESLint 9 configuration
├── next.config.ts                 # Next.js configuration
├── package.json                   # Dependencies and scripts
├── postcss.config.mjs             # PostCSS configuration
├── tailwind.config.ts             # Tailwind configuration with design tokens
├── tsconfig.json                  # Strict TypeScript configuration
└── README.md                      # Architecture documentation
```

---

## 8. Design Tokens

RoboHatch follows a minimal, product-first aesthetic with custom design tokens:

- **Primary Background:** `#FAFAF8`
- **Secondary Background:** `#F1F1EF`
- **Primary Text:** `#171717`
- **Secondary Text:** `#737373`
- **Brand Accent:** `#E87536` (Industrial Precision Orange)
- **Border:** `#E5E5E5`
- **Typography:** Geist Sans & Geist Mono

---

## 9. Future Development Roadmap

- **Phase 1: Brand & Design System Implementation**
  - Implement full design token suite, atomic UI components (Card, Input, Modal, Badge, Dropdown, Table, Skeleton).
  - Navigation header, footer, mobile drawer.
- **Phase 2: Authentication & User Accounts**
  - Auth.js integration with Google OAuth & Email Magic Link.
  - User profile, address management, order history.
- **Phase 3: Catalog & Product Management**
  - Category hierarchy, product listing with faceted filtering (price, material, dimensions).
  - Product detail page with high-res Cloudinary gallery, 3D printing specs, variant selectors.
- **Phase 4: Shopping Cart & Checkout Pipeline**
  - Persistent guest & authenticated cart with local storage sync.
  - Multi-step checkout pipeline with address selection, tax calculation, and coupon validation.
- **Phase 5: Payment Gateway Integration**
  - Razorpay order creation, payment verification webhook, transaction status reconciliation.
- **Phase 6: Order Fulfillment & 3D Print Queue Tracking**
  - Order status tracking with dedicated 3D printing stages (`PRINTING`, `PROCESSING`).
  - Automated customer order confirmations.
- **Phase 7: Admin Dashboard**
  - Inventory management, 3D print queue prioritization, order management, sales metrics.
- **Phase 8: Optimization & Production Launch**
  - SEO, OpenGraph tags, Core Web Vitals optimization, Vercel edge deployment.
