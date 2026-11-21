import type { Product, ProductImage, ProductVariant, Category } from "@/types";

export type ProductWithDetails = Product & {
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];
};

export interface ProductFilterParams {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  material?: string;
  isFeatured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
