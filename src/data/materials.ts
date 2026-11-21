export interface MaterialInfo {
  id: string;
  name: string;
  code: string;
  shortDescription: string;
  finish: string;
  layerResolution: string;
  bestFor: string;
  features: string[];
}

export const MATERIALS_DATA: MaterialInfo[] = [
  {
    id: "mat-pla",
    name: "Industrial Matte PLA",
    code: "Polylactic Acid",
    shortDescription:
      "Bio-based polymer derived from renewable starches, engineered with mineral additives for a zero-sheen, stone-like aesthetic.",
    finish: "Micro-Textured Matte",
    layerResolution: "0.12 – 0.16 mm",
    bestFor: "Architectural Decor & Planters",
    features: [
      "Zero surface reflection & glare",
      "Dimensional accuracy within ±0.15 mm",
      "Biodegradable industrial feedstock",
    ],
  },
  {
    id: "mat-petg",
    name: "Carbon-Enhanced PETG",
    code: "Polyethylene Terephthalate Glycol",
    shortDescription:
      "High-durability structural copolymer blended with micro carbon fibers for exceptional rigidity, impact absorption, and temperature resilience.",
    finish: "Satin Structural",
    layerResolution: "0.16 – 0.20 mm",
    bestFor: "Desk Gear & Functional Hardware",
    features: [
      "High impact & tensile resistance",
      "Moisture and chemical resistant",
      "Resilient up to 75°C continuous use",
    ],
  },
  {
    id: "mat-abs",
    name: "Engineering ABS",
    code: "Acrylonitrile Butadiene Styrene",
    shortDescription:
      "Industrial thermoplastic renowned for high heat deflection, flexural endurance, and precision snap-fit retention.",
    finish: "Smooth Satin",
    layerResolution: "0.12 – 0.16 mm",
    bestFor: "Mechanical Links & Enclosures",
    features: [
      "Heat deflection up to 98°C",
      "Exceptional flexural fatigue strength",
      "Superior dimensional repeatability",
    ],
  },
  {
    id: "mat-resin",
    name: "High-Detail Tough Resin",
    code: "Photopolymer Acrylate",
    shortDescription:
      "Stereolithography formulation cured at 405nm light wavelength for microscopic geometric definition and glass-smooth tactile surfaces.",
    finish: "Ultra-Smooth High Density",
    layerResolution: "25 – 50 microns",
    bestFor: "Art Sculptures & Miniatures",
    features: [
      "Microscopic 25-micron layer detail",
      "Isotropic mechanical strength in all axes",
      "Seamless organic curve reproduction",
    ],
  },
];
