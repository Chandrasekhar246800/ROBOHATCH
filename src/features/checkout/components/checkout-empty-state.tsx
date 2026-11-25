"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CheckoutEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center sm:p-16">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        <ShoppingBag className="h-7 w-7 stroke-[1.5]" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-foreground sm:text-xl">
        Your Cart is Empty
      </h2>
      <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
        You need at least one 3D-printed fabrication in your cart before proceeding to
        checkout. Explore our curated collection of architectural desk accessories and
        kinetic objects.
      </p>
      <div className="mt-6 flex justify-center">
        <Button
          asChild
          size="sm"
          className="gap-2 bg-[#171717] px-6 text-xs font-semibold text-white hover:bg-black dark:bg-white dark:text-[#171717] dark:hover:bg-neutral-200"
        >
          <Link href="/products">
            <span>Explore Catalogue</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#E87536]" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
