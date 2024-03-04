/*
  Warnings:

  - A unique constraint covering the columns `[productId,period,date]` on the table `prices` will be added. If there are existing duplicate values, this will fail.
  - Made the column `period` on table `prices` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "prices_productId_date_key";

-- AlterTable
ALTER TABLE "prices" ALTER COLUMN "period" SET NOT NULL;
ALTER TABLE "prices" ALTER COLUMN "period" SET DEFAULT '_1month';

-- CreateIndex
CREATE UNIQUE INDEX "prices_productId_period_date_key" ON "prices"("productId", "period", "date");
