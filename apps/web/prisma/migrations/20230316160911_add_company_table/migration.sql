-- CreateTable
CREATE TABLE "companies" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "addressId" STRING,
    "number" STRING NOT NULL,
    "legalRepId" STRING NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_legalRepId_key" ON "companies"("legalRepId");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_legalRepId_fkey" FOREIGN KEY ("legalRepId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
