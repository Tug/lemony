-- AlterEnum
ALTER TYPE "public"."PaymentStatus" ADD VALUE 'REFUNDED';

-- AlterTable
ALTER TABLE "public"."usertokenclaims" ALTER COLUMN "expiresAt" SET DEFAULT (NOW() + interval '3 month')::timestamp;
