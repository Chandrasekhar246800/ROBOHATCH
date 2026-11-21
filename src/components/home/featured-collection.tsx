import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { MainContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";

export function FeaturedCollection() {
  return (
    <section className="border-b border-border bg-background py-16 sm:py-20 lg:py-24">
      <MainContainer size="xl">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-[#171717] text-white shadow-xl">
          {/* Subtle noise/texture overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] opacity-10 [background-size:16px_16px]" />

          <div className="relative grid grid-cols-1 items-center gap-8 p-8 sm:p-12 lg:grid-cols-12 lg:gap-12 lg:p-16">
            {/* Content Column */}
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-[#E87536]" />
                <span>Curated Studio Capsule</span>
              </div>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl lg:leading-tight">
                Small Details. <br />
                <span className="text-[#E87536]">Extraordinary Design.</span>
              </h2>

              <p className="max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                A limited production series of geometric desk essentials, engineered for
                those who value tactile weight, microscopic layer alignment, and
                computational elegance in their workspace.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  asChild
                  variant="brand"
                  size="lg"
                  className="gap-2 font-semibold text-white shadow-lg shadow-[#E87536]/20"
                >
                  <Link href="/products?featured=true">
                    Explore Collection
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <span className="text-xs text-white/60">
                  Numbered Batches • Limited Stock
                </span>
              </div>
            </div>

            {/* Visual Column */}
            <div className="relative lg:col-span-5">
              <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=85"
                  alt="RoboHatch Curated Capsule Collection"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center transition-transform duration-700 hover:scale-105"
                />

                <div className="absolute right-4 top-4 rounded-full bg-[#E87536] px-3 py-1 text-xs font-semibold text-white shadow-md">
                  Capsule 01
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainContainer>
    </section>
  );
}
