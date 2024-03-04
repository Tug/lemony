-- DropIndex
DROP INDEX "projects_visibility_idx";

-- CreateIndex
CREATE INDEX "projects_visibility_slug_idx" ON "projects"("visibility", "slug");
