import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      taxRate: true,
      hsnCode: true,
      taxCategory: true,
      taxVerificationStatus: true,
    },
    orderBy: { id: "asc" },
  });

  console.log("Found", products.length, "products in database:");
  for (const p of products) {
    console.log(
      `- [${p.id}] ${p.name}: taxRate=${p.taxRate}, hsnCode=${p.hsnCode}, status=${p.taxVerificationStatus}`
    );
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
