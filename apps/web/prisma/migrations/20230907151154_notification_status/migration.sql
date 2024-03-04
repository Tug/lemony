-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('pending', 'pushed', 'muted', 'errored');

-- AlterTable
ALTER TABLE "public"."notifications" ADD COLUMN     "status" "public"."NotificationStatus" NOT NULL DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "notifications_visibleAt_status_idx" ON "public"."notifications"("visibleAt", "status");
