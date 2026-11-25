-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cgstAmount" DECIMAL(10,2),
ADD COLUMN     "igstAmount" DECIMAL(10,2),
ADD COLUMN     "sgstAmount" DECIMAL(10,2),
ADD COLUMN     "taxableAmount" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "gstRate" DECIMAL(5,2),
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "taxAmount" DECIMAL(10,2),
ADD COLUMN     "taxableAmount" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "hsnCode" TEXT,
ADD COLUMN     "taxCategory" TEXT,
ADD COLUMN     "taxRate" DECIMAL(5,2);
