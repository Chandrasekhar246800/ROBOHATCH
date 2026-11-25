import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MainContainer } from "@/components/layout";
import { Breadcrumb } from "@/components/common";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { ProductSpecs } from "@/components/product/product-specs";
import { ProductDescription } from "@/components/product/product-description";
import { RelatedProducts } from "@/components/product/related-products";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { MobileStickyBar } from "@/components/product/mobile-sticky-bar";
import { PRODUCTS_DATA, getProductBySlug } from "@/data/products";
import { Separator } from "@/components/ui/separator";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return PRODUCTS_DATA.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | RoboHatch",
    };
  }

  return {
    title: `${product.name} | RoboHatch`,
    description: product.shortDescription || product.description,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | RoboHatch`,
      description: product.shortDescription || product.description,
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <MainContainer
        size="xl"
        className="space-y-12 py-6 pb-24 sm:space-y-16 sm:py-10 lg:pb-12"
      >
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/products" },
            {
              label: product.category,
              href: `/categories/${product.categorySlug}`,
            },
            { label: product.name },
          ]}
        />

        {/* Main PDP 2-Column Hero Composition */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Product Image Gallery (~58% width on desktop) */}
          <div className="lg:col-span-7">
            <ProductGallery
              images={product.images || [product.image]}
              productName={product.name}
            />
          </div>

          {/* Right Column: Product Information & Purchasing (~42% width on desktop) */}
          <div className="lg:sticky lg:top-24 lg:col-span-5">
            <ProductInfo product={product} />
          </div>
        </div>

        <Separator className="my-8" />

        {/* Editorial Description & Specifications Sections */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left: Deep-Dive Editorial Description */}
          <div className="lg:col-span-7">
            <ProductDescription product={product} />
          </div>

          {/* Right: Technical Specifications */}
          <div className="lg:col-span-5">
            <ProductSpecs product={product} />
          </div>
        </div>

        <Separator className="my-8" />

        {/* Related Products */}
        <RelatedProducts currentProduct={product} />

        {/* Recently Viewed Products */}
        <RecentlyViewed currentSlug={product.slug} />
      </MainContainer>

      {/* Mobile Sticky Purchase Bar (lg:hidden) */}
      <MobileStickyBar product={product} />
    </>
  );
}
