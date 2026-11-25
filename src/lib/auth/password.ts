import bcrypt from "bcryptjs";

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Generates a secure bcrypt hash for a plaintext password.
 * Uses a work factor (salt rounds) of 12, balancing strong brute-force
 * resistance with acceptable server processing latency.
 *
 * @param password The plaintext password to hash.
 * @returns A promise resolving to the bcrypt hash string.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a valid non-empty string");
  }
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Securely compares a candidate plaintext password against an existing bcrypt hash.
 * Constant-time comparison defends against timing attacks.
 *
 * @param password The plaintext candidate password.
 * @param hash The stored bcrypt hash to compare against.
 * @returns A promise resolving to true if matching, false otherwise.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) {
    return false;
  }
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}
