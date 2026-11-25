export interface CartItem {
  id: string; // Deterministic ID: e.g. `${productId}__${colorSlug}`
  productId: string;
  slug: string;
  name: string;
  image: string;
  priceInPaise: number; // Stored in integer paise (e.g., ₹2,499 = 249900 paise)
  quantity: number;
  selectedColor?: string;
  category: string;
  material: string;
}

export interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  hasHydrated: boolean;
}

export interface CartActions {
  addItem: (productId: string, quantity?: number, selectedColor?: string) => boolean;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  increaseQuantity: (itemId: string) => void;
  decreaseQuantity: (itemId: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotalInPaise: () => number;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  mergeItems: (incomingItems: CartItem[]) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export type CartStore = CartState & CartActions;

// Legacy Prisma-based type aliases preserved for schema compatibility
import type {
  Cart,
  CartItem as PrismaCartItem,
  Product,
  ProductImage,
  ProductVariant,
} from "@/types";

export type CartItemWithProduct = PrismaCartItem & {
  product: Product & {
    images: ProductImage[];
  };
  variant: ProductVariant | null;
};

export type CartWithItems = Cart & {
  items: CartItemWithProduct[];
};

export interface AddToCartInput {
  productId: string;
  variantId?: string;
  quantity: number;
}
