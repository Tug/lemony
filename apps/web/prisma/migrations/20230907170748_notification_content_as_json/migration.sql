/*
  Warnings:

  - The `content` column on the `notifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."notifications" DROP COLUMN "content";
ALTER TABLE "public"."notifications" ADD COLUMN     "content" JSONB;
