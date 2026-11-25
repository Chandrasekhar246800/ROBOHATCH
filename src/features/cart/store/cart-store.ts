"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as React from "react";
import { PRODUCTS_DATA } from "@/data/products";
import type { CartStore, CartItem } from "../types";
import {
  rupeesToPaise,
  generateCartItemId,
  calculateTotalItemCount,
  calculateSubtotalInPaise,
} from "../lib/cart-utils";
import { mergeCartItems, sanitizeCartItems } from "../lib/cart-merge";

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      hasHydrated: false,

      addItem: (productId: string, quantity = 1, selectedColor?: string) => {
        // 1. Validate quantity input
        const validQty = Math.max(1, Math.floor(quantity || 1));

        // 2. Look up product in centralized dataset (single source of truth)
        const product = PRODUCTS_DATA.find((p) => p.id === productId);
        if (!product) {
          console.warn(`[Cart] Cannot add product: ID "${productId}" not found.`);
          return false;
        }

        // 3. Validate product availability
        if ((product.availability as string) === "Out of Stock") {
          console.warn(`[Cart] Cannot add product: "${product.name}" is out of stock.`);
          return false;
        }

        // 4. Validate or normalize color selection
        let resolvedColor: string | undefined = undefined;
        if (product.colors && product.colors.length > 0) {
          if (selectedColor && product.colors.includes(selectedColor)) {
            resolvedColor = selectedColor;
          } else {
            // Default to first supported color
            resolvedColor = product.colors[0];
          }
        }

        // 5. Generate deterministic line item ID
        const itemId = generateCartItemId(product.id, resolvedColor);

        // 6. Update existing line item or append new item
        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.id === itemId);

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const currentItem = updatedItems[existingIndex];
            updatedItems[existingIndex] = {
              ...currentItem,
              quantity: currentItem.quantity + validQty,
              // Always guarantee price remains validated against source of truth
              priceInPaise: rupeesToPaise(product.price),
            };
            return { items: updatedItems };
          }

          const newItem: CartItem = {
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
          };

          return { items: [...state.items, newItem] };
        });

        return true;
      },

      removeItem: (itemId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId: string, quantity: number) => {
        // Enforce strict minimum boundary of 1
        const validQty = Math.max(1, Math.floor(quantity || 1));
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity: validQty } : item
          ),
        }));
      },

      increaseQuantity: (itemId: string) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
          ),
        }));
      },

      decreaseQuantity: (itemId: string) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId
              ? { ...item, quantity: Math.max(1, item.quantity - 1) }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getItemCount: () => {
        return calculateTotalItemCount(get().items);
      },

      getSubtotalInPaise: () => {
        return calculateSubtotalInPaise(get().items);
      },

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
      mergeItems: (incomingItems: CartItem[]) =>
        set((state) => ({ items: mergeCartItems(state.items, incomingItems) })),
      setHasHydrated: (hydrated: boolean) => set({ hasHydrated: hydrated }),
    }),
    {
      name: "robohatch-cart-storage",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Only persist the items array; transient UI states are not persisted
      partialize: (state) => ({ items: state.items }) as unknown as CartStore,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.items = sanitizeCartItems(state.items);
          state.setHasHydrated(true);
        }
      },
    }
  )
);

/**
 * SSR-safe React hook that prevents hydration mismatch between server-rendered
 * markup and persisted client-side localStorage.
 */
export function useCart() {
  const store = useCartStore();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const isReady = isMounted && store.hasHydrated;

  return {
    items: isReady ? store.items : [],
    isDrawerOpen: store.isDrawerOpen,
    isHydrated: isReady,
    itemCount: isReady ? store.getItemCount() : 0,
    subtotalInPaise: isReady ? store.getSubtotalInPaise() : 0,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    increaseQuantity: store.increaseQuantity,
    decreaseQuantity: store.decreaseQuantity,
    clearCart: store.clearCart,
    openDrawer: store.openDrawer,
    closeDrawer: store.closeDrawer,
    toggleDrawer: store.toggleDrawer,
    mergeItems: store.mergeItems,
  };
}
