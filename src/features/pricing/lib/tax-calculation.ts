/**
 * ROBOHATCH PHASE 7C: GST-INCLUSIVE TAX EXTRACTION ENGINE
 *
 * Mathematical Foundation:
 * Product prices displayed across RoboHatch already include applicable GST.
 * GST is NEVER added on top of the displayed price.
 *
 * For a GST-inclusive amount P (in integer paise) with GST rate R (%):
 * Taxable value = Round( (P * 100) / (100 + R) )
 * GST amount    = P - Taxable value
 *
 * Implementation Guarantees:
 * 1. BigInt integer arithmetic: completely avoids IEEE-754 floating-point drift.
 * 2. Half-Up integer paise rounding: standard commercial banking convention.
 * 3. Identity conservation: Taxable value + GST amount === Inclusive amount.
 * 4. Zero invented tax rates: unconfigured rates throw an explicit error.
 */

import type { TaxCalculationParams, TaxCalculationResult } from "../types/pricing-types";

export class UnconfiguredTaxRateError extends Error {
  constructor(
    message = "GST rate is not configured. Final tax calculation cannot proceed."
  ) {
    super(message);
    this.name = "UnconfiguredTaxRateError";
  }
}

export class InvalidTaxRateError extends Error {
  constructor(
    message = "Invalid GST rate. Rate must be a valid number between 0 and 100."
  ) {
    super(message);
    this.name = "InvalidTaxRateError";
  }
}

export class InvalidMonetaryValueError extends Error {
  constructor(message = "Monetary amount cannot be negative or invalid.") {
    super(message);
    this.name = "InvalidMonetaryValueError";
  }
}

/**
 * Extracts the taxable component and GST amount from a GST-inclusive amount.
 *
 * @param params Tax calculation input parameters
 * @returns Precise tax breakdown in integer paise
 * @throws {UnconfiguredTaxRateError} If tax rate is null, undefined, or missing
 * @throws {InvalidTaxRateError} If tax rate is not a number between 0 and 100
 * @throws {InvalidMonetaryValueError} If amount is negative or invalid
 */
export function extractGstFromInclusivePaise(
  params: TaxCalculationParams
): TaxCalculationResult {
  const {
    inclusiveAmountInPaise,
    taxRatePercent,
    isInterState = false,
    hsnCode,
    taxCategory,
  } = params;

  // 1. Strict validation of configured tax rate (NEVER assume or invent a rate)
  if (
    taxRatePercent === null ||
    taxRatePercent === undefined ||
    isNaN(Number(taxRatePercent))
  ) {
    throw new UnconfiguredTaxRateError(
      "GST rate is not configured. Final tax calculation cannot proceed with an invented value."
    );
  }

  const rateNum = Number(taxRatePercent);
  if (rateNum < 0 || rateNum > 100) {
    throw new InvalidTaxRateError(
      `Invalid GST rate: ${taxRatePercent}%. Must be between 0% and 100%.`
    );
  }

  // 2. Validate monetary amount (integer paise)
  const numericAmount = Number(inclusiveAmountInPaise);
  if (isNaN(numericAmount) || numericAmount < 0) {
    throw new InvalidMonetaryValueError(
      "Inclusive amount in paise must be a non-negative number."
    );
  }

  const P = BigInt(Math.round(numericAmount));

  // 3. Zero-rate / tax-exempt handling
  if (rateNum === 0 || P === 0n) {
    return {
      inclusiveAmountInPaise: Number(P),
      taxableAmountInPaise: Number(P),
      taxAmountInPaise: 0,
      taxRatePercent: 0,
      taxRateBps: 0,
      cgstPaise: 0,
      sgstPaise: 0,
      igstPaise: 0,
      isInterState: Boolean(isInterState),
      hsnCode,
      taxCategory,
    };
  }

  // 4. Rate in basis points (18.00% -> 1800 bps) for 2-decimal precision
  const rateBps = BigInt(Math.round(rateNum * 100));

  // 5. Exact Half-Up integer paise rounding in BigInt:
  // Taxable = (P * 10000 + Denominator / 2) / Denominator
  // Where Denominator = 10000 + rateBps
  const numerator = P * 10000n;
  const denominator = 10000n + rateBps;
  const taxablePaise = (numerator + denominator / 2n) / denominator;

  // 6. GST Amount = Inclusive - Taxable (Mathematically guarantees Taxable + GST === Inclusive)
  const gstPaise = P - taxablePaise;

  // 7. CGST/SGST (Intra-state) vs IGST (Inter-state) breakdown
  let cgstPaise = 0n;
  let sgstPaise = 0n;
  let igstPaise = 0n;

  if (isInterState) {
    igstPaise = gstPaise;
  } else {
    cgstPaise = gstPaise / 2n;
    sgstPaise = gstPaise - cgstPaise; // Guarantees cgstPaise + sgstPaise === gstPaise exactly
  }

  return {
    inclusiveAmountInPaise: Number(P),
    taxableAmountInPaise: Number(taxablePaise),
    taxAmountInPaise: Number(gstPaise),
    taxRatePercent: rateNum,
    taxRateBps: Number(rateBps),
    cgstPaise: Number(cgstPaise),
    sgstPaise: Number(sgstPaise),
    igstPaise: Number(igstPaise),
    isInterState: Boolean(isInterState),
    hsnCode,
    taxCategory,
  };
}
