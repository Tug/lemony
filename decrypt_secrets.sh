#!/bin/sh

# --batch to prevent interactive command
# --yes to assume "yes" for questions
gpg --quiet --batch --yes --decrypt --passphrase="$SERVICE_ACCOUNT_KEY_SECRET_PASSPHRASE" \
--output apps/expo/service-account-key.json apps/expo/service-account-key.json.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$GOOGLE_SERVICES_SECRET_PASSPHRASE" \
--output apps/expo/google-services.json apps/expo/google-services.json.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$GOOGLE_SERVICES_SECRET_PASSPHRASE" \
--output apps/expo/google-services.staging.json apps/expo/google-services.staging.json.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$GOOGLE_SERVICES_SECRET_PASSPHRASE" \
--output apps/expo/google-services.staging.json apps/expo/google-services.development.json.gpg

# Expo .env files
gpg --quiet --batch --yes --decrypt --passphrase="$ENV_SECRET_PASSPHRASE" \
--output apps/expo/.env.production apps/expo/.env.production.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$ENV_SECRET_PASSPHRASE" \
--output apps/expo/.env.staging apps/expo/.env.staging.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$ENV_SECRET_PASSPHRASE" \
--output apps/expo/.env.development apps/expo/.env.development.gpg

# Web .env files
gpg --quiet --batch --yes --decrypt --passphrase="$ENV_SECRET_PASSPHRASE" \
--output apps/web/.env.production.local apps/web/.env.production.local.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$ENV_SECRET_PASSPHRASE" \
--output apps/web/.env.development apps/web/.env.development.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$ENV_SECRET_PASSPHRASE" \
--output apps/web/.env.ci apps/web/.env.ci.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$ENV_SECRET_PASSPHRASE" \
--output apps/web/.env.test apps/web/.env.test.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$ENV_SECRET_PASSPHRASE" \
--output apps/web/prisma/cockroachdb/root.crt apps/web/prisma/cockroachdb/root.crt.gpg
