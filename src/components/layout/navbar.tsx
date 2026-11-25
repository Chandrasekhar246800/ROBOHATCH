"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { MainContainer } from "./main-container";
import { SearchModal } from "./search-modal";
import { UserNav, MobileUserNav } from "./user-nav";
import { CartDrawer, useCart } from "@/features/cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NavItem {
  title: string;
  href: string;
  badge?: string;
}

const defaultNavItems: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "Shop", href: "/products" },
  { title: "Categories", href: "/categories" },
  { title: "About", href: "/about" },
];

export interface NavbarProps {
  navItems?: NavItem[];
  cartCount?: number;
  className?: string;
}

export function Navbar({
  navItems = defaultNavItems,
  cartCount: propCartCount,
  className,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const pathname = usePathname();
  const { itemCount: storeItemCount, openDrawer } = useCart();

  // Use dynamic cart store count, fallback to prop if provided
  const activeCartCount =
    typeof propCartCount === "number" ? propCartCount : storeItemCount;

  // Close mobile menu on resize to desktop
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md transition-colors supports-[backdrop-filter]:bg-background/80",
        className
      )}
    >
      <MainContainer
        size="xl"
        className="flex h-16 items-center justify-between gap-1.5 px-2.5 sm:gap-4 sm:px-6 lg:px-8"
      >
        {/* Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-90 sm:gap-2.5"
            aria-label="RoboHatch Home"
          >
            {/* Minimalist Hatching Hex Logo */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#171717] text-white">
              <span className="font-mono text-sm font-bold tracking-tight text-[#E87536]">
                RH
              </span>
            </div>
            <span className="text-base font-bold tracking-tight text-foreground sm:text-lg">
              Robo<span className="text-[#E87536]">Hatch</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative py-1 text-sm font-medium transition-colors hover:text-foreground",
                    isActive ? "font-semibold text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.title}
                  {item.badge && (
                    <span className="ml-1.5 rounded-full bg-[#E87536]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#E87536]">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#E87536]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions: Search, Account, Cart, Mobile Toggle */}
        <div className="flex items-center gap-0.5 sm:gap-2.5">
          {/* Search Trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground sm:h-9 sm:w-9"
            onClick={() => setSearchOpen(true)}
            aria-label="Search products"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Customer Account Navigation */}
          <UserNav />

          {/* Shopping Bag / Cart */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openDrawer}
            className="relative gap-1 border-border px-1.5 font-medium transition-all hover:border-foreground/30 active:scale-95 sm:gap-2 sm:px-3"
            aria-label={
              activeCartCount > 0
                ? `Shopping cart with ${activeCartCount} items`
                : "Shopping cart is empty"
            }
          >
            <ShoppingBag className="h-4 w-4 text-foreground" />
            <span className="hidden sm:inline">Cart</span>
            {activeCartCount > 0 && (
              <span className="shadow-xs flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#E87536] px-1 text-[10px] font-bold text-white">
                {activeCartCount > 99 ? "99+" : activeCartCount}
              </span>
            )}
          </Button>

          {/* Mobile Menu Hamburger Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground sm:h-9 sm:w-9 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </MainContainer>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background px-4 py-6 duration-150 animate-in fade-in-0 md:hidden">
          <nav className="flex flex-col space-y-3">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between border-b border-border/40 py-2.5 text-base font-medium transition-colors",
                    isActive
                      ? "font-semibold text-[#E87536]"
                      : "text-foreground hover:text-[#E87536]"
                  )}
                >
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="rounded-full bg-[#E87536]/10 px-2 py-0.5 text-xs font-medium text-[#E87536]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Customer Account Mobile Navigation */}
          <MobileUserNav onItemClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Global Search Dialog Modal */}
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Global Cart Slide-Over Drawer */}
      <CartDrawer />
    </header>
  );
}
