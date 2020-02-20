#!/usr/bin/env bash

autocannon \
  --latency \
  --method POST \
  --headers content-type=text/plain \
  --headers origin=http://localhost \
  --body v1.naclbox.test-payload \
  http://localhost:3002/testProjectID123?perf=42
