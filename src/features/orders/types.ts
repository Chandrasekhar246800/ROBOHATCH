import type { Order, OrderItem, Payment, Address } from "@/types";

export type OrderWithDetails = Order & {
  items: OrderItem[];
  payments: Payment[];
  shippingAddress: Address | null;
};
