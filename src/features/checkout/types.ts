import type { Address } from "@/types";

export interface CheckoutSessionState {
  step: "address" | "shipping" | "payment" | "review";
  shippingAddressId?: string;
  billingAddressId?: string;
  couponCode?: string;
}

export interface CreateOrderInput {
  shippingAddress: Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">;
  couponCode?: string;
  notes?: string;
}
