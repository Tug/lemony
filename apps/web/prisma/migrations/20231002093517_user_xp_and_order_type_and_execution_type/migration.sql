-- CreateEnum
CREATE TYPE "public"."OrderType" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "public"."OrderExecutionType" AS ENUM ('LIMIT', 'MARKET');

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "executionType" "public"."OrderExecutionType" NOT NULL DEFAULT 'LIMIT';
ALTER TABLE "public"."orders" ADD COLUMN     "type" "public"."OrderType" NOT NULL DEFAULT 'BUY';

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "xp" INT4 NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "sandbox"."orders" ADD COLUMN     "executionType" "public"."OrderExecutionType" NOT NULL DEFAULT 'LIMIT';
ALTER TABLE "sandbox"."orders" ADD COLUMN     "type" "public"."OrderType" NOT NULL DEFAULT 'BUY';
