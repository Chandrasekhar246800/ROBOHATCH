"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Info,
  ArrowRight,
  Truck,
  CheckCircle2,
  Receipt,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPaise } from "@/features/cart/lib/cart-utils";
import { toast } from "sonner";
import type { CheckoutAddress } from "../types/checkout-types";
import type { ShippingDetails } from "@/features/pricing";

interface CheckoutSummaryProps {
  subtotalInPaise: number;
  itemCount: number;
  selectedAddress: CheckoutAddress | null;
  hasUnavailableItems: boolean;
  isEmpty: boolean;
  taxableAmountInPaise?: number;
  gstAmountInPaise?: number;
  taxBreakdown?: {
    cgstTotalPaise: number;
    sgstTotalPaise: number;
    igstTotalPaise: number;
    isInterState: boolean;
    hasUnconfiguredTax: boolean;
  };
  shippingDetails?: ShippingDetails;
  isPayable?: boolean;
  payableAmountInPaise?: number | null;
  isServerCalculating?: boolean;
  onProceedToPayment?: () => void;
  isPaymentProcessing?: boolean;
}

export function CheckoutSummary({
  subtotalInPaise,
  itemCount,
  selectedAddress,
  hasUnavailableItems,
  isEmpty,
  taxableAmountInPaise,
  gstAmountInPaise,
  taxBreakdown,
  shippingDetails,
  isPayable = false,
  payableAmountInPaise = null,
  isServerCalculating = false,
  onProceedToPayment,
  isPaymentProcessing = false,
}: CheckoutSummaryProps) {
  const isAddressSelected = Boolean(selectedAddress);
  const isActionDisabled =
    isEmpty ||
    hasUnavailableItems ||
    !isAddressSelected ||
    !isPayable ||
    isPaymentProcessing;

  const handleProceedClick = () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address", {
        description: "Choose an existing address or add a new delivery destination.",
      });
      return;
    }

    if (!isPayable) {
      toast.error("Checkout Not Payable", {
        description:
          "Order pricing is not currently payable because tax classification or shipping rules require verification.",
      });
      return;
    }

    if (onProceedToPayment) {
      onProceedToPayment();
      return;
    }

    toast.info("Delivery Address Confirmed", {
      description: `Shipping to ${selectedAddress.fullName} in ${selectedAddress.city}. Payment processing ready.`,
      icon: <CheckCircle2 className="h-4 w-4 text-[#E87536]" />,
    });
  };

  const isShippingConfigured = Boolean(
    shippingDetails?.isConfigured && shippingDetails.amountInPaise !== null
  );

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">Order Summary</h2>
        {isServerCalculating && (
          <span className="animate-pulse font-mono text-[10px] text-muted-foreground">
            Reconciling with server...
          </span>
        )}
      </div>

      <div className="mt-4 space-y-3 text-xs sm:text-sm">
        {/* Preliminary Subtotal (GST Inclusive) */}
        <div className="flex items-center justify-between text-muted-foreground">
          <span>
            Preliminary Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
          <span className="font-mono font-semibold text-foreground">
            {formatPaise(subtotalInPaise)}
          </span>
        </div>

        {/* GST Inclusion Disclosure */}
        <div className="rounded-lg bg-secondary/50 p-2.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Receipt className="h-3.5 w-3.5 text-[#E87536]" />
            <span>GST-Inclusive Pricing</span>
          </div>
          <p className="mt-1 leading-relaxed">
            All catalogue prices include applicable GST. Tax is extracted from the price,
            not added on top.
          </p>
          {gstAmountInPaise !== undefined && gstAmountInPaise > 0 && (
            <div className="mt-2 space-y-1 border-t border-border/60 pt-1.5 font-mono text-[10px]">
              <div className="flex justify-between text-muted-foreground">
                <span>Taxable Value:</span>
                <span>{formatPaise(taxableAmountInPaise || 0)}</span>
              </div>
              {taxBreakdown?.isInterState ? (
                <div className="flex justify-between text-muted-foreground">
                  <span>Integrated GST (IGST):</span>
                  <span>{formatPaise(gstAmountInPaise)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Central GST (CGST):</span>
                    <span>{formatPaise(taxBreakdown?.cgstTotalPaise || 0)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>State GST (SGST):</span>
                    <span>{formatPaise(taxBreakdown?.sgstTotalPaise || 0)}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Shipping Line */}
        <div className="flex items-start justify-between gap-2 text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-muted-foreground/70" />
            <span>Shipping</span>
          </div>
          {isShippingConfigured ? (
            <span className="font-mono font-semibold text-foreground">
              {formatPaise(shippingDetails!.amountInPaise!)}
            </span>
          ) : (
            <span className="text-right text-[11px] font-medium italic text-muted-foreground/80 sm:text-xs">
              Calculated in the next checkout step.
            </span>
          )}
        </div>

        {/* Taxes Line */}
        <div className="flex items-start justify-between gap-2 text-muted-foreground">
          <span>Estimated Taxes (GST)</span>
          <span className="text-right text-[11px] font-medium italic text-muted-foreground/80 sm:text-xs">
            {gstAmountInPaise && gstAmountInPaise > 0
              ? `Included (${formatPaise(gstAmountInPaise)})`
              : "Calculated in the next checkout step."}
          </span>
        </div>

        {/* Final Payable Total Line */}
        <div className="border-t border-border pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-foreground">Total Payable</span>
            {isPayable && payableAmountInPaise !== null ? (
              <span className="font-mono text-base font-bold text-foreground">
                {formatPaise(payableAmountInPaise)}
              </span>
            ) : (
              <span className="text-right text-xs italic text-muted-foreground">
                Final total pending shipping configuration
              </span>
            )}
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground/70">
            {isPayable
              ? "All taxes and shipping finalized. Ready for payment capture in Phase 7D."
              : "* Final order payable total is finalized once shipping configuration is confirmed."}
          </p>
        </div>

        {/* Selected Address Indicator */}
        <div className="rounded-lg border border-border/80 bg-secondary/40 p-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-[#E87536]" />
            <span>Delivery Destination:</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            {selectedAddress ? (
              <span className="font-medium text-foreground/90">
                {selectedAddress.fullName} – {selectedAddress.city},{" "}
                {selectedAddress.postalCode}
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">
                No delivery address selected. Please select an address above.
              </span>
            )}
          </p>
        </div>

        {/* Explanatory Policy Disclosure */}
        <div className="flex items-start gap-2 text-[11px] text-muted-foreground/80">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
          <p>
            RoboHatch uses server-authoritative GST-inclusive calculation. Prices are
            verified against the manufacturing registry.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="pt-2">
          <Button
            type="button"
            onClick={handleProceedClick}
            disabled={isActionDisabled}
            className="w-full gap-2 bg-[#171717] py-5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-[#171717] dark:hover:bg-neutral-200 sm:text-sm"
          >
            {isPaymentProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#E87536]" />
                <span>Preparing Payment...</span>
              </>
            ) : isPayable && payableAmountInPaise !== null ? (
              <>
                <span>Pay {formatPaise(payableAmountInPaise)} with Razorpay</span>
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Proceed to Payment</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          {/* Test Mode Indicator Badge */}
          <div className="mt-3 flex items-center justify-center gap-1.5 rounded-md border border-amber-500/25 bg-amber-500/10 px-2.5 py-1.5 text-center text-[10px] font-medium text-amber-800 dark:text-amber-400">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            <span>Razorpay Test Mode &mdash; No real funds will be charged</span>
          </div>

          {!isAddressSelected && !isEmpty && (
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Select or add a delivery address to continue
            </p>
          )}

          {isAddressSelected && !isPayable && !isEmpty && (
            <p className="mt-2 text-center text-[11px] text-amber-700 dark:text-amber-400">
              Payment is unavailable: Tax classification or shipping is unverified.
            </p>
          )}
        </div>

        {/* Secondary Navigation Links */}
        <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
          <Link href="/cart" className="hover:text-foreground hover:underline">
            Return to Cart
          </Link>
          <Link href="/products" className="hover:text-foreground hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
