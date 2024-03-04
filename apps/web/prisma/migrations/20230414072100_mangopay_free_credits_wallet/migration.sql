/*
  Warnings:

  - You are about to drop the column `legalRepId` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `termsAndConditionsAccepted` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mangopayCreditsWalletId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_legalRepId_fkey";

-- DropIndex
DROP INDEX "companies_legalRepId_key";

-- AlterTable
ALTER TABLE "companies" DROP COLUMN "legalRepId";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "termsAndConditionsAccepted";
ALTER TABLE "users" ADD COLUMN     "companyId" STRING;
ALTER TABLE "users" ADD COLUMN     "disclaimerAcceptedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN     "mangopayCreditsWalletId" STRING;
ALTER TABLE "users" ADD COLUMN     "privacyPolicyAcceptedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN     "termsAndConditionsAcceptedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_mangopayCreditsWalletId_key" ON "users"("mangopayCreditsWalletId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
