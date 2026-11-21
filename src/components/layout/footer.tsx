import Link from "next/link";
import { MainContainer } from "./main-container";
import { Separator } from "@/components/ui/separator";

const footerNavigation = {
  products: [
    { name: "Architectural Decor", href: "/categories/architectural-decor" },
    { name: "Mechanical Accents", href: "/categories/mechanical-accents" },
    { name: "Desk Accessories", href: "/categories/desk-accessories" },
    { name: "Custom Fabrication", href: "/custom" },
  ],
  materials: [
    { name: "Carbon Fiber PETG", href: "/materials#carbon-petg" },
    { name: "High-Detail Tough Resin", href: "/materials#tough-resin" },
    { name: "Industrial Matte PLA", href: "/materials#matte-pla" },
    { name: "3D Specs & Tolerances", href: "/specifications" },
  ],
  company: [
    { name: "Our Studio", href: "/about" },
    { name: "Design Philosophy", href: "/philosophy" },
    { name: "Sustainability", href: "/sustainability" },
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
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="space-y-4 lg:col-span-2">
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

          {/* Links: Products */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Catalog
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {footerNavigation.products.map((item) => (
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

          {/* Links: Materials */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Materials & Specs
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {footerNavigation.materials.map((item) => (
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

          {/* Links: Studio & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Studio
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {footerNavigation.company.map((item) => (
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
