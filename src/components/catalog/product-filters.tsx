"use client";

import * as React from "react";
import { Filter, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CATEGORIES_DATA } from "@/data/categories";
import { ActiveFiltersState } from "./active-filter-chips";
import { cn } from "@/lib/utils";

const AVAILABLE_MATERIALS = ["Carbon PETG", "Matte PLA", "Tough Resin", "Industrial ABS"];

const AVAILABLE_AVAILABILITIES = ["In Stock", "Low Stock", "Made to Order"];

const PRICE_PRESETS = [
  { label: "All Prices", min: undefined, max: undefined },
  { label: "Under ₹1,500", min: undefined, max: 1500 },
  { label: "₹1,500 – ₹2,500", min: 1500, max: 2500 },
  { label: "Above ₹2,500", min: 2500, max: undefined },
];

export interface ProductFiltersProps {
  filters: ActiveFiltersState;
  onChange: (filters: ActiveFiltersState) => void;
  onReset: () => void;
  showCategoryFilter?: boolean;
  categoryCounts?: Record<string, number>;
  materialCounts?: Record<string, number>;
  availabilityCounts?: Record<string, number>;
  className?: string;
}

export function ProductFilterContent({
  filters,
  onChange,
  onReset,
  showCategoryFilter = true,
  categoryCounts,
  materialCounts,
  availabilityCounts,
  className,
}: ProductFiltersProps) {
  // Local state for min/max inputs
  const [minInput, setMinInput] = React.useState(
    filters.minPrice !== undefined ? String(filters.minPrice) : ""
  );
  const [maxInput, setMaxInput] = React.useState(
    filters.maxPrice !== undefined ? String(filters.maxPrice) : ""
  );

  React.useEffect(() => {
    setMinInput(filters.minPrice !== undefined ? String(filters.minPrice) : "");
  }, [filters.minPrice]);

  React.useEffect(() => {
    setMaxInput(filters.maxPrice !== undefined ? String(filters.maxPrice) : "");
  }, [filters.maxPrice]);

  // Handle Category Toggle
  const toggleCategory = (slug: string) => {
    const isSelected = filters.categories.includes(slug);
    const newCategories = isSelected
      ? filters.categories.filter((c) => c !== slug)
      : [...filters.categories, slug];
    onChange({ ...filters, categories: newCategories });
  };

  // Handle Material Toggle
  const toggleMaterial = (mat: string) => {
    const isSelected = filters.materials.includes(mat);
    const newMaterials = isSelected
      ? filters.materials.filter((m) => m !== mat)
      : [...filters.materials, mat];
    onChange({ ...filters, materials: newMaterials });
  };

  // Handle Availability Toggle
  const toggleAvailability = (avail: string) => {
    const isSelected = filters.availabilities.includes(avail);
    const newAvails = isSelected
      ? filters.availabilities.filter((a) => a !== avail)
      : [...filters.availabilities, avail];
    onChange({ ...filters, availabilities: newAvails });
  };

  // Handle Price Presets
  const applyPricePreset = (min?: number, max?: number) => {
    onChange({
      ...filters,
      minPrice: min,
      maxPrice: max,
    });
  };

  // Handle Price Inputs
  const handlePriceApply = () => {
    const minVal = minInput ? Number(minInput) : undefined;
    const maxVal = maxInput ? Number(maxInput) : undefined;
    onChange({
      ...filters,
      minPrice: isNaN(minVal as number) ? undefined : minVal,
      maxPrice: isNaN(maxVal as number) ? undefined : maxVal,
    });
  };

  return (
    <div className={cn("space-y-6 text-sm", className)}>
      {/* Header & Reset Button */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground">
          <Filter className="h-3.5 w-3.5 text-[#E87536]" />
          Filters
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="mr-1 h-3 w-3" />
          Reset
        </Button>
      </div>

      <Separator />

      {/* 1. Category Filter */}
      {showCategoryFilter && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Category
          </h4>
          <div className="space-y-1.5">
            {CATEGORIES_DATA.map((cat) => {
              const isChecked = filters.categories.includes(cat.slug);
              const count = categoryCounts ? categoryCounts[cat.slug] : undefined;

              return (
                <label
                  key={cat.id}
                  className="group flex cursor-pointer items-center justify-between rounded-md px-2 py-1 text-xs transition-colors hover:bg-secondary/60"
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChecked}
                    onChange={() => toggleCategory(cat.slug)}
                  />
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                        isChecked
                          ? "border-[#E87536] bg-[#E87536] text-white"
                          : "border-input group-hover:border-foreground/40"
                      )}
                    >
                      {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span
                      className={cn(
                        isChecked
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {cat.name}
                    </span>
                  </div>
                  {count !== undefined && (
                    <span className="text-[11px] text-muted-foreground/70">{count}</span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {showCategoryFilter && <Separator />}

      {/* 2. Material Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Material
        </h4>
        <div className="space-y-1.5">
          {AVAILABLE_MATERIALS.map((mat) => {
            const isChecked = filters.materials.includes(mat);
            const count = materialCounts ? materialCounts[mat] : undefined;

            return (
              <label
                key={mat}
                className="group flex cursor-pointer items-center justify-between rounded-md px-2 py-1 text-xs transition-colors hover:bg-secondary/60"
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isChecked}
                  onChange={() => toggleMaterial(mat)}
                />
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                      isChecked
                        ? "border-[#E87536] bg-[#E87536] text-white"
                        : "border-input group-hover:border-foreground/40"
                    )}
                  >
                    {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                  <span
                    className={cn(
                      isChecked
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {mat}
                  </span>
                </div>
                {count !== undefined && (
                  <span className="text-[11px] text-muted-foreground/70">{count}</span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* 3. Price Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Price Range (INR)
        </h4>

        {/* Presets */}
        <div className="flex flex-wrap gap-1.5">
          {PRICE_PRESETS.map((preset, idx) => {
            const isActive =
              filters.minPrice === preset.min && filters.maxPrice === preset.max;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => applyPricePreset(preset.min, preset.max)}
                className={cn(
                  "rounded border px-2 py-1 text-[11px] transition-colors",
                  isActive
                    ? "border-[#E87536] bg-[#E87536]/10 font-medium text-[#E87536]"
                    : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Inputs min / max */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label className="mb-1 block text-[10px] text-muted-foreground">
              Min Price
            </label>
            <Input
              type="number"
              placeholder="0"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-muted-foreground">
              Max Price
            </label>
            <Input
              type="number"
              placeholder="5000"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePriceApply}
          className="h-8 w-full border-border text-xs font-medium"
        >
          Apply Price Range
        </Button>
      </div>

      <Separator />

      {/* 4. Availability Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Availability
        </h4>
        <div className="space-y-1.5">
          {AVAILABLE_AVAILABILITIES.map((avail) => {
            const isChecked = filters.availabilities.includes(avail);
            const count = availabilityCounts ? availabilityCounts[avail] : undefined;

            return (
              <label
                key={avail}
                className="group flex cursor-pointer items-center justify-between rounded-md px-2 py-1 text-xs transition-colors hover:bg-secondary/60"
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isChecked}
                  onChange={() => toggleAvailability(avail)}
                />
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                      isChecked
                        ? "border-[#E87536] bg-[#E87536] text-white"
                        : "border-input group-hover:border-foreground/40"
                    )}
                  >
                    {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                  <span
                    className={cn(
                      isChecked
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {avail}
                  </span>
                </div>
                {count !== undefined && (
                  <span className="text-[11px] text-muted-foreground/70">{count}</span>
                )}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ProductFilterSidebar(props: ProductFiltersProps) {
  return (
    <aside className={cn("hidden w-64 shrink-0 lg:block", props.className)}>
      <div className="sticky top-24 rounded-lg border border-border bg-card p-5">
        <ProductFilterContent {...props} />
      </div>
    </aside>
  );
}

export interface ProductFilterDrawerProps extends ProductFiltersProps {
  activeCount?: number;
}

export function ProductFilterDrawer(props: ProductFilterDrawerProps) {
  const [open, setOpen] = React.useState(false);
  const activeCount = props.activeCount ?? 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative gap-2 border-border text-xs font-medium lg:hidden"
        >
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#E87536] text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] overflow-y-auto sm:w-[360px]">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-left text-base font-bold">
            Filter Products
          </SheetTitle>
        </SheetHeader>
        <ProductFilterContent
          {...props}
          onChange={(newFilters) => {
            props.onChange(newFilters);
          }}
          onReset={() => {
            props.onReset();
            setOpen(false);
          }}
        />
        <div className="mt-6 border-t border-border pt-4">
          <Button
            className="w-full bg-[#171717] text-white hover:bg-[#262626] dark:bg-[#FAFAF8] dark:text-[#171717]"
            onClick={() => setOpen(false)}
          >
            Show Results
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
