import * as React from "react";
import { DemoProduct } from "@/data/products";
import { ProductCard } from "@/components/common/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface ProductGridProps {
  products: DemoProduct[];
  isLoading?: boolean;
  className?: string;
  columns?: 3 | 4;
}

export function ProductGrid({
  products,
  isLoading = false,
  className,
  columns = 3,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6",
          columns === 4 ? "lg:grid-cols-3 xl:grid-cols-4" : "lg:grid-cols-3",
          className
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col space-y-3 overflow-hidden rounded-lg border border-border bg-card p-4"
          >
            <Skeleton className="aspect-square w-full rounded-md" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-5 w-4/5" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6",
        columns === 4 ? "lg:grid-cols-3 xl:grid-cols-4" : "lg:grid-cols-3",
        className
      )}
    >
      {products.map((product) => (
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
  );
}
