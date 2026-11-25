/**
 * ROBOHATCH PHASE 6B: END-TO-END BROWSER JOURNEY & AUDIT VERIFICATION
 *
 * Drives real headless Google Chrome via puppeteer-core against live Next.js server (http://localhost:3000).
 * Tests the complete 12-step guest cart preservation, authentication, merge, and session persistence journey.
 * Captures required high-fidelity screenshots for desktop and mobile authentication.
 */

import puppeteer from "puppeteer-core";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACTS_DIR =
  "C:\\Users\\mcsr8\\.gemini\\antigravity\\brain\\59f9ab82-233a-4db0-82c8-4c115a24dcf6";
const BASE_URL = "http://localhost:3000";

const prisma = new PrismaClient();

const TEST_USER = {
  name: "E2E Test Collector",
  email: "e2e-browser-test@robohatch.com",
  password: "SecureE2E!2026",
};

let passedAssertions = 0;
let totalAssertions = 0;

function assert(condition, description, details = "") {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  ✓ [PASS] ${description}`);
  } else {
    console.error(`  ✗ [FAIL] ${description}${details ? ` -> ${details}` : ""}`);
  }
}

async function ensureTestUser() {
  const existing = await prisma.user.findUnique({
    where: { email: TEST_USER.email },
  });

  const passwordHash = await bcrypt.hash(TEST_USER.password, 12);

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        name: TEST_USER.name,
        role: "CUSTOMER",
      },
    });
  } else {
    await prisma.user.create({
      data: {
        name: TEST_USER.name,
        email: TEST_USER.email,
        passwordHash,
        role: "CUSTOMER",
      },
    });
  }
}

async function runBrowserJourney() {
  console.log("===============================================================");
  console.log("   ROBOHATCH: REAL BROWSER END-TO-END CART & AUTH JOURNEY      ");
  console.log("===============================================================\n");

  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  // Ensure DB test user exists
  await ensureTestUser();
  console.log("✓ Live test customer prepared in PostgreSQL:", TEST_USER.email);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1440,900",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // -------------------------------------------------------------
    // STEP 1: Open RoboHatch as a guest and clear existing storage
    // -------------------------------------------------------------
    console.log("\n--- Step 1: Open RoboHatch as a Guest ---");
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle0" });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: "networkidle0" });

    const initialStorage = await page.evaluate(() =>
      localStorage.getItem("robohatch-cart-storage")
    );
    assert(
      !initialStorage || initialStorage.includes('"items":[]'),
      "Initial guest cart is clean and empty"
    );

    // -------------------------------------------------------------
    // STEP 2: Add two different products
    // -------------------------------------------------------------
    console.log("\n--- Step 2: Add Two Different Products ---");

    // Product 1: Voronoi Kinetic Vessel
    await page.goto(`${BASE_URL}/products/voronoi-kinetic-vessel`, {
      waitUntil: "networkidle0",
    });
    await page.waitForSelector("button[aria-label='Add to cart']");
    await page.click("button[aria-label='Add to cart']");
    await new Promise((r) => setTimeout(r, 600));

    // Product 2: Tessellated Desk Organizer
    await page.goto(`${BASE_URL}/products/tessellated-desk-organizer`, {
      waitUntil: "networkidle0",
    });
    await page.waitForSelector("button[aria-label='Add to cart']");
    await page.click("button[aria-label='Add to cart']");
    await new Promise((r) => setTimeout(r, 600));

    let cartData = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("robohatch-cart-storage") || "{}")
    );
    assert(
      cartData?.state?.items?.length === 2,
      "Guest cart contains 2 distinct products"
    );

    // -------------------------------------------------------------
    // STEP 3: Add a product with a selected color variant
    // -------------------------------------------------------------
    console.log("\n--- Step 3: Add Product with Selected Color Variant ---");
    await page.goto(`${BASE_URL}/products/modular-magsafe-dock`, {
      waitUntil: "networkidle0",
    });

    // Select second colorway button (Alabaster Bone)
    const colorButtons = await page.$$("button[aria-label*='Select']");
    if (colorButtons.length > 1) {
      await colorButtons[1].click();
      await new Promise((r) => setTimeout(r, 300));
    }

    await page.waitForSelector("button[aria-label='Add to cart']");
    await page.click("button[aria-label='Add to cart']");
    await new Promise((r) => setTimeout(r, 600));

    cartData = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("robohatch-cart-storage") || "{}")
    );
    assert(cartData?.state?.items?.length === 3, "Guest cart now contains 3 items");
    const variantItem = cartData?.state?.items?.find((i) => i.productId === "prod-4");
    assert(
      !!variantItem?.selectedColor,
      "Color variant recorded in cart item: " + variantItem?.selectedColor
    );

    // -------------------------------------------------------------
    // STEP 4: Increase quantities
    // -------------------------------------------------------------
    console.log("\n--- Step 4: Increase Item Quantities on /cart ---");
    await page.goto(`${BASE_URL}/cart`, { waitUntil: "networkidle0" });

    await page.waitForSelector("button[aria-label*='Increase quantity']");
    const incBtns = await page.$$("button[aria-label*='Increase quantity']");
    assert(incBtns.length >= 1, "Quantity increment steppers rendered on cart page");
    if (incBtns.length >= 1) {
      await incBtns[0].click();
      await new Promise((r) => setTimeout(r, 500));
    }

    cartData = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("robohatch-cart-storage") || "{}")
    );
    const firstItemQty = cartData?.state?.items?.[0]?.quantity;
    assert(
      firstItemQty === 2,
      `First item quantity successfully incremented to ${firstItemQty}`
    );

    const preLoginItems = JSON.parse(JSON.stringify(cartData?.state?.items || []));

    // -------------------------------------------------------------
    // STEP 5 & 6: Open Login Page & Log In Successfully
    // -------------------------------------------------------------
    console.log("\n--- Step 5 & 6: Open Login Page and Sign In ---");
    await page.goto(`${BASE_URL}/login?callbackUrl=/cart`, { waitUntil: "networkidle0" });

    // Capture Desktop Login Screenshot
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "desktop-login.png"),
      fullPage: true,
    });
    console.log("  📸 Saved screenshot: desktop-login.png");

    // Fill form
    await page.type("input[name='email']", TEST_USER.email);
    await page.type("input[name='password']", TEST_USER.password);
    await page.click("button[type='submit']");

    // Wait for navigation back to /cart
    await page.waitForNavigation({ waitUntil: "networkidle0" });
    assert(
      page.url().includes("/cart"),
      `Redirection to safe callbackUrl succeeded: ${page.url()}`
    );

    // -------------------------------------------------------------
    // STEP 7 & 8: Verify Cart Items & Quantities Intact Post-Login
    // -------------------------------------------------------------
    console.log("\n--- Step 7 & 8: Verify Cart Items & Color Variants Post-Login ---");
    cartData = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("robohatch-cart-storage") || "{}")
    );

    assert(
      cartData?.state?.items?.length === 3,
      "All 3 cart items remain intact post-login"
    );
    assert(
      cartData?.state?.items?.[0]?.quantity === preLoginItems[0].quantity,
      `Item 1 quantity preserved exactly (${cartData?.state?.items?.[0]?.quantity})`
    );

    const postLoginVariant = cartData?.state?.items?.find(
      (i) => i.productId === "prod-4"
    );
    assert(
      postLoginVariant?.selectedColor === variantItem?.selectedColor,
      `Color variant preserved post-login: ${postLoginVariant?.selectedColor}`
    );

    const sessionMergeFlag = await page.evaluate(() =>
      sessionStorage.getItem("robohatch-cart-merged-session")
    );
    assert(
      sessionMergeFlag === "true",
      "sessionStorage merge flag set to prevent repeated merges"
    );

    // Capture Desktop Cart Post-Login Screenshot
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "desktop-cart-post-login.png"),
      fullPage: true,
    });
    console.log("  📸 Saved screenshot: desktop-cart-post-login.png");

    // -------------------------------------------------------------
    // STEP 9: Refresh the page
    // -------------------------------------------------------------
    console.log("\n--- Step 9: Refresh Page & Verify Hydration ---");
    await page.reload({ waitUntil: "networkidle0" });

    cartData = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("robohatch-cart-storage") || "{}")
    );
    assert(
      cartData?.state?.items?.length === 3,
      "Cart item count unchanged after page refresh (no duplicate additions)"
    );
    assert(
      cartData?.state?.items?.[0]?.quantity === preLoginItems[0].quantity,
      "Item quantities unchanged after page refresh"
    );

    const hydrationMismatch = consoleErrors.some((e) => e.includes("Hydration"));
    assert(!hydrationMismatch, "No React hydration errors occurred on page refresh");

    // -------------------------------------------------------------
    // STEP 10: Navigate between Product and Cart Pages
    // -------------------------------------------------------------
    console.log("\n--- Step 10: Navigate Between Routes ---");
    await page.goto(`${BASE_URL}/products`, { waitUntil: "networkidle0" });
    await page.goto(`${BASE_URL}/cart`, { waitUntil: "networkidle0" });

    cartData = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("robohatch-cart-storage") || "{}")
    );
    assert(
      cartData?.state?.items?.length === 3,
      "Cart items persistent across multi-route navigation"
    );

    // -------------------------------------------------------------
    // STEP 11 & 12: Logout and Re-Login (Accidental Duplicate Merge Check)
    // -------------------------------------------------------------
    console.log("\n--- Step 11 & 12: Logout and Re-Login Check ---");
    // Navigate to Account page
    await page.goto(`${BASE_URL}/account`, { waitUntil: "networkidle0" });
    assert(page.url().includes("/account"), "Authenticated user can access /account");

    // Capture Desktop Account Screenshot
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "desktop-account.png"),
      fullPage: true,
    });
    console.log("  📸 Saved screenshot: desktop-account.png");

    // Go to profile page
    await page.goto(`${BASE_URL}/account/profile`, { waitUntil: "networkidle0" });

    // Capture Desktop Account Profile Screenshot
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "desktop-account-profile.png"),
      fullPage: true,
    });
    console.log("  📸 Saved screenshot: desktop-account-profile.png");

    // Sign out using the account navigation button
    const signoutBtns = await page.$$("button");
    let signedOut = false;
    for (const btn of signoutBtns) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && text.includes("Sign Out")) {
        await btn.click();
        signedOut = true;
        await new Promise((r) => setTimeout(r, 1000));
        break;
      }
    }

    if (!signedOut) {
      // Fallback: clear auth cookies
      const cookies = await page.cookies();
      for (const cookie of cookies) {
        if (cookie.name.includes("authjs") || cookie.name.includes("next-auth")) {
          await page.deleteCookie(cookie);
        }
      }
      await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
    }

    // Re-login
    await page.goto(`${BASE_URL}/login?callbackUrl=/cart`, { waitUntil: "networkidle0" });
    await page.type("input[name='email']", TEST_USER.email);
    await page.type("input[name='password']", TEST_USER.password);
    await page.click("button[type='submit']");
    await page.waitForNavigation({ waitUntil: "networkidle0" });

    // Check cart again
    await page.goto(`${BASE_URL}/cart`, { waitUntil: "networkidle0" });
    cartData = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("robohatch-cart-storage") || "{}")
    );

    assert(
      cartData?.state?.items?.length === 3,
      "Cart still contains exactly 3 items after re-login"
    );
    assert(
      cartData?.state?.items?.[0]?.quantity === preLoginItems[0].quantity,
      `Quantities did NOT double on re-login (retained ${cartData?.state?.items?.[0]?.quantity})`
    );

    // -------------------------------------------------------------
    // EDGE CASES: Unavailable Product & Outdated Price Sanitization
    // -------------------------------------------------------------
    console.log("\n--- Edge Case Testing: Outdated Price & Out-of-Stock Removal ---");

    // Inject an invalid product and an altered price into localStorage
    await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem("robohatch-cart-storage") || "{}");
      if (data?.state?.items) {
        // Tamper price of item 1
        data.state.items[0].priceInPaise = 1;
        // Inject fake out of stock product
        data.state.items.push({
          id: "fake-raw-item",
          productId: "non-existent-product",
          slug: "fake-raw",
          name: "Invalid Phantom Product",
          image: "/images/fake.jpg",
          priceInPaise: 9999,
          quantity: 1,
        });
        localStorage.setItem("robohatch-cart-storage", JSON.stringify(data));
      }
    });

    // Reload page to trigger rehydration sanitization
    await page.reload({ waitUntil: "networkidle0" });

    const sanitizedData = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("robohatch-cart-storage") || "{}")
    );

    const hasPhantom = sanitizedData?.state?.items?.some(
      (i) => i.productId === "non-existent-product"
    );
    assert(
      !hasPhantom,
      "Sanitization automatically discarded non-existent/unavailable product"
    );

    const refreshedPrice = sanitizedData?.state?.items?.[0]?.priceInPaise;
    assert(
      refreshedPrice > 100,
      `Sanitization automatically refreshed tampered price to official paise (${refreshedPrice})`
    );

    // -------------------------------------------------------------
    // MOBILE VIEWPORT SCREENSHOTS (390px)
    // -------------------------------------------------------------
    console.log("\n--- Mobile Responsive Audits & Screenshots (390px) ---");
    await page.setViewport({ width: 390, height: 844, isMobile: true });

    // Mobile Login
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "mobile-login.png"),
      fullPage: true,
    });
    console.log("  📸 Saved screenshot: mobile-login.png");

    // Mobile Register
    await page.goto(`${BASE_URL}/register`, { waitUntil: "networkidle0" });
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "mobile-register.png"),
      fullPage: true,
    });
    console.log("  📸 Saved screenshot: mobile-register.png");

    // Mobile Menu Drawer with User Nav
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle0" });
    const mobileMenuBtn = await page.$("button[aria-label='Open menu']");
    if (mobileMenuBtn) {
      await mobileMenuBtn.click();
      await new Promise((r) => setTimeout(r, 400));
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, "mobile-account-nav.png"),
        fullPage: true,
      });
      console.log("  📸 Saved screenshot: mobile-account-nav.png");
    }

    // Desktop Register
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/register`, { waitUntil: "networkidle0" });
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "desktop-register.png"),
      fullPage: true,
    });
    console.log("  📸 Saved screenshot: desktop-register.png");
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }

  console.log("\n===============================================================");
  console.log(
    `   JOURNEY COMPLETE: ${passedAssertions}/${totalAssertions} ASSERTIONS PASSED`
  );
  console.log("===============================================================\n");

  if (passedAssertions !== totalAssertions) {
    process.exit(1);
  }
}

runBrowserJourney().catch((err) => {
  console.error("FATAL BROWSER JOURNEY ERROR:", err);
  process.exit(1);
});
