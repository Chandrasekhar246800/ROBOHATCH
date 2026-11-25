/**
 * ROBOHATCH PHASE 7C: SERVER-AUTHORITATIVE SELLER ORIGIN CONFIGURATION
 *
 * Mandate:
 * 1. Move seller origin state strictly into server configuration.
 * 2. Never allow client-controlled origin overrides.
 * 3. Validate destination state against official Indian States & Union Territories.
 * 4. If seller origin configuration is missing or invalid, fail safely without inventing a state.
 */

export interface IndianStateInfo {
  code: string;
  name: string;
  type: "STATE" | "UNION_TERRITORY";
}

/**
 * Canonical registry of 28 Indian States and 8 Union Territories.
 * Standardizes ISO 3166-2:IN codes and state names for precise GST jurisdiction matching.
 */
export const INDIAN_STATES_AND_UTS: Record<string, IndianStateInfo> = {
  // 28 States
  AP: { code: "AP", name: "Andhra Pradesh", type: "STATE" },
  AR: { code: "AR", name: "Arunachal Pradesh", type: "STATE" },
  AS: { code: "AS", name: "Assam", type: "STATE" },
  BR: { code: "BR", name: "Bihar", type: "STATE" },
  CG: { code: "CG", name: "Chhattisgarh", type: "STATE" },
  GA: { code: "GA", name: "Goa", type: "STATE" },
  GJ: { code: "GJ", name: "Gujarat", type: "STATE" },
  HR: { code: "HR", name: "Haryana", type: "STATE" },
  HP: { code: "HP", name: "Himachal Pradesh", type: "STATE" },
  JH: { code: "JH", name: "Jharkhand", type: "STATE" },
  KA: { code: "KA", name: "Karnataka", type: "STATE" },
  KL: { code: "KL", name: "Kerala", type: "STATE" },
  MP: { code: "MP", name: "Madhya Pradesh", type: "STATE" },
  MH: { code: "MH", name: "Maharashtra", type: "STATE" },
  MN: { code: "MN", name: "Manipur", type: "STATE" },
  ML: { code: "ML", name: "Meghalaya", type: "STATE" },
  MZ: { code: "MZ", name: "Mizoram", type: "STATE" },
  NL: { code: "NL", name: "Nagaland", type: "STATE" },
  OD: { code: "OD", name: "Odisha", type: "STATE" },
  PB: { code: "PB", name: "Punjab", type: "STATE" },
  RJ: { code: "RJ", name: "Rajasthan", type: "STATE" },
  SK: { code: "SK", name: "Sikkim", type: "STATE" },
  TN: { code: "TN", name: "Tamil Nadu", type: "STATE" },
  TS: { code: "TS", name: "Telangana", type: "STATE" },
  TR: { code: "TR", name: "Tripura", type: "STATE" },
  UP: { code: "UP", name: "Uttar Pradesh", type: "STATE" },
  UK: { code: "UK", name: "Uttarakhand", type: "STATE" },
  WB: { code: "WB", name: "West Bengal", type: "STATE" },

  // 8 Union Territories
  AN: { code: "AN", name: "Andaman and Nicobar Islands", type: "UNION_TERRITORY" },
  CH: { code: "CH", name: "Chandigarh", type: "UNION_TERRITORY" },
  DH: {
    code: "DH",
    name: "Dadra and Nagar Haveli and Daman and Diu",
    type: "UNION_TERRITORY",
  },
  DL: { code: "DL", name: "Delhi", type: "UNION_TERRITORY" },
  JK: { code: "JK", name: "Jammu and Kashmir", type: "UNION_TERRITORY" },
  LA: { code: "LA", name: "Ladakh", type: "UNION_TERRITORY" },
  LD: { code: "LD", name: "Lakshadweep", type: "UNION_TERRITORY" },
  PY: { code: "PY", name: "Puducherry", type: "UNION_TERRITORY" },
};

// Case-insensitive lookup map for state names & alternate spellings
const NORMALIZED_LOOKUP: Map<string, IndianStateInfo> = new Map();

for (const [code, info] of Object.entries(INDIAN_STATES_AND_UTS)) {
  NORMALIZED_LOOKUP.set(code.toLowerCase(), info);
  NORMALIZED_LOOKUP.set(info.name.toLowerCase(), info);
}

// Common aliases
NORMALIZED_LOOKUP.set("orissa", INDIAN_STATES_AND_UTS.OD);
NORMALIZED_LOOKUP.set("uttaranchal", INDIAN_STATES_AND_UTS.UK);
NORMALIZED_LOOKUP.set("nct of delhi", INDIAN_STATES_AND_UTS.DL);
NORMALIZED_LOOKUP.set("new delhi", INDIAN_STATES_AND_UTS.DL);

/**
 * Normalizes and validates an Indian state or union territory name or code.
 */
export function normalizeIndianState(
  input: string | null | undefined
): IndianStateInfo | null {
  if (!input || typeof input !== "string") return null;
  const cleaned = input.trim().toLowerCase();
  return NORMALIZED_LOOKUP.get(cleaned) || null;
}

export interface SellerOriginConfig {
  sellerStateCode: string;
  sellerStateName: string;
  country: string;
  isConfigured: boolean;
}

/**
 * Server-authoritative seller origin configuration.
 *
 * PRODUCTION POLICY:
 * In production (`NODE_ENV === "production"`), SELLER_ORIGIN_STATE MUST be explicitly
 * configured in the server environment as a recognized Indian State or Union Territory
 * (e.g., "Karnataka" or "KA").
 * If the variable is missing, empty, or invalid, the system strictly returns `isConfigured: false`,
 * which triggers `SELLER_ORIGIN_UNCONFIGURED` in the pricing service.
 * NO implicit fallback to Karnataka or any other state is permitted in production.
 *
 * DEVELOPMENT POLICY:
 * In non-production environments (`NODE_ENV !== "production"`), if SELLER_ORIGIN_STATE is unset,
 * a documented development fallback to "Karnataka" (KA) is provided for local DX convenience.
 * If SELLER_ORIGIN_STATE is explicitly set to an empty or invalid value in development,
 * it returns `isConfigured: false`.
 *
 * Client-controlled origin overrides are strictly prohibited across all environments.
 */
export function getSellerOriginConfig(): SellerOriginConfig {
  const isProduction = process.env.NODE_ENV === "production";
  const rawEnvState = process.env.SELLER_ORIGIN_STATE?.trim();

  // 1. Strict production enforcement: NO implicit fallback
  if (isProduction) {
    if (!rawEnvState) {
      return {
        sellerStateCode: "",
        sellerStateName: "",
        country: "IN",
        isConfigured: false,
      };
    }

    const normalized = normalizeIndianState(rawEnvState);
    if (!normalized) {
      return {
        sellerStateCode: "",
        sellerStateName: "",
        country: "IN",
        isConfigured: false,
      };
    }

    return {
      sellerStateCode: normalized.code,
      sellerStateName: normalized.name,
      country: "IN",
      isConfigured: true,
    };
  }

  // 2. Non-production environments (development / test)
  // If explicitly set, validate strictly. If unset (undefined), apply documented dev fallback.
  const envState = rawEnvState !== undefined ? rawEnvState : "Karnataka";

  if (!envState) {
    return {
      sellerStateCode: "",
      sellerStateName: "",
      country: "IN",
      isConfigured: false,
    };
  }

  const normalized = normalizeIndianState(envState);
  if (!normalized) {
    return {
      sellerStateCode: "",
      sellerStateName: "",
      country: "IN",
      isConfigured: false,
    };
  }

  return {
    sellerStateCode: normalized.code,
    sellerStateName: normalized.name,
    country: "IN",
    isConfigured: true,
  };
}
