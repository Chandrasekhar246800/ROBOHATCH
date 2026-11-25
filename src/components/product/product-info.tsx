"use client";

import * as React from "react";
import Link from "next/link";
import {
  Layers,
  Truck,
  ShieldCheck,
  PackageCheck,
  Minus,
  Plus,
  ShoppingBag,
  Check,
} from "lucide-react";
import { DemoProduct } from "@/data/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCart } from "@/features/cart";

export interface ProductInfoProps {
  product: DemoProduct;
  className?: string;
}

export function ProductInfo({ product, className }: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = React.useState<string | undefined>(
    product.colors && product.colors.length > 0 ? product.colors[0] : undefined
  );
  const [quantity, setQuantity] = React.useState<number>(1);

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const savings = hasDiscount ? product.compareAtPrice! - product.price : 0;
  const discountPercent = hasDiscount
    ? Math.round((savings / product.compareAtPrice!) * 100)
    : 0;

  const { addItem, openDrawer } = useCart();
  const [isAdding, setIsAdding] = React.useState(false);

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    if (isAdding) return;
    setIsAdding(true);

    const success = addItem(product.id, quantity, selectedColor);

    if (success) {
      toast.success("Added to your cart.", {
        description: `${product.name}${selectedColor ? ` · ${selectedColor}` : ""} (Qty: ${quantity})`,
        action: {
          label: "View Cart",
          onClick: () => openDrawer(),
        },
      });
    } else {
      toast.error("Could not add product to cart.", {
        description: "This item may be temporarily out of stock.",
      });
    }

    setTimeout(() => {
      setIsAdding(false);
    }, 350);
  };

  // Demonstration dispatch timeline based on availability
  const dispatchText =
    product.availability === "Made to Order"
      ? "Demonstration estimate: 4–6 business days (on-demand production)"
      : product.availability === "Low Stock"
        ? "Demonstration estimate: 2–3 business days (limited batch)"
        : "Demonstration estimate: 1–3 business days (standard handling)";

  return (
    <div className={cn("flex flex-col space-y-6", className)}>
      {/* 1. Category Navigation & Status Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/categories/${product.categorySlug}`}
          className="text-xs font-semibold uppercase tracking-wider text-[#E87536] transition-colors hover:text-[#d36427]"
        >
          {product.category}
        </Link>

        {product.badge && (
          <Badge variant="brand" className="text-[10px] uppercase tracking-wide">
            {product.badge}
          </Badge>
        )}

        <Badge
          variant="outline"
          className={cn(
            "border-border/80 bg-background/80 text-[10px] font-medium",
            product.availability === "In Stock" &&
              "border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
            product.availability === "Low Stock" &&
              "border-amber-500/30 text-amber-700 dark:text-amber-400",
            product.availability === "Made to Order" && "text-foreground"
          )}
        >
          <span
            className={cn(
              "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
              product.availability === "In Stock" && "bg-emerald-500",
              product.availability === "Low Stock" && "bg-amber-500",
              product.availability === "Made to Order" && "bg-[#E87536]"
            )}
          />
          {product.availability}
        </Badge>
      </div>

      {/* 2. Product Title & Social Proof (Demo) */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          {product.name}
        </h1>

        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <span className="text-[#E87536]">★</span>
            <span>{product.rating.toFixed(1)}</span>
          </div>
          <span className="text-muted-foreground/60">·</span>
          <span>{product.reviewsCount} verified reviews</span>
          <span className="text-muted-foreground/60">·</span>
          <span className="rounded bg-secondary/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            Demonstration preview
          </span>
        </div>
      </div>

      {/* 3. Pricing Display */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {formatCurrency(product.price)}
          </span>

          {hasDiscount && (
            <>
              <span className="text-lg text-muted-foreground line-through sm:text-xl">
                {formatCurrency(product.compareAtPrice!)}
              </span>
              <Badge variant="brand-subtle" className="text-xs font-semibold">
                Save {formatCurrency(savings)} ({discountPercent}% off)
              </Badge>
            </>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Demonstration pricing preview. No commercial transaction or shipping commitment
          is active.
        </p>
      </div>

      {/* 4. Short Editorial Statement */}
      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
        {product.shortDescription || product.description}
      </p>

      <Separator />

      {/* 5. Additive Material & Structural Attributes */}
      <div className="space-y-2">
        <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Material & Architecture
        </span>
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3.5 py-2.5 text-xs font-medium text-foreground">
          <Layers className="h-4 w-4 shrink-0 text-[#E87536]" />
          <span className="font-semibold">{product.material}</span>
          {product.dimensions && (
            <>
              <span className="text-muted-foreground/50">·</span>
              <span className="font-mono text-muted-foreground">
                {product.dimensions}
              </span>
            </>
          )}
          {product.weight && (
            <>
              <span className="text-muted-foreground/50">·</span>
              <span className="font-mono text-muted-foreground">{product.weight}</span>
            </>
          )}
        </div>
      </div>

      {/* 6. Color Selection (Minimum 44px Touch Targets) */}
      {product.colors && product.colors.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-muted-foreground">
              Colorway:
            </span>
            <span className="font-semibold text-foreground">{selectedColor}</span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {product.colors.map((color) => {
              const isSelected = selectedColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "inline-flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-medium transition-all active:scale-[0.98]",
                    isSelected
                      ? "shadow-xs border-[#E87536] bg-[#E87536]/10 text-[#E87536]"
                      : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  )}
                  aria-pressed={isSelected}
                  aria-label={`Select ${color} finish`}
                >
                  <span
                    className={cn(
                      "shadow-xs h-3 w-3 rounded-full border border-border/80",
                      color.toLowerCase().includes("black") ||
                        color.toLowerCase().includes("obsidian") ||
                        color.toLowerCase().includes("charcoal")
                        ? "bg-neutral-900"
                        : color.toLowerCase().includes("bone") ||
                            color.toLowerCase().includes("alabaster") ||
                            color.toLowerCase().includes("white")
                          ? "bg-neutral-100"
                          : color.toLowerCase().includes("grey") ||
                              color.toLowerCase().includes("slate")
                            ? "bg-neutral-500"
                            : color.toLowerCase().includes("amber")
                              ? "bg-amber-600"
                              : color.toLowerCase().includes("terracotta")
                                ? "bg-amber-800"
                                : "bg-[#E87536]"
                    )}
                  />
                  <span>{color}</span>
                  {isSelected && <Check className="ml-1 h-3.5 w-3.5 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Quantity & Add to Cart Controls (Primary Purchase Section) */}
      <div id="primary-purchase-section" className="space-y-3 pt-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Quantity Selector with 44px+ touch targets */}
          <div className="shadow-xs flex items-center rounded-lg border border-border bg-background">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className="h-12 min-h-[44px] w-12 min-w-[44px] text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="Decrease item quantity"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 select-none text-center text-sm font-semibold tabular-nums text-foreground">
              {quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleIncrement}
              className="h-12 min-h-[44px] w-12 min-w-[44px] text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Increase item quantity"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Add to Cart CTA */}
          <Button
            type="button"
            size="lg"
            onClick={handleAddToCart}
            disabled={isAdding}
            aria-label="Add to cart"
            className="shadow-xs min-h-[48px] flex-1 gap-2 rounded-lg bg-[#171717] px-6 text-sm font-semibold text-white transition-all hover:bg-[#262626] active:scale-[0.99] disabled:opacity-60 dark:bg-[#FAFAF8] dark:text-[#171717] dark:hover:bg-white"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>{isAdding ? "Adding..." : "Add to Cart"}</span>
          </Button>
        </div>

        <p className="text-center text-[11px] text-muted-foreground/80 sm:text-left">
          * Additive fabrication on demand. Items are added directly to your cart and
          stored locally.
        </p>
      </div>

      <Separator />

      {/* 8. Delivery, Craft & Quality Assurance Block */}
      <div className="space-y-3 rounded-xl border border-border bg-secondary/30 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Fulfillment & Assurance
          </span>
          <span className="rounded border border-border/60 bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            Demonstration preview
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
          <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
            <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#E87536]" />
            <div>
              <p className="font-semibold text-foreground">Estimated Dispatch</p>
              <p className="text-[11px] leading-tight text-muted-foreground">
                {dispatchText}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
            <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#E87536]" />
            <div>
              <p className="font-semibold text-foreground">Custom Foam Pack</p>
              <p className="text-[11px] leading-tight text-muted-foreground">
                Molded protective cradle
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#E87536]" />
            <div>
              <p className="font-semibold text-foreground">Physical QA</p>
              <p className="text-[11px] leading-tight text-muted-foreground">
                Inspected for layer adhesion and visual consistency
              </p>
            </div>
          </div>
        </div>

        <p className="pt-1 text-[10px] text-muted-foreground/75">
          * Notice: All timelines and fulfillment attributes are demonstration data only.
          RoboHatch does not imply confirmed shipping dates or dispatch commitments in
          this preview phase.
        </p>
      </div>
    </div>
  );
}
