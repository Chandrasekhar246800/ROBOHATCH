import * as React from "react";
import Link from "next/link";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES_DATA } from "@/data/categories";
import { cn } from "@/lib/utils";

export interface CatalogEmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  resetHref?: string;
  showCategories?: boolean;
  className?: string;
}

export function CatalogEmptyState({
  title = "No products found",
  description = "No items match your active filters or search terms. Try refining your criteria or resetting filters.",
  onReset,
  resetHref,
  showCategories = true,
  className,
}: CatalogEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/60 p-8 text-center sm:p-12",
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground/80">
        <SlidersHorizontal className="h-6 w-6 stroke-[1.5]" />
      </div>

      <h3 className="text-lg font-semibold text-foreground sm:text-xl">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      {/* Reset Action */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onReset && (
          <Button
            variant="default"
            size="sm"
            onClick={onReset}
            className="gap-2 bg-[#E87536] text-white hover:bg-[#d36427]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset All Filters
          </Button>
        )}
        {resetHref && (
          <Button
            variant="default"
            size="sm"
            asChild
            className="gap-2 bg-[#E87536] text-white hover:bg-[#d36427]"
          >
            <Link href={resetHref}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset All Filters
            </Link>
          </Button>
        )}
      </div>

      {/* Suggested Categories */}
      {showCategories && (
        <div className="mt-10 w-full max-w-lg border-t border-border/40 pt-8">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Suggested Categories
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES_DATA.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="inline-flex items-center rounded-md border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-[#E87536]/50 hover:bg-[#E87536]/10 hover:text-[#E87536]"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
