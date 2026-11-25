export type ProductMaterial =
  "Carbon PETG" | "Matte PLA" | "Tough Resin" | "Industrial ABS";

export type ProductAvailability = "In Stock" | "Low Stock" | "Made to Order";

export interface DemoProduct {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  longDescription: string;
  category: string;
  categorySlug: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  images: string[];
  material: ProductMaterial;
  colors?: string[];
  dimensions?: string;
  dimensionsMm?: string;
  weight?: string;
  specifications: Record<string, string>;
  badge?: string;
  availability: ProductAvailability;
  createdAt: string;
  isFeatured: boolean;
  isNew: boolean;
  rating: number;
  reviewsCount: number;
}

export const PRODUCTS_DATA: DemoProduct[] = [
  {
    id: "prod-1",
    slug: "voronoi-kinetic-vessel",
    name: "Voronoi Kinetic Vessel",
    shortDescription:
      "A mathematically calculated cellular Voronoi lattice vessel engineered for sculptural prominence and delicate botanical arrangements.",
    description:
      "A mathematically calculated cellular Voronoi lattice vessel engineered for sculptural prominence and delicate botanical arrangements.",
    longDescription:
      "The Voronoi Kinetic Vessel emerges from computational spatial algorithms that simulate cellular structures found in nature. Constructed with carbon fiber-reinforced PETG, each strut in the open lattice balances structural rigidity with visual lightness. Designed as a striking standalone art piece or an architectural vase for dried botanicals and architectural stems.",
    category: "Home & Living",
    categorySlug: "home-and-living",
    price: 2499,
    compareAtPrice: 3199,
    image: "/images/products/voronoi-kinetic-vessel.jpg",
    images: [
      "/images/products/voronoi-kinetic-vessel.jpg",
      "/images/hero/hero-voronoi-vessel.jpg",
    ],
    material: "Carbon PETG",
    colors: ["Carbon Obsidian", "Basalt Charcoal"],
    dimensions: "140 × 140 × 260 mm",
    dimensionsMm: "140 × 140 × 260 mm",
    weight: "380 g",
    specifications: {
      "Manufacturing Process": "Continuous Fused Filament Fabrication (FFF)",
      "Layer Resolution": "0.16 mm",
      "Material Composition": "Carbon fiber-reinforced PETG copolymer",
      "Surface Finish": "Micro-textured matte satin",
      Origin: "Designed & fabricated in Bengaluru, India",
    },
    badge: "Bestseller",
    availability: "In Stock",
    createdAt: "2026-10-15T09:00:00.000Z",
    isFeatured: true,
    isNew: false,
    rating: 4.9,
    reviewsCount: 38,
  },
  {
    id: "prod-2",
    slug: "tessellated-desk-organizer",
    name: "Tessellated Hex Desk Organizer",
    shortDescription:
      "Interlocking hexagonal desktop modules with angled instrument wells, card slots, and integrated cable pass-throughs.",
    description:
      "Interlocking hexagonal desktop modules with angled instrument wells, card slots, and integrated cable pass-throughs.",
    longDescription:
      "Engineered to bring architectural discipline to workspaces, the Tessellated Hex Desk Organizer utilizes a tri-hex modular footprint. Each cell is calibrated for stationary instruments: deep wells for drafting pens, tiered slots for business cards, and a subterranean channel for routing USB-C charging cables cleanly beneath.",
    category: "Desk Accessories",
    categorySlug: "desk-accessories",
    price: 1850,
    compareAtPrice: null,
    image: "/images/products/tessellated-desk-organizer.jpg",
    images: ["/images/products/tessellated-desk-organizer.jpg"],
    material: "Matte PLA",
    colors: ["Architectural Bone", "Matte Charcoal"],
    dimensions: "220 × 120 × 95 mm",
    dimensionsMm: "220 × 120 × 95 mm",
    weight: "420 g",
    specifications: {
      "Manufacturing Process": "Fused Filament Fabrication (FFF)",
      "Layer Resolution": "0.16 mm",
      "Material Composition": "Matte finish Polylactic Acid (PLA)",
      "Surface Finish": "Zero-glare micro-stippled matte",
      "Base Protection": "Recessed non-slip silicone pads included",
    },
    badge: "Staff Pick",
    availability: "In Stock",
    createdAt: "2026-10-20T10:00:00.000Z",
    isFeatured: true,
    isNew: false,
    rating: 4.8,
    reviewsCount: 29,
  },
  {
    id: "prod-3",
    slug: "gyroid-acoustic-diffuser",
    name: "Gyroid Acoustic Sound Tile",
    shortDescription:
      "Continuous minimal triply periodic gyroid surface calculated to scatter mid-to-high frequency acoustic reflections in studio spaces.",
    description:
      "Continuous minimal triply periodic gyroid surface calculated to scatter mid-to-high frequency acoustic reflections in studio spaces.",
    longDescription:
      "Based on triply periodic minimal surface (TPMS) mathematics discovered by Alan Schoen, this gyroid panel presents an infinite continuous boundary without self-intersection. Cured via precision photopolymerization, the undulating curves form a continuous geometric relief surface suitable for contemporary architectural and studio wall accents.",
    category: "Art & Decor",
    categorySlug: "art-and-decor",
    price: 3400,
    compareAtPrice: 4200,
    image: "/images/products/gyroid-acoustic-diffuser.jpg",
    images: [
      "/images/products/gyroid-acoustic-diffuser.jpg",
      "/images/editorial/featured-capsule.jpg",
    ],
    material: "Tough Resin",
    colors: ["Titanium Slate", "Pure Alabaster"],
    dimensions: "200 × 200 × 40 mm",
    dimensionsMm: "200 × 200 × 40 mm",
    weight: "610 g",
    specifications: {
      "Manufacturing Process": "Stereolithography (SLA / MSLA)",
      "Layer Resolution": "50 microns (0.05 mm)",
      "Material Composition": "Crosslinked photopolymer resin",
      "Mounting Mechanism": "Concealed keyhole brackets for flush wall mounting",
      "Surface Finish": "Hand-cured isotropic smooth satin",
    },
    badge: "Limited Batch",
    availability: "Low Stock",
    createdAt: "2026-10-25T11:00:00.000Z",
    isFeatured: true,
    isNew: false,
    rating: 5.0,
    reviewsCount: 14,
  },
  {
    id: "prod-4",
    slug: "modular-magsafe-dock",
    name: "Apex Geometric MagSafe Dock",
    shortDescription:
      "Ergonomically weighted desktop charging pedestal holding iPhones securely at an optimal 45-degree angle with concealed cable routing.",
    description:
      "Ergonomically weighted desktop charging pedestal holding iPhones securely at an optimal 45-degree angle with concealed cable routing.",
    longDescription:
      "A desktop charging sculpture designed for seamless one-handed detachment. The Apex MagSafe Dock features a weighted internal cavity and precision press-fit silicone ring engineered to hold official Apple and Qi2 wireless chargers. Angled at exactly 45 degrees, it supports StandBy mode on nightstands and desks while routing cables invisibly through a rear channel.",
    category: "Gadgets & Accessories",
    categorySlug: "gadgets-and-accessories",
    price: 2199,
    compareAtPrice: 2650,
    image: "/images/products/modular-magsafe-dock.jpg",
    images: ["/images/products/modular-magsafe-dock.jpg"],
    material: "Carbon PETG",
    colors: ["Stealth Black", "Carbon Grey"],
    dimensions: "95 × 95 × 115 mm",
    dimensionsMm: "95 × 95 × 115 mm",
    weight: "340 g (counterbalanced)",
    specifications: {
      Compatibility: "Apple MagSafe & Qi2 wireless chargers (56 mm puck diameter)",
      "Viewing Angle": "45° fixed ergonomic elevation",
      "Manufacturing Process": "Continuous FFF with high-density solid infill",
      "Material Composition": "Carbon-fiber reinforced PETG copolymer",
      "Base Retention": "Non-slip desk pad",
    },
    badge: "Top Rated",
    availability: "In Stock",
    createdAt: "2026-11-02T12:00:00.000Z",
    isFeatured: true,
    isNew: false,
    rating: 4.9,
    reviewsCount: 42,
  },
  {
    id: "prod-5",
    slug: "articulated-cyber-beetle",
    name: "Articulated Titan Beetle Automaton",
    shortDescription:
      "Intricate print-in-place mechanical specimen featuring 22 ball-joint segments, segmented elytra, and micro-textured exoskeleton detailing.",
    description:
      "Intricate print-in-place mechanical specimen featuring 22 ball-joint segments, segmented elytra, and micro-textured exoskeleton detailing.",
    longDescription:
      "Inspired by coleopteran anatomy and cyberpunk mecha fiction, this articulated specimen is produced with zero post-assembly. Twenty-two internal captive ball joints and folding wing cases are formed simultaneously within the photopolymer resin vat. Features fine surface texturing and poseable mandibular pincers.",
    category: "Miniatures & Collectibles",
    categorySlug: "miniatures-and-collectibles",
    price: 2899,
    compareAtPrice: null,
    image: "/images/products/articulated-cyber-beetle.jpg",
    images: ["/images/products/articulated-cyber-beetle.jpg"],
    material: "Tough Resin",
    colors: ["Gunmetal Grey", "Industrial Amber"],
    dimensions: "160 × 90 × 45 mm",
    dimensionsMm: "160 × 90 × 45 mm",
    weight: "180 g",
    specifications: {
      "Joint Articulation": "22 captive articulated ball joints (print-in-place)",
      "Manufacturing Method": "Stereolithography (SLA) vat photopolymerization",
      "Layer Precision": "25 microns (0.025 mm)",
      "Post-Processing": "Ultrasonic solvent cleanse & dual-wavelength UV cure",
    },
    badge: "Collector",
    availability: "Made to Order",
    createdAt: "2026-11-05T14:00:00.000Z",
    isFeatured: false,
    isNew: true,
    rating: 4.9,
    reviewsCount: 18,
  },
  {
    id: "prod-6",
    slug: "fibonacci-spiral-planter",
    name: "Fibonacci Spiral Self-Watering Planter",
    shortDescription:
      "A golden ratio spiral shell silhouette containing a hidden sub-irrigation capillary water reservoir for succulents and delicate flora.",
    description:
      "A golden ratio spiral shell silhouette containing a hidden sub-irrigation capillary water reservoir for succulents and delicate flora.",
    longDescription:
      "Following the mathematical proportion of the logarithmic golden spiral, this planter merges botanical geometry with automated plant care. The dual-chamber structure holds a 150ml water reservoir in the base. A porous capillary wick draws water upward directly into the root zone, helping maintain gradual soil hydration.",
    category: "Home & Living",
    categorySlug: "home-and-living",
    price: 1699,
    compareAtPrice: 2100,
    image: "/images/products/fibonacci-spiral-planter.jpg",
    images: ["/images/products/fibonacci-spiral-planter.jpg"],
    material: "Matte PLA",
    colors: ["Chalk White", "Terracotta Stone", "Basalt Black"],
    dimensions: "130 × 130 × 110 mm",
    dimensionsMm: "130 × 130 × 110 mm",
    weight: "260 g",
    specifications: {
      "Reservoir Volume": "150 ml sub-irrigation capillary water reserve",
      "Drainage System": "Porous capillary wick platform with overflow prevention",
      "Material Composition": "Matte finish Polylactic Acid (PLA)",
      "Layer Resolution": "0.16 mm",
    },
    badge: "New Release",
    availability: "In Stock",
    createdAt: "2026-11-10T15:00:00.000Z",
    isFeatured: false,
    isNew: true,
    rating: 4.7,
    reviewsCount: 11,
  },
  {
    id: "prod-7",
    slug: "parametric-cable-loom",
    name: "Parametric Under-Desk Cable Loom",
    shortDescription:
      "Modular snap-fit wire raceway segments engineered for clean under-desk routing, high-tension clamping, and concealed cable organization.",
    description:
      "Modular snap-fit wire raceway segments engineered for clean under-desk routing, high-tension clamping, and concealed cable organization.",
    longDescription:
      "Engineered for high-density audio, video, and power cable consolidation. Each interlocking link pivots up to 30 degrees, allowing clean curved transitions from standing desk grommets to wall outlets. Durable ABS offers good flexural resilience, allowing clips to open and close securely for cable organization.",
    category: "Functional Objects",
    categorySlug: "functional-objects",
    price: 1299,
    compareAtPrice: null,
    image: "/images/products/parametric-cable-loom.jpg",
    images: ["/images/products/parametric-cable-loom.jpg"],
    material: "Industrial ABS",
    colors: ["Industrial Matte Black", "Smoke Grey"],
    dimensions: "350 × 45 × 30 mm (modular expandable)",
    dimensionsMm: "350 × 45 × 30 mm",
    weight: "210 g",
    specifications: {
      "Cable Capacity": "Consolidates up to 6 cables (12 mm maximum diameter each)",
      "Material Composition": "Engineering-grade ABS polymer",
      "Joint Design": "Integrated snap-fit hinge retention",
      Mounting: "Dual countersunk M4 screw holes + heavy-duty tape channels",
    },
    badge: "New Release",
    availability: "In Stock",
    createdAt: "2026-11-12T16:00:00.000Z",
    isFeatured: false,
    isNew: true,
    rating: 4.8,
    reviewsCount: 19,
  },
  {
    id: "prod-8",
    slug: "minimalist-caliper-stand",
    name: "Precision Caliper & Gauge Pedestal",
    shortDescription:
      "Weighted vertical instrument rest designed to cradle digital vernier calipers, micrometer screw gauges, and precision scale rules.",
    description:
      "Weighted vertical instrument rest designed to cradle digital vernier calipers, micrometer screw gauges, and precision scale rules.",
    longDescription:
      "Designed specifically for engineering benches and inspection stations. This stand holds precision digital calipers upright by their beam rather than the fragile carbide tips. An inclined cradle prevents jaw collisions, while the low center of mass prevents tipping even when bumping the workbench.",
    category: "Functional Objects",
    categorySlug: "functional-objects",
    price: 1450,
    compareAtPrice: 1750,
    image: "/images/products/minimalist-caliper-stand.jpg",
    images: ["/images/products/minimalist-caliper-stand.jpg"],
    material: "Carbon PETG",
    colors: ["Carbon Black", "Machinist Grey"],
    dimensions: "85 × 85 × 140 mm",
    dimensionsMm: "85 × 85 × 140 mm",
    weight: "290 g (counterbalanced base)",
    specifications: {
      "Instrument Compatibility": "Standard 150 mm and 200 mm vernier/digital calipers",
      "Cradle Design": "Chamfered jaw relief with zero carbide tip contact",
      "Material Composition": "Carbon-fiber reinforced PETG copolymer",
      "Infill Strategy": "40% gyroid internal infill for structural stability",
    },
    badge: "New Release",
    availability: "In Stock",
    createdAt: "2026-11-15T17:00:00.000Z",
    isFeatured: false,
    isNew: true,
    rating: 4.9,
    reviewsCount: 8,
  },
];

export const BEST_SELLERS = PRODUCTS_DATA.filter((p) => p.isFeatured);
export const NEW_ARRIVALS = PRODUCTS_DATA.filter((p) => p.isNew);

export function getProductBySlug(slug: string): DemoProduct | undefined {
  return PRODUCTS_DATA.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): DemoProduct[] {
  return PRODUCTS_DATA.filter((p) => p.categorySlug === categorySlug);
}

export function getRelatedProducts(
  currentSlug: string,
  categorySlug: string,
  material: ProductMaterial,
  limit = 4
): DemoProduct[] {
  // Exclude current product
  const others = PRODUCTS_DATA.filter((p) => p.slug !== currentSlug);

  // Score others: same category (+2), same material (+1)
  const scored = others.map((p) => {
    let score = 0;
    if (p.categorySlug === categorySlug) score += 2;
    if (p.material === material) score += 1;
    return { product: p, score };
  });

  // Sort descending by score, then pick up to limit
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.product);
}
