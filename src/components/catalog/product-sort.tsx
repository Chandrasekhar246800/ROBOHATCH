"use client";

import * as React from "react";
import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS, SortOption } from "@/lib/catalog/sort-products";
import { cn } from "@/lib/utils";

export interface ProductSortProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
}

export function ProductSort({ value, onChange, className }: ProductSortProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="hidden shrink-0 text-xs font-medium text-muted-foreground sm:inline-block">
        Sort by:
      </span>
      <Select value={value} onValueChange={(val) => onChange(val as SortOption)}>
        <SelectTrigger className="h-9 w-[180px] border-border bg-background text-xs sm:w-[190px]">
          <div className="flex items-center gap-1.5 truncate">
            <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <SelectValue placeholder="Sort products" />
          </div>
        </SelectTrigger>
        <SelectContent align="end">
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
