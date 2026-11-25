import * as React from "react";
import type { Metadata } from "next";
import { MainContainer } from "@/components/layout";
import { PageHeader, Breadcrumb } from "@/components/common";
import { CategoryGrid } from "@/components/catalog/category-grid";
import { CATEGORIES_DATA } from "@/data/categories";
import { PRODUCTS_DATA } from "@/data/products";

export const metadata: Metadata = {
  title: "Categories | RoboHatch",
  description:
    "Explore our complete range of 3D-printed product categories, from home decor and desk accessories to miniatures and functional hardware.",
};

export default function CategoriesPage() {
  // Compute actual product counts dynamically from centralized PRODUCTS_DATA
  const productCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of CATEGORIES_DATA) {
      counts[cat.slug] = PRODUCTS_DATA.filter((p) => p.categorySlug === cat.slug).length;
    }
    return counts;
  }, []);

  return (
    <MainContainer size="xl" className="py-8 sm:py-12">
      <PageHeader
        breadcrumb={
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Categories" }]} />
        }
        badge="Taxonomy"
        title="Product Categories"
        description="Discover our specialized additive manufacturing collections organized by functional domains and design disciplines."
      />

      <div className="mt-8 sm:mt-12">
        <CategoryGrid categories={CATEGORIES_DATA} productCounts={productCounts} />
      </div>
    </MainContainer>
  );
}
