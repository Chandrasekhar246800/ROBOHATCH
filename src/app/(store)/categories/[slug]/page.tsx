import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";
import { MainContainer } from "@/components/layout";
import { Breadcrumb } from "@/components/common";
import { CatalogView } from "@/components/catalog/catalog-view";
import { ProductGrid } from "@/components/catalog/product-grid";
import { CATEGORIES_DATA, getCategoryBySlug } from "@/data/categories";
import { getProductsByCategory } from "@/data/products";
import { Badge } from "@/components/ui/badge";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return CATEGORIES_DATA.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found | RoboHatch",
    };
  }

  return {
    title: `${category.name} | RoboHatch`,
    description: category.description,
  };
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const categoryProducts = getProductsByCategory(category.slug);

  return (
    <MainContainer size="xl" className="py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Categories", href: "/categories" },
            { label: category.name },
          ]}
        />
      </div>

      {/* Category Editorial Hero Banner */}
      <div className="relative mb-10 overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid grid-cols-1 items-center md:grid-cols-12">
          {/* Left Text Column */}
          <div className="space-y-3 p-6 sm:space-y-4 sm:p-10 md:col-span-7 lg:col-span-8">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="text-[10px] uppercase tracking-wider">
                Collection
              </Badge>
              <span className="font-mono text-xs text-muted-foreground">
                {categoryProducts.length}{" "}
                {categoryProducts.length === 1 ? "design" : "designs"}
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {category.name}
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {category.description}
            </p>
          </div>

          {/* Right Visual Image */}
          <div className="relative aspect-[16/9] min-h-[220px] overflow-hidden bg-secondary/50 md:col-span-5 md:aspect-auto md:h-full lg:col-span-4">
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover object-center transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent md:bg-gradient-to-r" />
          </div>
        </div>
      </div>

      {/* Category Specific Catalog View */}
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-10 w-full animate-pulse rounded-md bg-secondary/60" />
            <div className="flex items-start gap-8">
              <div className="hidden h-96 w-64 animate-pulse rounded-lg bg-secondary/40 lg:block" />
              <div className="flex-1">
                <ProductGrid products={categoryProducts} isLoading />
              </div>
            </div>
          </div>
        }
      >
        <CatalogView
          initialProducts={categoryProducts}
          defaultCategory={category.slug}
          showCategoryFilter={false}
          pageSize={6}
        />
      </Suspense>
    </MainContainer>
  );
}
