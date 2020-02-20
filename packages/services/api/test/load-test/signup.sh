#!/usr/bin/env bash

autocannon \
  --latency \
  --method POST \
  --headers content-type=application/json \
  --idReplacement \
  --input $(dirname $0)/signup.json \
  http://localhost:3001/v1/auth/signup
