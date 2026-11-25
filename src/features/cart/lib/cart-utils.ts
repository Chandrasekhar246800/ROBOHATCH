import { formatCurrency } from "@/lib/utils";
import type { CartItem } from "../types";

/**
 * Converts standard Rupees into integer Paise (e.g., ₹2,499 -> 249900 paise).
 */
export function rupeesToPaise(rupees: number): number {
  const numericRupees = Number(rupees);
  if (isNaN(numericRupees) || numericRupees <= 0) return 0;
  return Math.round(numericRupees * 100);
}

/**
 * Converts integer Paise into decimal Rupees (e.g., 249900 paise -> 2499.00).
 */
export function paiseToRupees(paise: number): number {
  const numericPaise = Number(paise);
  if (isNaN(numericPaise) || numericPaise <= 0) return 0;
  return numericPaise / 100;
}

/**
 * Formats an amount in integer paise as INR currency (e.g., 249900 -> "₹2,499.00").
 */
export function formatPaise(paise: number): string {
  return formatCurrency(paiseToRupees(paise));
}

/**
 * Generates a stable and predictable cart item ID based on productId and selectedColor.
 */
export function generateCartItemId(productId: string, selectedColor?: string): string {
  if (!selectedColor) {
    return `${productId}__default`;
  }
  const normalizedColor = selectedColor.trim().toLowerCase().replace(/\s+/g, "-");
  return `${productId}__${normalizedColor}`;
}

/**
 * Calculates total item count across all cart items.
 */
export function calculateTotalItemCount(items: CartItem[]): number {
  return items.reduce(
    (total, item) => total + (item.quantity > 0 ? item.quantity : 0),
    0
  );
}

/**
 * Calculates cart subtotal in integer paise.
 */
export function calculateSubtotalInPaise(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const validQty = Math.max(0, Math.floor(Number(item.quantity) || 0));
    const validPrice = Math.max(0, Math.floor(Number(item.priceInPaise) || 0));
    return total + validPrice * validQty;
  }, 0);
}
