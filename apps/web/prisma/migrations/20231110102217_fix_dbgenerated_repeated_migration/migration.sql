-- AlterTable
ALTER TABLE "public"."usertokenclaims" ALTER COLUMN "expiresAt" SET DEFAULT (now() + '90 days'::interval)::timestamp;
