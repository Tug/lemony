-- CreateTable
CREATE TABLE "public"."devicetokens" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "platform" STRING NOT NULL,
    "token" STRING NOT NULL,

    CONSTRAINT "devicetokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "devicetokens_userId_platform_idx" ON "public"."devicetokens"("userId", "platform");

-- AddForeignKey
ALTER TABLE "public"."devicetokens" ADD CONSTRAINT "devicetokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
