"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Package, Lock } from "lucide-react";
import { formatPaise } from "../lib/cart-utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface CartSummaryProps {
  totalItems: number;
  subtotalInPaise: number;
  isCompact?: boolean;
  onCheckoutClick?: () => void;
  className?: string;
}

export function CartSummary({
  totalItems,
  subtotalInPaise,
  isCompact = false,
  onCheckoutClick,
  className,
}: CartSummaryProps) {
  const router = useRouter();

  const handleProceedToCheckout = () => {
    if (onCheckoutClick) {
      onCheckoutClick();
      return;
    }
    router.push("/checkout");
  };

  return (
    <div
      className={cn(
        "shadow-xs rounded-xl border border-border bg-card p-5 sm:p-6",
        className
      )}
    >
      <h3 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
        Order Summary
      </h3>

      <div className="mt-4 space-y-3 text-sm">
        {/* Total Items Count */}
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Total Items</span>
          <span className="font-semibold text-foreground">{totalItems}</span>
        </div>

        {/* Subtotal */}
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-bold text-foreground">
            {formatPaise(subtotalInPaise)}
          </span>
        </div>

        {/* Shipping Notice */}
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Estimated Shipping</span>
          <span className="text-xs italic text-muted-foreground">
            Calculated at checkout
          </span>
        </div>

        {/* Tax Notice */}
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Estimated GST / Tax</span>
          <span className="text-xs italic text-muted-foreground">To be confirmed</span>
        </div>

        <Separator className="my-3" />

        {/* Subtotal Total Line */}
        <div className="flex items-baseline justify-between text-base">
          <span className="font-bold text-foreground">Estimated Subtotal</span>
          <span className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {formatPaise(subtotalInPaise)}
          </span>
        </div>

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          * Final delivery charges, regional carrier transit rates, and GST taxes will be
          calculated during checkout based on the delivery destination.
        </p>
      </div>

      {/* Checkout Action Button */}
      <div className="mt-6 space-y-2.5">
        <Button
          type="button"
          size="lg"
          onClick={handleProceedToCheckout}
          disabled={totalItems === 0}
          className="shadow-xs w-full gap-2 rounded-lg bg-[#171717] py-3 text-sm font-semibold text-white transition-all hover:bg-[#262626] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#FAFAF8] dark:text-[#171717]"
        >
          <Lock className="h-4 w-4" />
          <span>Proceed to Checkout (Demo)</span>
          <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="text-center text-[11px] text-muted-foreground/80">
          Payment processing & carrier checkout will be enabled in Phase 6.
        </p>
      </div>

      {/* Trust Badges */}
      {!isCompact && (
        <div className="mt-6 space-y-3 border-t border-border/60 pt-5">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#E87536]" />
            <div>
              <p className="font-semibold text-foreground">
                Precision Quality Inspection
              </p>
              <p className="text-[11px]">
                Each part is visually checked for layer consistency.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Package className="mt-0.5 h-4 w-4 shrink-0 text-[#E87536]" />
            <div>
              <p className="font-semibold text-foreground">Custom Foam Packaging</p>
              <p className="text-[11px]">
                Engineered protective cradles for delicate geometries.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
