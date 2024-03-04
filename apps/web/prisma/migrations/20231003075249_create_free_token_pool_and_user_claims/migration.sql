/*
  Warnings:

  - Added the required column `version` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "public"."FundsSourceType" ADD VALUE 'FREE_TOKEN';
ALTER TYPE "public"."FundsSourceType" ADD VALUE 'DIVERSIFIED';

-- AlterEnum
ALTER TYPE "public"."OrderExecutionType" ADD VALUE 'INITIAL';

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "version" INT4 NOT NULL DEFAULT 0;
ALTER TABLE "public"."orders" ALTER COLUMN "fundsSource" DROP NOT NULL;
ALTER TABLE "public"."orders" ALTER COLUMN "fundsSource" DROP DEFAULT;
ALTER TABLE "public"."orders" ALTER COLUMN "executionType" SET DEFAULT 'INITIAL';

-- AlterTable
ALTER TABLE "sandbox"."orders" ADD COLUMN     "version" INT4 NOT NULL DEFAULT 0;
ALTER TABLE "sandbox"."orders" ALTER COLUMN "fundsSource" DROP NOT NULL;
ALTER TABLE "sandbox"."orders" ALTER COLUMN "fundsSource" DROP DEFAULT;

-- CreateTable
CREATE TABLE "public"."freetokenpools" (
    "id" STRING NOT NULL,
    "projectId" STRING NOT NULL,
    "ownerId" STRING NOT NULL,
    "sizeInDecimal" INT8 NOT NULL,
    "offeredInDecimal" INT8 NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "freetokenpools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usertokenclaims" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "quantityInDecimal" INT8 NOT NULL DEFAULT 1000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT NOW() + interval '3 month',
    "poolId" STRING,

    CONSTRAINT "usertokenclaims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "freetokenpools_projectId_ownerId_idx" ON "public"."freetokenpools"("projectId", "ownerId");

-- CreateIndex
CREATE INDEX "usertokenclaims_userId_createdAt_idx" ON "public"."usertokenclaims"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."freetokenpools" ADD CONSTRAINT "freetokenpools_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."freetokenpools" ADD CONSTRAINT "freetokenpools_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usertokenclaims" ADD CONSTRAINT "usertokenclaims_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usertokenclaims" ADD CONSTRAINT "usertokenclaims_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "public"."freetokenpools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
