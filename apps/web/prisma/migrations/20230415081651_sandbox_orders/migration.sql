-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "sandbox";

-- CreateTable
CREATE TABLE "sandbox"."orders" (
    "id" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" STRING NOT NULL DEFAULT 'EUR',
    "quantityInDecimal" INT4 NOT NULL,
    "paymentId" STRING,
    "paymentStatus" "public"."PaymentStatus",
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_paymentId_key" ON "sandbox"."orders"("paymentId");

-- CreateIndex
CREATE INDEX "orders_userId_status_idx" ON "sandbox"."orders"("userId", "status");

-- AddForeignKey
ALTER TABLE "sandbox"."orders" ADD CONSTRAINT "orders_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sandbox"."orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
