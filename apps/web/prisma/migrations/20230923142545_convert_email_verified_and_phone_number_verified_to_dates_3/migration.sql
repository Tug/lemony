-- AlterTable
ALTER TABLE "users" DROP COLUMN "emailVerified";
ALTER TABLE "users" DROP COLUMN "phoneNumberVerified";
ALTER TABLE "users" RENAME COLUMN "emailVerifiedTemp" TO "emailVerified";
ALTER TABLE "users" RENAME COLUMN "phoneNumberVerifiedTemp" TO "phoneNumberVerified";
