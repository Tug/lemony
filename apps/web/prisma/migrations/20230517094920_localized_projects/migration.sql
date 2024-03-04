-- CreateTable
CREATE TABLE "public"."projectsi18n" (
    "projectId" STRING NOT NULL,
    "lang" STRING NOT NULL,
    "title" STRING,
    "content" JSONB,
    "description" STRING,

    CONSTRAINT "projectsi18n_pkey" PRIMARY KEY ("projectId","lang")
);

-- AddForeignKey
ALTER TABLE "public"."projectsi18n" ADD CONSTRAINT "projectsi18n_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
