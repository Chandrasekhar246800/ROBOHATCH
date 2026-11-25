import { DemoProduct } from "@/data/products";

/**
 * Searches products across name, description, category, material, and badges.
 * Case-insensitive, supports multi-keyword searches, trims whitespace.
 */
export function searchProducts(
  products: DemoProduct[],
  query?: string | null
): DemoProduct[] {
  if (!query) return products;
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return products;

  const keywords = trimmed.split(/\s+/).filter(Boolean);

  return products.filter((product) => {
    const searchableText = [
      product.name,
      product.description,
      product.category,
      product.material,
      product.badge || "",
    ]
      .join(" ")
      .toLowerCase();

    return keywords.every((kw) => searchableText.includes(kw));
  });
}
