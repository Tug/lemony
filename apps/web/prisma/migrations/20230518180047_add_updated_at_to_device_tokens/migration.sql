/*
  Warnings:

  - Added the required column `updatedAt` to the `devicetokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."devicetokens" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
