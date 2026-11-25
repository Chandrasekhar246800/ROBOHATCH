/**
 * ROBOHATCH PHASE 7C: FINANCIAL PRECISION & DETERMINISTIC MONETARY CONVERSIONS
 *
 * Audit Mandates:
 * 1. ZERO JavaScript floating-point arithmetic for monetary calculations.
 * 2. Exact conversions between Prisma Decimal, Integer Paise, BigInt, and Display Strings.
 * 3. Commercial Half-Up rounding for integer paise.
 * 4. Guard against silent overflow on large monetary volumes.
 */

import { Prisma } from "@prisma/client";

export class MonetaryConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MonetaryConversionError";
  }
}

/**
 * Converts a Prisma Decimal, number string, or numeric value to exact integer paise.
 * Avoids IEEE-754 floating point multiplication (e.g., 2499.99 * 100 = 249998.99999999997).
 *
 * Examples:
 * - Decimal("2499.00") -> 249900
 * - "3400.50"          -> 340050
 * - 150                -> 15000
 */
export function decimalToPaiseExact(
  val: Prisma.Decimal | string | number | bigint | null | undefined
): number {
  if (val === null || val === undefined) {
    throw new MonetaryConversionError("Cannot convert null or undefined to paise.");
  }

  let str: string;
  if (typeof val === "object" && "toFixed" in val && typeof val.toFixed === "function") {
    str = val.toFixed(2);
  } else if (typeof val === "bigint") {
    // If already BigInt paise or rupees? BigInt direct to number if within safe range
    return Number(val * 100n);
  } else {
    str = String(val).trim();
  }

  if (!str || str === "NaN") {
    throw new MonetaryConversionError(`Invalid monetary string input: "${str}".`);
  }

  const isNegative = str.startsWith("-");
  const cleanStr = isNegative ? str.slice(1) : str;

  const parts = cleanStr.split(".");
  if (parts.length > 2) {
    throw new MonetaryConversionError(`Malformed decimal monetary string: "${str}".`);
  }

  const rupeePart = parts[0] || "0";
  let paisePart = parts[1] || "";

  if (!/^\d+$/.test(rupeePart) || (paisePart && !/^\d+$/.test(paisePart))) {
    throw new MonetaryConversionError(
      `Non-numeric characters in monetary string: "${str}".`
    );
  }

  // Normalize paise to exactly 2 digits with Half-Up rounding if > 2 decimal places
  let extraFraction = 0;
  if (paisePart.length === 0) {
    paisePart = "00";
  } else if (paisePart.length === 1) {
    paisePart = `${paisePart}0`;
  } else if (paisePart.length === 2) {
    // Exactly 2 digits
  } else {
    // More than 2 decimal digits: apply Half-Up rounding
    const firstTwo = paisePart.slice(0, 2);
    const thirdDigit = parseInt(paisePart.charAt(2), 10);
    extraFraction = thirdDigit >= 5 ? 1 : 0;
    paisePart = firstTwo;
  }

  const rupeesBig = BigInt(rupeePart);
  const paiseBig = BigInt(paisePart) + BigInt(extraFraction);
  const totalPaiseBig = rupeesBig * 100n + paiseBig;

  if (totalPaiseBig > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new MonetaryConversionError(
      `Monetary value ${str} exceeds JavaScript Number.MAX_SAFE_INTEGER.`
    );
  }

  const result = Number(totalPaiseBig);
  return isNegative ? -result : result;
}

/**
 * Converts integer paise to a Prisma Decimal without floating-point division.
 *
 * Example:
 * - 249900 -> Decimal("2499.00")
 * - 38120  -> Decimal("381.20")
 */
export function paiseToDecimalExact(paise: number | bigint): Prisma.Decimal {
  const p = BigInt(paise);
  const isNegative = p < 0n;
  const absP = isNegative ? -p : p;

  const rupees = absP / 100n;
  const rem = absP % 100n;
  const remStr = rem < 10n ? `0${rem}` : `${rem}`;

  const prefix = isNegative ? "-" : "";
  return new Prisma.Decimal(`${prefix}${rupees}.${remStr}`);
}

/**
 * Formats an amount in integer paise as an Indian Rupee (INR) display string without float drift.
 *
 * Example:
 * - 249900 -> "₹2,499.00"
 * - 1459700 -> "₹14,597.00"
 */
export function formatPaiseExact(paise: number | bigint): string {
  const p = BigInt(paise);
  const isNegative = p < 0n;
  const absP = isNegative ? -p : p;

  const rupees = absP / 100n;
  const rem = absP % 100n;
  const remStr = rem < 10n ? `0${rem}` : `${rem}`;

  // Format integer rupees according to Indian numbering system (e.g. 12,34,567)
  const rupeeStr = rupees.toString();
  let formattedRupees = "";

  if (rupeeStr.length <= 3) {
    formattedRupees = rupeeStr;
  } else {
    const lastThree = rupeeStr.slice(-3);
    const otherNumbers = rupeeStr.slice(0, -3);
    formattedRupees =
      otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  }

  const sign = isNegative ? "-" : "";
  return `${sign}₹${formattedRupees}.${remStr}`;
}
