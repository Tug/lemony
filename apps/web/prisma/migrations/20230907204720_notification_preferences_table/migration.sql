-- DropIndex
DROP INDEX "public"."notifications_recipientId_visibleAt_idx";

-- CreateTable
CREATE TABLE "public"."notificationpreferences" (
    "userId" STRING NOT NULL,
    "notificationType" STRING NOT NULL,
    "enabled" BOOL NOT NULL DEFAULT true,
    "lastUpdated" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "notificationpreferences_userId_notificationType_key" ON "public"."notificationpreferences"("userId", "notificationType");

-- CreateIndex
CREATE INDEX "notifications_recipientId_visibleAt_type_idx" ON "public"."notifications"("recipientId", "visibleAt", "type");

-- AddForeignKey
ALTER TABLE "public"."notificationpreferences" ADD CONSTRAINT "notificationpreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
