#!/usr/bin/env bash

export COMPOSE_PROJECT_NAME=chiffre-test
export COMPOSE_FILE=$(dirname $0)/../docker-compose.test.yml

# Stop services
docker-compose down
