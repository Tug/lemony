/*
  Warnings:

  - Added the required column `email` to the `companies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "email" STRING NOT NULL;
