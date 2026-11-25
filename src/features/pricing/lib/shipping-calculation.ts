/**
 * ROBOHATCH PHASE 7C: CONFIGURABLE SHIPPING CALCULATION ARCHITECTURE
 *
 * Business Constraints:
 * 1. Shipping charges are NOT yet commercially finalized.
 * 2. Do NOT invent shipping prices, free-shipping thresholds, or PIN coverage.
 * 3. Clearly distinguish configured shipping from unconfigured shipping.
 * 4. If shipping is unconfigured, return an incomplete state that prevents
 *    the final checkout pricing from being marked as payable.
 * 5. Modular architecture supporting future flat-rate, PIN-code, weight, and zone rules.
 */

import type { ShippingDetails } from "../types/pricing-types";

export interface ShippingItemParam {
  productId: string;
  quantity: number;
  weightGrams?: number;
}

export interface ShippingDeliveryAddressParam {
  postalCode?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface ShippingCalculationParams {
  items: ShippingItemParam[];
  subtotalInPaise: number;
  deliveryAddress?: ShippingDeliveryAddressParam | null;
}

export interface ShippingCalculator {
  calculateShipping(
    params: ShippingCalculationParams
  ): Promise<ShippingDetails> | ShippingDetails;
}

/**
 * PRODUCTION DEFAULT STRATEGY (PHASE 7C)
 *
 * Explicitly marks shipping as UNCONFIGURED because commercial terms
 * have not been finalized. Never invents a fee or fabricated delivery date.
 */
export class DefaultUnconfiguredShippingCalculator implements ShippingCalculator {
  calculateShipping(_params: ShippingCalculationParams): ShippingDetails {
    return {
      status: "UNCONFIGURED",
      isConfigured: false,
      amountInPaise: null,
      message: "Shipping charges are pending commercial finalization.",
    };
  }
}

/**
 * CONFIGURABLE FLAT-RATE SHIPPING STRATEGY
 *
 * For use when shipping terms are finalized or during controlled integration testing.
 * Supports configurable flat rate and optional free-shipping threshold.
 */
export interface FlatRateShippingConfig {
  flatRateInPaise: number;
  freeShippingThresholdInPaise?: number | null;
  methodName?: string;
  estimatedDays?: string;
}

export class ConfigurableFlatRateShippingCalculator implements ShippingCalculator {
  constructor(private config: FlatRateShippingConfig) {}

  calculateShipping(params: ShippingCalculationParams): ShippingDetails {
    const { flatRateInPaise, freeShippingThresholdInPaise, methodName, estimatedDays } =
      this.config;

    // Reject invalid or negative configuration
    if (
      typeof flatRateInPaise !== "number" ||
      isNaN(flatRateInPaise) ||
      flatRateInPaise < 0
    ) {
      return {
        status: "CONFIGURATION_ERROR",
        isConfigured: false,
        amountInPaise: null,
        message:
          "Invalid shipping configuration: flatRateInPaise must be a non-negative number.",
      };
    }

    // Check optional free-shipping threshold
    if (
      typeof freeShippingThresholdInPaise === "number" &&
      freeShippingThresholdInPaise > 0 &&
      params.subtotalInPaise >= freeShippingThresholdInPaise
    ) {
      return {
        status: "CONFIGURED",
        isConfigured: true,
        amountInPaise: 0,
        methodName: methodName || "Standard Ground Shipping (Free Promotion)",
        estimatedDays,
        message: "Complimentary shipping applied based on order value.",
      };
    }

    return {
      status: "CONFIGURED",
      isConfigured: true,
      amountInPaise: Math.round(flatRateInPaise),
      methodName: methodName || "Standard Ground Shipping",
      estimatedDays,
      message: `Standard shipping calculated at ₹${(flatRateInPaise / 100).toFixed(2)}.`,
    };
  }
}

/**
 * PIN-CODE-BASED SHIPPING STRATEGY (FUTURE-READY)
 *
 * Maps customer delivery destination PIN code to validated regional zones.
 */
export interface PinCodeZoneRule {
  allowedPostalPrefixes: string[];
  rateInPaise: number;
  methodName?: string;
  estimatedDays?: string;
}

export class RuleBasedPinCodeShippingCalculator implements ShippingCalculator {
  constructor(private rules: PinCodeZoneRule[]) {}

  calculateShipping(params: ShippingCalculationParams): ShippingDetails {
    const postalCode = params.deliveryAddress?.postalCode?.trim();

    if (!postalCode) {
      return {
        status: "UNCONFIGURED",
        isConfigured: false,
        amountInPaise: null,
        message: "Delivery postal code is required to compute location-based shipping.",
      };
    }

    const matchedRule = this.rules.find((rule) =>
      rule.allowedPostalPrefixes.some((prefix) => postalCode.startsWith(prefix))
    );

    if (!matchedRule) {
      return {
        status: "RESTRICTED",
        isConfigured: false,
        amountInPaise: null,
        message: `Delivery is currently not available for postal code ${postalCode}.`,
      };
    }

    return {
      status: "CONFIGURED",
      isConfigured: true,
      amountInPaise: Math.round(matchedRule.rateInPaise),
      methodName: matchedRule.methodName || "Regional Carrier Shipping",
      estimatedDays: matchedRule.estimatedDays,
      message: "Shipping rate determined by destination zone.",
    };
  }
}

/**
 * Singleton factory returning the active shipping calculator.
 */
let activeCalculator: ShippingCalculator = new DefaultUnconfiguredShippingCalculator();

export function getActiveShippingCalculator(): ShippingCalculator {
  return activeCalculator;
}

export function setActiveShippingCalculator(calculator: ShippingCalculator): void {
  activeCalculator = calculator;
}

export function resetActiveShippingCalculator(): void {
  activeCalculator = new DefaultUnconfiguredShippingCalculator();
}
