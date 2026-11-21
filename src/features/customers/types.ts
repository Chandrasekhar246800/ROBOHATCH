import type { User, Address, Order } from "@/types";

export type CustomerProfile = User & {
  addresses: Address[];
  orders: Order[];
};
