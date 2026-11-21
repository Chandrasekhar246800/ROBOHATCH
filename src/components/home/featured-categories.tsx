import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { MainContainer } from "@/components/layout";
import { SectionHeading } from "@/components/common";
import { CATEGORIES_DATA } from "@/data/categories";

export function FeaturedCategories() {
  return (
    <section className="border-b border-border bg-background py-16 sm:py-20 lg:py-24">
      <MainContainer size="xl" className="space-y-12">
        <SectionHeading
          badge="Product Domains"
          title="Featured Categories"
          description="Explore our collections designed for everyday ergonomics, architectural decor, and functional utility."
          action={
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#E87536] hover:underline"
            >
              Browse All Categories
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          }
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES_DATA.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-foreground/30 hover:shadow-md"
            >
              {/* Category Image Frame */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary/50">
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-60" />

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-white/80">
                      {cat.itemCount} Designs
                    </span>
                    <h3 className="text-lg font-semibold tracking-tight text-white">
                      {cat.name}
                    </h3>
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#E87536]">
                    <ArrowUpRight className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Description & Metadata */}
              <div className="p-4 sm:p-5">
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </MainContainer>
    </section>
  );
}
