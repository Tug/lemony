/*
  Warnings:

  - Made the column `poolId` on table `usertokenclaims` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."usertokenclaims" DROP CONSTRAINT "usertokenclaims_poolId_fkey";

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "klaviyoId" STRING;
ALTER TABLE "public"."users" ADD COLUMN     "klaviyoLastSyncedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."usertokenclaims" ALTER COLUMN "expiresAt" SET DEFAULT (NOW() + interval '3 month')::timestamp;
ALTER TABLE "public"."usertokenclaims" ALTER COLUMN "poolId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."usertokenclaims" ADD CONSTRAINT "usertokenclaims_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "public"."freetokenpools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
