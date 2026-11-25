import * as React from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { MainContainer } from "@/components/layout";
import { PageHeader, Breadcrumb } from "@/components/common";
import { CatalogView } from "@/components/catalog/catalog-view";
import { ProductGrid } from "@/components/catalog/product-grid";
import { PRODUCTS_DATA } from "@/data/products";

export const metadata: Metadata = {
  title: "Shop All Products | RoboHatch",
  description:
    "Explore our complete collection of precision-engineered 3D-printed products, geometric vessels, desktop accessories, and architectural decor.",
};

export default function ShopPage() {
  return (
    <MainContainer size="xl" className="py-8 sm:py-12">
      <PageHeader
        breadcrumb={
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
        }
        badge="Catalogue"
        title="Explore Our Collection"
        description="Browse precision-crafted 3D-printed products, architectural artifacts, and functional lifestyle objects engineered with additive manufacturing."
      />

      <div className="mt-8 sm:mt-10">
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="h-10 w-full animate-pulse rounded-md bg-secondary/60" />
              <div className="flex items-start gap-8">
                <div className="hidden h-96 w-64 animate-pulse rounded-lg bg-secondary/40 lg:block" />
                <div className="flex-1">
                  <ProductGrid products={PRODUCTS_DATA.slice(0, 6)} isLoading />
                </div>
              </div>
            </div>
          }
        >
          <CatalogView initialProducts={PRODUCTS_DATA} pageSize={6} />
        </Suspense>
      </div>
    </MainContainer>
  );
}
