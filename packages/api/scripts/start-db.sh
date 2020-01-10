#!/usr/bin/env bash

docker run --rm -it \
  -v $(pwd)/.db:/var/lib/postgresql/data \
  --name chiffre-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=chiffre \
  -p 5432:5432 \
  -d \
  postgres:11.1
