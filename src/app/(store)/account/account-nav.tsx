"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  User,
  LayoutDashboard,
  ShieldCheck,
  Package,
  MapPin,
  LogOut,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { resetCartMergeSession } from "@/features/cart/lib/cart-merge";

interface AccountNavProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

interface NavLinkItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  badge?: string;
  disabled?: boolean;
}

export function AccountNav({ user }: AccountNavProps) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    resetCartMergeSession();
    toast.info("Signing out...", { description: "You are being securely logged out." });
    await signOut({ callbackUrl: "/" });
  };

  const navLinks: NavLinkItem[] = [
    {
      title: "Dashboard Overview",
      href: "/account",
      icon: LayoutDashboard,
      active: pathname === "/account",
    },
    {
      title: "Profile & Identity",
      href: "/account/profile",
      icon: User,
      active: pathname === "/account/profile",
    },
    {
      title: "Order History",
      href: "/account/orders",
      icon: Package,
      active: pathname === "/account/orders" || pathname.startsWith("/account/orders/"),
    },
    {
      title: "Shipping Addresses",
      href: "/account/addresses",
      icon: MapPin,
      active: pathname === "/account/addresses",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Customer Identity Card */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E87536]/10 font-mono text-base font-bold text-[#E87536]">
            {user.name ? user.name.slice(0, 2).toUpperCase() : "CU"}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-bold text-foreground">
              {user.name || "Customer Account"}
            </h2>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] font-medium text-muted-foreground">Status</span>
          </div>
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-[10px] font-semibold text-emerald-800 dark:text-emerald-400"
          >
            {user.role || "CUSTOMER"}
          </Badge>
        </div>
      </div>

      {/* Account Navigation List */}
      <nav className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="divide-y divide-border/60">
          {navLinks.map((link) => {
            const Icon = link.icon;
            if (link.disabled) {
              return (
                <div
                  key={link.title}
                  className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground/60"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{link.title}</span>
                  </div>
                  {link.badge && (
                    <span className="rounded bg-secondary/80 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                      {link.badge}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.title}
                href={link.href}
                className={cn(
                  "flex items-center justify-between px-4 py-3 text-xs font-medium transition-colors hover:bg-secondary/40 sm:text-sm",
                  link.active
                    ? "bg-[#E87536]/10 font-semibold text-[#E87536]"
                    : "text-foreground"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      link.active ? "text-[#E87536]" : "text-muted-foreground"
                    )}
                  />
                  <span>{link.title}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Cart & Sign Out Actions */}
        <div className="space-y-1.5 border-t border-border bg-secondary/20 p-2.5">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Link href="/cart">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>View Shopping Cart</span>
            </Link>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start gap-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}
