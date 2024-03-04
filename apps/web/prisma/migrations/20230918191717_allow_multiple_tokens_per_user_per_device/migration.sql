-- DropIndex
DROP INDEX "public"."devicetokens_userId_platform_key";

-- CreateIndex
CREATE INDEX "devicetokens_userId_platform_idx" ON "public"."devicetokens"("userId", "platform");
