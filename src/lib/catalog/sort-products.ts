import { DemoProduct } from "@/data/products";

export type SortOption = "featured" | "newest" | "price-asc" | "price-desc" | "name-asc";

export interface SortItem {
  label: string;
  value: SortOption;
}

export const SORT_OPTIONS: SortItem[] = [
  { label: "Featured", value: "featured" },
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A to Z", value: "name-asc" },
];

/**
 * Sorts products based on selected strategy.
 */
export function sortProducts(
  products: DemoProduct[],
  sortBy: SortOption = "featured"
): DemoProduct[] {
  const cloned = [...products];

  switch (sortBy) {
    case "price-asc":
      return cloned.sort((a, b) => a.price - b.price);

    case "price-desc":
      return cloned.sort((a, b) => b.price - a.price);

    case "name-asc":
      return cloned.sort((a, b) => a.name.localeCompare(b.name));

    case "newest":
      return cloned.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return timeB - timeA;
      });

    case "featured":
    default:
      return cloned.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      });
  }
}
