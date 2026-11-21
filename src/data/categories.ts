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
    imageUrl:
      "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "cat-2",
    name: "Desk Accessories",
    slug: "desk-accessories",
    description: "Modular organizers, ergonomic docking rests, and precision pen wells.",
    itemCount: 19,
    imageUrl:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "cat-3",
    name: "Gadgets & Accessories",
    slug: "gadgets-and-accessories",
    description: "MagSafe pedestals, cable management tracks, and audio mounts.",
    itemCount: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "cat-4",
    name: "Miniatures & Collectibles",
    slug: "miniatures-and-collectibles",
    description: "High-resolution resin automatons, mechanical models, and chess sets.",
    itemCount: 8,
    imageUrl:
      "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "cat-5",
    name: "Art & Decor",
    slug: "art-and-decor",
    description: "Voronoi wall panels, mathematical lattices, and optical vases.",
    itemCount: 16,
    imageUrl:
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "cat-6",
    name: "Functional Objects",
    slug: "functional-objects",
    description:
      "Calibrated measuring tool stands, kitchen jigs, and heavy-duty brackets.",
    itemCount: 11,
    imageUrl:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
  },
];
