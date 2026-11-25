import * as React from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { MainContainer } from "@/components/layout";
import { PageHeader, Breadcrumb } from "@/components/common";
import { CatalogView } from "@/components/catalog/catalog-view";
import { ProductGrid } from "@/components/catalog/product-grid";
import { PRODUCTS_DATA } from "@/data/products";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    [key: string]: string | undefined;
  }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q ? params.q.trim() : "";

  return {
    title: query ? `Search: "${query}" | RoboHatch` : "Search Products | RoboHatch",
    description:
      "Search precision 3D-printed products, materials, and categories on RoboHatch.",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const initialQuery = params.q ? params.q.trim() : "";

  return (
    <MainContainer size="xl" className="py-8 sm:py-12">
      <PageHeader
        breadcrumb={
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
        }
        badge="Discovery"
        title={initialQuery ? `Search: "${initialQuery}"` : "Search Catalogue"}
        description="Search across precision-crafted geometric products, materials, collections, and functional hardware."
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
          <CatalogView
            initialProducts={PRODUCTS_DATA}
            showCategoryFilter={true}
            pageSize={6}
          />
        </Suspense>
      </div>
    </MainContainer>
  );
}
