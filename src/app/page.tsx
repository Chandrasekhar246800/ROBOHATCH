import { Navbar, Footer } from "@/components/layout";
import {
  HeroSection,
  FeaturedCategories,
  BestSellers,
  NewArrivals,
  BrandStory,
  FeaturedCollection,
  MaterialsQuality,
  CustomerTestimonials,
  Newsletter,
} from "@/components/home";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Navigation */}
      <Navbar cartCount={0} />

      <main className="flex-1">
        {/* SECTION 1: HERO */}
        <HeroSection />

        {/* SECTION 2: FEATURED CATEGORIES */}
        <FeaturedCategories />

        {/* SECTION 3: BEST SELLERS */}
        <BestSellers />

        {/* SECTION 4: NEW ARRIVALS */}
        <NewArrivals />

        {/* SECTION 5: BRAND STORY */}
        <BrandStory />

        {/* SECTION 6: FEATURED COLLECTION */}
        <FeaturedCollection />

        {/* SECTION 7: MATERIALS & QUALITY */}
        <MaterialsQuality />

        {/* SECTION 8: CUSTOMER TESTIMONIALS */}
        <CustomerTestimonials />

        {/* SECTION 9: NEWSLETTER */}
        <Newsletter />
      </main>

      {/* SECTION 10: FOOTER */}
      <Footer />
    </div>
  );
}
