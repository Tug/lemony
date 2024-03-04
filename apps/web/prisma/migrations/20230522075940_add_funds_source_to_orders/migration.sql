-- CreateEnum
CREATE TYPE "public"."FundsSourceType" AS ENUM ('CREDIT_CARD', 'WALLET_EUR', 'FREE_CREDITS');

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "fundsSource" "public"."FundsSourceType" NOT NULL DEFAULT 'WALLET_EUR';

-- AlterTable
ALTER TABLE "sandbox"."orders" ADD COLUMN "fundsSource" "public"."FundsSourceType" NOT NULL DEFAULT 'WALLET_EUR';
