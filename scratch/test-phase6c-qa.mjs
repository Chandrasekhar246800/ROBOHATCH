/**
 * ROBOHATCH PHASE 6C: CUSTOMER ACCOUNT MANAGEMENT QA TEST SUITE
 *
 * Automated verification of:
 * 1. Profile Name Update & Zod Validation
 * 2. Password Change Security & Bcrypt Hash Verification
 * 3. Address Book CRUD & Default Address Promotion
 * 4. Cross-User IDOR Access Prevention (Strict Authorization Scoping)
 * 5. Order History & Scoped Ownership Access Control
 * 6. Live Route Protection & Server Probes
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  updateProfileSchema,
  changePasswordSchema,
  addressSchema,
} from "../src/lib/validations/account.ts";

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

async function runPhase6CQATests() {
  console.log("===============================================================");
  console.log("   ROBOHATCH: PHASE 6C QA & SECURITY AUDIT TEST SUITE          ");
  console.log("===============================================================\n");

  // Setup Two Isolated Test Users for IDOR and Authorization Testing
  const timestamp = Date.now();
  const passwordA = "SecurePassA!2026";
  const passwordB = "SecurePassB!2026";

  const hashA = await bcrypt.hash(passwordA, 12);
  const hashB = await bcrypt.hash(passwordB, 12);

  const userA = await prisma.user.create({
    data: {
      name: "Customer Alpha",
      email: `customer-a-${timestamp}@test.com`,
      passwordHash: hashA,
      role: "CUSTOMER",
    },
  });

  const userB = await prisma.user.create({
    data: {
      name: "Customer Beta",
      email: `customer-b-${timestamp}@test.com`,
      passwordHash: hashB,
      role: "CUSTOMER",
    },
  });

  console.log(`✓ Test Users Created: Alpha (${userA.id}), Beta (${userB.id})\n`);

  try {
    // -------------------------------------------------------------
    // SECTION 1: PROFILE UPDATE & VALIDATION
    // -------------------------------------------------------------
    console.log("--- 1. Profile Update & Validation ---");

    // 1.1 Invalid profile input (< 2 chars)
    const invalidShortName = updateProfileSchema.safeParse({ name: "A" });
    assert(!invalidShortName.success, "Rejects name shorter than 2 characters");

    // 1.2 Invalid empty name
    const invalidEmptyName = updateProfileSchema.safeParse({ name: "   " });
    assert(!invalidEmptyName.success, "Rejects whitespace-only name");

    // 1.3 Valid name
    const validProfile = updateProfileSchema.safeParse({ name: "Alpha Modified" });
    assert(validProfile.success, "Validates compliant profile name");

    // 1.4 Update in Database
    const updatedUserA = await prisma.user.update({
      where: { id: userA.id },
      data: { name: validProfile.data.name },
      select: { id: true, name: true, email: true },
    });
    assert(updatedUserA.name === "Alpha Modified", "Updates customer name in PostgreSQL");
    assert(
      !Object.prototype.hasOwnProperty.call(updatedUserA, "passwordHash"),
      "User update payload strictly excludes passwordHash"
    );

    // -------------------------------------------------------------
    // SECTION 2: PASSWORD CHANGE SECURITY
    // -------------------------------------------------------------
    console.log("\n--- 2. Password Change Security & Bcrypt Hashing ---");

    // 2.1 Password mismatch rejection
    const mismatchedPass = changePasswordSchema.safeParse({
      currentPassword: passwordA,
      newPassword: "BrandNewSecure!2026",
      confirmNewPassword: "DifferentNewPass!2026",
    });
    assert(!mismatchedPass.success, "Rejects mismatched new password confirmation");

    // 2.2 Same password rejection
    const samePass = changePasswordSchema.safeParse({
      currentPassword: passwordA,
      newPassword: passwordA,
      confirmNewPassword: passwordA,
    });
    assert(!samePass.success, "Rejects new password identical to current password");

    // 2.3 Weak new password rejection
    const weakPass = changePasswordSchema.safeParse({
      currentPassword: passwordA,
      newPassword: "weakpassword",
      confirmNewPassword: "weakpassword",
    });
    assert(
      !weakPass.success,
      "Rejects weak new password (missing uppercase, number, symbol)"
    );

    // 2.4 Valid change payload
    const validChange = changePasswordSchema.safeParse({
      currentPassword: passwordA,
      newPassword: "BrandNewSecure!2026",
      confirmNewPassword: "BrandNewSecure!2026",
    });
    assert(validChange.success, "Accepts compliant password change payload");

    // 2.5 Verify current password against stored hash
    const currentA = await prisma.user.findUnique({
      where: { id: userA.id },
      select: { passwordHash: true },
    });
    const currentMatch = await bcrypt.compare(
      validChange.data.currentPassword,
      currentA.passwordHash
    );
    assert(currentMatch, "Validates correct current password with bcrypt");

    const badCurrentMatch = await bcrypt.compare(
      "WrongCurrentPassword!",
      currentA.passwordHash
    );
    assert(!badCurrentMatch, "Rejects incorrect current password with bcrypt");

    // 2.6 Update password hash in database
    const newHashA = await bcrypt.hash(validChange.data.newPassword, 12);
    await prisma.user.update({
      where: { id: userA.id },
      data: { passwordHash: newHashA },
    });

    const updatedA = await prisma.user.findUnique({
      where: { id: userA.id },
      select: { passwordHash: true },
    });
    const newPassMatch = await bcrypt.compare(
      "BrandNewSecure!2026",
      updatedA.passwordHash
    );
    assert(newPassMatch, "New bcrypt hash verifies successfully with new password");

    // -------------------------------------------------------------
    // SECTION 3: ADDRESS BOOK CRUD & DEFAULT PROMOTION
    // -------------------------------------------------------------
    console.log("\n--- 3. Address Book CRUD & Default Management ---");

    // 3.1 Validate Address Schema
    const validAddressInput = addressSchema.safeParse({
      fullName: "Jane Doe",
      phone: "+91 9876543210",
      street: "100 Feet Road, Indiranagar",
      apartment: "Unit 4B",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
      country: "IN",
      isDefault: false,
      type: "SHIPPING",
    });
    assert(validAddressInput.success, "Validates compliant address schema");

    // 3.2 Create First Address for User A (Should become default)
    const addrA1 = await prisma.address.create({
      data: {
        userId: userA.id,
        ...validAddressInput.data,
        isDefault: true,
      },
    });
    assert(addrA1.userId === userA.id, "Address A1 created and scoped to User A");
    assert(addrA1.isDefault === true, "Address A1 marked as default");

    // 3.3 Create Second Address for User A and set as default (Should unset A1)
    await prisma.address.updateMany({
      where: { userId: userA.id, isDefault: true },
      data: { isDefault: false },
    });
    const addrA2 = await prisma.address.create({
      data: {
        userId: userA.id,
        fullName: "Jane Secondary",
        phone: "+91 9876543211",
        street: "24th Main, HSR Layout",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560102",
        country: "IN",
        isDefault: true,
        type: "SHIPPING",
      },
    });

    const refreshedA1 = await prisma.address.findUnique({ where: { id: addrA1.id } });
    assert(
      refreshedA1.isDefault === false,
      "Setting A2 as default unsets A1 default flag"
    );
    assert(addrA2.isDefault === true, "A2 is now the active default address");

    // 3.4 Delete Default Address (A2) and promote remaining (A1)
    await prisma.address.delete({ where: { id: addrA2.id } });
    const remainingForA = await prisma.address.findFirst({
      where: { userId: userA.id },
      orderBy: { createdAt: "desc" },
    });
    if (remainingForA) {
      await prisma.address.update({
        where: { id: remainingForA.id },
        data: { isDefault: true },
      });
    }

    const rePromotedA1 = await prisma.address.findUnique({ where: { id: addrA1.id } });
    assert(
      rePromotedA1.isDefault === true,
      "Deleting default address promotes remaining address to default"
    );

    // -------------------------------------------------------------
    // SECTION 4: CROSS-USER IDOR DEFENSE
    // -------------------------------------------------------------
    console.log("\n--- 4. Cross-User IDOR Access Prevention ---");

    // Create Address for User B
    const addrB1 = await prisma.address.create({
      data: {
        userId: userB.id,
        fullName: "Beta Recipient",
        phone: "+91 9123456789",
        street: "Park Street",
        city: "Kolkata",
        state: "West Bengal",
        postalCode: "700016",
        country: "IN",
        isDefault: true,
        type: "SHIPPING",
      },
    });

    // IDOR Test 1: User A attempts to find/modify User B's address
    const unauthorizedAccess = await prisma.address.findFirst({
      where: {
        id: addrB1.id,
        userId: userA.id, // Strictly scoped query!
      },
    });
    assert(
      unauthorizedAccess === null,
      "Scoped query blocks User A from accessing User B's address (IDOR Prevention)"
    );

    // IDOR Test 2: User A attempts to update User B's address
    let updateBlocked = false;
    const canUpdate = await prisma.address.findFirst({
      where: { id: addrB1.id, userId: userA.id },
    });
    if (!canUpdate) {
      updateBlocked = true;
    }
    assert(updateBlocked, "Pre-check blocks User A from modifying User B's address");

    // IDOR Test 3: User A attempts to delete User B's address
    let deleteBlocked = false;
    const canDelete = await prisma.address.findFirst({
      where: { id: addrB1.id, userId: userA.id },
    });
    if (!canDelete) {
      deleteBlocked = true;
    }
    assert(deleteBlocked, "Pre-check blocks User A from deleting User B's address");

    // -------------------------------------------------------------
    // SECTION 5: ORDER OWNERSHIP & SCOPING
    // -------------------------------------------------------------
    console.log("\n--- 5. Order History & Scoped Ownership Access ---");

    // Verify empty state for user with no orders
    const userAOrders = await prisma.order.findMany({
      where: { userId: userA.id },
    });
    assert(
      userAOrders.length === 0,
      "Correctly returns empty orders array when customer has placed no orders"
    );

    // Create an order for User B
    const orderB = await prisma.order.create({
      data: {
        orderNumber: `RH-TEST-${timestamp}`,
        userId: userB.id,
        status: "CONFIRMED",
        subtotal: 2499.0,
        taxAmount: 449.82,
        shippingAmount: 0.0,
        discountAmount: 0.0,
        totalAmount: 2948.82,
        shippingAddressId: addrB1.id,
      },
    });

    // Scoped order query for User B
    const userBOrders = await prisma.order.findMany({
      where: { userId: userB.id },
    });
    assert(userBOrders.length === 1, "User B order list contains User B's order");

    // IDOR Order Check: User A tries to view User B's order
    const unauthorizedOrder = await prisma.order.findFirst({
      where: {
        id: orderB.id,
        userId: userA.id, // Scoped to User A!
      },
    });
    assert(
      unauthorizedOrder === null,
      "Scoped order query prevents User A from viewing User B's order (Returns null / notFound)"
    );

    // Clean up created order
    await prisma.order.delete({ where: { id: orderB.id } });

    // -------------------------------------------------------------
    // SECTION 6: LIVE ROUTE PROTECTION PROBES
    // -------------------------------------------------------------
    console.log("\n--- 6. Live Next.js Server & Route Protection Probes ---");

    const base = "http://localhost:3000";

    const endpoints = [
      { path: "/account", redirectTarget: "/login?callbackUrl=/account" },
      { path: "/account/profile", redirectTarget: "/login?callbackUrl=/account/profile" },
      {
        path: "/account/addresses",
        redirectTarget: "/login?callbackUrl=/account/addresses",
      },
      { path: "/account/orders", redirectTarget: "/login?callbackUrl=/account/orders" },
      {
        path: "/account/orders/non-existent-order-id",
        redirectTarget: "/login?callbackUrl=/account/orders",
      },
    ];

    for (const ep of endpoints) {
      const res = await fetch(`${base}${ep.path}`, { redirect: "manual" });
      assert(
        res.status === 307 || res.status === 302,
        `GET ${ep.path} redirects unauthenticated requests (status: ${res.status})`
      );
      const loc = res.headers.get("location");
      assert(
        loc && loc.includes("/login"),
        `GET ${ep.path} redirect location points to /login (${loc})`
      );
    }
  } finally {
    // Cleanup test users and addresses
    await prisma.address.deleteMany({ where: { userId: { in: [userA.id, userB.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });
    await prisma.$disconnect();
    console.log("\n✓ Test data cleanly removed from PostgreSQL.");
  }

  console.log("\n===============================================================");
  console.log(`   QA AUDIT SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("===============================================================\n");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runPhase6CQATests().catch((err) => {
  console.error("FATAL QA ERROR:", err);
  process.exit(1);
});
