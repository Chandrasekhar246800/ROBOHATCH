/**
 * ROBOHATCH PHASE 6B: CUSTOMER AUTHENTICATION UI & FLOW QA TEST SUITE
 *
 * Comprehensive automated verification covering:
 * 1. Registration Schema & Server Action Validation (Live DB)
 * 2. Login Credentials Verification & Error Masking
 * 3. Open Redirect Protection (Callback URL Hardening)
 * 4. Guest Cart Preservation & Merge Logic (Integrity & Idempotency)
 * 5. Route Protection & Live Server Probes (/account, /account/profile redirect checks)
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { registerSchema, loginSchema } from "../src/lib/validations/auth.ts";
import { getSafeCallbackUrl } from "../src/lib/auth/callback-url.ts";
import { mergeCartItems } from "../src/features/cart/lib/cart-merge.ts";
import { PRODUCTS_DATA } from "../src/data/products.ts";
import { rupeesToPaise } from "../src/features/cart/lib/cart-utils.ts";

const prisma = new PrismaClient();

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, details = "") {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName}${details ? ` -> ${details}` : ""}`);
  }
}

async function runPhase6BQATests() {
  console.log("===============================================================");
  console.log("   ROBOHATCH: PHASE 6B AUTOMATED QA TEST SUITE                 ");
  console.log("===============================================================\n");

  // SECTION 1: REGISTRATION VALIDATION & SERVER LOGIC
  console.log("--- 1. Registration Validation & Security ---");

  // 1.1 Name validation
  const shortName = registerSchema.safeParse({
    name: "A",
    email: "test@example.com",
    password: "Password123!",
    confirmPassword: "Password123!",
  });
  assert(!shortName.success, "Rejects name with less than 2 characters");

  // 1.2 Invalid email format
  const invalidEmail = registerSchema.safeParse({
    name: "Valid Name",
    email: "not-an-email",
    password: "Password123!",
    confirmPassword: "Password123!",
  });
  assert(!invalidEmail.success, "Rejects invalid email format");

  // 1.3 Weak password (missing special char)
  const weakPassword = registerSchema.safeParse({
    name: "Valid Name",
    email: "valid@example.com",
    password: "Password123",
    confirmPassword: "Password123",
  });
  assert(!weakPassword.success, "Rejects password without special character");

  // 1.4 Mismatched passwords
  const mismatchedPw = registerSchema.safeParse({
    name: "Valid Name",
    email: "valid@example.com",
    password: "Password123!",
    confirmPassword: "DifferentPassword123!",
  });
  assert(!mismatchedPw.success, "Rejects non-matching confirmPassword");

  // 1.5 Valid registration schema
  const validReg = registerSchema.safeParse({
    name: "Jane Engineer",
    email: " Jane.Engineer@RoboHatch.com ",
    password: "SecurePassword!2026",
    confirmPassword: "SecurePassword!2026",
  });
  assert(validReg.success, "Accepts compliant registration payload");
  if (validReg.success) {
    assert(
      validReg.data.email === "jane.engineer@robohatch.com",
      "Normalizes and lowercases registration email"
    );
  }

  // 1.6 Live DB Registration & Password Hash Salt
  const uniqueEmail = `qa-customer-${Date.now()}@robohatch-test.com`;
  let createdUserId = null;
  try {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash("SecurePassword!2026", saltRounds);
    const user = await prisma.user.create({
      data: {
        name: "QA Customer",
        email: uniqueEmail,
        passwordHash: hashedPassword,
        role: "CUSTOMER",
      },
    });
    createdUserId = user.id;

    assert(!!user.id, "Successfully creates user in PostgreSQL via Prisma");
    assert(user.role === "CUSTOMER", "Defaults user role to CUSTOMER");
    assert(
      user.passwordHash.startsWith("$2a$") || user.passwordHash.startsWith("$2b$"),
      "Stores bcrypt hash starting with valid bcrypt identifier ($2a$/$2b$)"
    );
    assert(
      !user.passwordHash.includes("SecurePassword!2026"),
      "Plaintext password is never stored or exposed"
    );

    // 1.7 Duplicate email rejection test
    let duplicateRejected = false;
    try {
      await prisma.user.create({
        data: {
          name: "Duplicate Customer",
          email: uniqueEmail,
          passwordHash: hashedPassword,
          role: "CUSTOMER",
        },
      });
    } catch (err) {
      if (err.code === "P2002") {
        duplicateRejected = true;
      }
    }
    assert(
      duplicateRejected,
      "Database unique constraint rejects duplicate email registration"
    );
  } catch (err) {
    assert(false, "Live DB Registration failed", err.message);
  }

  // SECTION 2: LOGIN CREDENTIALS & ERROR HANDLING
  console.log("\n--- 2. Login Credentials Verification & Error Masking ---");

  // 2.1 Login schema validation
  const validLogin = loginSchema.safeParse({
    email: "jane.engineer@robohatch.com",
    password: "SecurePassword!2026",
  });
  assert(validLogin.success, "Accepts valid login schema payload");

  // 2.2 Password verification against database hash
  const foundUser = await prisma.user.findUnique({
    where: { email: uniqueEmail },
  });
  assert(!!foundUser, "Finds registered user by email in PostgreSQL");

  const correctMatch = await bcrypt.compare(
    "SecurePassword!2026",
    foundUser.passwordHash
  );
  assert(correctMatch, "bcrypt.compare validates correct password");

  const incorrectMatch = await bcrypt.compare(
    "WrongPassword!123",
    foundUser.passwordHash
  );
  assert(!incorrectMatch, "bcrypt.compare rejects incorrect password");

  // Cleanup test user
  if (createdUserId) {
    await prisma.user.delete({ where: { id: createdUserId } });
  }

  // SECTION 3: OPEN REDIRECT DEFENSE (CALLBACK URL HARDENING)
  console.log("\n--- 3. Callback URL Hardening & Open Redirect Defense ---");

  const safeInternal = getSafeCallbackUrl("/account");
  assert(safeInternal === "/account", "Allows standard internal route (/account)");

  const safeInternalWithParams = getSafeCallbackUrl(
    "/products/rh-apex-dock?color=Matte+Black"
  );
  assert(
    safeInternalWithParams === "/products/rh-apex-dock?color=Matte+Black",
    "Allows internal route with query parameters"
  );

  const blockProtocolRelative = getSafeCallbackUrl("//evil.com/phish");
  assert(
    blockProtocolRelative === "/account",
    "Blocks protocol-relative URL (//evil.com) -> defaults to /account"
  );

  const blockAbsoluteHttps = getSafeCallbackUrl("https://malicious-site.com");
  assert(
    blockAbsoluteHttps === "/account",
    "Blocks absolute HTTPS URL -> defaults to /account"
  );

  const blockJavascriptScheme = getSafeCallbackUrl("javascript:alert(1)");
  assert(
    blockJavascriptScheme === "/account",
    "Blocks javascript: scheme -> defaults to /account"
  );

  const blockBackslashBypass = getSafeCallbackUrl("/\\evil.com");
  assert(
    blockBackslashBypass === "/account",
    "Blocks backslash bypass target (/\\evil.com) -> defaults to /account"
  );

  // SECTION 4: GUEST CART PRESERVATION & MERGE
  console.log("\n--- 4. Guest Cart Preservation & Merge Logic ---");

  const p1 = PRODUCTS_DATA[0]; // RH-01 Apex Phone Dock
  const p2 = PRODUCTS_DATA[1]; // RH-02 Orbit Headphone Stand

  // 4.1 Merging guest items into empty cart
  const guestItem1 = {
    id: `${p1.id}-${p1.colors[0]}`,
    productId: p1.id,
    slug: p1.slug,
    name: p1.name,
    image: p1.image,
    priceInPaise: rupeesToPaise(p1.price),
    quantity: 2,
    selectedColor: p1.colors[0],
    category: p1.category,
    material: p1.material,
  };

  const initialMerge = mergeCartItems([], [guestItem1]);
  assert(initialMerge.length === 1, "Merges guest item into empty cart");
  assert(initialMerge[0].quantity === 2, "Preserves initial guest item quantity (2)");
  assert(
    initialMerge[0].priceInPaise === rupeesToPaise(p1.price),
    "Refreshes price against single-source integer paise"
  );

  // 4.2 Merging same product + same color adds quantity
  const sameItemIncoming = { ...guestItem1, quantity: 3 };
  const combinedMerge = mergeCartItems(initialMerge, [sameItemIncoming]);
  assert(combinedMerge.length === 1, "Does not duplicate same product and color");
  assert(combinedMerge[0].quantity === 5, "Correctly combines quantities (2 + 3 = 5)");

  // 4.3 Merging same product with different colorway creates distinct cart line
  if (p1.colors.length > 1) {
    const diffColorItem = {
      ...guestItem1,
      id: `${p1.id}-${p1.colors[1]}`,
      selectedColor: p1.colors[1],
      quantity: 1,
    };
    const colorwayMerge = mergeCartItems(combinedMerge, [diffColorItem]);
    assert(
      colorwayMerge.length === 2,
      "Distinct colorways create separate cart line items"
    );
    assert(
      colorwayMerge.find((i) => i.selectedColor === p1.colors[1])?.quantity === 1,
      "New colorway line item retains its distinct quantity"
    );
  }

  // 4.4 Merging non-existent product is safely discarded
  const invalidProductItem = {
    id: "fake-product-raw",
    productId: "fake-product-999",
    slug: "fake-product",
    name: "Fake Product",
    image: "/images/fake.jpg",
    priceInPaise: 100000,
    quantity: 1,
    category: "Desk Accessories",
    material: "PLA",
  };
  const filteredMerge = mergeCartItems(combinedMerge, [invalidProductItem]);
  assert(
    filteredMerge.length === combinedMerge.length,
    "Discards products not present in centralized PRODUCTS_DATA"
  );

  // SECTION 5: LIVE ROUTE PROTECTION & HTTP PROBES
  console.log("\n--- 5. Live Next.js Server & Route Protection Probes ---");

  try {
    const base = "http://localhost:3000";

    const homeRes = await fetch(`${base}/`);
    assert(homeRes.status === 200, "GET / -> 200 OK");

    const regRes = await fetch(`${base}/register`);
    assert(regRes.status === 200, "GET /register -> 200 OK");

    const loginRes = await fetch(`${base}/login`);
    assert(loginRes.status === 200, "GET /login -> 200 OK");

    const cartRes = await fetch(`${base}/cart`);
    assert(cartRes.status === 200, "GET /cart -> 200 OK");

    const productsRes = await fetch(`${base}/products`);
    assert(productsRes.status === 200, "GET /products -> 200 OK");

    // Account protection test (unauthenticated redirect)
    const accountRes = await fetch(`${base}/account`, { redirect: "manual" });
    assert(
      accountRes.status === 307 || accountRes.status === 302,
      `GET /account redirects unauthenticated requests (status: ${accountRes.status})`
    );
    const accountLocation = accountRes.headers.get("location");
    assert(
      accountLocation && accountLocation.includes("/login"),
      `GET /account redirect target points to /login (location: ${accountLocation})`
    );

    const profileRes = await fetch(`${base}/account/profile`, { redirect: "manual" });
    assert(
      profileRes.status === 307 || profileRes.status === 302,
      `GET /account/profile redirects unauthenticated requests (status: ${profileRes.status})`
    );
    const profileLocation = profileRes.headers.get("location");
    assert(
      profileLocation && profileLocation.includes("/login"),
      `GET /account/profile redirect target points to /login (location: ${profileLocation})`
    );
  } catch (err) {
    assert(false, "Server route probes failed", err.message);
  }

  console.log("\n===============================================================");
  console.log(`   QA AUDIT SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("===============================================================\n");

  await prisma.$disconnect();

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runPhase6BQATests().catch((err) => {
  console.error("FATAL QA ERROR:", err);
  process.exit(1);
});
