const { PrismaClient } = require("@prisma/client");

async function inspectDatabase() {
  const prisma = new PrismaClient();
  try {
    // Query public tables in PostgreSQL
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE';
    `;

    console.log("=== TARGET DATABASE INSPECTION ===");
    console.log(`Public tables count: ${tables.length}`);
    if (tables.length > 0) {
      console.log("Existing tables:", tables.map((t) => t.table_name).join(", "));
    } else {
      console.log("Database state: CLEAN and EMPTY (0 public tables found)");
    }

    // Check if _prisma_migrations table exists
    const hasMigrationTable = tables.some((t) => t.table_name === "_prisma_migrations");
    console.log(`Prisma migration history table present: ${hasMigrationTable}`);

    await prisma.$disconnect();
    return { tableCount: tables.length, hasMigrationTable };
  } catch (error) {
    console.error("Database inspection error:", error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

inspectDatabase();
