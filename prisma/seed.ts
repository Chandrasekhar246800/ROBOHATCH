import { PrismaClient, Prisma } from "@prisma/client";
import { CATEGORIES_DATA } from "../src/data/categories";
import { PRODUCTS_DATA } from "../src/data/products";

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log("--- Seeding Categories ---");
  for (const cat of CATEGORIES_DATA) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.imageUrl,
      },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.imageUrl,
      },
    });
  }
  console.log(`✓ Seeded ${CATEGORIES_DATA.length} categories.`);

  console.log("--- Seeding Products & Variants ---");
  for (const prod of PRODUCTS_DATA) {
    // Resolve categoryId
    const category = CATEGORIES_DATA.find((c) => c.slug === prod.categorySlug);
    const categoryId = category ? category.id : "cat-1";

    const basePrice = new Prisma.Decimal(prod.price);
    const compareAtPrice = prod.compareAtPrice
      ? new Prisma.Decimal(prod.compareAtPrice)
      : null;

    // Phase 7C Final Audit: All products are set to UNVERIFIED tax status until officially classified.
    // Universally assumed 18% GST and HSN 39269099 have been removed.
    const taxRate: Prisma.Decimal | null = null;
    const hsnCode: string | null = null;
    const taxCategory: string | null = null;
    const taxVerificationStatus = "UNVERIFIED" as const;

    const productRecord = await prisma.product.upsert({
      where: { id: prod.id },
      update: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        shortDescription: prod.shortDescription,
        basePrice,
        compareAtPrice,
        taxRate,
        hsnCode,
        taxCategory,
        taxVerificationStatus,
        isActive: true,
        isFeatured: prod.isFeatured,
        categoryId,
        metadata: {
          material: prod.material,
          dimensions: prod.dimensions,
          dimensionsMm: prod.dimensionsMm,
          weight: prod.weight,
          specifications: prod.specifications,
          availability: prod.availability,
          badge: prod.badge,
          rating: prod.rating,
          reviewsCount: prod.reviewsCount,
        },
      },
      create: {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        shortDescription: prod.shortDescription,
        basePrice,
        compareAtPrice,
        taxRate,
        hsnCode,
        taxCategory,
        taxVerificationStatus,
        isActive: true,
        isFeatured: prod.isFeatured,
        categoryId,
        metadata: {
          material: prod.material,
          dimensions: prod.dimensions,
          dimensionsMm: prod.dimensionsMm,
          weight: prod.weight,
          specifications: prod.specifications,
          availability: prod.availability,
          badge: prod.badge,
          rating: prod.rating,
          reviewsCount: prod.reviewsCount,
        },
      },
    });

    // Seed primary product image
    const imageId = `${prod.id}__primary-image`;
    await prisma.productImage.upsert({
      where: { id: imageId },
      update: {
        url: prod.image,
        altText: prod.name,
        isPrimary: true,
        displayOrder: 0,
      },
      create: {
        id: imageId,
        productId: productRecord.id,
        url: prod.image,
        altText: prod.name,
        isPrimary: true,
        displayOrder: 0,
      },
    });

    // Seed variants
    const colors = prod.colors && prod.colors.length > 0 ? prod.colors : ["Standard"];
    for (const color of colors) {
      const colorSlug = color.trim().toLowerCase().replace(/\s+/g, "-");
      const variantId = `${prod.id}__${colorSlug}`;
      const sku = `RH-${prod.id.replace("prod-", "P").toUpperCase()}-${color.slice(0, 3).toUpperCase()}`;

      await prisma.productVariant.upsert({
        where: { id: variantId },
        update: {
          name: `${prod.name} (${color})`,
          sku,
          price: basePrice,
          stock: (prod.availability as string) === "Out of Stock" ? 0 : 50,
          color,
          material: prod.material,
        },
        create: {
          id: variantId,
          productId: productRecord.id,
          name: `${prod.name} (${color})`,
          sku,
          price: basePrice,
          stock: (prod.availability as string) === "Out of Stock" ? 0 : 50,
          color,
          material: prod.material,
        },
      });
    }
  }
  console.log(`✓ Seeded ${PRODUCTS_DATA.length} products and their variants.`);
}

async function main() {
  try {
    await seedDatabase();
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && process.argv[1].endsWith("seed.ts")) {
  main();
}
