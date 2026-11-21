import type { Cart, CartItem, Product, ProductImage, ProductVariant } from "@/types";

export type CartItemWithProduct = CartItem & {
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
