#!/usr/bin/env bash

curl $SENTRY_RELEASES_ENDPOINT \
  -X POST \
  -H 'Content-Type: application/json' \
  -d "{\"version\": \"$COMMIT_ID\"}"
