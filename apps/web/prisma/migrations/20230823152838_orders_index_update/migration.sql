-- DropIndex
DROP INDEX "public"."orders_userId_projectId_idx";

-- DropIndex
DROP INDEX "public"."orders_userId_status_idx";

-- DropIndex
DROP INDEX "sandbox"."orders_userId_projectId_idx";

-- DropIndex
DROP INDEX "sandbox"."orders_userId_status_idx";

-- CreateIndex
CREATE INDEX "orders_userId_projectId_status_createdAt_idx" ON "public"."orders"("userId", "projectId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "orders_userId_projectId_status_createdAt_idx" ON "sandbox"."orders"("userId", "projectId", "status", "createdAt");
