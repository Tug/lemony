/*
  Warnings:

  - You are about to drop the column `labels` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "labels";

-- CreateTable
CREATE TABLE "public"."userlabels" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "label" STRING NOT NULL,

    CONSTRAINT "userlabels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "userlabels_userId_idx" ON "public"."userlabels"("userId");

-- CreateIndex
CREATE INDEX "userlabels_label_idx" ON "public"."userlabels"("label");

-- AddForeignKey
ALTER TABLE "public"."userlabels" ADD CONSTRAINT "userlabels_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
