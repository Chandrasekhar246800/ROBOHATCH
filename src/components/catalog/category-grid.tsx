import * as React from "react";
import { CategoryItem } from "@/data/categories";
import { CategoryCard } from "./category-card";
import { cn } from "@/lib/utils";

export interface CategoryGridProps {
  categories: CategoryItem[];
  productCounts?: Record<string, number>;
  className?: string;
}

export function CategoryGrid({
  categories,
  productCounts,
  className,
}: CategoryGridProps) {
  return (
    <div
      className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}
    >
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          productCount={productCounts ? productCounts[category.slug] : undefined}
        />
      ))}
    </div>
  );
}
