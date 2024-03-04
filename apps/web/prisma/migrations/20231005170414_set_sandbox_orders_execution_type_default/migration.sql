-- AlterTable
ALTER TABLE "public"."usertokenclaims" ALTER COLUMN "expiresAt" SET DEFAULT (NOW() + interval '3 month')::timestamp;

-- AlterTable
ALTER TABLE "sandbox"."orders" ALTER COLUMN "executionType" SET DEFAULT 'INITIAL';
