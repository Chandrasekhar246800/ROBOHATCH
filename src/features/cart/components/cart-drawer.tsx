"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "../store/cart-store";
import { CartItemRow } from "./cart-item";
import { CartEmptyState } from "./cart-empty-state";
import { formatPaise } from "../lib/cart-utils";

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    itemCount,
    subtotalInPaise,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const handleCheckoutDemo = () => {
    closeDrawer();
    router.push("/checkout");
  };

  return (
    <Sheet
      open={isDrawerOpen}
      onOpenChange={(open) => (!open ? closeDrawer() : undefined)}
    >
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col justify-between p-0 sm:max-w-md"
        aria-describedby="cart-drawer-description"
      >
        {/* Drawer Header */}
        <div className="border-b border-border p-4 sm:p-5">
          <SheetHeader className="space-y-1 text-left">
            <div className="flex items-center justify-between pr-8">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-[#E87536]" />
                <SheetTitle className="text-base font-bold text-foreground sm:text-lg">
                  Shopping Cart
                </SheetTitle>
              </div>

              {itemCount > 0 && (
                <span className="rounded-full bg-secondary/80 px-2.5 py-0.5 text-xs font-semibold text-foreground">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              )}
            </div>

            <SheetDescription
              id="cart-drawer-description"
              className="text-xs text-muted-foreground"
            >
              Review your selected 3D-printed items before proceeding.
            </SheetDescription>
          </SheetHeader>

          {items.length > 0 && (
            <div className="mt-2 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear All</span>
              </Button>
            </div>
          )}
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5">
          {items.length === 0 ? (
            <CartEmptyState onAction={closeDrawer} isCompact />
          ) : (
            <div className="divide-y divide-border/60">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  compact
                  onIncrease={increaseQuantity}
                  onDecrease={decreaseQuantity}
                  onRemove={removeItem}
                  onItemClick={closeDrawer}
                />
              ))}
            </div>
          )}
        </div>

        {/* Drawer Sticky Footer (when items exist) */}
        {items.length > 0 && (
          <div className="border-t border-border bg-background p-4 sm:p-5">
            {/* Subtotal & Logistics Notice */}
            <div className="space-y-1.5 pb-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-muted-foreground">
                  Subtotal
                </span>
                <span className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                  {formatPaise(subtotalInPaise)}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Shipping rates and taxes calculated at checkout.
              </p>
            </div>

            <Separator className="my-2" />

            {/* Actions: View Cart & Checkout */}
            <div className="flex flex-col gap-2 pt-2">
              <Button
                type="button"
                size="lg"
                onClick={handleCheckoutDemo}
                className="shadow-xs w-full gap-2 rounded-lg bg-[#171717] py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#262626] active:scale-[0.99] dark:bg-[#FAFAF8] dark:text-[#171717]"
              >
                <span>Proceed to Checkout (Demo)</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  onClick={closeDrawer}
                  className="flex-1 text-xs"
                >
                  <Link href="/cart">View Full Cart</Link>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={closeDrawer}
                  className="flex-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
