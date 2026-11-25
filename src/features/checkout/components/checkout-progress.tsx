"use client";

import * as React from "react";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";

interface CheckoutProgressProps {
  currentStep?: 1 | 2 | 3;
}

export function CheckoutProgress({ currentStep = 2 }: CheckoutProgressProps) {
  const isStep2 = currentStep === 2;
  const isStep3 = currentStep === 3;

  return (
    <nav aria-label="Checkout Progress" className="border-b border-border pb-4">
      <ol className="flex flex-wrap items-center gap-2 text-xs font-medium sm:gap-3 sm:text-sm">
        {/* Step 1: Cart */}
        <li className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground">
          <Link href="/cart" className="flex items-center gap-1.5 focus:outline-none">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#171717] text-[10px] text-white dark:bg-white dark:text-[#171717]">
              <Check className="h-3 w-3 stroke-[2.5]" />
            </span>
            <span>Cart</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        </li>

        {/* Step 2: Delivery & Review */}
        <li
          className={`flex items-center gap-1.5 ${
            isStep2 ? "font-semibold text-foreground" : "text-muted-foreground"
          }`}
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
              isStep2
                ? "bg-[#E87536] font-bold text-white"
                : isStep3
                  ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717]"
                  : "border border-border bg-muted/40"
            }`}
          >
            {isStep3 ? <Check className="h-3 w-3 stroke-[2.5]" /> : "2"}
          </span>
          <span className={isStep2 ? "text-[#171717] dark:text-white" : ""}>
            Delivery & Order Review
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        </li>

        {/* Step 3: Payment */}
        <li
          className={`flex items-center gap-1.5 ${
            isStep3 ? "font-semibold text-foreground" : "text-muted-foreground/70"
          }`}
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
              isStep3
                ? "bg-[#E87536] font-bold text-white"
                : "border border-border bg-muted/40"
            }`}
          >
            3
          </span>
          <span>Payment</span>
        </li>
      </ol>
    </nav>
  );
}
