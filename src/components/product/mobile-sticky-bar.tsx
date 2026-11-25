"use client";

import * as React from "react";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { DemoProduct } from "@/data/products";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCart } from "@/features/cart";

export interface MobileStickyBarProps {
  product: DemoProduct;
  className?: string;
}

export function MobileStickyBar({ product, className }: MobileStickyBarProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Observe the primary purchase section on the page
    const target = document.getElementById("primary-purchase-section");

    if (!target) {
      // Fallback: Show sticky bar after scrolling past 400px if element not found
      const handleScroll = () => {
        setIsVisible(window.scrollY > 450);
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // When the primary CTA scrolls up and out of the viewport, show sticky bar
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      {
        threshold: 0,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const { addItem, openDrawer } = useCart();
  const [isAdding, setIsAdding] = React.useState(false);

  const handleAddToCart = () => {
    if (isAdding) return;
    setIsAdding(true);

    const success = addItem(product.id, 1);

    if (success) {
      toast.success("Added to your cart.", {
        description: `${product.name} (Qty: 1)`,
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

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <aside
      aria-label="Mobile quick purchase bar"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md transition-transform duration-300 ease-in-out lg:hidden",
        "px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-lg",
        isVisible ? "translate-y-0" : "pointer-events-none translate-y-full",
        className
      )}
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        {/* Product Thumbnail & Details */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-[#F1F1EF] dark:bg-secondary/40">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="44px"
              className="object-cover object-center"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground sm:text-sm">
              {product.name}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-bold text-foreground sm:text-sm">
                {formatCurrency(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-[10px] text-muted-foreground line-through">
                  {formatCurrency(product.compareAtPrice!)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Add to Cart CTA (Minimum 44px touch target) */}
        <Button
          type="button"
          size="sm"
          onClick={handleAddToCart}
          disabled={isAdding}
          className="shadow-xs h-11 min-h-[44px] shrink-0 gap-1.5 rounded-lg bg-[#171717] px-3 text-xs font-semibold text-white transition-all active:scale-95 disabled:opacity-60 dark:bg-[#FAFAF8] dark:text-[#171717] sm:px-4"
        >
          <ShoppingBag className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">
            {isAdding ? "Adding..." : "Add to Cart"}
          </span>
        </Button>
      </div>
    </aside>
  );
}
