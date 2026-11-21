"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, Compass, ShieldCheck, Layers } from "lucide-react";
import { MainContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="relative overflow-hidden border-b border-border bg-background pb-16 pt-12 sm:pb-24 sm:pt-16 lg:pb-28 lg:pt-20">
      {/* Subtle architectural grid pattern background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#171717 1px, transparent 1px), linear-gradient(to right, #171717 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <MainContainer size="xl" className="relative">
        <motion.div
          className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column: Brand Typography & Action Hierarchy */}
          <div className="flex flex-col space-y-6 lg:col-span-7">
            {/* Architectural Status Pill */}
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/80 px-3.5 py-1 text-xs font-medium text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E87536]" />
                <span>Precision Additive Manufacturing</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.1]"
            >
              Designed Digitally. <br />
              <span className="text-[#171717]">Crafted Physically.</span>
            </motion.h1>

            {/* Supporting Copy */}
            <motion.p
              variants={itemVariants}
              className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Discover thoughtfully designed 3D-printed products that bring creativity,
              precision and functionality into everyday life.
            </motion.p>

            {/* Call to Actions */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <Button
                asChild
                variant="brand"
                size="lg"
                className="gap-2 text-sm font-semibold"
              >
                <Link href="/products">
                  Explore Collection
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="text-sm font-medium">
                <Link href="/about">Discover RoboHatch</Link>
              </Button>
            </motion.div>

            {/* Trust Badges / Specification Highlights */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-4 border-t border-border/60 pt-6 sm:pt-8"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Compass className="h-3.5 w-3.5 text-[#E87536]" />
                  <span>±0.15 mm</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Dimensional Tolerance</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Layers className="h-3.5 w-3.5 text-[#E87536]" />
                  <span>Carbon & Resin</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Engineering Feedstock</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#E87536]" />
                  <span>Zero Glare</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Satin Matte Surface</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Hero Product Visual Presentation */}
          <motion.div variants={itemVariants} className="relative lg:col-span-5">
            <div className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-secondary/50 shadow-sm transition-all duration-300">
              {/* Product Hero Image */}
              <Image
                src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=85"
                alt="RoboHatch Voronoi Kinetic Vessel 3D-Printed Design"
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                className="object-cover object-center transition-transform duration-700 hover:scale-105"
              />

              {/* Floating Product Specification Tag */}
              <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-border/80 bg-background/90 p-3.5 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-foreground">
                      Voronoi Kinetic Vessel
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Parametric Carbon PETG • 0.12mm Resolution
                    </div>
                  </div>
                  <span className="font-mono text-sm font-semibold text-foreground">
                    ₹2,499
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </MainContainer>
    </section>
  );
}
