export interface DemoProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  categorySlug: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  material: "Carbon PETG" | "Matte PLA" | "Tough Resin" | "Industrial ABS";
  badge?: string;
  isFeatured: boolean;
  isNew: boolean;
  rating: number;
  reviewsCount: number;
  dimensionsMm?: string;
}

export const PRODUCTS_DATA: DemoProduct[] = [
  {
    id: "prod-1",
    slug: "voronoi-kinetic-vessel",
    name: "Voronoi Kinetic Vessel",
    description:
      "A mathematically calculated cellular Voronoi lattice vessel engineered for sculptural prominence and delicate botanical arrangements.",
    category: "Home & Living",
    categorySlug: "home-and-living",
    price: 2499,
    compareAtPrice: 3199,
    image:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80",
    material: "Carbon PETG",
    badge: "Bestseller",
    isFeatured: true,
    isNew: false,
    rating: 4.9,
    reviewsCount: 38,
    dimensionsMm: "140 × 140 × 260 mm",
  },
  {
    id: "prod-2",
    slug: "tessellated-desk-organizer",
    name: "Tessellated Hex Desk Organizer",
    description:
      "Interlocking hexagonal desktop modules with angled instrument wells, card slots, and integrated cable pass-throughs.",
    category: "Desk Accessories",
    categorySlug: "desk-accessories",
    price: 1850,
    compareAtPrice: null,
    image:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    material: "Matte PLA",
    badge: "Staff Pick",
    isFeatured: true,
    isNew: false,
    rating: 4.8,
    reviewsCount: 29,
    dimensionsMm: "220 × 120 × 95 mm",
  },
  {
    id: "prod-3",
    slug: "gyroid-acoustic-diffuser",
    name: "Gyroid Acoustic Sound Tile",
    description:
      "Continuous minimal triply periodic gyroid surface calculated to scatter mid-to-high frequency acoustic reflections in studio spaces.",
    category: "Art & Decor",
    categorySlug: "art-and-decor",
    price: 3400,
    compareAtPrice: 4200,
    image:
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
    material: "Tough Resin",
    badge: "Limited Batch",
    isFeatured: true,
    isNew: false,
    rating: 5.0,
    reviewsCount: 14,
    dimensionsMm: "200 × 200 × 40 mm",
  },
  {
    id: "prod-4",
    slug: "modular-magsafe-dock",
    name: "Apex Geometric MagSafe Dock",
    description:
      "Ergonomically weighted desktop charging pedestal holding iPhones securely at an optimal 45-degree angle with concealed cable routing.",
    category: "Gadgets & Accessories",
    categorySlug: "gadgets-and-accessories",
    price: 2199,
    compareAtPrice: 2650,
    image:
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80",
    material: "Carbon PETG",
    badge: "Top Rated",
    isFeatured: true,
    isNew: false,
    rating: 4.9,
    reviewsCount: 42,
    dimensionsMm: "95 × 95 × 115 mm",
  },
  {
    id: "prod-5",
    slug: "articulated-cyber-beetle",
    name: "Articulated Titan Beetle Automaton",
    description:
      "Intricate print-in-place mechanical specimen featuring 22 ball-joint segments, segmented elytra, and micro-textured exoskeleton detailing.",
    category: "Miniatures & Collectibles",
    categorySlug: "miniatures-and-collectibles",
    price: 2899,
    compareAtPrice: null,
    image:
      "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80",
    material: "Tough Resin",
    badge: "Collector",
    isFeatured: false,
    isNew: true,
    rating: 4.9,
    reviewsCount: 18,
    dimensionsMm: "160 × 90 × 45 mm",
  },
  {
    id: "prod-6",
    slug: "fibonacci-spiral-planter",
    name: "Fibonacci Spiral Self-Watering Planter",
    description:
      "A golden ratio spiral shell silhouette containing a hidden sub-irrigation capillary water reservoir for succulents and delicate flora.",
    category: "Home & Living",
    categorySlug: "home-and-living",
    price: 1699,
    compareAtPrice: 2100,
    image:
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80",
    material: "Matte PLA",
    badge: "New Release",
    isFeatured: false,
    isNew: true,
    rating: 4.7,
    reviewsCount: 11,
    dimensionsMm: "130 × 130 × 110 mm",
  },
  {
    id: "prod-7",
    slug: "parametric-cable-loom",
    name: "Parametric Under-Desk Cable Loom",
    description:
      "Modular snap-fit wire raceway segments engineered for clean under-desk routing, high-tension clamping, and concealed cable organization.",
    category: "Functional Objects",
    categorySlug: "functional-objects",
    price: 1299,
    compareAtPrice: null,
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    material: "Industrial ABS",
    badge: "New Release",
    isFeatured: false,
    isNew: true,
    rating: 4.8,
    reviewsCount: 19,
    dimensionsMm: "350 × 45 × 30 mm",
  },
  {
    id: "prod-8",
    slug: "minimalist-caliper-stand",
    name: "Precision Caliper & Gauge Pedestal",
    description:
      "Weighted vertical instrument rest designed to cradle digital vernier calipers, micrometer screw gauges, and precision scale rules.",
    category: "Functional Objects",
    categorySlug: "functional-objects",
    price: 1450,
    compareAtPrice: 1750,
    image:
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
    material: "Carbon PETG",
    badge: "New Release",
    isFeatured: false,
    isNew: true,
    rating: 4.9,
    reviewsCount: 8,
    dimensionsMm: "85 × 85 × 140 mm",
  },
];

export const BEST_SELLERS = PRODUCTS_DATA.filter((p) => p.isFeatured);
export const NEW_ARRIVALS = PRODUCTS_DATA.filter((p) => p.isNew);
