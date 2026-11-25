/**
 * ROBOHATCH PHASE 7D: RAZORPAY CONFIGURATION (TEST MODE ONLY)
 *
 * Security and Compliance Mandates:
 * 1. STRICT TEST MODE: Key ID must begin with "rzp_test_". Live keys ("rzp_live_") are rejected.
 * 2. Fail safely when credentials are missing; never expose secrets to client code.
 * 3. Never commit actual API keys or webhook secrets.
 */

import Razorpay from "razorpay";

export class RazorpayConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RazorpayConfigurationError";
  }
}

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
  isConfigured: boolean;
  isTestMode: boolean;
}

/**
 * Returns the verified Razorpay server configuration.
 * Strictly enforces Test Mode and guards against missing/live credentials.
 */
export function getRazorpayConfig(): RazorpayConfig {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim() || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || "";
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || undefined;

  // Strict check: No credentials
  if (!keyId || !keySecret) {
    return {
      keyId: "",
      keySecret: "",
      webhookSecret,
      isConfigured: false,
      isTestMode: false,
    };
  }

  // Strict check: Block live credentials in Phase 7D
  if (keyId.startsWith("rzp_live_")) {
    throw new RazorpayConfigurationError(
      "RoboHatch Phase 7D is restricted to Razorpay Test Mode only. Live API keys ('rzp_live_...') are strictly forbidden."
    );
  }

  // Key must be in test format
  const isTestMode = keyId.startsWith("rzp_test_");
  if (!isTestMode) {
    return {
      keyId,
      keySecret: "",
      webhookSecret,
      isConfigured: false,
      isTestMode: false,
    };
  }

  return {
    keyId,
    keySecret,
    webhookSecret,
    isConfigured: true,
    isTestMode: true,
  };
}

/**
 * Returns an authenticated Razorpay Node SDK client instance.
 * Throws RazorpayConfigurationError if configuration is missing, invalid, or in live mode.
 */
export function getRazorpayClient(configOverride?: RazorpayConfig): Razorpay {
  const config = configOverride || getSellerConfigSafe();

  if (!config.isConfigured || !config.isTestMode) {
    throw new RazorpayConfigurationError(
      "Razorpay test mode is not configured. Valid RAZORPAY_KEY_ID ('rzp_test_...') and RAZORPAY_KEY_SECRET are required."
    );
  }

  return new Razorpay({
    key_id: config.keyId,
    key_secret: config.keySecret,
  });
}

function getSellerConfigSafe(): RazorpayConfig {
  try {
    return getRazorpayConfig();
  } catch (err) {
    throw err;
  }
}
