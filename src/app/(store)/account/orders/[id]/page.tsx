import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Package, MapPin, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: OrderDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Order #${id.slice(-6).toUpperCase()} | RoboHatch`,
    description: "Detailed view of your custom RoboHatch fabrication order.",
  };
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/orders");
  }

  const { id: orderId } = await params;

  if (!orderId || typeof orderId !== "string") {
    notFound();
  }

  // Strictly scoped to the authenticated customer's ID to prevent IDOR
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              slug: true,
              images: {
                take: 1,
                select: {
                  url: true,
                },
              },
            },
          },
        },
      },
      shippingAddress: true,
      payments: true,
    },
  });

  // Return notFound() for nonexistent or unauthorized order IDs
  if (!order) {
    notFound();
  }

  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "full",
  }).format(new Date(order.createdAt));

  const subtotal = Number(order.subtotal);
  const taxAmount = Number(order.taxAmount);
  const shippingAmount = Number(order.shippingAmount);
  const discountAmount = Number(order.discountAmount);
  const totalAmount = Number(order.totalAmount);

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#E87536]">
              Order Specification
            </span>
            <Badge
              variant="outline"
              className="border-border text-[10px] font-semibold uppercase tracking-wide"
            >
              {order.status}
            </Badge>
          </div>
          <h1 className="mt-1 font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {order.orderNumber}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Placed on {formattedDate}
          </p>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="gap-1.5 self-start text-xs sm:self-auto"
        >
          <Link href="/account/orders">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Orders</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Items List & Fabrication Status (8 cols) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Items Card */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border/60 p-4 sm:p-5">
              <h2 className="text-sm font-bold text-foreground sm:text-base">
                Fabrication Items ({order.items.length})
              </h2>
            </div>

            <div className="divide-y divide-border/60 p-4 sm:p-5">
              {order.items.map((item) => {
                const unitPrice = Number(item.unitPrice);
                const itemTotal = Number(item.totalPrice);
                const imageUrl = item.product?.images?.[0]?.url;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-secondary/50">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={item.productName}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        {item.product?.slug ? (
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="text-sm font-semibold text-foreground hover:text-[#E87536] hover:underline"
                          >
                            {item.productName}
                          </Link>
                        ) : (
                          <p className="text-sm font-semibold text-foreground">
                            {item.productName}
                          </p>
                        )}
                        {item.variantName && (
                          <p className="text-xs text-muted-foreground">
                            Variant: {item.variantName}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} × ₹{unitPrice.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-foreground">
                        ₹{itemTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fabrication Notice */}
          <div className="rounded-xl border border-border bg-secondary/20 p-5">
            <div className="flex items-start gap-3">
              <Printer className="mt-0.5 h-5 w-5 shrink-0 text-[#E87536]" />
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Precision Additive Manufacturing
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Each RoboHatch item is individually sliced and 3D printed with
                  continuous layer verification. Status transitions reflect queue
                  scheduling, physical slicing, bed printing, post-curing, and final QA
                  inspection.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Shipping Address (4 cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Financial Breakdown Card */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="border-b border-border/60 pb-3 text-sm font-bold text-foreground">
              Order Summary
            </h2>

            <div className="mt-4 space-y-2.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-foreground">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-mono text-foreground">
                  {shippingAmount === 0
                    ? "Calculated at dispatch"
                    : `₹${shippingAmount.toLocaleString("en-IN")}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Taxes (GST)</span>
                <span className="font-mono text-foreground">
                  {taxAmount === 0
                    ? "Included in base price"
                    : `₹${taxAmount.toLocaleString("en-IN")}`}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span className="font-mono">
                    -₹{discountAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              <div className="flex justify-between border-t border-border/60 pt-3 text-sm font-bold text-foreground">
                <span>Total Amount</span>
                <span className="font-mono text-base text-[#E87536]">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <MapPin className="h-4 w-4 text-[#E87536]" />
              <h2 className="text-sm font-bold text-foreground">Delivery Destination</h2>
            </div>

            {order.shippingAddress ? (
              <div className="mt-3 space-y-1 text-xs leading-relaxed text-muted-foreground">
                <p className="font-semibold text-foreground">
                  {order.shippingAddress.fullName}
                </p>
                <p>{order.shippingAddress.street}</p>
                {order.shippingAddress.apartment && (
                  <p>{order.shippingAddress.apartment}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} –{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p>India (IN)</p>
                <p className="pt-1 font-medium text-foreground">
                  Phone: {order.shippingAddress.phone}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                No delivery address attached to this order.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
