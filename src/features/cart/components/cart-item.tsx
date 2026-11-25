"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem as CartItemType } from "../types";
import { formatPaise } from "../lib/cart-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface CartItemProps {
  item: CartItemType;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
  onItemClick?: () => void;
  compact?: boolean;
  className?: string;
}

export function CartItemRow({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  onItemClick,
  compact = false,
  className,
}: CartItemProps) {
  const lineTotal = item.priceInPaise * item.quantity;

  return (
    <div
      className={cn(
        "flex items-start gap-3.5 border-b border-border/60 py-4 transition-colors last:border-b-0",
        compact ? "py-3" : "py-4 sm:py-5",
        className
      )}
    >
      {/* Product Image Thumbnail */}
      <Link
        href={`/products/${item.slug}`}
        onClick={onItemClick}
        className={cn(
          "relative shrink-0 overflow-hidden rounded-lg border border-border bg-[#F1F1EF] transition-opacity hover:opacity-90 dark:bg-secondary/40",
          compact ? "h-16 w-16" : "h-20 w-20 sm:h-24 sm:w-24"
        )}
        aria-label={`View details for ${item.name}`}
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes={compact ? "64px" : "96px"}
          className="object-cover object-center"
        />
      </Link>

      {/* Item Details Column */}
      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
        <div>
          {/* Title & Remove Button Row */}
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/products/${item.slug}`}
              onClick={onItemClick}
              className="line-clamp-1 text-sm font-semibold text-foreground transition-colors hover:text-[#E87536]"
            >
              {item.name}
            </Link>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(item.id)}
              className={cn(
                "shrink-0 text-muted-foreground transition-colors hover:text-destructive",
                compact
                  ? "h-8 min-h-[36px] w-8 min-w-[36px]"
                  : "h-11 min-h-[44px] w-11 min-w-[44px]"
              )}
              aria-label={`Remove ${item.name} from cart`}
            >
              <Trash2 className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
            </Button>
          </div>

          {/* Colorway & Material Badges */}
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {item.selectedColor && (
              <Badge
                variant="outline"
                className="border-border/80 bg-secondary/30 px-1.5 py-0 text-[10px] font-normal"
              >
                Color: {item.selectedColor}
              </Badge>
            )}
            <span className="text-[11px] text-muted-foreground/80">{item.material}</span>
          </div>
        </div>

        {/* Pricing & Quantity Row */}
        <div className="mt-3 flex items-center justify-between gap-2">
          {/* Quantity Stepper (Strictly meets 44x44px touch target on Cart Page) */}
          <div className="shadow-xs flex items-center rounded-md border border-border bg-background">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onDecrease(item.id)}
              disabled={item.quantity <= 1}
              className={cn(
                "text-muted-foreground transition-colors hover:text-foreground disabled:opacity-25",
                compact
                  ? "h-8 min-h-[36px] w-8 min-w-[36px]"
                  : "h-11 min-h-[44px] w-11 min-w-[44px]"
              )}
              aria-label={`Decrease quantity of ${item.name}`}
            >
              <Minus className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
            </Button>

            <span
              className={cn(
                "select-none text-center font-semibold tabular-nums text-foreground",
                compact ? "w-8 text-xs" : "w-10 text-sm"
              )}
            >
              {item.quantity}
            </span>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onIncrease(item.id)}
              className={cn(
                "text-muted-foreground transition-colors hover:text-foreground",
                compact
                  ? "h-8 min-h-[36px] w-8 min-w-[36px]"
                  : "h-11 min-h-[44px] w-11 min-w-[44px]"
              )}
              aria-label={`Increase quantity of ${item.name}`}
            >
              <Plus className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
            </Button>
          </div>

          {/* Line Item Total */}
          <div className="text-right">
            <span className="block text-sm font-bold text-foreground">
              {formatPaise(lineTotal)}
            </span>
            {item.quantity > 1 && (
              <span className="block text-[10px] text-muted-foreground">
                {formatPaise(item.priceInPaise)} each
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
