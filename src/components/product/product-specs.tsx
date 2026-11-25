import * as React from "react";
import { DemoProduct } from "@/data/products";
import { cn } from "@/lib/utils";

export interface ProductSpecsProps {
  product: DemoProduct;
  className?: string;
}

export function ProductSpecs({ product, className }: ProductSpecsProps) {
  // Aggregate verified specifications without duplication
  const seenKeys = new Set<string>();
  const entries: { label: string; value: string; isMono?: boolean }[] = [];

  const addEntry = (label: string, value: string | undefined | null, isMono = true) => {
    if (!value || typeof value !== "string" || !value.trim()) return;
    const normalizedKey = label.trim().toLowerCase();
    if (seenKeys.has(normalizedKey)) return;
    seenKeys.add(normalizedKey);
    entries.push({ label, value: value.trim(), isMono });
  };

  // 1. Primary Physical Metrics
  if (product.material) {
    addEntry("Base Material", product.material, false);
  }

  const dimensions = product.dimensions || product.dimensionsMm;
  if (dimensions) {
    addEntry("Dimensions (L × W × H)", dimensions, true);
  }

  if (product.weight) {
    addEntry("Unit Weight", product.weight, true);
  }

  // 2. Additive Manufacturing Parameters
  const manufacturing =
    product.specifications?.["Manufacturing Process"] ||
    product.specifications?.["Manufacturing Method"];
  if (manufacturing) {
    addEntry("Print Technology", manufacturing, false);
  }

  const layer =
    product.specifications?.["Layer Resolution"] ||
    product.specifications?.["Layer Precision"];
  if (layer) {
    addEntry("Layer Resolution", layer, true);
  }

  const composition = product.specifications?.["Material Composition"];
  if (composition) {
    addEntry("Material Formulation", composition, false);
  }

  const infill =
    product.specifications?.["Infill Strategy"] ||
    product.specifications?.["Infill Density"] ||
    product.specifications?.["Internal Structure"];
  if (infill) {
    addEntry("Internal Geometry", infill, false);
  }

  const finish = product.specifications?.["Surface Finish"];
  if (finish) {
    addEntry("Surface Finish", finish, false);
  }

  // 3. Map remaining verified specifications from the data model
  if (product.specifications) {
    for (const [key, val] of Object.entries(product.specifications)) {
      // Skip already-consumed variants
      const lower = key.toLowerCase();
      if (
        lower === "manufacturing process" ||
        lower === "manufacturing method" ||
        lower === "layer resolution" ||
        lower === "layer precision" ||
        lower === "material composition" ||
        lower === "infill strategy" ||
        lower === "infill density" ||
        lower === "surface finish" ||
        lower === "material" ||
        lower === "base material"
      ) {
        continue;
      }

      if (val && typeof val === "string") {
        const isNumericOrMeasured = /[\d°×]|mm|g|ml|micron|hz|khz|c\b/i.test(val);
        addEntry(key, val, isNumericOrMeasured);
      }
    }
  }

  if (entries.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          Technical Specifications
        </h3>
        <p className="text-xs text-muted-foreground">
          Observed additive manufacturing parameters and physical dimensions.
        </p>
      </div>

      <div className="shadow-xs overflow-hidden rounded-xl border border-border bg-card">
        <dl className="divide-y divide-border/60">
          {entries.map((item, idx) => (
            <div
              key={idx}
              className={cn(
                "grid grid-cols-1 gap-1.5 px-5 py-3.5 text-xs sm:grid-cols-12 sm:gap-4 sm:text-sm",
                idx % 2 === 0 ? "bg-transparent" : "bg-secondary/30"
              )}
            >
              <dt className="font-medium text-muted-foreground sm:col-span-4 sm:font-semibold">
                {item.label}
              </dt>
              <dd
                className={cn(
                  "text-foreground sm:col-span-8",
                  item.isMono && "font-mono text-xs sm:text-sm"
                )}
              >
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
