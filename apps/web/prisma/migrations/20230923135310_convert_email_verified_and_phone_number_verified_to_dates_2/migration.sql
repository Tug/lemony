-- This is an empty migration.
UPDATE "public"."users" SET "emailVerifiedTemp" = CASE WHEN "emailVerified" THEN CURRENT_TIMESTAMP END;
UPDATE "public"."users" SET "phoneNumberVerifiedTemp" = CASE WHEN "phoneNumberVerified" THEN CURRENT_TIMESTAMP END;
