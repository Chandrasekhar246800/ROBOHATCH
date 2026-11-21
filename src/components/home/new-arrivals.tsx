import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { MainContainer } from "@/components/layout";
import { SectionHeading, ProductCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { NEW_ARRIVALS } from "@/data/products";

export function NewArrivals() {
  return (
    <section className="border-b border-border bg-secondary/30 py-16 sm:py-20 lg:py-24">
      <MainContainer size="xl" className="space-y-12">
        <SectionHeading
          badge="Fresh Releases"
          title="New Arrivals"
          description="The latest design explorations off our fabrication floor, experimenting with organic geometries and advanced multi-joint assemblies."
          action={
            <Button asChild variant="brand" size="sm" className="gap-1.5 font-semibold">
              <Link href="/products?sort=newest">
                <Sparkles className="h-4 w-4" />
                View All Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {NEW_ARRIVALS.map((product) => (
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
              badge={product.badge || "New"}
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
