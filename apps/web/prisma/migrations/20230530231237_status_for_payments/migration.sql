-- DropIndex
DROP INDEX "public"."payments_fromUserId_toUserId_transferStatus_idx";

-- AlterTable
ALTER TABLE "public"."payments" ADD COLUMN     "status" "public"."OrderStatus" NOT NULL DEFAULT 'pending';
ALTER TABLE "public"."payments" ALTER COLUMN "fundsSource" SET DEFAULT 'FREE_CREDITS';

-- CreateIndex
CREATE INDEX "payments_fromUserId_toUserId_status_idx" ON "public"."payments"("fromUserId", "toUserId", "status");
