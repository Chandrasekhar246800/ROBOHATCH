import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Box, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  categoryName?: string;
  price: number | string;
  compareAtPrice?: number | string | null;
  imageUrl?: string | null;
  imageAlt?: string;
  material?: string;
  badge?: string;
  isFeatured?: boolean;
  className?: string;
  actionSlot?: React.ReactNode;
}

export function ProductCard({
  name,
  slug,
  categoryName,
  price,
  compareAtPrice,
  imageUrl,
  imageAlt,
  material,
  badge,
  isFeatured,
  className,
  actionSlot,
}: ProductCardProps) {
  const hasDiscount = compareAtPrice && Number(compareAtPrice) > Number(price);

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-200 hover:border-foreground/20 hover:shadow-sm",
        className
      )}
    >
      {/* Product Image Frame */}
      <div className="relative aspect-square w-full overflow-hidden bg-secondary/60">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt || name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          /* Elegant architectural wireframe placeholder */
          <div className="flex h-full w-full items-center justify-center bg-secondary/40 text-muted-foreground/40">
            <Box className="h-12 w-12 stroke-[1.25] text-muted-foreground/30 transition-transform duration-300 group-hover:scale-110" />
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {badge && (
            <Badge variant="brand" className="text-[10px] font-medium tracking-wide">
              {badge}
            </Badge>
          )}
          {isFeatured && !badge && (
            <Badge variant="secondary" className="text-[10px] font-medium tracking-wide">
              Featured
            </Badge>
          )}
        </div>

        {/* Material Tag Overlay */}
        {material && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 rounded border border-border/40 bg-background/90 px-2 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
              <Layers className="h-3 w-3 text-[#E87536]" />
              {material}
            </span>
          </div>
        )}
      </div>

      {/* Product Metadata & Information */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {categoryName && (
          <span className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {categoryName}
          </span>
        )}

        <h3 className="line-clamp-1 text-sm font-medium tracking-tight text-foreground transition-colors group-hover:text-[#E87536] sm:text-base">
          <Link href={`/products/${slug}`} className="focus:outline-none">
            <span aria-hidden="true" className="absolute inset-0" />
            {name}
          </Link>
        </h3>

        {/* Price and Details */}
        <div className="mt-3 flex items-baseline justify-between gap-2 border-t border-border/40 pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-foreground">
              {formatCurrency(price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(compareAtPrice)}
              </span>
            )}
          </div>

          {actionSlot && <div className="relative z-10">{actionSlot}</div>}
        </div>
      </div>
    </div>
  );
}
