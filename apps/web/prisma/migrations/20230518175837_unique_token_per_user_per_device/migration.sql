/*
  Warnings:

  - A unique constraint covering the columns `[userId,platform]` on the table `devicetokens` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."devicetokens_userId_platform_idx";

-- CreateIndex
CREATE UNIQUE INDEX "devicetokens_userId_platform_key" ON "public"."devicetokens"("userId", "platform");
