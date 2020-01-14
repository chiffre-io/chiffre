#!/usr/bin/env bash

docker run --rm -it \
  --name chiffre-test \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=chiffre-test \
  -p 6543:5432 \
  -d \
  postgres:11.1

# Wait for the database to be ready
docker run --rm -it \
  --link chiffre-test \
  jwilder/dockerize -wait tcp://chiffre-test:5432


RETRIES=10

until docker exec -it chiffre-test psql --user=postgres -c "select 1" > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo "Waiting for postgres server, $((RETRIES--)) remaining attempts..."
  sleep 1
done

