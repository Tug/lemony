-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "crowdfundingStateId" STRING;

-- CreateTable
CREATE TABLE "ProjectCrowdfundingState" (
    "id" STRING NOT NULL,
    "projectId" STRING NOT NULL,
    "collectedAmount" DECIMAL(12,2) NOT NULL,
    "maximumAmount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "ProjectCrowdfundingState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectCrowdfundingState_projectId_key" ON "ProjectCrowdfundingState"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectCrowdfundingState" ADD CONSTRAINT "ProjectCrowdfundingState_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
