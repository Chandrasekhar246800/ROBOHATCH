import { CheckCircle2, Layers } from "lucide-react";
import { MainContainer } from "@/components/layout";
import { SectionHeading } from "@/components/common";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MATERIALS_DATA } from "@/data/materials";

export function MaterialsQuality() {
  return (
    <section className="border-b border-border bg-secondary/30 py-16 sm:py-20 lg:py-24">
      <MainContainer size="xl" className="space-y-12">
        <SectionHeading
          badge="Material Science"
          title="Materials & Fabrication Quality"
          description="We select and calibrate aerospace and industrial feedstocks, ensuring every object possesses genuine tactile durability, precise tolerances, and distinct surface finishes."
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MATERIALS_DATA.map((mat) => (
            <Card
              key={mat.id}
              className="flex flex-col justify-between border-border bg-card transition-all duration-200 hover:border-foreground/20 hover:shadow-sm"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] uppercase tracking-wider"
                  >
                    {mat.code.split(" ")[0]}
                  </Badge>
                  <Layers className="h-4 w-4 text-[#E87536]" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {mat.name}
                  </CardTitle>
                  <CardDescription className="mt-0.5 text-xs text-muted-foreground">
                    {mat.code}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {mat.shortDescription}
                </p>

                <div className="space-y-2 border-t border-border/50 pt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Surface Texture:</span>
                    <span className="font-medium text-foreground">{mat.finish}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resolution:</span>
                    <span className="font-mono font-medium text-foreground">
                      {mat.layerResolution}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Optimal For:</span>
                    <span className="text-right font-medium text-foreground">
                      {mat.bestFor}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-border/50 pt-3">
                  {mat.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-1.5 text-[11px] text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#E87536]" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </MainContainer>
    </section>
  );
}
