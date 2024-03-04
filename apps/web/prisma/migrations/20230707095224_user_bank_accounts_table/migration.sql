-- CreateTable
CREATE TABLE "public"."userbankaccounts" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "mangopayBankAccountId" STRING NOT NULL,
    "label" STRING,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userbankaccounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "userbankaccounts_userId_mangopayBankAccountId_idx" ON "public"."userbankaccounts"("userId", "mangopayBankAccountId");

-- AddForeignKey
ALTER TABLE "public"."userbankaccounts" ADD CONSTRAINT "userbankaccounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
