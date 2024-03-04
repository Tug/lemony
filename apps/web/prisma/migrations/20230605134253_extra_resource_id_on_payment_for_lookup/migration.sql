-- DropIndex
DROP INDEX "public"."payments_fromUserId_toUserId_status_idx";

-- AlterTable
ALTER TABLE "public"."payments" ADD COLUMN     "resourceId" STRING;

-- CreateIndex
CREATE INDEX "payments_fromUserId_toUserId_status_resourceId_idx" ON "public"."payments"("fromUserId", "toUserId", "status", "resourceId");
