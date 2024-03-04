/*
  Warnings:

  - You are about to drop the column `templateUrl` on the `projects` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."projects" DROP COLUMN "templateUrl";
ALTER TABLE "public"."projects" ADD COLUMN     "documentUrl" STRING;
