/*
  Warnings:

  - You are about to drop the `projectsi18n` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."projectsi18n" DROP CONSTRAINT "projectsi18n_projectId_fkey";

-- AlterTable
ALTER TABLE "public"."projects" ADD COLUMN     "paid" BOOL NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "public"."projectsi18n";
