import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Package, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Order History | RoboHatch",
  description: "View and track your RoboHatch orders and fabrication status.",
};

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/orders");
  }

  // Scoped strictly to the authenticated user ID
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      shippingAddress: true,
    },
  });

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Order History
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Review your custom 3D-printed fabrication orders and shipment records.
          </p>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="gap-1.5 self-start text-xs sm:self-auto"
        >
          <Link href="/account">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </Button>
      </div>

      {/* Orders List or Genuine Empty State */}
      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center sm:p-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/80 text-muted-foreground">
            <Package className="h-7 w-7 stroke-[1.75]" />
          </div>
          <h2 className="mt-4 text-base font-bold text-foreground">
            No Orders Placed Yet
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
            You haven&apos;t placed any orders with RoboHatch yet. When you complete an
            order, its real-time printing status, specifications, and dispatch tracking
            will be available here.
          </p>
          <div className="mt-6 flex justify-center">
            <Button
              asChild
              size="sm"
              className="gap-2 bg-[#171717] px-5 text-xs font-semibold text-white dark:bg-white dark:text-[#171717]"
            >
              <Link href="/products">
                <Sparkles className="h-3.5 w-3.5 text-[#E87536]" />
                <span>Explore 3D-Printed Designs</span>
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const formattedDate = new Intl.DateTimeFormat("en-IN", {
              dateStyle: "medium",
            }).format(new Date(order.createdAt));

            const totalAmount = Number(order.totalAmount);

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-foreground/30"
              >
                {/* Order Card Header */}
                <div className="flex flex-col gap-3 border-b border-border/60 bg-secondary/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Order Reference
                      </span>
                      <p className="font-mono text-sm font-bold text-foreground">
                        {order.orderNumber}
                      </p>
                    </div>

                    <div className="hidden h-7 w-px bg-border sm:block" />

                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Date Placed
                      </span>
                      <p className="text-xs font-medium text-foreground">
                        {formattedDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="border-border text-xs font-semibold uppercase tracking-wide"
                    >
                      {order.status}
                    </Badge>
                    <span className="font-mono text-base font-bold text-foreground">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-foreground">
                        {order.items.length}{" "}
                        {order.items.length === 1 ? "Product" : "Products"} in this
                        fabrication order
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.items
                          .map((i) => `${i.productName} (×${i.quantity})`)
                          .join(", ")}
                      </p>
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="gap-1.5 self-start text-xs sm:self-auto"
                    >
                      <Link href={`/account/orders/${order.id}`}>
                        <span>View Order Details</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
