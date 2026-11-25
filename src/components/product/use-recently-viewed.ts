"use client";

import * as React from "react";
import { PRODUCTS_DATA, DemoProduct } from "@/data/products";

const STORAGE_KEY = "robohatch_recently_viewed_slugs";
const MAX_HISTORY = 6;

export function useRecentlyViewed(currentSlug?: string) {
  const [recentProducts, setRecentProducts] = React.useState<DemoProduct[]>([]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      // 1. Read existing stored slugs
      const stored = localStorage.getItem(STORAGE_KEY);
      let slugs: string[] = stored ? JSON.parse(stored) : [];

      // Ensure slugs is an array
      if (!Array.isArray(slugs)) slugs = [];

      // 2. If a current product slug is provided, add it to front and deduplicate
      if (currentSlug) {
        slugs = [currentSlug, ...slugs.filter((s) => s !== currentSlug)].slice(
          0,
          MAX_HISTORY
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
      }

      // 3. Resolve slugs to DemoProducts (excluding the currently viewed product from display)
      const displaySlugs = currentSlug ? slugs.filter((s) => s !== currentSlug) : slugs;

      const products = displaySlugs
        .map((s) => PRODUCTS_DATA.find((p) => p.slug === s))
        .filter((p): p is DemoProduct => Boolean(p));

      setRecentProducts(products);
    } catch {
      // Ignore localStorage errors (e.g. private browsing restrictions)
    }
  }, [currentSlug]);

  return recentProducts;
}
