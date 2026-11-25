import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  // Generate page numbers with window
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("ellipsis");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1.5 sm:gap-2", className)}
    >
      <Button
        variant="outline"
        size="sm"
        disabled={!canPrev}
        onClick={() => onPageChange(currentPage - 1)}
        className="gap-1 border-border px-2.5 text-xs sm:px-3"
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      <div className="flex items-center gap-1">
        {pages.map((p, idx) => {
          if (p === "ellipsis") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="select-none px-2 text-xs text-muted-foreground"
              >
                …
              </span>
            );
          }

          const isCurrent = p === currentPage;
          return (
            <Button
              key={p}
              variant={isCurrent ? "default" : "outline"}
              size="icon"
              className={cn(
                "h-8 w-8 text-xs font-medium transition-colors",
                isCurrent
                  ? "bg-[#171717] text-white hover:bg-[#262626] dark:bg-[#FAFAF8] dark:text-[#171717]"
                  : "border-border text-foreground hover:bg-secondary"
              )}
              onClick={() => onPageChange(p)}
              aria-current={isCurrent ? "page" : undefined}
              aria-label={`Page ${p}`}
            >
              {p}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={!canNext}
        onClick={() => onPageChange(currentPage + 1)}
        className="gap-1 border-border px-2.5 text-xs sm:px-3"
        aria-label="Go to next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
