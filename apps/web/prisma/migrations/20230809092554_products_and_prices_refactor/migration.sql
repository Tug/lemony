/*
  Warnings:

  - You are about to drop the `pricehistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `prices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `unitPrice` to the `productsinprojects` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."pricehistory" DROP CONSTRAINT "pricehistory_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."prices" DROP CONSTRAINT "prices_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."productsinprojects" DROP CONSTRAINT "productsinprojects_productId_fkey";

-- empty productsinprojects table
TRUNCATE TABLE "public"."productsinprojects";

-- AlterTable
ALTER TABLE "public"."productsinprojects" ADD COLUMN     "priceIncludesVAT" BOOL NOT NULL DEFAULT false;
ALTER TABLE "public"."productsinprojects" ADD COLUMN     "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "public"."productsinprojects" ADD COLUMN     "resaleFeeFixed" DECIMAL(12,2) NOT NULL DEFAULT 0.0;
ALTER TABLE "public"."productsinprojects" ADD COLUMN     "resaleFeePercent" FLOAT8 NOT NULL DEFAULT 0.0;
ALTER TABLE "public"."productsinprojects" ADD COLUMN     "unitPrice" DECIMAL(12,2) NOT NULL;
ALTER TABLE "public"."productsinprojects" ADD COLUMN     "vatPercentage" FLOAT8 NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "public"."projects" ADD COLUMN     "externalId" STRING;

-- DropTable
DROP TABLE "public"."pricehistory";

-- DropTable
DROP TABLE "public"."prices";

-- DropTable
DROP TABLE "public"."products";

-- CreateTable
CREATE TABLE "public"."productsininventory" (
    "id" STRING NOT NULL,
    "externalId" STRING NOT NULL,
    "title" STRING NOT NULL,
    "supplier" STRING NOT NULL,

    CONSTRAINT "productsininventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."oracles" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,

    CONSTRAINT "oracles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."oracleproducts" (
    "id" STRING NOT NULL,
    "externalId" STRING NOT NULL,
    "productId" STRING NOT NULL,
    "oracleId" STRING NOT NULL,
    "oracleUrl" STRING,
    "oracleCurrency" STRING,
    "oracleUpdateFrequency" STRING,
    "oracleHasVAT" BOOL NOT NULL DEFAULT false,
    "oracleHasFees" BOOL NOT NULL DEFAULT false,
    "oracleVAT" DECIMAL(12,2),
    "oraclePercentageFees" DECIMAL(12,2),
    "oracleFixedFees" DECIMAL(12,2),
    "data" JSONB,

    CONSTRAINT "oracleproducts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."oraclepricesnapshots" (
    "id" STRING NOT NULL,
    "oracleProductId" STRING NOT NULL,
    "period" STRING NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "oraclepricesnapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."oracleprices" (
    "id" STRING NOT NULL,
    "oracleProductId" STRING NOT NULL,
    "period" STRING NOT NULL DEFAULT '_1month',
    "date" TIMESTAMP(3) NOT NULL,
    "mean" DECIMAL(12,2) NOT NULL,
    "min" DECIMAL(12,2),
    "max" DECIMAL(12,2),
    "currency" STRING NOT NULL DEFAULT 'EUR',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oracleprices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "productsininventory_externalId_key" ON "public"."productsininventory"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "oracles_name_key" ON "public"."oracles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "oracleproducts_externalId_key" ON "public"."oracleproducts"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "oracleproducts_productId_oracleId_key" ON "public"."oracleproducts"("productId", "oracleId");

-- CreateIndex
CREATE UNIQUE INDEX "oraclepricesnapshots_oracleProductId_period_key" ON "public"."oraclepricesnapshots"("oracleProductId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "oracleprices_oracleProductId_period_date_key" ON "public"."oracleprices"("oracleProductId", "period", "date");

-- AddForeignKey
ALTER TABLE "public"."oracleproducts" ADD CONSTRAINT "oracleproducts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."productsininventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."oracleproducts" ADD CONSTRAINT "oracleproducts_oracleId_fkey" FOREIGN KEY ("oracleId") REFERENCES "public"."oracles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."oraclepricesnapshots" ADD CONSTRAINT "oraclepricesnapshots_oracleProductId_fkey" FOREIGN KEY ("oracleProductId") REFERENCES "public"."oracleproducts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."oracleprices" ADD CONSTRAINT "oracleprices_oracleProductId_fkey" FOREIGN KEY ("oracleProductId") REFERENCES "public"."oracleproducts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."productsinprojects" ADD CONSTRAINT "productsinprojects_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."productsininventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
