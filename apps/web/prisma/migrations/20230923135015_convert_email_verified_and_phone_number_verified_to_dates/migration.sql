-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "emailVerifiedTemp" TIMESTAMP(3);
ALTER TABLE "public"."users" ADD COLUMN     "phoneNumberVerifiedTemp" TIMESTAMP(3);
