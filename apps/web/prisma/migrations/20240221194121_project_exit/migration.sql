-- AlterTable
ALTER TABLE "public"."projects" ADD COLUMN     "exitDate" TIMESTAMP(3);
ALTER TABLE "public"."projects" ADD COLUMN     "exitFundsTxDate" TIMESTAMP(3);
ALTER TABLE "public"."projects" ADD COLUMN     "exitFundsTxId" STRING;
ALTER TABLE "public"."projects" ADD COLUMN     "exitPrice" DECIMAL(12,2);
