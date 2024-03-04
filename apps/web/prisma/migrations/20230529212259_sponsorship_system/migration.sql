/*
  Warnings:

  - A unique constraint covering the columns `[referralCode]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "referralCode" STRING;
ALTER TABLE "public"."users" ADD COLUMN     "referrerId" STRING;

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" STRING NOT NULL,
    "fromUserId" STRING NOT NULL,
    "toUserId" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "transferId" STRING,
    "transferStatus" "public"."PaymentStatus",
    "fundsSource" "public"."FundsSourceType" NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_transferId_key" ON "public"."payments"("transferId");

-- CreateIndex
CREATE INDEX "payments_fromUserId_toUserId_transferStatus_idx" ON "public"."payments"("fromUserId", "toUserId", "transferStatus");

-- CreateIndex
CREATE UNIQUE INDEX "users_referralCode_key" ON "public"."users"("referralCode");

-- CreateIndex
CREATE INDEX "users_referralCode_idx" ON "public"."users"("referralCode");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
