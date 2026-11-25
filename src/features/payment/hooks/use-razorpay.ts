"use client";

import * as React from "react";
import { toast } from "sonner";
import { initiatePaymentAction } from "../actions/initiate-payment-action";
import { verifyPaymentAction } from "../actions/verify-payment-action";
import { cancelPaymentAction } from "../actions/cancel-payment-action";
import type {
  InitiatePaymentItemInput,
  VerifyPaymentResult,
} from "../types/payment-types";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

export interface RazorpayPrefill {
  name?: string;
  email?: string;
  contact?: string;
}

export interface RazorpayModalOptions {
  ondismiss?: () => void;
  escape?: boolean;
  backdropclose?: boolean;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: RazorpayPrefill;
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: RazorpayModalOptions;
}

export interface RazorpayInstance {
  open: () => void;
  close: () => void;
  on: (event: string, callback: (response: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export interface UseRazorpayProps {
  onSuccess?: (result: VerifyPaymentResult) => void;
  onFailure?: (error: string) => void;
  onCancel?: () => void;
}

export function useRazorpay({ onSuccess, onFailure, onCancel }: UseRazorpayProps = {}) {
  const [isScriptLoaded, setIsScriptLoaded] = React.useState(false);
  const [isScriptLoading, setIsScriptLoading] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [activePaymentId, setActivePaymentId] = React.useState<string | null>(null);

  // Load Razorpay checkout script on demand
  const loadScript = React.useCallback((): Promise<boolean> => {
    if (typeof window === "undefined") return Promise.resolve(false);

    if (window.Razorpay) {
      setIsScriptLoaded(true);
      return Promise.resolve(true);
    }

    // Check if script element already exists in DOM
    const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
    if (existingScript) {
      setIsScriptLoading(true);
      return new Promise((resolve) => {
        existingScript.addEventListener("load", () => {
          setIsScriptLoaded(true);
          setIsScriptLoading(false);
          resolve(true);
        });
        existingScript.addEventListener("error", () => {
          setIsScriptLoading(false);
          resolve(false);
        });
      });
    }

    setIsScriptLoading(true);
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = RAZORPAY_SCRIPT_URL;
      script.async = true;
      script.onload = () => {
        setIsScriptLoaded(true);
        setIsScriptLoading(false);
        resolve(true);
      };
      script.onerror = () => {
        setIsScriptLoading(false);
        toast.error("Failed to load payment gateway", {
          description:
            "Unable to reach Razorpay servers. Please check your internet connection.",
        });
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }, []);

  /**
   * Initiates payment on the server, loads SDK script, and launches the Razorpay modal.
   */
  const processCheckoutPayment = React.useCallback(
    async (params: {
      items: InitiatePaymentItemInput[];
      deliveryAddressId: string;
      notes?: string;
    }) => {
      if (isProcessing) return;

      setIsProcessing(true);

      try {
        // 1. Initiate payment attempt on server
        const initiation = await initiatePaymentAction({
          items: params.items,
          deliveryAddressId: params.deliveryAddressId,
          notes: params.notes,
        });

        if (!initiation.success) {
          const errorMessage =
            initiation.error || "Unable to initiate checkout payment. Please try again.";
          toast.error("Payment Initiation Blocked", {
            description: errorMessage,
          });
          onFailure?.(errorMessage);
          setIsProcessing(false);
          return;
        }

        const { paymentId, razorpayOrderId, amountInPaise, currency, keyId, customer } =
          initiation;

        if (!paymentId || !razorpayOrderId || !amountInPaise || !keyId) {
          throw new Error("Invalid payment initiation response from server.");
        }

        setActivePaymentId(paymentId);

        // 2. Load Razorpay script on demand
        const scriptReady = await loadScript();
        if (!scriptReady || !window.Razorpay) {
          throw new Error("Razorpay checkout script could not be initialized.");
        }

        // 3. Configure Razorpay modal
        const options: RazorpayOptions = {
          key: keyId,
          amount: amountInPaise,
          currency: currency || "INR",
          name: "RoboHatch",
          description: "Precision 3D Printed Products",
          order_id: razorpayOrderId,
          prefill: {
            name: customer?.name,
            email: customer?.email,
            contact: customer?.contact,
          },
          theme: {
            color: "#171717",
          },
          handler: async (response) => {
            try {
              // 4. Verify payment signature on server
              const verification = await verifyPaymentAction({
                paymentId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (verification.success && verification.status === "SUCCESSFUL") {
                toast.success("Payment Captured (Test Mode)", {
                  description: `Payment for Order #${verification.orderNumber} recorded. Order remains PENDING awaiting reconciliation.`,
                });
                onSuccess?.(verification);
              } else if (
                verification.success &&
                verification.status === "PENDING" &&
                verification.isAuthorized
              ) {
                toast.info("Payment Authorized (Test Mode)", {
                  description: `Payment for Order #${verification.orderNumber} authorized by bank. Capture pending.`,
                });
                onSuccess?.(verification);
              } else {
                const failMsg =
                  verification.message ||
                  "Payment signature verification failed. Please contact support.";
                toast.error("Payment Verification Failed", {
                  description: failMsg,
                });
                onFailure?.(failMsg);
              }
            } catch (verErr) {
              console.error("[useRazorpay] Verification exception:", verErr);
              toast.error("Verification Error", {
                description: "An error occurred while verifying the payment response.",
              });
              onFailure?.((verErr as Error).message);
            } finally {
              setIsProcessing(false);
              setActivePaymentId(null);
            }
          },
          modal: {
            ondismiss: async () => {
              setIsProcessing(false);
              toast.info("Payment Cancelled", {
                description:
                  "You closed the payment window. Your cart is preserved and you can try again.",
              });
              if (paymentId) {
                try {
                  await cancelPaymentAction({ paymentId });
                } catch (cErr) {
                  console.warn("[useRazorpay] Cancel action notification:", cErr);
                }
              }
              setActivePaymentId(null);
              onCancel?.();
            },
            escape: true,
            backdropclose: false,
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.on("payment.failed", (failResponse: unknown) => {
          console.warn("[useRazorpay] Payment attempt failed:", failResponse);
        });

        razorpayInstance.open();
      } catch (err) {
        console.error("[useRazorpay] Checkout payment error:", err);
        const errMessage =
          (err as Error).message ||
          "An unexpected error occurred while launching payment.";
        toast.error("Payment Error", {
          description: errMessage,
        });
        onFailure?.(errMessage);
        setIsProcessing(false);
        setActivePaymentId(null);
      }
    },
    [isProcessing, loadScript, onCancel, onFailure, onSuccess]
  );

  return {
    processCheckoutPayment,
    isProcessing,
    isScriptLoading,
    isScriptLoaded,
    activePaymentId,
    loadScript,
  };
}
