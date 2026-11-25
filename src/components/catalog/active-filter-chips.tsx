"use client";

import * as React from "react";
import { X, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import { CATEGORIES_DATA } from "@/data/categories";

export interface ActiveFiltersState {
  categories: string[];
  materials: string[];
  minPrice?: number;
  maxPrice?: number;
  availabilities: string[];
  search?: string;
}

export interface ActiveFilterChipsProps {
  filters: ActiveFiltersState;
  showCategoryChips?: boolean;
  onRemoveCategory: (slug: string) => void;
  onRemoveMaterial: (material: string) => void;
  onRemovePrice: () => void;
  onRemoveAvailability: (avail: string) => void;
  onRemoveSearch: () => void;
  onClearAll: () => void;
  className?: string;
}

export function ActiveFilterChips({
  filters,
  showCategoryChips = true,
  onRemoveCategory,
  onRemoveMaterial,
  onRemovePrice,
  onRemoveAvailability,
  onRemoveSearch,
  onClearAll,
  className,
}: ActiveFilterChipsProps) {
  const hasCategories = showCategoryChips && filters.categories.length > 0;
  const hasMaterials = filters.materials.length > 0;
  const hasPrice =
    typeof filters.minPrice === "number" || typeof filters.maxPrice === "number";
  const hasAvailability = filters.availabilities.length > 0;
  const hasSearch = Boolean(filters.search && filters.search.trim());

  const hasAnyFilter =
    hasCategories || hasMaterials || hasPrice || hasAvailability || hasSearch;

  if (!hasAnyFilter) return null;

  const getCategoryName = (slug: string) => {
    const cat = CATEGORIES_DATA.find((c) => c.slug === slug);
    return cat ? cat.name : slug;
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 pb-1 pt-2 text-xs text-muted-foreground",
        className
      )}
    >
      <span className="mr-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
        Active Filters:
      </span>

      {/* Search Query Chip */}
      {hasSearch && (
        <Badge
          variant="secondary"
          className="gap-1 border border-border/60 bg-secondary/80 px-2 py-0.5 text-xs font-normal text-foreground"
        >
          <span>Search: &ldquo;{filters.search}&rdquo;</span>
          <button
            type="button"
            onClick={onRemoveSearch}
            className="hover:text-destructive focus:outline-none"
            aria-label="Remove search filter"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Category Chips */}
      {hasCategories &&
        filters.categories.map((slug) => (
          <Badge
            key={`cat-${slug}`}
            variant="secondary"
            className="gap-1 border border-border/60 bg-secondary/80 px-2 py-0.5 text-xs font-normal text-foreground"
          >
            <span>{getCategoryName(slug)}</span>
            <button
              type="button"
              onClick={() => onRemoveCategory(slug)}
              className="hover:text-destructive focus:outline-none"
              aria-label={`Remove ${getCategoryName(slug)} filter`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

      {/* Material Chips */}
      {filters.materials.map((mat) => (
        <Badge
          key={`mat-${mat}`}
          variant="secondary"
          className="gap-1 border border-border/60 bg-secondary/80 px-2 py-0.5 text-xs font-normal text-foreground"
        >
          <span>{mat}</span>
          <button
            type="button"
            onClick={() => onRemoveMaterial(mat)}
            className="hover:text-destructive focus:outline-none"
            aria-label={`Remove ${mat} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Price Chip */}
      {hasPrice && (
        <Badge
          variant="secondary"
          className="gap-1 border border-border/60 bg-secondary/80 px-2 py-0.5 text-xs font-normal text-foreground"
        >
          <span>
            {typeof filters.minPrice === "number" && typeof filters.maxPrice === "number"
              ? `${formatCurrency(filters.minPrice)} – ${formatCurrency(filters.maxPrice)}`
              : typeof filters.minPrice === "number"
                ? `From ${formatCurrency(filters.minPrice)}`
                : `Up to ${formatCurrency(filters.maxPrice!)}`}
          </span>
          <button
            type="button"
            onClick={onRemovePrice}
            className="hover:text-destructive focus:outline-none"
            aria-label="Remove price filter"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Availability Chips */}
      {filters.availabilities.map((avail) => (
        <Badge
          key={`avail-${avail}`}
          variant="secondary"
          className="gap-1 border border-border/60 bg-secondary/80 px-2 py-0.5 text-xs font-normal text-foreground"
        >
          <span>{avail}</span>
          <button
            type="button"
            onClick={() => onRemoveAvailability(avail)}
            className="hover:text-destructive focus:outline-none"
            aria-label={`Remove ${avail} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Clear All Action */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-6 px-2 text-xs font-medium text-[#E87536] hover:bg-[#E87536]/10 hover:text-[#d36427]"
      >
        <RotateCcw className="mr-1 h-3 w-3" />
        Clear All
      </Button>
    </div>
  );
}
