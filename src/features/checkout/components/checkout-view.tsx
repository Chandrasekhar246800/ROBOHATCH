"use client";

import * as React from "react";
import { useCart } from "@/features/cart/store/cart-store";
import { validateCheckoutCart } from "../lib/checkout-validation";
import { calculateCheckoutPricingAction } from "@/features/pricing";
import type { CheckoutPricingResult } from "@/features/pricing";
import { CheckoutProgress } from "./checkout-progress";
import { AddressSelection } from "./address-selection";
import { OrderReview } from "./order-review";
import { CheckoutSummary } from "./checkout-summary";
import { CheckoutEmptyState } from "./checkout-empty-state";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { CheckoutAddress } from "../types/checkout-types";
import { useRazorpay } from "@/features/payment";
import type { VerifyPaymentResult } from "@/features/payment";

interface CheckoutViewProps {
  initialAddresses: CheckoutAddress[];
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
  };
}

export function CheckoutView({ initialAddresses }: CheckoutViewProps) {
  const { items: rawCartItems, isHydrated } = useCart();

  const [addresses, setAddresses] = React.useState<CheckoutAddress[]>(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string | null>(() => {
    const defaultAddr = initialAddresses.find((a) => a.isDefault);
    return defaultAddr ? defaultAddr.id : initialAddresses[0]?.id || null;
  });

  const [serverPricing, setServerPricing] = React.useState<CheckoutPricingResult | null>(
    null
  );
  const [isServerCalculating, setIsServerCalculating] = React.useState(false);
  const [paymentSuccessResult, setPaymentSuccessResult] =
    React.useState<VerifyPaymentResult | null>(null);

  const { processCheckoutPayment, isProcessing: isPaymentProcessing } = useRazorpay({
    onSuccess: (result) => {
      setPaymentSuccessResult(result);
    },
  });

  // Client-side fallback / preliminary cart validation
  const validation = React.useMemo(() => {
    return validateCheckoutCart(rawCartItems);
  }, [rawCartItems]);

  const selectedAddress = React.useMemo(() => {
    return addresses.find((a) => a.id === selectedAddressId) || null;
  }, [addresses, selectedAddressId]);

  const handleProceedToPayment = React.useCallback(() => {
    if (!selectedAddressId) return;

    const paymentItems = validation.items.map((item) => ({
      productId: item.productId,
      color: item.selectedColor,
      quantity: item.quantity,
    }));

    processCheckoutPayment({
      items: paymentItems,
      deliveryAddressId: selectedAddressId,
    });
  }, [selectedAddressId, validation.items, processCheckoutPayment]);

  // Server-authoritative pricing reconciliation
  React.useEffect(() => {
    if (!rawCartItems || rawCartItems.length === 0) {
      setServerPricing(null);
      return;
    }

    let isCancelled = false;
    setIsServerCalculating(true);

    const payload = {
      items: rawCartItems.map((item) => ({
        productId: item.productId,
        color: item.selectedColor,
        quantity: item.quantity,
      })),
      deliveryAddressId: selectedAddressId || undefined,
    };

    calculateCheckoutPricingAction(payload)
      .then((res) => {
        if (!isCancelled && res.success && res.pricing) {
          setServerPricing(res.pricing);
        }
      })
      .catch((err) => {
        console.error("[CheckoutView] Server pricing calculation error:", err);
      })
      .finally(() => {
        if (!isCancelled) {
          setIsServerCalculating(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [rawCartItems, selectedAddressId]);

  // Loading skeleton while client cart hydrates from localStorage
  if (!isHydrated) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-3">
        <Loader2 className="h-7 w-7 animate-spin text-[#E87536]" />
        <p className="font-mono text-xs text-muted-foreground">
          Loading secure checkout session...
        </p>
      </div>
    );
  }

  // Handle empty cart state
  if (validation.isEmpty) {
    return (
      <div className="space-y-6">
        <CheckoutProgress currentStep={1} />
        <CheckoutEmptyState />
      </div>
    );
  }

  const effectiveSubtotalInPaise = serverPricing
    ? serverPricing.subtotalInPaise
    : validation.subtotalInPaise;

  const effectiveItemCount = serverPricing
    ? serverPricing.itemCount
    : validation.itemCount;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Checkout Progress Stepper */}
      <CheckoutProgress currentStep={2} />

      {/* Payment Success Banner (Test Mode Verified) */}
      {paymentSuccessResult && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-950 dark:text-emerald-200">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold">
              Payment Signature Verified &mdash; Order #{paymentSuccessResult.orderNumber}
            </h3>
            <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
              Your test transaction signature was verified (
              {paymentSuccessResult.providerStatus === "captured"
                ? "Captured"
                : "Authorized"}
              ). Payment attempt ID:{" "}
              <span className="font-mono font-medium">
                {paymentSuccessResult.paymentId}
              </span>
              . In accordance with Phase 7D lifecycle boundaries, Order Status strictly
              remains <span className="font-semibold">PENDING</span>.
            </p>
            <p className="text-[11px] text-muted-foreground">
              Note: Final order confirmation, trusted payment-state reconciliation, and
              fulfillment transitions are scheduled for Phase 7E.
            </p>
          </div>
        </div>
      )}

      {/* Unavailable Items Warning (if any product is out of stock) */}
      {(validation.hasUnavailableItems || (serverPricing && !serverPricing.success)) && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            <p className="font-semibold">
              Notice: Certain items are currently unavailable
            </p>
            <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400/90">
              {serverPricing?.validationErrors?.[0]?.message || (
                <>
                  The following products in your cart are out of stock or discontinued:{" "}
                  <span className="font-medium underline">
                    {validation.unavailableNames.join(", ")}
                  </span>
                  . Please update your cart to proceed.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Main Two-Column Checkout Layout */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Left Column (Address Selection & Order Review) */}
        <div className="space-y-8 lg:col-span-7 xl:col-span-8">
          <AddressSelection
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            onSelectAddress={(addr) => setSelectedAddressId(addr.id)}
            onAddressListChange={(updatedList) => setAddresses(updatedList)}
          />

          <OrderReview items={validation.items} />
        </div>

        {/* Right Column (Sticky Order Summary) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <CheckoutSummary
            subtotalInPaise={effectiveSubtotalInPaise}
            itemCount={effectiveItemCount}
            selectedAddress={selectedAddress}
            hasUnavailableItems={validation.hasUnavailableItems}
            isEmpty={validation.isEmpty}
            taxableAmountInPaise={serverPricing?.taxableAmountInPaise}
            gstAmountInPaise={serverPricing?.gstAmountInPaise}
            taxBreakdown={serverPricing?.taxBreakdown}
            shippingDetails={serverPricing?.shipping}
            isPayable={serverPricing?.isPayable ?? false}
            payableAmountInPaise={serverPricing?.payableAmountInPaise ?? null}
            isServerCalculating={isServerCalculating}
            onProceedToPayment={handleProceedToPayment}
            isPaymentProcessing={isPaymentProcessing}
          />
        </div>
      </div>
    </div>
  );
}
