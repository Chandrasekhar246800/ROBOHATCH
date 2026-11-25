"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
}

export function ProductSearch({
  value,
  onChange,
  onSubmit,
  placeholder = "Search products, materials, categories...",
  className,
}: ProductSearchProps) {
  const [localValue, setLocalValue] = React.useState(value);

  // Sync with external value changes
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    onChange(val);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className={cn("relative flex w-full items-center", className)}>
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-9 w-full border-border bg-background pl-9 pr-8 text-xs placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-[#E87536]"
      />
      {localValue && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1.5 h-6 w-6 text-muted-foreground hover:text-foreground"
          aria-label="Clear search query"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
