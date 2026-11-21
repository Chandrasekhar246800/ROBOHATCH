export interface TestimonialItem {
  id: string;
  author: string;
  role: string;
  city: string;
  productName: string;
  quote: string;
  rating: number;
}

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: "test-1",
    author: "Arjun Mehta",
    role: "Architectural Visualizer",
    city: "Bengaluru",
    productName: "Voronoi Kinetic Vessel",
    quote:
      "The lattice complexity on the Voronoi vessel is remarkable. There is zero stringing, and the matte texture absorbs ambient gallery lighting in a way injection molding simply cannot achieve.",
    rating: 5,
  },
  {
    id: "test-2",
    author: "Elena Rostova",
    role: "Industrial Designer",
    city: "Mumbai",
    productName: "Tessellated Hex Desk Organizer",
    quote:
      "Clean bevels, solid weight, and seamless module tolerance. You can tell the print orientation and slicing parameters were calibrated by engineers who appreciate physical ergonomics.",
    rating: 5,
  },
  {
    id: "test-3",
    author: "Devang Sharma",
    role: "Sound Engineer",
    city: "Pune",
    productName: "Gyroid Acoustic Sound Tile",
    quote:
      "The high-resolution resin gyroid surface is mathematically impeccable. It performs as both a functional sound diffuser and an architectural statement in my mixing suite.",
    rating: 5,
  },
];
