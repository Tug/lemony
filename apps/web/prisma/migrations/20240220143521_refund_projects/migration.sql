-- AlterEnum
ALTER TYPE "public"."OrderStatus" ADD VALUE 'pendingRefund';
ALTER TYPE "public"."OrderStatus" ADD VALUE 'refunded';

-- AlterTable
ALTER TABLE "public"."projects" ADD COLUMN     "failed" BOOL NOT NULL DEFAULT false;
