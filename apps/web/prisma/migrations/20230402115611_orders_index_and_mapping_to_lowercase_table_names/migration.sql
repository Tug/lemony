/*
  Warnings:

  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectCrowdfundingState` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectCrowdfundingState" DROP CONSTRAINT "ProjectCrowdfundingState_projectId_fkey";

-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "ProjectCrowdfundingState";

-- CreateTable
CREATE TABLE "projectcrowdfundingstate" (
    "id" STRING NOT NULL,
    "projectId" STRING NOT NULL,
    "collectedAmount" DECIMAL(12,2) NOT NULL,
    "maximumAmount" DECIMAL(12,2) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projectcrowdfundingstate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" STRING NOT NULL DEFAULT 'EUR',
    "quantityInDecimal" INT4 NOT NULL,
    "paymentId" STRING,
    "paymentStatus" "PaymentStatus",
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projectcrowdfundingstate_projectId_key" ON "projectcrowdfundingstate"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_paymentId_key" ON "orders"("paymentId");

-- CreateIndex
CREATE INDEX "orders_userId_status_idx" ON "orders"("userId", "status");

-- AddForeignKey
ALTER TABLE "projectcrowdfundingstate" ADD CONSTRAINT "projectcrowdfundingstate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
