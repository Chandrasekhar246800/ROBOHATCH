"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { MainContainer } from "@/components/layout";
import { Breadcrumb } from "@/components/common";
import { Button } from "@/components/ui/button";
import { useCart, CartItemRow, CartSummary, CartEmptyState } from "@/features/cart";

export function CartView() {
  const {
    items,
    isHydrated,
    itemCount,
    subtotalInPaise,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const isEmpty = items.length === 0;

  return (
    <MainContainer size="xl" className="space-y-8 py-6 sm:py-10">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Shopping Cart" }]} />

      {/* Page Title & Item Count */}
      <div className="flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Your Shopping Cart
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {!isHydrated
              ? "Loading your selected designs..."
              : isEmpty
                ? "Your cart is currently empty."
                : `Review your ${itemCount} ${itemCount === 1 ? "design" : "designs"} before proceeding.`}
          </p>
        </div>

        {isHydrated && !isEmpty && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearCart}
            className="gap-1.5 self-start text-xs text-muted-foreground hover:text-destructive sm:self-auto"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Entire Cart</span>
          </Button>
        )}
      </div>

      {/* Main Cart Body */}
      {!isHydrated ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-border border-t-[#E87536]" />
        </div>
      ) : isEmpty ? (
        <CartEmptyState />
      ) : (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Cart Items List (8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="shadow-xs rounded-xl border border-border bg-card p-4 sm:p-6">
              <div className="divide-y divide-border/60">
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onIncrease={increaseQuantity}
                    onDecrease={decreaseQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>

              {/* Continue Shopping Link */}
              <div className="mt-6 border-t border-border/60 pt-4">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Link href="/products">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Continue Browsing Products</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (4 cols) */}
          <div className="lg:sticky lg:top-24 lg:col-span-5 xl:col-span-4">
            <CartSummary totalItems={itemCount} subtotalInPaise={subtotalInPaise} />
          </div>
        </div>
      )}
    </MainContainer>
  );
}
