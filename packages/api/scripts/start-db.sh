#!/usr/bin/env bash

docker run --rm -it \
  -v $(pwd)/.db:/var/lib/postgresql/data \
  --name chiffre-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=chiffre \
  -p 5432:5432 \
  -d \
  postgres:11.1

# Wait for the database to be ready
docker run --rm -it \
  --link chiffre-db \
  jwilder/dockerize -wait tcp://chiffre-db:5432 -timeout 30s

RETRIES=10

until docker exec -it chiffre-db psql --user=postgres -c "select 1" > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo "Waiting for postgres server, $((RETRIES--)) remaining attempts..."
  sleep 1
done
