import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [
    users,
    products,
    variants,
    orders,
    payments,
    claims,
    webhookEvents,
    reservations,
    refunds,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.order.count(),
    prisma.payment.count(),
    prisma.paymentInitiationClaim.count(),
    prisma.razorpayWebhookEvent.count(),
    prisma.inventoryReservation.count(),
    prisma.refund.count(),
  ]);

  console.log(
    "COUNTS:" +
      JSON.stringify({
        users,
        products,
        variants,
        orders,
        payments,
        claims,
        webhookEvents,
        reservations,
        refunds,
      })
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
