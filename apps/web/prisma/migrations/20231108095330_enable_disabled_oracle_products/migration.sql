-- AlterTable
ALTER TABLE "public"."oracleproducts" ADD COLUMN     "enabled" BOOL NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."usertokenclaims" ALTER COLUMN "expiresAt" SET DEFAULT (NOW() + interval '3 month')::timestamp;
