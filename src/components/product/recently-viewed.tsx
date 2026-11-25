"use client";

import * as React from "react";
import { ProductCard } from "@/components/common/product-card";
import { useRecentlyViewed } from "./use-recently-viewed";
import { cn } from "@/lib/utils";

export interface RecentlyViewedProps {
  currentSlug?: string;
  className?: string;
}

export function RecentlyViewed({ currentSlug, className }: RecentlyViewedProps) {
  const recentProducts = useRecentlyViewed(currentSlug);

  // If no other products were recently viewed, render nothing
  if (recentProducts.length === 0) return null;

  return (
    <section className={cn("space-y-6", className)}>
      <div className="flex flex-col space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Browsing History
        </span>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Recently Viewed
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {recentProducts.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            slug={product.slug}
            categoryName={product.category}
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            imageUrl={product.image}
            material={product.material}
            badge={product.badge}
            availability={product.availability}
            isFeatured={product.isFeatured}
          />
        ))}
      </div>
    </section>
  );
}
