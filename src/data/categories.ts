import { PRODUCTS_DATA } from "./products";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  itemCount: number;
  imageUrl: string;
}

export const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: "cat-1",
    name: "Home & Living",
    slug: "home-and-living",
    description:
      "Parametric planters, kinetic centerpieces, and organic interior sculptures.",
    itemCount: 14,
    imageUrl: "/images/categories/home-and-living.jpg",
  },
  {
    id: "cat-2",
    name: "Desk Accessories",
    slug: "desk-accessories",
    description: "Modular organizers, ergonomic docking rests, and precision pen wells.",
    itemCount: 19,
    imageUrl: "/images/categories/desk-accessories.jpg",
  },
  {
    id: "cat-3",
    name: "Gadgets & Accessories",
    slug: "gadgets-and-accessories",
    description: "MagSafe pedestals, cable management tracks, and audio mounts.",
    itemCount: 12,
    imageUrl: "/images/categories/gadgets-and-accessories.jpg",
  },
  {
    id: "cat-4",
    name: "Miniatures & Collectibles",
    slug: "miniatures-and-collectibles",
    description: "High-resolution resin automatons, mechanical models, and chess sets.",
    itemCount: 8,
    imageUrl: "/images/categories/miniatures-and-collectibles.jpg",
  },
  {
    id: "cat-5",
    name: "Art & Decor",
    slug: "art-and-decor",
    description: "Voronoi wall panels, mathematical lattices, and optical vases.",
    itemCount: 16,
    imageUrl: "/images/categories/art-and-decor.jpg",
  },
  {
    id: "cat-6",
    name: "Functional Objects",
    slug: "functional-objects",
    description:
      "Calibrated measuring tool stands, kitchen jigs, and heavy-duty brackets.",
    itemCount: 11,
    imageUrl: "/images/categories/functional-objects.jpg",
  },
];

export function getCategoryBySlug(slug: string): CategoryItem | undefined {
  return CATEGORIES_DATA.find((c) => c.slug === slug);
}

export function getActualProductCountForCategory(slug: string): number {
  return PRODUCTS_DATA.filter((p) => p.categorySlug === slug).length;
}
