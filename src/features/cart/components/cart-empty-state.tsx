"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CartEmptyStateProps {
  onAction?: () => void;
  className?: string;
  isCompact?: boolean;
}

export function CartEmptyState({
  onAction,
  className,
  isCompact = false,
}: CartEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        isCompact ? "px-4 py-12" : "px-4 py-16 sm:py-24",
        className
      )}
    >
      {/* Icon Frame */}
      <div className="shadow-xs flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-[#F1F1EF] text-[#E87536] dark:bg-secondary/40 sm:h-20 sm:w-20">
        <ShoppingBag className="h-8 w-8 stroke-[1.75] sm:h-10 sm:w-10" />
      </div>

      {/* Heading & Copy */}
      <h3 className="mt-5 text-lg font-bold tracking-tight text-foreground sm:text-xl">
        Your Cart Is Empty
      </h3>
      <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground sm:text-sm">
        Explore our curated collection of precision 3D-printed geometric vessels, desk
        modules, and functional objects.
      </p>

      {/* Explore Collection Action Button */}
      <div className="mt-6">
        <Button
          asChild
          size="lg"
          onClick={onAction}
          className="shadow-xs gap-2 rounded-lg bg-[#171717] px-6 text-sm font-semibold text-white transition-all hover:bg-[#262626] active:scale-95 dark:bg-[#FAFAF8] dark:text-[#171717]"
        >
          <Link href="/products">
            <span>Explore Collection</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
