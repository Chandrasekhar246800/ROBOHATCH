import fs from "node:fs";
import {
  passwordSchema,
  registerSchema,
  loginSchema,
} from "../src/lib/validations/auth.ts";
import { hashPassword, verifyPassword } from "../src/lib/auth/password.ts";

async function runAuthTests() {
  console.log("====================================================");
  console.log("   ROBOHATCH PHASE 6A: AUTH FOUNDATION TEST SUITE   ");
  console.log("====================================================\n");

  let total = 0;
  let passed = 0;
  let failed = 0;

  function assert(category, testName, condition, details = "") {
    total++;
    if (condition) {
      passed++;
      console.log(`[PASS] [${category}] ${testName}${details ? ` -> ${details}` : ""}`);
    } else {
      failed++;
      console.error(
        `[FAIL] [${category}] ${testName}${details ? ` -> ERROR: ${details}` : ""}`
      );
    }
  }

  // ----------------------------------------------------
  // 1. PASSWORD POLICY VALIDATION
  // ----------------------------------------------------
  console.log("--- 1. PASSWORD POLICY VALIDATION ---");

  assert(
    "PasswordPolicy",
    "Rejects passwords shorter than 8 characters",
    passwordSchema.safeParse("Ab1!").success === false
  );

  assert(
    "PasswordPolicy",
    "Rejects passwords without uppercase letter",
    passwordSchema.safeParse("lowercase1!pass").success === false
  );

  assert(
    "PasswordPolicy",
    "Rejects passwords without lowercase letter",
    passwordSchema.safeParse("UPPERCASE1!PASS").success === false
  );

  assert(
    "PasswordPolicy",
    "Rejects passwords without numeric digit",
    passwordSchema.safeParse("NoDigitsHere!").success === false
  );

  assert(
    "PasswordPolicy",
    "Rejects passwords without special character",
    passwordSchema.safeParse("NoSpecialChar123").success === false
  );

  assert(
    "PasswordPolicy",
    "Accepts compliant high-entropy password",
    passwordSchema.safeParse("RoboHatch!2026").success === true
  );

  // ----------------------------------------------------
  // 2. REGISTRATION SCHEMA VALIDATION
  // ----------------------------------------------------
  console.log("\n--- 2. REGISTRATION SCHEMA VALIDATION ---");

  const validReg = registerSchema.safeParse({
    name: "  Alex Mercer  ",
    email: "  ALEX.MERCER@EXAMPLE.COM  ",
    password: "RoboHatch!2026",
    confirmPassword: "RoboHatch!2026",
  });

  assert(
    "RegisterSchema",
    "Normalizes name (trimmed) and email (trimmed and lowercased)",
    validReg.success === true &&
      validReg.data.name === "Alex Mercer" &&
      validReg.data.email === "alex.mercer@example.com"
  );

  const mismatchReg = registerSchema.safeParse({
    name: "Alex Mercer",
    email: "alex@example.com",
    password: "RoboHatch!2026",
    confirmPassword: "DifferentPassword!2026",
  });

  assert(
    "RegisterSchema",
    "Rejects mismatched password and confirmPassword",
    mismatchReg.success === false &&
      mismatchReg.error.issues[0]?.message === "Passwords do not match"
  );

  const invalidEmailReg = registerSchema.safeParse({
    name: "Alex",
    email: "not-an-email",
    password: "RoboHatch!2026",
    confirmPassword: "RoboHatch!2026",
  });

  assert(
    "RegisterSchema",
    "Rejects malformed email string",
    invalidEmailReg.success === false
  );

  // ----------------------------------------------------
  // 3. LOGIN SCHEMA VALIDATION
  // ----------------------------------------------------
  console.log("\n--- 3. LOGIN SCHEMA VALIDATION ---");

  const validLogin = loginSchema.safeParse({
    email: "  USER@ROBOHATCH.COM ",
    password: "MySecretPassword!1",
  });

  assert(
    "LoginSchema",
    "Normalizes email to trimmed lowercase",
    validLogin.success === true && validLogin.data.email === "user@robohatch.com"
  );

  const emptyPassLogin = loginSchema.safeParse({
    email: "user@robohatch.com",
    password: "",
  });

  assert(
    "LoginSchema",
    "Rejects empty password on login attempt",
    emptyPassLogin.success === false
  );

  // ----------------------------------------------------
  // 4. BCRYPT PASSWORD HASHING & VERIFICATION
  // ----------------------------------------------------
  console.log("\n--- 4. BCRYPT HASHING & VERIFICATION ---");

  const plainSecret = "RoboHatch!IndustrialDesign2026";
  const hash1 = await hashPassword(plainSecret);
  const hash2 = await hashPassword(plainSecret);

  assert(
    "Bcrypt",
    "Generated hash conforms to standard bcrypt format ($2a$ or $2b$)",
    hash1.startsWith("$2a$") || hash1.startsWith("$2b$")
  );

  assert(
    "Bcrypt",
    "Separate hashes of same plaintext produce unique salt outputs",
    hash1 !== hash2
  );

  const correctMatch = await verifyPassword(plainSecret, hash1);
  assert(
    "Bcrypt",
    "verifyPassword returns true for matching password and hash",
    correctMatch === true
  );

  const wrongMatch = await verifyPassword("WrongPassword!123", hash1);
  assert(
    "Bcrypt",
    "verifyPassword returns false for non-matching password",
    wrongMatch === false
  );

  const emptyInputMatch = await verifyPassword("", hash1);
  assert(
    "Bcrypt",
    "verifyPassword safely returns false for empty password without throwing",
    emptyInputMatch === false
  );

  // ----------------------------------------------------
  // 5. REGISTRATION DEFENSIVE GUARDS & SOURCE CODE AUDIT
  // ----------------------------------------------------
  console.log("\n--- 5. REGISTRATION DEFENSIVE GUARDS ---");

  const invalidInput = {
    name: "A",
    email: "invalid-email",
    password: "short",
    confirmPassword: "short",
  };
  const valResult = registerSchema.safeParse(invalidInput);

  assert(
    "RegisterValidation",
    "registerSchema rejects malformed inputs with descriptive errors",
    valResult.success === false && valResult.error.issues.length >= 3
  );

  const registerCode = fs.readFileSync("src/lib/auth/register.ts", "utf8");
  assert(
    "RegisterSecurity",
    "registerCustomer never selects or returns passwordHash",
    registerCode.includes("select:") &&
      !registerCode.includes("passwordHash: true") &&
      registerCode.includes("role: true")
  );

  assert(
    "RegisterSecurity",
    "registerCustomer normalizes email and performs duplicate email lookup",
    registerCode.includes("toLowerCase()") &&
      registerCode.includes("findUnique") &&
      registerCode.includes("An account with this email address already exists")
  );

  console.log("\n====================================================");
  console.log(`TOTAL TESTS: ${total}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log("====================================================");

  process.exit(failed > 0 ? 1 : 0);
}

runAuthTests().catch((err) => {
  console.error("Test runner threw unexpected exception:", err);
  process.exit(1);
});
