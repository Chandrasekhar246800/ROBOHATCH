import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MainContainer } from "@/components/layout";
import { SectionHeading, ProductCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { BEST_SELLERS } from "@/data/products";

export function BestSellers() {
  return (
    <section className="border-b border-border bg-background py-16 sm:py-20 lg:py-24">
      <MainContainer size="xl" className="space-y-12">
        <SectionHeading
          badge="Customer Favorites"
          title="Best Sellers"
          description="Our most revered physical designs, praised for exceptional structural integrity, tactile balance, and mathematical precision."
          action={
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href="/products?sort=bestselling">
                View All Best Sellers
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BEST_SELLERS.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              categoryName={product.category}
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              imageUrl={product.image}
              imageAlt={product.name}
              material={product.material}
              badge={product.badge}
              isFeatured={product.isFeatured}
              actionSlot={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2.5 text-xs font-semibold text-[#E87536] hover:text-[#D66325]"
                >
                  View Spec
                </Button>
              }
            />
          ))}
        </div>
      </MainContainer>
    </section>
  );
}
