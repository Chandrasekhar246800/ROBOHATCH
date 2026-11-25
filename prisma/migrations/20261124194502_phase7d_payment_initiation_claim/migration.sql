-- CreateTable
CREATE TABLE "PaymentInitiationClaim" (
    "id" TEXT NOT NULL,
    "claimKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "intentHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "orderId" TEXT,
    "paymentId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentInitiationClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentInitiationClaim_claimKey_key" ON "PaymentInitiationClaim"("claimKey");

-- CreateIndex
CREATE INDEX "PaymentInitiationClaim_claimKey_idx" ON "PaymentInitiationClaim"("claimKey");

-- CreateIndex
CREATE INDEX "PaymentInitiationClaim_userId_idx" ON "PaymentInitiationClaim"("userId");

-- CreateIndex
CREATE INDEX "PaymentInitiationClaim_status_idx" ON "PaymentInitiationClaim"("status");

-- CreateIndex
CREATE INDEX "PaymentInitiationClaim_expiresAt_idx" ON "PaymentInitiationClaim"("expiresAt");
