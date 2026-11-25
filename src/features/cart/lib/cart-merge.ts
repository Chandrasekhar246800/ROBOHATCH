import { PRODUCTS_DATA } from "@/data/products";
import type { CartItem } from "../types";
import { generateCartItemId, rupeesToPaise } from "./cart-utils";

/**
 * Sanitizes an array of cart items:
 * 1. Discards items whose product is nonexistent or "Out of Stock".
 * 2. Normalizes colorways to valid product colors.
 * 3. Enforces integer quantity >= 1.
 * 4. Refreshes priceInPaise against current PRODUCTS_DATA.
 * 5. Deduplicates identical item IDs, combining their quantities.
 */
export function sanitizeCartItems(items: CartItem[]): CartItem[] {
  if (!items || items.length === 0) return [];

  const sanitized: CartItem[] = [];

  for (const item of items) {
    if (!item.productId) continue;

    const product = PRODUCTS_DATA.find((p) => p.id === item.productId);
    if (!product || (product.availability as string) === "Out of Stock") {
      continue;
    }

    const validQty = Math.max(1, Math.floor(Number(item.quantity) || 1));

    let resolvedColor: string | undefined = undefined;
    if (product.colors && product.colors.length > 0) {
      if (item.selectedColor && product.colors.includes(item.selectedColor)) {
        resolvedColor = item.selectedColor;
      } else {
        resolvedColor = product.colors[0];
      }
    }

    const itemId = generateCartItemId(product.id, resolvedColor);
    const existingIndex = sanitized.findIndex((i) => i.id === itemId);

    if (existingIndex > -1) {
      sanitized[existingIndex] = {
        ...sanitized[existingIndex],
        quantity: sanitized[existingIndex].quantity + validQty,
        priceInPaise: rupeesToPaise(product.price),
      };
    } else {
      sanitized.push({
        id: itemId,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        priceInPaise: rupeesToPaise(product.price),
        quantity: validQty,
        selectedColor: resolvedColor,
        category: product.category,
        material: product.material,
      });
    }
  }

  return sanitized;
}

/**
 * Merges incoming cart items into an existing target cart items array.
 *
 * Rules:
 * 1. Product must exist in centralized PRODUCTS_DATA.
 * 2. Out of stock products are filtered out safely.
 * 3. Colorways are normalized against supported colors.
 * 4. Existing matching items (same product + same color) have their quantities combined.
 * 5. New items are appended.
 * 6. Prices are strictly refreshed against single-source-of-truth integer paise.
 */
export function mergeCartItems(
  targetItems: CartItem[],
  incomingItems: CartItem[]
): CartItem[] {
  if (!incomingItems || incomingItems.length === 0) {
    return sanitizeCartItems(targetItems);
  }

  // Prevent merging identical item array onto itself
  if (targetItems === incomingItems) {
    return sanitizeCartItems(targetItems);
  }

  const merged = sanitizeCartItems(targetItems);

  for (const item of incomingItems) {
    if (!item.productId) continue;

    const product = PRODUCTS_DATA.find((p) => p.id === item.productId);
    if (!product || (product.availability as string) === "Out of Stock") {
      continue;
    }

    const validQty = Math.max(1, Math.floor(Number(item.quantity) || 1));

    // Resolve color
    let resolvedColor: string | undefined = undefined;
    if (product.colors && product.colors.length > 0) {
      if (item.selectedColor && product.colors.includes(item.selectedColor)) {
        resolvedColor = item.selectedColor;
      } else {
        resolvedColor = product.colors[0];
      }
    }

    const itemId = generateCartItemId(product.id, resolvedColor);
    const existingIndex = merged.findIndex((i) => i.id === itemId);

    if (existingIndex > -1) {
      merged[existingIndex] = {
        ...merged[existingIndex],
        quantity: merged[existingIndex].quantity + validQty,
        priceInPaise: rupeesToPaise(product.price),
      };
    } else {
      merged.push({
        id: itemId,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        priceInPaise: rupeesToPaise(product.price),
        quantity: validQty,
        selectedColor: resolvedColor,
        category: product.category,
        material: product.material,
      });
    }
  }

  return merged;
}

const SESSION_MERGE_KEY = "robohatch-cart-merged-session";

/**
 * Checks whether guest cart has already been merged for the active browser session.
 */
export function hasCartBeenMergedInSession(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return sessionStorage.getItem(SESSION_MERGE_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Marks that the guest cart merge has completed for this browser session.
 */
export function markCartMergedInSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_MERGE_KEY, "true");
  } catch {}
}

/**
 * Clears the session merge flag (useful upon logout so a subsequent login can merge fresh items).
 */
export function resetCartMergeSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_MERGE_KEY);
  } catch {}
}
