-- CreateIndex
CREATE INDEX "orders_userId_projectId_idx" ON "public"."orders"("userId", "projectId");

-- CreateIndex
CREATE INDEX "orders_userId_projectId_idx" ON "sandbox"."orders"("userId", "projectId");
