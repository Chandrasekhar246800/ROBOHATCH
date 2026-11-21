import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { MainContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";

const storyPillars = [
  {
    title: "Micron-Level Calibration",
    description:
      "Every printer is enclosed, temperature-governed, and calibrated for zero deviation across layers.",
  },
  {
    title: "Engineering-Grade Materials",
    description:
      "We formulate and select polymers with carbon fibers and mineral additives to eliminate plastic sheen.",
  },
  {
    title: "Additive Geometry Freedom",
    description:
      "Gyroids, Voronoi cells, and internal fluid channels impossible with traditional tooling.",
  },
];

export function BrandStory() {
  return (
    <section className="overflow-hidden border-b border-border bg-background py-16 sm:py-20 lg:py-28">
      <MainContainer size="xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Editorial Studio Visual */}
          <div className="relative lg:col-span-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-secondary/50 shadow-sm sm:aspect-[5/4]">
              <Image
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=85"
                alt="RoboHatch Additive Engineering & Material Science Studio"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/20 bg-black/60 p-4 text-white backdrop-blur-md">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#E87536]">
                  Studio Philosophy
                </div>
                <div className="text-sm font-medium text-white/90">
                  Where computational algorithms meet physical tactile reality.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Narrative & Core Principles */}
          <div className="space-y-6 lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E87536]" />
              Our Manifesto
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              More Than Just a Print.
            </h2>

            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              At RoboHatch, we transform digital designs into thoughtfully crafted
              physical products. Every creation combines precision engineering with
              practical functionality.
            </p>

            <div className="space-y-4 border-t border-border/60 pt-2">
              {storyPillars.map((pillar) => (
                <div key={pillar.title} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#E87536]" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {pillar.title}
                    </h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Button asChild variant="outline" className="gap-2">
                <Link href="/about">
                  Learn About Our Engineering Process
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </MainContainer>
    </section>
  );
}
