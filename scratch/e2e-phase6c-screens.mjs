/**
 * ROBOHATCH PHASE 6C: BROWSER RESPONSIVE AUDIT & SCREENSHOT CAPTURE
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
  name: "Arjun Verma",
  email: "arjun.verma@robohatch.com",
  password: "SecureAccount!2026",
};

async function setupCustomer() {
  const passwordHash = await bcrypt.hash(TEST_USER.password, 12);
  let user = await prisma.user.findUnique({ where: { email: TEST_USER.email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: TEST_USER.name,
        email: TEST_USER.email,
        passwordHash,
        role: "CUSTOMER",
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, name: TEST_USER.name },
    });
  }

  // Ensure customer has one default address for realistic UI
  const existingAddr = await prisma.address.findFirst({
    where: { userId: user.id },
  });

  if (!existingAddr) {
    await prisma.address.create({
      data: {
        userId: user.id,
        fullName: "Arjun Verma",
        phone: "+91 9845012345",
        street: "742 Evergreen Terrace, Koramangala 4th Block",
        apartment: "Penthouse 402",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560034",
        country: "IN",
        isDefault: true,
        type: "SHIPPING",
      },
    });
  }

  return user;
}

async function runResponsiveAudit() {
  console.log("===============================================================");
  console.log("   ROBOHATCH: PHASE 6C RESPONSIVE AUDIT & SCREENSHOT CAPTURE   ");
  console.log("===============================================================\n");

  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  const user = await setupCustomer();
  console.log("✓ Test customer ready in PostgreSQL:", user.email);

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

    // 1. Log in to establish authenticated session
    console.log("--- 1. Authenticating Session ---");
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/login?callbackUrl=/account`, {
      waitUntil: "networkidle0",
    });
    await page.type("input[name='email']", TEST_USER.email);
    await page.type("input[name='password']", TEST_USER.password);
    await page.click("button[type='submit']");
    await page.waitForNavigation({ waitUntil: "networkidle0" });
    console.log("✓ Logged in; redirected to:", page.url());

    // 2. Desktop Screenshots (1440x900)
    console.log("\n--- 2. Capturing Desktop Screenshots (1440px) ---");

    // Overview
    await page.goto(`${BASE_URL}/account`, { waitUntil: "networkidle0" });
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "phase6c-account-desktop-1440.png"),
      fullPage: true,
    });
    console.log("  📸 Saved: phase6c-account-desktop-1440.png");

    // Profile & Password Security
    await page.goto(`${BASE_URL}/account/profile`, { waitUntil: "networkidle0" });
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "phase6c-profile-desktop-1440.png"),
      fullPage: true,
    });
    console.log("  📸 Saved: phase6c-profile-desktop-1440.png");

    // Addresses
    await page.goto(`${BASE_URL}/account/addresses`, { waitUntil: "networkidle0" });
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "phase6c-addresses-desktop-1440.png"),
      fullPage: true,
    });
    console.log("  📸 Saved: phase6c-addresses-desktop-1440.png");

    // Orders
    await page.goto(`${BASE_URL}/account/orders`, { waitUntil: "networkidle0" });
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "phase6c-orders-desktop-1440.png"),
      fullPage: true,
    });
    console.log("  📸 Saved: phase6c-orders-desktop-1440.png");

    // 3. Mobile Screenshots (390x844)
    console.log("\n--- 3. Capturing Mobile Screenshots (390px) ---");
    await page.setViewport({ width: 390, height: 844, isMobile: true });

    // Overview Mobile
    await page.goto(`${BASE_URL}/account`, { waitUntil: "networkidle0" });
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "phase6c-account-mobile-390.png"),
      fullPage: true,
    });
    console.log("  📸 Saved: phase6c-account-mobile-390.png");

    // Profile Mobile
    await page.goto(`${BASE_URL}/account/profile`, { waitUntil: "networkidle0" });
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "phase6c-profile-mobile-390.png"),
      fullPage: true,
    });
    console.log("  📸 Saved: phase6c-profile-mobile-390.png");

    // Addresses Mobile
    await page.goto(`${BASE_URL}/account/addresses`, { waitUntil: "networkidle0" });
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "phase6c-addresses-mobile-390.png"),
      fullPage: true,
    });
    console.log("  📸 Saved: phase6c-addresses-mobile-390.png");

    // Orders Mobile
    await page.goto(`${BASE_URL}/account/orders`, { waitUntil: "networkidle0" });
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, "phase6c-orders-mobile-390.png"),
      fullPage: true,
    });
    console.log("  📸 Saved: phase6c-orders-mobile-390.png");

    // 4. Multi-Breakpoint Viewport Audit (320px, 390px, 768px, 1024px, 1440px)
    console.log("\n--- 4. Multi-Breakpoint Viewport Verification ---");
    const breakpoints = [
      { name: "320px (Compact Mobile)", width: 320, height: 600 },
      { name: "390px (Standard Mobile)", width: 390, height: 844 },
      { name: "768px (Tablet Portrait)", width: 768, height: 1024 },
      { name: "1024px (Tablet Landscape / Desktop Sm)", width: 1024, height: 768 },
      { name: "1440px (Desktop Pro)", width: 1440, height: 900 },
    ];

    for (const bp of breakpoints) {
      await page.setViewport({ width: bp.width, height: bp.height });
      await page.goto(`${BASE_URL}/account/addresses`, { waitUntil: "networkidle0" });
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      if (overflow) {
        console.error(`  ✗ [FAIL] Horizontal overflow detected at ${bp.name}`);
      } else {
        console.log(`  ✓ [PASS] Zero horizontal overflow at ${bp.name}`);
      }
    }
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }

  console.log("\n===============================================================");
  console.log("   RESPONSIVE AUDIT & SCREENSHOT CAPTURE COMPLETE               ");
  console.log("===============================================================\n");
}

runResponsiveAudit().catch((err) => {
  console.error("FATAL AUDIT ERROR:", err);
  process.exit(1);
});
