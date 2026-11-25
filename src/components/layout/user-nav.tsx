"use client";

import * as React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  LogIn,
  UserPlus,
  LayoutDashboard,
  ShieldCheck,
  Package,
  MapPin,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { resetCartMergeSession } from "@/features/cart/lib/cart-merge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function UserNav() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on Escape key
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsOpen(false);
    resetCartMergeSession();
    toast.info("Signing out...", { description: "You are being securely logged out." });
    await signOut({ callbackUrl: "/" });
  };

  const isAuthenticated = status === "authenticated" && !!session?.user;
  const user = session?.user;

  return (
    <div className="relative" ref={menuRef}>
      {/* Navbar User Action Button */}
      {status === "loading" ? (
        <Button
          variant="ghost"
          size="icon"
          disabled
          className="h-9 w-9 text-muted-foreground opacity-50"
          aria-label="Loading customer account"
        >
          <User className="h-4 w-4" />
        </Button>
      ) : isAuthenticated ? (
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative flex h-8 items-center gap-1 rounded-lg px-1.5 text-xs font-semibold transition-colors hover:bg-secondary/60 sm:h-9 sm:gap-1.5 sm:px-2",
            isOpen && "bg-secondary/60 text-[#E87536]"
          )}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="Customer account menu"
        >
          <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[#E87536]/15 font-mono text-[11px] font-bold text-[#E87536]">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "CU"}
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background bg-emerald-500" />
          </div>
          <span className="hidden max-w-[100px] truncate md:inline-block">
            {user?.name?.split(" ")[0] || "Account"}
          </span>
          <ChevronDown
            className={cn(
              "h-3 w-3 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-9 w-9 text-muted-foreground hover:text-foreground",
            isOpen && "bg-secondary text-foreground"
          )}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="Customer account options"
        >
          <User className="h-4 w-4" />
        </Button>
      )}

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-md transition-all duration-150 animate-in fade-in-0 zoom-in-95"
        >
          {isAuthenticated ? (
            <>
              {/* Authenticated Header */}
              <div className="px-3 py-2">
                <p className="truncate text-xs font-bold text-foreground">
                  {user?.name || "Customer Account"}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {user?.email}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0 text-[9px] font-semibold text-emerald-800 dark:text-emerald-400"
                  >
                    {user?.role || "CUSTOMER"}
                  </Badge>
                </div>
              </div>

              <Separator className="my-1" />

              {/* Navigation Links */}
              <div className="space-y-0.5">
                <Link
                  href="/account"
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-secondary/60 hover:text-foreground"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-[#E87536]" />
                  <span>My Account</span>
                </Link>

                <Link
                  href="/account/orders"
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-secondary/60 hover:text-foreground"
                >
                  <Package className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Order History</span>
                </Link>

                <Link
                  href="/account/addresses"
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-secondary/60 hover:text-foreground"
                >
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Saved Addresses</span>
                </Link>

                <Link
                  href="/account/profile"
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-secondary/60 hover:text-foreground"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Profile & Security</span>
                </Link>
              </div>

              <Separator className="my-1" />

              {/* Sign Out Action */}
              <button
                type="button"
                onClick={handleSignOut}
                role="menuitem"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              {/* Guest Header */}
              <div className="px-3 py-2">
                <p className="text-xs font-bold text-foreground">Customer Account</p>
                <p className="text-[11px] text-muted-foreground">
                  Sign in to access orders and saved items
                </p>
              </div>

              <Separator className="my-1" />

              {/* Guest Actions */}
              <div className="space-y-1 p-1">
                <Button
                  asChild
                  size="sm"
                  className="h-8 w-full justify-start gap-2 bg-[#171717] px-3 text-xs font-semibold text-white dark:bg-white dark:text-[#171717]"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/login">
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Sign In</span>
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 w-full justify-start gap-2 px-3 text-xs font-semibold"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/register">
                    <UserPlus className="h-3.5 w-3.5 text-[#E87536]" />
                    <span>Create Account</span>
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Mobile-specific Customer Account Navigation items for the mobile drawer.
 */
export function MobileUserNav({ onItemClick }: { onItemClick?: () => void }) {
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    if (onItemClick) onItemClick();
    resetCartMergeSession();
    toast.info("Signing out...", { description: "You are being securely logged out." });
    await signOut({ callbackUrl: "/" });
  };

  const isAuthenticated = status === "authenticated" && !!session?.user;
  const user = session?.user;

  if (status === "loading") {
    return null;
  }

  if (isAuthenticated) {
    return (
      <div className="border-t border-border/80 pt-4">
        <div className="mb-3 flex items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E87536]/15 font-mono text-xs font-bold text-[#E87536]">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "CU"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">
              {user?.name || "Customer Account"}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          <Link
            href="/account"
            onClick={onItemClick}
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary hover:text-[#E87536]"
          >
            <LayoutDashboard className="h-4 w-4 text-[#E87536]" />
            <span>My Account</span>
          </Link>

          <Link
            href="/account/orders"
            onClick={onItemClick}
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary hover:text-[#E87536]"
          >
            <Package className="h-4 w-4 text-muted-foreground" />
            <span>Order History</span>
          </Link>

          <Link
            href="/account/addresses"
            onClick={onItemClick}
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary hover:text-[#E87536]"
          >
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>Saved Addresses</span>
          </Link>

          <Link
            href="/account/profile"
            onClick={onItemClick}
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary hover:text-[#E87536]"
          >
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <span>Profile & Security</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-border/80 pt-4">
      <div className="flex flex-col gap-2">
        <Button
          asChild
          size="sm"
          onClick={onItemClick}
          className="h-9 w-full justify-center gap-2 bg-[#171717] text-xs font-semibold text-white dark:bg-white dark:text-[#171717]"
        >
          <Link href="/login">
            <LogIn className="h-4 w-4" />
            <span>Sign In to Account</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          size="sm"
          onClick={onItemClick}
          className="h-9 w-full justify-center gap-2 text-xs font-semibold"
        >
          <Link href="/register">
            <UserPlus className="h-4 w-4 text-[#E87536]" />
            <span>Create New Account</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
