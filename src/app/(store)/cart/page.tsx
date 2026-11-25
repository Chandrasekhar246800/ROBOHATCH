import * as React from "react";
import type { Metadata } from "next";
import { CartView } from "./cart-view";

export const metadata: Metadata = {
  title: "Shopping Cart | RoboHatch",
  description:
    "Review your selected 3D-printed geometric designs, desktop accessories, and functional objects in your RoboHatch shopping cart.",
  alternates: {
    canonical: "/cart",
  },
};

export default function CartPage() {
  return <CartView />;
}
