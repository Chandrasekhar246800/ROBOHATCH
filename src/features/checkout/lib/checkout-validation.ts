import { PRODUCTS_DATA } from "@/data/products";
import { rupeesToPaise } from "@/features/cart/lib/cart-utils";
import type { CartItem } from "@/features/cart/types";
import type {
  CheckoutValidationSummary,
  ValidatedCheckoutItem,
} from "../types/checkout-types";

/**
 * Validates and sanitizes raw client-side cart items against the authoritative
 * product catalogue (PRODUCTS_DATA).
 *
 * Security Requirements:
 * - NEVER trust client-supplied prices, subtotals, or currency calculations.
 * - Always resolve authoritative unit prices from server/catalog data in integer paise.
 * - Enforce positive integer quantity limits (1 to 10 per line).
 * - Flag missing or discontinued products.
 * - Compute line totals and preliminary subtotals strictly using integer paise.
 */
export function validateCheckoutCart(rawItems: CartItem[]): CheckoutValidationSummary {
  if (!rawItems || rawItems.length === 0) {
    return {
      items: [],
      itemCount: 0,
      subtotalInPaise: 0,
      hasUnavailableItems: false,
      unavailableNames: [],
      isEmpty: true,
    };
  }

  const validatedItems: ValidatedCheckoutItem[] = [];
  const unavailableNames: string[] = [];
  let totalPaise = 0;
  let totalCount = 0;

  for (const rawItem of rawItems) {
    const trustedProduct = PRODUCTS_DATA.find((p) => p.id === rawItem.productId);

    // If product no longer exists in catalog
    if (!trustedProduct) {
      unavailableNames.push(rawItem.name || "Unknown Product");
      continue;
    }

    // Check availability status
    const isOutOfStock = (trustedProduct.availability as string) === "Out of Stock";
    if (isOutOfStock) {
      unavailableNames.push(trustedProduct.name);
    }

    // Clamp quantity safely between 1 and 10
    const safeQty = Math.min(10, Math.max(1, Math.floor(Number(rawItem.quantity) || 1)));

    // Authoritative price converted to integer paise
    const authoritativePriceInPaise = rupeesToPaise(trustedProduct.price);
    const lineTotalInPaise = authoritativePriceInPaise * safeQty;

    // Validate colorway against product supported colors
    let resolvedColor = rawItem.selectedColor;
    if (trustedProduct.colors && trustedProduct.colors.length > 0) {
      if (!resolvedColor || !trustedProduct.colors.includes(resolvedColor)) {
        resolvedColor = trustedProduct.colors[0];
      }
    } else {
      resolvedColor = undefined;
    }

    validatedItems.push({
      id: rawItem.id,
      productId: trustedProduct.id,
      slug: trustedProduct.slug,
      name: trustedProduct.name,
      image: trustedProduct.image,
      selectedColor: resolvedColor,
      quantity: safeQty,
      unitPriceInPaise: authoritativePriceInPaise,
      lineTotalInPaise,
      availability: trustedProduct.availability,
      isAvailable: !isOutOfStock,
      material: trustedProduct.material,
    });

    if (!isOutOfStock) {
      totalPaise += lineTotalInPaise;
      totalCount += safeQty;
    }
  }

  return {
    items: validatedItems,
    itemCount: totalCount,
    subtotalInPaise: totalPaise,
    hasUnavailableItems: unavailableNames.length > 0,
    unavailableNames,
    isEmpty: validatedItems.length === 0,
  };
}
