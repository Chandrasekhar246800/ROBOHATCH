import * as React from "react";
import { DemoProduct, getRelatedProducts } from "@/data/products";
import { ProductCard } from "@/components/common/product-card";
import { cn } from "@/lib/utils";

export interface RelatedProductsProps {
  currentProduct: DemoProduct;
  className?: string;
}

export function RelatedProducts({ currentProduct, className }: RelatedProductsProps) {
  const related = getRelatedProducts(
    currentProduct.slug,
    currentProduct.categorySlug,
    currentProduct.material,
    4
  );

  if (related.length === 0) return null;

  return (
    <section
      className={cn("space-y-6", className)}
      aria-label="Related 3D-printed products"
    >
      <div className="flex flex-col space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#E87536]">
          Curated Complements
        </span>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Related Designs & Complements
        </h2>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Architectural objects sharing harmonious computational aesthetics and additive
          material specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {related.map((product) => (
          <div key={product.id} className="h-full">
            <ProductCard
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
              className="h-full"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
