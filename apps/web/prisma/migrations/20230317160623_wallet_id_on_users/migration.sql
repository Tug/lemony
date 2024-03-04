/*
  Warnings:

  - A unique constraint covering the columns `[mangopayWalletId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "mangopayWalletId" STRING;

-- CreateIndex
CREATE UNIQUE INDEX "users_mangopayWalletId_key" ON "users"("mangopayWalletId");
