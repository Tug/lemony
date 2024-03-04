/*
  Warnings:

  - The `resaleFeePercent` column on the `productsinprojects` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `vatPercentage` column on the `productsinprojects` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."productsinprojects" DROP COLUMN "resaleFeePercent";
ALTER TABLE "public"."productsinprojects" ADD COLUMN     "resaleFeePercent" DECIMAL(12,2) NOT NULL DEFAULT 0.0;
ALTER TABLE "public"."productsinprojects" DROP COLUMN "vatPercentage";
ALTER TABLE "public"."productsinprojects" ADD COLUMN     "vatPercentage" DECIMAL(12,2) NOT NULL DEFAULT 0.0;
