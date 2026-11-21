import Link from "next/link";
import { MainContainer } from "./main-container";
import { Separator } from "@/components/ui/separator";

const footerNavigation = {
  shop: [
    { name: "All Products", href: "/products" },
    { name: "Featured Collections", href: "/products?featured=true" },
    { name: "New Arrivals", href: "/products?sort=newest" },
    { name: "Limited Batches", href: "/products?filter=limited" },
  ],
  categories: [
    { name: "Architectural Decor", href: "/categories/architectural-decor" },
    { name: "Mechanical Accents", href: "/categories/mechanical-accents" },
    { name: "Desk Accessories", href: "/categories/desk-accessories" },
    { name: "Sculptural & Lighting", href: "/categories/sculptural-lighting" },
  ],
  information: [
    { name: "Our Studio", href: "/about" },
    { name: "Materials & Tolerances", href: "/materials" },
    { name: "Design Philosophy", href: "/about#philosophy" },
    { name: "Sustainability", href: "/sustainability" },
  ],
  support: [
    { name: "Order Tracking", href: "/orders/track" },
    { name: "Shipping & Delivery", href: "/shipping" },
    { name: "Returns & Warranty", href: "/returns" },
    { name: "Contact Studio", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Shipping & Returns", href: "/shipping" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary/40 text-foreground">
      <MainContainer size="xl" className="py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand Column */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-90"
              aria-label="RoboHatch Home"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#171717] text-white">
                <span className="font-mono text-xs font-bold tracking-tight text-[#E87536]">
                  RH
                </span>
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                Robo<span className="text-[#E87536]">Hatch</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Precision 3D-printed products and geometric lifestyle artifacts, crafted
              with aerospace-grade filaments and high-resolution resin technology.
            </p>
            <div className="pt-2 text-xs text-muted-foreground">
              <span>Engineered with mathematical precision.</span>
            </div>
          </div>

          {/* Links: Shop */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Shop
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {footerNavigation.shop.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links: Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {footerNavigation.categories.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links: Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Information
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {footerNavigation.information.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links: Customer Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {footerNavigation.support.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-10" />

        {/* Bottom Bar: Copyright & Legal */}
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <p>© {currentYear} RoboHatch Studio. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {footerNavigation.legal.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </MainContainer>
    </footer>
  );
}
