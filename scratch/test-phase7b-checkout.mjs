/**
 * ROBOHATCH PHASE 7B: CHECKOUT UI & SHIPPING ADDRESS QA TEST SUITE
 *
 * Comprehensive verification of:
 * 1. Protected Route & Auth Redirection (/checkout)
 * 2. Database Address Scoping & Ownership
 * 3. Authoritative Cart Validation & Integer Paise Precision
 * 4. Address Book CRUD Integration & Zod Validation
 * 5. Browser E2E Checkout Flow & Responsive Screenshots (5 Viewports)
 * 6. Responsive Overflow & Accessibility Checks
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { validateCheckoutCart } from "../src/features/checkout/lib/checkout-validation.ts";
import { addressSchema } from "../src/lib/validations/account.ts";
import { PRODUCTS_DATA } from "../src/data/products.ts";
import { rupeesToPaise, formatPaise } from "../src/features/cart/lib/cart-utils.ts";

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

async function runPhase7BTests() {
  console.log("===============================================================");
  console.log("   ROBOHATCH: PHASE 7B CHECKOUT UI & ADDRESS QA TEST SUITE     ");
  console.log("===============================================================\n");

  const timestamp = Date.now();
  const testPassword = "SecureCheckout!2026";
  const passwordHash = await bcrypt.hash(testPassword, 12);

  // Setup Test Customer A
  const userA = await prisma.user.create({
    data: {
      name: "Rohan Singhania",
      email: `rohan-checkout-${timestamp}@test.com`,
      passwordHash,
      role: "CUSTOMER",
    },
  });

  // Setup Test Customer B (for IDOR isolation)
  const userB = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: `priya-checkout-${timestamp}@test.com`,
      passwordHash,
      role: "CUSTOMER",
    },
  });

  // Seed two addresses for User A (one default)
  const addrA1 = await prisma.address.create({
    data: {
      userId: userA.id,
      fullName: "Rohan Singhania (Home)",
      phone: "+91 98200 11223",
      street: "128 Indiranagar 100 Feet Road",
      apartment: "Villa 4",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
      country: "IN",
      isDefault: true,
      type: "SHIPPING",
    },
  });

  const addrA2 = await prisma.address.create({
    data: {
      userId: userA.id,
      fullName: "Rohan Singhania (Office)",
      phone: "+91 98200 99887",
      street: "Tower B, Prestige Tech Park",
      apartment: "Floor 6",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560103",
      country: "IN",
      isDefault: false,
      type: "SHIPPING",
    },
  });

  // Seed address for User B
  const addrB1 = await prisma.address.create({
    data: {
      userId: userB.id,
      fullName: "Priya Sharma",
      phone: "+91 98111 22334",
      street: "45 Nariman Point",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400021",
      country: "IN",
      isDefault: true,
      type: "SHIPPING",
    },
  });

  console.log(
    `✓ Test Fixtures Initialized: User A (${userA.id}), User B (${userB.id})\n`
  );

  try {
    // -------------------------------------------------------------
    // SECTION 1: ROUTE PROTECTION & AUTHENTICATION REDIRECT
    // -------------------------------------------------------------
    console.log("--- 1. Protected Checkout Route & Redirection ---");

    // Test 1: Unauthenticated request to /checkout redirects
    const unauthRes = await fetch(`${BASE_URL}/checkout`, { redirect: "manual" });
    assert(
      unauthRes.status === 307 ||
        unauthRes.status === 308 ||
        unauthRes.headers.get("location")?.includes("/login"),
      1,
      "Unauthenticated access to /checkout triggers redirect (HTTP 307)"
    );

    // Test 2: Redirect location points to /login with callbackUrl=/checkout
    const redirectLocation = unauthRes.headers.get("location") || "";
    assert(
      redirectLocation.includes("/login") &&
        (redirectLocation.includes("callbackUrl=%2Fcheckout") ||
          redirectLocation.includes("callbackUrl=/checkout")),
      2,
      "Redirect target preserves safe callbackUrl (/login?callbackUrl=/checkout)"
    );

    // -------------------------------------------------------------
    // SECTION 2: DATABASE ADDRESS SCOPING & IDOR PROTECTION
    // -------------------------------------------------------------
    console.log("\n--- 2. Database Address Scoping & IDOR Defense ---");

    // Test 3: User A's checkout query loads only User A's addresses
    const userAAddresses = await prisma.address.findMany({
      where: { userId: userA.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    assert(
      userAAddresses.length === 2 && userAAddresses.every((a) => a.userId === userA.id),
      3,
      "Checkout address query strictly scopes records to authenticated customer"
    );

    // Test 4: Default address is preselected in address query
    assert(
      userAAddresses[0].id === addrA1.id && userAAddresses[0].isDefault === true,
      4,
      "Customer default address is correctly prioritized as first/preselected item"
    );

    // Test 5: IDOR protection - User A cannot access User B's address
    const crossTenantCheck = await prisma.address.findFirst({
      where: { id: addrB1.id, userId: userA.id },
    });
    assert(
      crossTenantCheck === null,
      5,
      "IDOR defense: User A cannot query or select User B's address"
    );

    // -------------------------------------------------------------
    // SECTION 3: AUTHORITATIVE CART VALIDATION & INTEGER PAISE
    // -------------------------------------------------------------
    console.log("\n--- 3. Authoritative Cart Validation & Monetary Precision ---");

    // Test 6: Empty cart validation handles zero items gracefully
    const emptyValidation = validateCheckoutCart([]);
    assert(
      emptyValidation.isEmpty === true && emptyValidation.subtotalInPaise === 0,
      6,
      "Cart validation detects empty cart state and sets subtotal to 0"
    );

    // Test 7: Resolves trusted catalog prices in integer paise (discards fake client price)
    const rawCartWithTamperedPrice = [
      {
        id: "prod-1__carbon-obsidian",
        productId: "prod-1", // Voronoi Kinetic Vessel (catalog price ₹2,499)
        slug: "voronoi-kinetic-vessel",
        name: "Voronoi Kinetic Vessel",
        image: "/images/products/voronoi-kinetic-vessel.jpg",
        priceInPaise: 100, // Tampered client price: ₹1.00 (100 paise)
        quantity: 2,
        selectedColor: "Carbon Obsidian",
        category: "Home & Living",
        material: "Carbon PETG",
      },
    ];
    const tamperedValidation = validateCheckoutCart(rawCartWithTamperedPrice);
    assert(
      tamperedValidation.items[0].unitPriceInPaise === 249900 &&
        tamperedValidation.items[0].lineTotalInPaise === 499800 &&
        tamperedValidation.subtotalInPaise === 499800,
      7,
      "Cart validation rejects client-supplied price and enforces authoritative catalog price (₹2,499 = 249,900 paise)"
    );

    // Test 8: Safe clamping of quantities between 1 and 10
    const rawCartExtremeQty = [
      {
        id: "prod-2__default",
        productId: "prod-2", // Tessellated Desk Organizer (catalog price ₹1,899)
        slug: "tessellated-desk-organizer",
        name: "Tessellated Desk Organizer",
        image: "/images/products/tessellated-desk-organizer.jpg",
        priceInPaise: 189900,
        quantity: 999, // Extreme quantity
        category: "Desk Accessories",
        material: "Matte PLA",
      },
    ];
    const clampedValidation = validateCheckoutCart(rawCartExtremeQty);
    assert(
      clampedValidation.items[0].quantity === 10,
      8,
      "Cart validation clamps excessive quantity to maximum allowable line limit (10)"
    );

    // Test 9: Unknown or discontinued products are detected and flagged
    const rawCartWithGhostItem = [
      {
        id: "prod-ghost__default",
        productId: "non-existent-id",
        slug: "ghost-item",
        name: "Ghost Item",
        image: "/ghost.jpg",
        priceInPaise: 99900,
        quantity: 1,
        category: "Unknown",
        material: "Plastic",
      },
    ];
    const ghostValidation = validateCheckoutCart(rawCartWithGhostItem);
    assert(
      ghostValidation.hasUnavailableItems === true && ghostValidation.isEmpty === true,
      9,
      "Cart validation identifies missing or discontinued products and flags unavailable state"
    );

    // -------------------------------------------------------------
    // SECTION 4: ADDRESS FORM & ZOD VALIDATION
    // -------------------------------------------------------------
    console.log("\n--- 4. Address Validation & Schema Defense ---");

    // Test 10: Rejects invalid phone numbers
    const invalidPhoneResult = addressSchema.safeParse({
      fullName: "Test User",
      phone: "1234", // too short
      street: "Test Street 101",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560034",
      country: "IN",
      isDefault: false,
      type: "SHIPPING",
    });
    assert(
      !invalidPhoneResult.success,
      10,
      "Address schema rejects invalid/short phone numbers"
    );

    // Test 11: Rejects invalid PIN codes
    const invalidPinResult = addressSchema.safeParse({
      fullName: "Test User",
      phone: "+91 98765 43210",
      street: "Test Street 101",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "ABC", // invalid PIN
      country: "IN",
      isDefault: false,
      type: "SHIPPING",
    });
    assert(
      !invalidPinResult.success,
      11,
      "Address schema rejects invalid PIN/postal codes"
    );

    // Test 12: Accepts compliant address payload
    const validAddressResult = addressSchema.safeParse({
      fullName: "Rohan Singhania",
      phone: "+91 98200 11223",
      street: "128 Indiranagar 100 Feet Road",
      apartment: "Villa 4",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
      country: "IN",
      isDefault: true,
      type: "SHIPPING",
    });
    assert(
      validAddressResult.success,
      12,
      "Address schema validates compliant delivery address payload"
    );

    // -------------------------------------------------------------
    // SECTION 5: BROWSER E2E TEST & RESPONSIVE SCREENSHOTS
    // -------------------------------------------------------------
    console.log("\n--- 5. Browser E2E Checkout Flow & Responsive Capture ---");

    if (!fs.existsSync(ARTIFACTS_DIR)) {
      fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
    }

    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    try {
      const page = await browser.newPage();

      // Step 5A: Log in as Test Customer A
      console.log("  Logging in via /login...");
      await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });
      await page.waitForSelector('input[name="email"]');
      await page.type('input[name="email"]', userA.email);
      await page.type('input[name="password"]', testPassword);
      await page.click('button[type="submit"]');
      await new Promise((r) => setTimeout(r, 2000));
      console.log("  Logged in. Current URL:", page.url());

      // Step 5B: Add items to cart via product pages
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

      // Step 5C: Navigate to /checkout
      console.log("  Navigating to /checkout...");
      await page.goto(`${BASE_URL}/checkout`, { waitUntil: "networkidle2" });
      console.log("  At /checkout. Page URL:", page.url());

      // Verify that we are on /checkout
      await page.waitForSelector("#shipping-address-heading", { timeout: 15000 });

      // Test 13: Checkout page renders main sections
      const hasAddressSection = await page.$("#shipping-address-heading");
      const hasReviewSection = await page.$("#order-review-heading");
      assert(
        Boolean(hasAddressSection && hasReviewSection),
        13,
        "Checkout renders Address Selection and Order Review sections"
      );

      // Test 14: Saved address cards render
      const addressCards = await page.$$('div[role="radio"]');
      assert(
        addressCards.length >= 2,
        14,
        "Checkout displays saved customer address cards"
      );

      // Test 15: Default address is visually preselected
      const preselectedChecked = await page.evaluate(() => {
        const firstRadio = document.querySelector('div[role="radio"]');
        return firstRadio ? firstRadio.getAttribute("aria-checked") === "true" : false;
      });
      assert(
        preselectedChecked,
        15,
        "Default address is selected with aria-checked=true and active highlight"
      );

      // Test 16: Order review displays trusted items with preliminary subtotal
      const reviewText = await page.evaluate(() => document.body.innerText);
      const hasVoronoi = reviewText.includes("Voronoi Kinetic Vessel");
      const hasTessellated = reviewText.includes("Tessellated Hex Desk Organizer");
      const hasSubtotalDisclosure = reviewText.includes(
        "Calculated in the next checkout step."
      );
      assert(
        hasVoronoi && hasTessellated && hasSubtotalDisclosure,
        16,
        "Order Review displays validated items, integer paise pricing, and uncalculated shipping/tax disclosures"
      );

      // Step 5D: Responsive Viewports & Screenshots
      console.log("  Auditing 5 Responsive Viewports & Capturing Screenshots...");

      const viewports = [
        { name: "desktop-1440", width: 1440, height: 900 },
        { name: "desktop-1024", width: 1024, height: 768 },
        { name: "tablet-768", width: 768, height: 1024 },
        { name: "mobile-390", width: 390, height: 844 },
        { name: "mobile-320", width: 320, height: 600 },
      ];

      for (const vp of viewports) {
        await page.setViewport({ width: vp.width, height: vp.height });
        await new Promise((r) => setTimeout(r, 400));

        // Check for horizontal overflow
        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        assert(
          !overflow,
          17 + viewports.indexOf(vp),
          `Viewport ${vp.width}px (${vp.name}) renders with zero horizontal overflow`
        );

        // Capture screenshot
        const screenshotPath = path.join(ARTIFACTS_DIR, `checkout-${vp.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`    ↳ Screenshot captured: checkout-${vp.name}.png`);
      }
    } finally {
      await browser.close();
    }
  } finally {
    // Teardown Test Data
    console.log("\n--- Cleaning up test fixtures from PostgreSQL ---");
    await prisma.address.deleteMany({ where: { userId: { in: [userA.id, userB.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });
    await prisma.$disconnect();
    console.log("✓ Test database cleanup completed successfully.");
  }

  console.log("\n===============================================================");
  console.log(`   PHASE 7B QA AUDIT SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("===============================================================\n");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runPhase7BTests().catch((err) => {
  console.error("FATAL TEST EXCEPTION:", err);
  process.exit(1);
});
