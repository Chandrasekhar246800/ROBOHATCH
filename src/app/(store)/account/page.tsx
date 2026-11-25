import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  ShieldCheck,
  User,
  Package,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Account Overview | RoboHatch",
  description: "View your RoboHatch account overview and recent activity.",
};

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account");
  }

  // Retrieve user record and real relationship counts from PostgreSQL
  const [user, addressCount, defaultAddress, orderCount, recentOrders] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.address.count({
        where: { userId: session.user.id },
      }),
      prisma.address.findFirst({
        where: { userId: session.user.id, isDefault: true },
        select: {
          city: true,
          state: true,
          postalCode: true,
        },
      }),
      prisma.order.count({
        where: { userId: session.user.id },
      }),
      prisma.order.findMany({
        where: { userId: session.user.id },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
        },
      }),
    ]);

  if (!user) {
    redirect("/login");
  }

  const memberSince = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(user.createdAt));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-border bg-[#F1F1EF]/70 p-6 dark:bg-card/60 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#E87536]">
                Customer Dashboard
              </span>
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-800 dark:text-emerald-400"
              >
                Active Session
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back, {user.name || "Customer"}
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Member since {memberSince} · Connected to RoboHatch customer portal
            </p>
          </div>

          <Button
            asChild
            size="sm"
            className="gap-1.5 self-start rounded-lg bg-[#171717] px-4 text-xs font-semibold text-white dark:bg-white dark:text-[#171717] sm:self-auto"
          >
            <Link href="/products">
              <span>Browse Catalogue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Profile Summary */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Profile
            </span>
            <User className="h-4 w-4 text-[#E87536]" />
          </div>
          <div className="mt-3">
            <p className="truncate text-base font-bold text-foreground">
              {user.name || "Customer"}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="mt-4 border-t border-border/60 pt-3">
            <Link
              href="/account/profile"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#E87536] hover:underline"
            >
              <span>Manage profile</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Card 2: Saved Addresses */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Addresses
            </span>
            <MapPin className="h-4 w-4 text-[#E87536]" />
          </div>
          <div className="mt-3">
            <p className="text-base font-bold text-foreground">
              {addressCount === 1 ? "1 Saved Address" : `${addressCount} Saved Addresses`}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {defaultAddress
                ? `Default: ${defaultAddress.city}, ${defaultAddress.state}`
                : "No default address set"}
            </p>
          </div>
          <div className="mt-4 border-t border-border/60 pt-3">
            <Link
              href="/account/addresses"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#E87536] hover:underline"
            >
              <span>View addresses</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Card 3: Orders Summary */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Orders</span>
            <Package className="h-4 w-4 text-[#E87536]" />
          </div>
          <div className="mt-3">
            <p className="text-base font-bold text-foreground">
              {orderCount === 1 ? "1 Order Placed" : `${orderCount} Orders Placed`}
            </p>
            <p className="text-xs text-muted-foreground">
              {orderCount > 0 ? "Track manufacturing & delivery" : "No active orders"}
            </p>
          </div>
          <div className="mt-4 border-t border-border/60 pt-3">
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#E87536] hover:underline"
            >
              <span>View order history</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Card 4: Security */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Security
            </span>
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-3">
            <p className="text-base font-bold text-foreground">Bcrypt 12 Rounds</p>
            <p className="text-xs text-muted-foreground">Cryptographically protected</p>
          </div>
          <div className="mt-4 border-t border-border/60 pt-3">
            <Link
              href="/account/profile#security"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#E87536] hover:underline"
            >
              <span>Update password</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-[#E87536]" />
            <h3 className="text-base font-bold text-foreground">Recent Orders</h3>
          </div>
          {orderCount > 0 && (
            <Link
              href="/account/orders"
              className="text-xs font-semibold text-[#E87536] hover:underline"
            >
              View all ({orderCount})
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          /* Genuine Clean Empty State */
          <div className="py-10 text-center sm:py-14">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/80 text-muted-foreground">
              <Clock className="h-6 w-6 stroke-[1.75]" />
            </div>
            <h4 className="mt-4 text-sm font-bold text-foreground">
              No Orders Placed Yet
            </h4>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
              When you complete an order, its details, items, and manufacturing progress
              will appear here.
            </p>
            <div className="mt-5">
              <Button asChild variant="outline" size="sm" className="gap-2 text-xs">
                <Link href="/products">
                  <Sparkles className="h-3.5 w-3.5 text-[#E87536]" />
                  <span>Explore 3D-Printed Designs</span>
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          /* Real Orders List */
          <div className="mt-4 divide-y divide-border/60">
            {recentOrders.map((order) => {
              const formattedDate = new Intl.DateTimeFormat("en-IN", {
                dateStyle: "medium",
              }).format(new Date(order.createdAt));

              return (
                <div
                  key={order.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {order.orderNumber}
                      </span>
                      <Badge
                        variant="outline"
                        className="border-border text-[10px] font-semibold uppercase"
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Placed on {formattedDate} · {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <span className="font-mono text-sm font-bold text-foreground">
                      ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                    </span>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs"
                    >
                      <Link href={`/account/orders/${order.id}`}>
                        <span>Details</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
