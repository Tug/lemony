-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'SELLER');

-- CreateEnum
CREATE TYPE "KYCStatus" AS ENUM ('init', 'pending', 'prechecked', 'queued', 'completed', 'onHold');

-- CreateTable
CREATE TABLE "accounts" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "type" STRING NOT NULL,
    "provider" STRING NOT NULL,
    "providerAccountId" STRING NOT NULL,
    "refresh_token" STRING,
    "access_token" STRING,
    "expires_at" INT4,
    "token_type" STRING,
    "scope" STRING,
    "id_token" STRING,
    "session_state" STRING,
    "oauth_token_secret" STRING,
    "oauth_token" STRING,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" STRING NOT NULL,
    "sessionToken" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" STRING NOT NULL,
    "firstName" STRING,
    "lastName" STRING,
    "email" STRING,
    "phoneNumber" STRING,
    "emailVerified" BOOL NOT NULL DEFAULT false,
    "phoneNumberVerified" BOOL NOT NULL DEFAULT false,
    "image" STRING,
    "birthDate" DATE,
    "termsAndConditionsAccepted" BOOL NOT NULL DEFAULT false,
    "nationalityCountryId" STRING,
    "countryOfResidenceId" STRING,
    "addressId" STRING,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "disabled" BOOL NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "kycStatus" "KYCStatus",
    "kycUpdatedAt" TIMESTAMP(3),
    "sumsubId" STRING,
    "mangopayId" STRING,
    "locale" STRING,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" STRING NOT NULL,
    "addressLine1" STRING NOT NULL,
    "addressLine2" STRING,
    "city" STRING NOT NULL,
    "region" STRING,
    "postalCode" STRING NOT NULL,
    "countryId" STRING NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" STRING NOT NULL,
    "address" STRING NOT NULL,
    "ownerId" STRING,
    "isPrimary" BOOL NOT NULL DEFAULT false,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verificationtokens" (
    "identifier" STRING NOT NULL,
    "token" STRING NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "countries" (
    "id" STRING NOT NULL,
    "code" STRING NOT NULL,
    "name" STRING NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" STRING NOT NULL,
    "oracleName" STRING NOT NULL,
    "oracleId" STRING NOT NULL,
    "oracleUrl" STRING,
    "oracleCurrency" STRING,
    "oracleUpdateFrequency" STRING,
    "oracleHasVAT" BOOL NOT NULL DEFAULT false,
    "oracleHasFees" BOOL NOT NULL DEFAULT false,
    "oracleVAT" DECIMAL(12,2),
    "oraclePercentageFees" DECIMAL(12,2),
    "oracleFixedFees" DECIMAL(12,2),
    "data" JSONB,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricehistory" (
    "id" STRING NOT NULL,
    "productId" STRING NOT NULL,
    "period" STRING NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "pricehistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prices" (
    "id" STRING NOT NULL,
    "productId" STRING NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "period" STRING,
    "mean" DECIMAL(12,2) NOT NULL,
    "min" DECIMAL(12,2),
    "max" DECIMAL(12,2),
    "currency" STRING NOT NULL DEFAULT 'EUR',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mangopayevents" (
    "id" STRING NOT NULL,
    "resourceId" STRING NOT NULL,
    "eventType" STRING NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "mangopayevents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" STRING NOT NULL,
    "tokenSymbol" STRING NOT NULL,
    "tokenName" STRING NOT NULL,
    "tokenDecimals" INT4 NOT NULL DEFAULT 3,
    "slug" STRING NOT NULL,
    "expectedAPR" DECIMAL(12,2) NOT NULL,
    "title" STRING,
    "content" JSONB,
    "description" STRING,
    "media" JSONB,
    "tags" STRING[],
    "ownerId" STRING,
    "mangopayWalletId" STRING,
    "mangopayWalletCurrency" STRING DEFAULT 'EUR',
    "stoWalletAddress" STRING,
    "targetPrice" DECIMAL(12,2) NOT NULL,
    "maxSupplyInDecimal" INT4 NOT NULL,
    "tokenPrice" DECIMAL(12,2) NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "durationInMonths" INT4 NOT NULL,
    "visibleAt" TIMESTAMP(3) NOT NULL,
    "crowdfundingStartsAt" TIMESTAMP(3) NOT NULL,
    "crowdfundingEndsAt" TIMESTAMP(3) NOT NULL,
    "percent" FLOAT8 NOT NULL DEFAULT 0,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productsinprojects" (
    "projectId" STRING NOT NULL,
    "productId" STRING NOT NULL,
    "quantity" INT4 NOT NULL DEFAULT 1,

    CONSTRAINT "productsinprojects_pkey" PRIMARY KEY ("projectId","productId")
);

-- CreateTable
CREATE TABLE "_initial_investments" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateTable
CREATE TABLE "_current_investments" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_sumsubId_key" ON "users"("sumsubId");

-- CreateIndex
CREATE UNIQUE INDEX "users_mangopayId_key" ON "users"("mangopayId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phoneNumber_idx" ON "users"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_address_key" ON "wallets"("address");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_token_key" ON "verificationtokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "verificationtokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "countries_code_key" ON "countries"("code");

-- CreateIndex
CREATE UNIQUE INDEX "products_oracleName_oracleId_key" ON "products"("oracleName", "oracleId");

-- CreateIndex
CREATE UNIQUE INDEX "pricehistory_productId_period_key" ON "pricehistory"("productId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "prices_productId_date_key" ON "prices"("productId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "mangopayevents_resourceId_eventType_timestamp_key" ON "mangopayevents"("resourceId", "eventType", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "projects_tokenSymbol_key" ON "projects"("tokenSymbol");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "projects_ownerId_crowdfundingStartsAt_idx" ON "projects"("ownerId", "crowdfundingStartsAt");

-- CreateIndex
CREATE INDEX "projects_ownerId_crowdfundingEndsAt_idx" ON "projects"("ownerId", "crowdfundingEndsAt");

-- CreateIndex
CREATE UNIQUE INDEX "_initial_investments_AB_unique" ON "_initial_investments"("A", "B");

-- CreateIndex
CREATE INDEX "_initial_investments_B_index" ON "_initial_investments"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_current_investments_AB_unique" ON "_current_investments"("A", "B");

-- CreateIndex
CREATE INDEX "_current_investments_B_index" ON "_current_investments"("B");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_nationalityCountryId_fkey" FOREIGN KEY ("nationalityCountryId") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_countryOfResidenceId_fkey" FOREIGN KEY ("countryOfResidenceId") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricehistory" ADD CONSTRAINT "pricehistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prices" ADD CONSTRAINT "prices_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productsinprojects" ADD CONSTRAINT "productsinprojects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productsinprojects" ADD CONSTRAINT "productsinprojects_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_initial_investments" ADD CONSTRAINT "_initial_investments_A_fkey" FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_initial_investments" ADD CONSTRAINT "_initial_investments_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_current_investments" ADD CONSTRAINT "_current_investments_A_fkey" FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_current_investments" ADD CONSTRAINT "_current_investments_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
