import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Box } from "lucide-react";
import { CategoryItem } from "@/data/categories";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface CategoryCardProps {
  category: CategoryItem;
  productCount?: number;
  className?: string;
}

export function CategoryCard({ category, productCount, className }: CategoryCardProps) {
  const count = productCount ?? category.itemCount;

  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-foreground/20 hover:shadow-md",
        className
      )}
    >
      {/* Category Image Header */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary/60">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary/40 text-muted-foreground/30">
            <Box className="h-12 w-12 stroke-[1.25]" />
          </div>
        )}

        {/* Subtle gradient vignette for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />

        {/* Count Badge in image overlay */}
        <div className="absolute left-3.5 top-3.5 z-10">
          <Badge
            variant="outline"
            className="border-white/20 bg-black/40 text-[11px] font-medium text-white backdrop-blur-md"
          >
            {count} {count === 1 ? "Product" : "Products"}
          </Badge>
        </div>

        {/* Name on image bottom */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10">
          <h3 className="text-xl font-bold tracking-tight text-white transition-colors group-hover:text-[#E87536]">
            {category.name}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {category.description}
        </p>

        <div className="mt-4 flex items-center gap-1.5 border-t border-border/40 pt-4 text-xs font-semibold text-[#E87536] transition-colors group-hover:text-[#d36427]">
          <span>Explore Collection</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
