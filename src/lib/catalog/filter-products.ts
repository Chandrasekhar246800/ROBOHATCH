import { DemoProduct, ProductAvailability, ProductMaterial } from "@/data/products";

export interface CatalogFilterOptions {
  categories?: string[];
  materials?: (ProductMaterial | string)[];
  minPrice?: number;
  maxPrice?: number;
  availabilities?: (ProductAvailability | string)[];
  search?: string;
}

/**
 * Filters a product list against multiple criteria simultaneously.
 */
export function filterProducts(
  products: DemoProduct[],
  filters: CatalogFilterOptions
): DemoProduct[] {
  return products.filter((product) => {
    // 1. Category Filter (by slug or name)
    if (filters.categories && filters.categories.length > 0) {
      const match = filters.categories.some(
        (c) =>
          c.toLowerCase() === product.categorySlug.toLowerCase() ||
          c.toLowerCase() === product.category.toLowerCase()
      );
      if (!match) return false;
    }

    // 2. Material Filter
    if (filters.materials && filters.materials.length > 0) {
      const match = filters.materials.some(
        (m) => m.toLowerCase() === product.material.toLowerCase()
      );
      if (!match) return false;
    }

    // 3. Price Filter (min / max)
    if (typeof filters.minPrice === "number" && !isNaN(filters.minPrice)) {
      if (product.price < filters.minPrice) return false;
    }
    if (typeof filters.maxPrice === "number" && !isNaN(filters.maxPrice)) {
      if (product.price > filters.maxPrice) return false;
    }

    // 4. Availability Filter
    if (filters.availabilities && filters.availabilities.length > 0) {
      const match = filters.availabilities.some(
        (a) => a.toLowerCase() === product.availability.toLowerCase()
      );
      if (!match) return false;
    }

    // 5. Search Query
    if (filters.search && filters.search.trim()) {
      const keywords = filters.search.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const searchableText = [
        product.name,
        product.description,
        product.category,
        product.material,
        product.badge || "",
      ]
        .join(" ")
        .toLowerCase();

      const matches = keywords.every((kw) => searchableText.includes(kw));
      if (!matches) return false;
    }

    return true;
  });
}
