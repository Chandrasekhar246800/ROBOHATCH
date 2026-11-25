"use client";

import * as React from "react";
import { ProductSort } from "./product-sort";
import { ProductSearch } from "./product-search";
import { ProductFilterDrawer } from "./product-filters";
import { SortOption } from "@/lib/catalog/sort-products";
import { ActiveFiltersState } from "./active-filter-chips";
import { cn } from "@/lib/utils";

export interface CatalogToolbarProps {
  totalCount: number;
  filteredCount: number;
  sortValue: SortOption;
  onSortChange: (sort: SortOption) => void;
  searchValue: string;
  onSearchChange: (search: string) => void;
  filters: ActiveFiltersState;
  onFilterChange: (filters: ActiveFiltersState) => void;
  onResetFilters: () => void;
  showCategoryFilter?: boolean;
  categoryCounts?: Record<string, number>;
  materialCounts?: Record<string, number>;
  availabilityCounts?: Record<string, number>;
  showSearch?: boolean;
  className?: string;
}

export function CatalogToolbar({
  totalCount,
  filteredCount,
  sortValue,
  onSortChange,
  searchValue,
  onSearchChange,
  filters,
  onFilterChange,
  onResetFilters,
  showCategoryFilter = true,
  categoryCounts,
  materialCounts,
  availabilityCounts,
  showSearch = true,
  className,
}: CatalogToolbarProps) {
  // Calculate active filter count for mobile badge
  const activeCount =
    (showCategoryFilter ? filters.categories.length : 0) +
    filters.materials.length +
    filters.availabilities.length +
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Product count & Mobile filter button */}
        <div className="flex items-center justify-between gap-3 sm:justify-start">
          <div className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredCount}</span>{" "}
            {filteredCount === 1 ? "product" : "products"}
            {filteredCount !== totalCount && (
              <span className="text-muted-foreground/70"> of {totalCount}</span>
            )}
          </div>

          {/* Mobile Filter Drawer */}
          <ProductFilterDrawer
            filters={filters}
            onChange={onFilterChange}
            onReset={onResetFilters}
            activeCount={activeCount}
            showCategoryFilter={showCategoryFilter}
            categoryCounts={categoryCounts}
            materialCounts={materialCounts}
            availabilityCounts={availabilityCounts}
          />
        </div>

        {/* Right: Search (on desktop) & Sort */}
        <div className="flex items-center gap-2 sm:gap-3">
          {showSearch && (
            <div className="w-full sm:w-64">
              <ProductSearch
                value={searchValue}
                onChange={onSearchChange}
                placeholder="Search collection..."
              />
            </div>
          )}

          <div className="shrink-0">
            <ProductSort value={sortValue} onChange={onSortChange} />
          </div>
        </div>
      </div>
    </div>
  );
}
