"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPaise } from "@/features/cart/lib/cart-utils";
import type { ValidatedCheckoutItem } from "../types/checkout-types";

interface OrderReviewProps {
  items: ValidatedCheckoutItem[];
}

export function OrderReview({ items }: OrderReviewProps) {
  return (
    <section
      aria-labelledby="order-review-heading"
      className="space-y-4 border-t border-border pt-4"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#171717] text-xs font-bold text-white dark:bg-white dark:text-[#171717]">
            2
          </div>
          <h2
            id="order-review-heading"
            className="text-base font-bold text-foreground sm:text-lg"
          >
            Review Order Items ({items.length})
          </h2>
        </div>

        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-1.5 self-start text-xs text-muted-foreground hover:text-foreground sm:self-auto"
        >
          <Link href="/cart">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Modify Cart</span>
          </Link>
        </Button>
      </div>

      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3.5 p-3.5 sm:gap-4 sm:p-4">
            {/* Thumbnail */}
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary/50 sm:h-20 sm:w-20">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 64px, 80px"
                className="object-cover"
              />
            </div>

            {/* Item Details */}
            <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate text-xs font-bold text-foreground sm:text-sm">
                    {item.name}
                  </h3>
                  <span className="shrink-0 font-mono text-xs font-bold text-foreground sm:text-sm">
                    {formatPaise(item.lineTotalInPaise)}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground sm:text-xs">
                  {item.selectedColor && (
                    <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 font-medium text-foreground/80">
                      <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                      {item.selectedColor}
                    </span>
                  )}
                  <span>•</span>
                  <span>{item.material}</span>
                  <span>•</span>
                  <Badge
                    variant="outline"
                    className="h-4 border-border px-1 text-[10px] font-normal uppercase text-muted-foreground"
                  >
                    {item.availability}
                  </Badge>
                </div>
              </div>

              {/* Quantity and Unit Price */}
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono text-[11px]">Qty: {item.quantity}</span>
                <span className="text-[11px] text-muted-foreground/80">
                  {formatPaise(item.unitPriceInPaise)} each
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
