"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DemoProduct, PRODUCTS_DATA } from "@/data/products";
import { filterProducts, CatalogFilterOptions } from "@/lib/catalog/filter-products";
import { sortProducts, SortOption } from "@/lib/catalog/sort-products";
import { searchProducts } from "@/lib/catalog/search-products";
import { ProductGrid } from "./product-grid";
import { ProductFilterSidebar } from "./product-filters";
import { CatalogToolbar } from "./catalog-toolbar";
import { ActiveFilterChips, ActiveFiltersState } from "./active-filter-chips";
import { CatalogEmptyState } from "./catalog-empty-state";
import { Pagination } from "./pagination";
import { cn } from "@/lib/utils";

export interface CatalogViewProps {
  initialProducts?: DemoProduct[];
  defaultCategory?: string;
  showCategoryFilter?: boolean;
  pageSize?: number;
  className?: string;
}

export function CatalogView({
  initialProducts = PRODUCTS_DATA,
  defaultCategory,
  showCategoryFilter = true,
  pageSize = 6,
  className,
}: CatalogViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Read state from searchParams
  const categoryParam = searchParams.get("category");
  const materialParam = searchParams.get("material");
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const availabilityParam = searchParams.get("availability");
  const sortParam = (searchParams.get("sort") as SortOption) || "featured";
  const searchParam = searchParams.get("q") || "";
  const pageParam = searchParams.get("page");

  const currentPage = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;

  const activeFilters: ActiveFiltersState = React.useMemo(() => {
    return {
      categories: defaultCategory
        ? [defaultCategory]
        : categoryParam
          ? categoryParam.split(",").filter(Boolean)
          : [],
      materials: materialParam ? materialParam.split(",").filter(Boolean) : [],
      minPrice:
        minPriceParam && !isNaN(Number(minPriceParam))
          ? Number(minPriceParam)
          : undefined,
      maxPrice:
        maxPriceParam && !isNaN(Number(maxPriceParam))
          ? Number(maxPriceParam)
          : undefined,
      availabilities: availabilityParam
        ? availabilityParam.split(",").filter(Boolean)
        : [],
      search: searchParam,
    };
  }, [
    defaultCategory,
    categoryParam,
    materialParam,
    minPriceParam,
    maxPriceParam,
    availabilityParam,
    searchParam,
  ]);

  // 2. Helper to sync changes with URL
  const updateUrl = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === undefined) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      // If page was not specifically updated in this call, reset page to 1
      if (!("page" in updates)) {
        params.delete("page");
      }

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(targetUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // 3. Compute Filtered & Sorted Products
  const processedProducts = React.useMemo(() => {
    // A. Apply Search first
    let result = searchProducts(initialProducts, activeFilters.search);

    // B. Apply Filter options
    const filterOptions: CatalogFilterOptions = {
      categories: activeFilters.categories,
      materials: activeFilters.materials,
      minPrice: activeFilters.minPrice,
      maxPrice: activeFilters.maxPrice,
      availabilities: activeFilters.availabilities,
    };
    result = filterProducts(result, filterOptions);

    // C. Apply Sort
    result = sortProducts(result, sortParam);

    return result;
  }, [initialProducts, activeFilters, sortParam]);

  // 4. Compute Counts for Sidebar
  const { categoryCounts, materialCounts, availabilityCounts } = React.useMemo(() => {
    const catMap: Record<string, number> = {};
    const matMap: Record<string, number> = {};
    const availMap: Record<string, number> = {};

    initialProducts.forEach((p) => {
      catMap[p.categorySlug] = (catMap[p.categorySlug] || 0) + 1;
      matMap[p.material] = (matMap[p.material] || 0) + 1;
      availMap[p.availability] = (availMap[p.availability] || 0) + 1;
    });

    return {
      categoryCounts: catMap,
      materialCounts: matMap,
      availabilityCounts: availMap,
    };
  }, [initialProducts]);

  // 5. Pagination calculation
  const totalCount = initialProducts.length;
  const filteredCount = processedProducts.length;
  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = React.useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return processedProducts.slice(startIndex, startIndex + pageSize);
  }, [processedProducts, safeCurrentPage, pageSize]);

  // 6. Event Handlers
  const handleSortChange = (newSort: SortOption) => {
    updateUrl({ sort: newSort === "featured" ? null : newSort });
  };

  const handleSearchChange = (newQuery: string) => {
    updateUrl({ q: newQuery ? newQuery : null });
  };

  const handleFiltersChange = (newFilters: ActiveFiltersState) => {
    updateUrl({
      category:
        !defaultCategory && newFilters.categories.length > 0
          ? newFilters.categories.join(",")
          : null,
      material: newFilters.materials.length > 0 ? newFilters.materials.join(",") : null,
      minPrice: newFilters.minPrice !== undefined ? String(newFilters.minPrice) : null,
      maxPrice: newFilters.maxPrice !== undefined ? String(newFilters.maxPrice) : null,
      availability:
        newFilters.availabilities.length > 0 ? newFilters.availabilities.join(",") : null,
    });
  };

  const handleResetFilters = () => {
    updateUrl({
      category: null,
      material: null,
      minPrice: null,
      maxPrice: null,
      availability: null,
      q: null,
      sort: null,
      page: null,
    });
  };

  const handleRemoveCategory = (slug: string) => {
    const updated = activeFilters.categories.filter((c) => c !== slug);
    updateUrl({ category: updated.length ? updated.join(",") : null });
  };

  const handleRemoveMaterial = (mat: string) => {
    const updated = activeFilters.materials.filter((m) => m !== mat);
    updateUrl({ material: updated.length ? updated.join(",") : null });
  };

  const handleRemovePrice = () => {
    updateUrl({ minPrice: null, maxPrice: null });
  };

  const handleRemoveAvailability = (avail: string) => {
    const updated = activeFilters.availabilities.filter((a) => a !== avail);
    updateUrl({ availability: updated.length ? updated.join(",") : null });
  };

  const handleRemoveSearch = () => {
    updateUrl({ q: null });
  };

  const handlePageChange = (newPage: number) => {
    updateUrl({ page: newPage > 1 ? String(newPage) : null });
    // Smooth scroll to top of catalog
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Catalog Toolbar */}
      <CatalogToolbar
        totalCount={totalCount}
        filteredCount={filteredCount}
        sortValue={sortParam}
        onSortChange={handleSortChange}
        searchValue={activeFilters.search || ""}
        onSearchChange={handleSearchChange}
        filters={activeFilters}
        onFilterChange={handleFiltersChange}
        onResetFilters={handleResetFilters}
        showCategoryFilter={showCategoryFilter && !defaultCategory}
        categoryCounts={categoryCounts}
        materialCounts={materialCounts}
        availabilityCounts={availabilityCounts}
      />

      {/* Active Filter Chips */}
      <ActiveFilterChips
        filters={activeFilters}
        showCategoryChips={showCategoryFilter && !defaultCategory}
        onRemoveCategory={handleRemoveCategory}
        onRemoveMaterial={handleRemoveMaterial}
        onRemovePrice={handleRemovePrice}
        onRemoveAvailability={handleRemoveAvailability}
        onRemoveSearch={handleRemoveSearch}
        onClearAll={handleResetFilters}
      />

      {/* Main Content Area: Sidebar + Grid */}
      <div className="flex items-start gap-8">
        {/* Desktop Sidebar */}
        <ProductFilterSidebar
          filters={activeFilters}
          onChange={handleFiltersChange}
          onReset={handleResetFilters}
          showCategoryFilter={showCategoryFilter && !defaultCategory}
          categoryCounts={categoryCounts}
          materialCounts={materialCounts}
          availabilityCounts={availabilityCounts}
        />

        {/* Product Grid / Empty State */}
        <div className="min-w-0 flex-1 space-y-8">
          {paginatedProducts.length > 0 ? (
            <>
              <ProductGrid products={paginatedProducts} columns={3} />
              <Pagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="pt-6"
              />
            </>
          ) : (
            <CatalogEmptyState
              onReset={handleResetFilters}
              title={
                activeFilters.search
                  ? `No results for "${activeFilters.search}"`
                  : "No matching products"
              }
              description={
                activeFilters.search
                  ? `We couldn't find any products matching "${activeFilters.search}". Try checking for spelling errors, using simpler keywords, or browsing our suggested categories below.`
                  : "No products match all your selected filters. Try clearing some filters to broaden your search."
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
