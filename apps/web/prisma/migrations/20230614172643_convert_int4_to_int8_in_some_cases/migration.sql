/*
  Warnings:

  - Changed the type of `quantityInDecimal` on the `orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `maxSupplyInDecimal` on the `projects` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `quantityInDecimal` on the `orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."orders" ALTER COLUMN "quantityInDecimal" TYPE INT8;

-- AlterTable
ALTER TABLE "public"."projects" ALTER COLUMN "maxSupplyInDecimal" TYPE INT8;

-- AlterTable
ALTER TABLE "sandbox"."orders" ALTER COLUMN "quantityInDecimal" TYPE INT8;
