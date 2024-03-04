/*
  Warnings:

  - You are about to drop the column `oracleCurrency` on the `oracleproducts` table. All the data in the column will be lost.
  - You are about to drop the column `oracleFixedFees` on the `oracleproducts` table. All the data in the column will be lost.
  - You are about to drop the column `oracleHasFees` on the `oracleproducts` table. All the data in the column will be lost.
  - You are about to drop the column `oracleHasVAT` on the `oracleproducts` table. All the data in the column will be lost.
  - You are about to drop the column `oraclePercentageFees` on the `oracleproducts` table. All the data in the column will be lost.
  - You are about to drop the column `oracleUpdateFrequency` on the `oracleproducts` table. All the data in the column will be lost.
  - You are about to drop the column `oracleUrl` on the `oracleproducts` table. All the data in the column will be lost.
  - You are about to drop the column `oracleVAT` on the `oracleproducts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."oracleproducts" DROP COLUMN "oracleCurrency";
ALTER TABLE "public"."oracleproducts" DROP COLUMN "oracleFixedFees";
ALTER TABLE "public"."oracleproducts" DROP COLUMN "oracleHasFees";
ALTER TABLE "public"."oracleproducts" DROP COLUMN "oracleHasVAT";
ALTER TABLE "public"."oracleproducts" DROP COLUMN "oraclePercentageFees";
ALTER TABLE "public"."oracleproducts" DROP COLUMN "oracleUpdateFrequency";
ALTER TABLE "public"."oracleproducts" DROP COLUMN "oracleUrl";
ALTER TABLE "public"."oracleproducts" DROP COLUMN "oracleVAT";
ALTER TABLE "public"."oracleproducts" ADD COLUMN     "currency" STRING;
ALTER TABLE "public"."oracleproducts" ADD COLUMN     "fixedFees" DECIMAL(12,2);
ALTER TABLE "public"."oracleproducts" ADD COLUMN     "hasFees" BOOL NOT NULL DEFAULT false;
ALTER TABLE "public"."oracleproducts" ADD COLUMN     "hasVAT" BOOL NOT NULL DEFAULT false;
ALTER TABLE "public"."oracleproducts" ADD COLUMN     "percentageFees" DECIMAL(12,2);
ALTER TABLE "public"."oracleproducts" ADD COLUMN     "updateFrequency" STRING;
ALTER TABLE "public"."oracleproducts" ADD COLUMN     "vatPercent" DECIMAL(12,2);
