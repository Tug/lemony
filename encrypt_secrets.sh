#!/bin/sh

gpg --quiet --batch --yes --encrypt --passphrase="$SERVICE_ACCOUNT_KEY_SECRET_PASSPHRASE" --recipient dekervit@gmail.com \
 --output apps/expo/service-account-key.json.gpg apps/expo/service-account-key.json

gpg --quiet --batch --yes --encrypt --passphrase="$GOOGLE_SERVICES_SECRET_PASSPHRASE" --recipient dekervit@gmail.com \
--output apps/expo/google-services.json.gpg apps/expo/google-services.json

gpg --quiet --batch --yes --encrypt --passphrase="$GOOGLE_SERVICES_SECRET_PASSPHRASE" --recipient dekervit@gmail.com \
--output apps/expo/google-services.staging.json.gpg apps/expo/google-services.staging.json

gpg --quiet --batch --yes --encrypt --passphrase="$GOOGLE_SERVICES_SECRET_PASSPHRASE" --recipient dekervit@gmail.com \
--output apps/expo/google-services.development.json.gpg apps/expo/google-services.development.json

# Expo .env files
gpg --quiet --batch --yes --encrypt --passphrase="$ENV_SECRET_PASSPHRASE" --recipient dekervit@gmail.com \
--output apps/expo/.env.production.gpg apps/expo/.env.production

gpg --quiet --batch --yes --encrypt --passphrase="$ENV_SECRET_PASSPHRASE" --recipient dekervit@gmail.com \
--output apps/expo/.env.staging.gpg apps/expo/.env.staging

gpg --quiet --batch --yes --encrypt --passphrase="$ENV_SECRET_PASSPHRASE" --recipient dekervit@gmail.com \
--output apps/expo/.env.development.gpg apps/expo/.env.development

# Web .env files
gpg --quiet --batch --yes --encrypt --passphrase="$ENV_SECRET_PASSPHRASE" --recipient dekervit@gmail.com \
--output apps/web/.env.production.local.gpg apps/web/.env.production.local

gpg --quiet --batch --yes --encrypt --passphrase="$ENV_SECRET_PASSPHRASE" --recipient dekervit@gmail.com \
--output apps/web/.env.development.gpg apps/web/.env.development

gpg --quiet --batch --yes --encrypt --passphrase="$ENV_SECRET_PASSPHRASE" --recipient dekervit@gmail.com \
--output apps/web/.env.ci.gpg apps/web/.env.ci

gpg --quiet --batch --yes --encrypt --passphrase="$ENV_SECRET_PASSPHRASE" --recipient dekervit@gmail.com \
--output apps/web/.env.test.gpg apps/web/.env.test

gpg --quiet --batch --yes --encrypt --passphrase="$ENV_SECRET_PASSPHRASE" --recipient dekervit@gmail.com \
--output apps/web/prisma/cockroachdb/root.crt.gpg apps/web/prisma/cockroachdb/root.crt

