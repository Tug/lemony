-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "notificationsLastOpened" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" STRING NOT NULL,
    "recipientId" STRING NOT NULL,
    "authorId" STRING,
    "type" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visibleAt" TIMESTAMP(3) NOT NULL,
    "imgUrl" STRING,
    "content" STRING,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_recipientId_visibleAt_idx" ON "public"."notifications"("recipientId", "visibleAt");

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
