/*
  Warnings:

  - A unique constraint covering the columns `[userId,label]` on the table `userlabels` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."userlabels_userId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "userlabels_userId_label_key" ON "public"."userlabels"("userId", "label");
