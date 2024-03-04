-- CreateTable
CREATE TABLE "sandbox"."usertokenclaims" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "quantityInDecimal" INT8 NOT NULL DEFAULT 1000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT (now() + '90 days'::interval)::timestamp,
    "poolId" STRING NOT NULL,

    CONSTRAINT "usertokenclaims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "usertokenclaims_userId_createdAt_idx" ON "sandbox"."usertokenclaims"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "sandbox"."usertokenclaims" ADD CONSTRAINT "usertokenclaims_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sandbox"."usertokenclaims" ADD CONSTRAINT "usertokenclaims_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "public"."freetokenpools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
