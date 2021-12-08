#!/usr/bin/env bash

export COMPOSE_PROJECT_NAME=chiffre-dev
export COMPOSE_FILE=$(dirname $0)/../docker-compose.yml

# Start services
docker-compose run wait

RETRIES=10

until docker exec -it chiffre-dev_db_1 psql --user=postgres -c "select 1" > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo "Waiting for postgres server, $((RETRIES--)) remaining attempts..."
  sleep 1
done
