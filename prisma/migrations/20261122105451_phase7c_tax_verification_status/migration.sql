-- CreateEnum
CREATE TYPE "TaxVerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING_REVIEW', 'VERIFIED');

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "hsnCode" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "taxVerificationStatus" "TaxVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED';
