-- DropForeignKey
ALTER TABLE "Refund" DROP CONSTRAINT "Refund_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Refund" DROP CONSTRAINT "Refund_paymentId_fkey";

-- DropIndex
DROP INDEX "InventoryReservation_orderId_variantId_key";

-- DropIndex
DROP INDEX "RazorpayWebhookEvent_eventId_idx";

-- DropIndex
DROP INDEX "Refund_idempotencyKey_idx";

-- DropIndex
DROP INDEX "Refund_razorpayRefundId_idx";

-- AlterTable
ALTER TABLE "InventoryReservation" ADD COLUMN "generation" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "InventoryReservation_orderId_variantId_status_idx" ON "InventoryReservation"("orderId", "variantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryReservation_orderId_variantId_generation_key" ON "InventoryReservation"("orderId", "variantId", "generation");

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
