import { MainContainer } from "@/components/layout";
import {
  PageHeader,
  SectionHeading,
  ProductCard,
  DesignSystemShowcase,
} from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function DesignSystemPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1 pb-20">
        <MainContainer size="xl" className="space-y-16 pt-8 sm:pt-12">
          <PageHeader
            badge="Phase 1A Foundation"
            title="Design System & Component Architecture"
            description="The comprehensive visual design foundation, semantic token system, and accessible component library for RoboHatch."
            actions={
              <Badge variant="success-subtle" className="gap-1.5 px-3 py-1 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Phase 1A Verified
              </Badge>
            }
          />

          <DesignSystemShowcase />

          <Separator />

          <section className="space-y-8">
            <SectionHeading
              badge="Architecture Component"
              title="ProductCard Base Structure"
              description="A reusable presentational card engineered with strict aspect ratios, material overlays, and subtle hover interactions."
              action={
                <Button variant="ghost" size="sm" className="gap-1.5 text-[#E87536]">
                  Preview Architecture <ArrowRight className="h-4 w-4" />
                </Button>
              }
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <ProductCard
                id="preview-1"
                name="Voronoi Kinetic Vessel"
                slug="voronoi-kinetic-vessel"
                categoryName="Architectural Decor"
                price={2499}
                compareAtPrice={3199}
                material="Carbon PETG"
                badge="Limited Batch"
                isFeatured
                actionSlot={
                  <Button variant="brand" size="sm">
                    View Spec
                  </Button>
                }
              />

              <ProductCard
                id="preview-2"
                name="Tessellated Mechanical Planter"
                slug="tessellated-mechanical-planter"
                categoryName="Desk Accessories"
                price={1850}
                material="Matte PLA"
                badge="New"
                actionSlot={
                  <Button variant="outline" size="sm">
                    View Spec
                  </Button>
                }
              />

              <ProductCard
                id="preview-3"
                name="Gyroid Acoustic Diffuser Tile"
                slug="gyroid-acoustic-diffuser"
                categoryName="Acoustic Panels"
                price={3400}
                material="Tough Resin"
                isFeatured
                actionSlot={
                  <Button variant="outline" size="sm">
                    View Spec
                  </Button>
                }
              />
            </div>
          </section>
        </MainContainer>
      </main>
    </div>
  );
}
