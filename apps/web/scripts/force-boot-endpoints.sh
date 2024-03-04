#!/usr/bin/env bash

curl -f --silent --output /dev/stderr -X POST "$NEXT_API_URL/payment/checkout"
curl -f --silent --output /dev/stderr -X GET "$NEXT_API_URL/payment/mangopay/payload?RessourceId=SYSTEM_BOOT&EventType=&Date="
curl -f --silent --output /dev/stderr -X GET "$NEXT_API_URL/payment/mangopay/cards"
curl -f --silent --output /dev/stderr -X POST "$NEXT_API_URL/payment/mangopay/card-registration"
curl -f --silent --output /dev/stderr -X POST "$NEXT_API_URL/payment/mangopay/credit-wallet"
curl -f --silent --output /dev/stderr -X GET "$NEXT_API_URL/feed/project"
curl -f --silent --output /dev/stderr -X POST "$NEXT_API_URL/token/magic"
echo "Done booting main endpoints"