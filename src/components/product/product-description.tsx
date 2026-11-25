import * as React from "react";
import { Sparkles, Cpu, ShieldCheck, Leaf } from "lucide-react";
import { DemoProduct } from "@/data/products";
import { cn } from "@/lib/utils";

export interface ProductDescriptionProps {
  product: DemoProduct;
  className?: string;
}

export function ProductDescription({ product, className }: ProductDescriptionProps) {
  // Material-specific descriptive overview
  const getMaterialRationale = (material: string) => {
    switch (material) {
      case "Carbon PETG":
        return "Selected for its structural rigidity and clean aesthetic. Carbon fiber-reinforced PETG provides good mechanical stiffness with a distinctive low-gloss, fine-textured matte finish suitable for architectural and functional objects.";
      case "Matte PLA":
        return "Selected for its clean visual presentation and crisp geometric definition. Matte PLA provides a non-reflective, tactile surface finish that accentuates subtle curves and planar facets in interior lighting.";
      case "Tough Resin":
        return "Cured using high-resolution vat photopolymerization (SLA). Stereolithography produces smooth surface transitions with fine layer definition, reproducing intricate articulation and organic textures with high fidelity.";
      case "Industrial ABS":
        return "Specified for its mechanical durability and snap-fit flexural behavior. Industrial ABS provides good impact resistance and dimensional stability for functional desk and cable management accessories.";
      default:
        return "Engineered specifically for balanced structural stiffness and clean surface presentation under daily interior handling.";
    }
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* 1. Editorial Concept & Narrative */}
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#E87536]">
          Design Concept & Narrative
        </span>
        <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Architectural Intent & Functional Form
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {product.longDescription || product.description}
        </p>
      </div>

      {/* 2. Four Structured Engineering & Craft Pillars */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Computational Geometry */}
        <div className="shadow-xs space-y-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 shrink-0 text-[#E87536]" />
            <span>Parametric Computational Geometry</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Form follows algorithm. Geometries and cellular lattices are mathematically
            generated to balance structural form with visual lightness, creating distinct
            architectural silhouettes.
          </p>
        </div>

        {/* Material Selection Rationale */}
        <div className="shadow-xs space-y-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
            <Cpu className="h-4 w-4 shrink-0 text-[#E87536]" />
            <span>Material Specification: {product.material}</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {getMaterialRationale(product.material)}
          </p>
        </div>

        {/* Additive Tooling & On-Demand Production */}
        <div className="shadow-xs space-y-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
            <Leaf className="h-4 w-4 shrink-0 text-[#E87536]" />
            <span>Additive Tooling & On-Demand Production</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Additive manufacturing eliminates the need for high-volume metal molds or
            disposable tooling. By printing objects on demand, material waste and excess
            warehouse inventory are significantly reduced compared to traditional mass
            manufacturing methods.
          </p>
        </div>

        {/* Care & Maintenance */}
        <div className="shadow-xs space-y-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#E87536]" />
            <span>Care & Material Handling</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Clean gently with a soft dry or damp microfiber cloth. As with most desktop
            3D-printed thermoplastics, keep away from open flames, direct sustained heat
            sources, and harsh chemical solvents such as acetone. Intended for indoor
            display and use.
          </p>
        </div>
      </div>
    </div>
  );
}
