/*
  Warnings:

  - You are about to drop the column `projectId` on the `projectcrowdfundingstate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[crowdfundingStateId]` on the table `projects` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "projectcrowdfundingstate" DROP CONSTRAINT "projectcrowdfundingstate_projectId_fkey";

-- DropIndex
DROP INDEX "projectcrowdfundingstate_projectId_key";

-- AlterTable
ALTER TABLE "projectcrowdfundingstate" DROP COLUMN "projectId";

-- CreateIndex
CREATE UNIQUE INDEX "projects_crowdfundingStateId_key" ON "projects"("crowdfundingStateId");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_crowdfundingStateId_fkey" FOREIGN KEY ("crowdfundingStateId") REFERENCES "projectcrowdfundingstate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
