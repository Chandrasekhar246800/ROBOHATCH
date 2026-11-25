"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PRODUCTS_DATA } from "@/data/products";
import { CATEGORIES_DATA } from "@/data/categories";
import { formatCurrency } from "@/lib/utils";

export interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  // Keyboard shortcut Ctrl+K / Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    onOpenChange(false);
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/search");
    }
  };

  // Instant matching preview (up to 4 products)
  const matches = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return PRODUCTS_DATA.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q)
    ).slice(0, 4);
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden border-border bg-background p-0 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Search Products</DialogTitle>
        </DialogHeader>

        {/* Search Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center border-b border-border px-4 py-3"
        >
          <Search className="mr-3 h-5 w-5 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, materials, or collections... (Press Enter)"
            className="h-10 border-0 bg-transparent px-0 text-sm shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {/* Results / Suggestions Dropdown View */}
        <div className="max-h-[380px] space-y-4 overflow-y-auto p-4">
          {matches.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Matching Products
              </span>
              <div className="space-y-1">
                {matches.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-secondary/70"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-border/60 bg-secondary/50">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground transition-colors group-hover:text-[#E87536]">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {product.category} · {product.material}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-foreground">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* View all results link */}
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="mt-2 flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold text-[#E87536] hover:underline"
              >
                <span>View all results for &ldquo;{query}&rdquo;</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : query.trim() ? (
            <div className="space-y-2 py-6 text-center text-xs text-muted-foreground">
              <p>No instant matches found for &ldquo;{query}&rdquo;</p>
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="inline-flex items-center gap-1 font-medium text-[#E87536] hover:underline"
              >
                Search full catalogue <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Popular Categories
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES_DATA.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      onClick={() => onOpenChange(false)}
                      className="rounded border border-border bg-secondary/40 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-[#E87536]/40 hover:text-foreground"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Engineering Materials
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["Carbon PETG", "Matte PLA", "Tough Resin", "Industrial ABS"].map(
                    (mat) => (
                      <Link
                        key={mat}
                        href={`/products?material=${encodeURIComponent(mat)}`}
                        onClick={() => onOpenChange(false)}
                        className="rounded border border-border bg-secondary/40 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-[#E87536]/40 hover:text-foreground"
                      >
                        {mat}
                      </Link>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
