-- DropForeignKey
ALTER TABLE "public"."devicetokens" DROP CONSTRAINT "devicetokens_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."userlabels" DROP CONSTRAINT "userlabels_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."wallets" DROP CONSTRAINT "wallets_ownerId_fkey";

-- AddForeignKey
ALTER TABLE "public"."userlabels" ADD CONSTRAINT "userlabels_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wallets" ADD CONSTRAINT "wallets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."devicetokens" ADD CONSTRAINT "devicetokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
