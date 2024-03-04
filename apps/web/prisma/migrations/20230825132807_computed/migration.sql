-- AlterTable
ALTER TABLE "public"."projects" ADD COLUMN     "computedAPR" DECIMAL(12,2);
ALTER TABLE "public"."projects" ADD COLUMN     "hasOwnPriceHistory" BOOL NOT NULL DEFAULT true;
ALTER TABLE "public"."projects" ADD COLUMN     "yearsForAPRCalculation" INT4 NOT NULL DEFAULT 2;
