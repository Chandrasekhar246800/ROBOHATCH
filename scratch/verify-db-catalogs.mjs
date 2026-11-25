import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log('--- Verifying Foreign Keys on "Refund" ---');
  const fkResult = await prisma.$queryRaw`
    SELECT
      tc.constraint_name,
      kcu.column_name,
      rc.delete_rule,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.table_name = 'Refund'
      AND tc.constraint_type = 'FOREIGN KEY';
  `;
  console.log(JSON.stringify(fkResult, null, 2));

  console.log('--- Verifying Indexes on "InventoryReservation" ---');
  const invIndexes = await prisma.$queryRaw`
    SELECT
      indexname,
      indexdef
    FROM pg_indexes
    WHERE tablename = 'InventoryReservation';
  `;
  console.log(JSON.stringify(invIndexes, null, 2));

  console.log('--- Verifying Indexes on "Refund" ---');
  const refundIndexes = await prisma.$queryRaw`
    SELECT
      indexname,
      indexdef
    FROM pg_indexes
    WHERE tablename = 'Refund';
  `;
  console.log(JSON.stringify(refundIndexes, null, 2));

  console.log('--- Verifying Indexes on "RazorpayWebhookEvent" ---');
  const webhookIndexes = await prisma.$queryRaw`
    SELECT
      indexname,
      indexdef
    FROM pg_indexes
    WHERE tablename = 'RazorpayWebhookEvent';
  `;
  console.log(JSON.stringify(webhookIndexes, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
