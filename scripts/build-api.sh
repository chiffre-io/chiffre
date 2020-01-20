#!/usr/bin/env bash

yarn wsrun                \
  --stages                \
  --recursive             \
  --package @chiffre/api  \
  -c build
