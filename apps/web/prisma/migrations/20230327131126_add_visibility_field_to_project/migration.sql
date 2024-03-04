-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "visibility" STRING NOT NULL DEFAULT 'staging';

-- CreateIndex
CREATE INDEX "projects_visibility_idx" ON "projects"("visibility");
