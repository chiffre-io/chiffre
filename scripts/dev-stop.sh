#!/usr/bin/env bash

export COMPOSE_PROJECT_NAME=chiffre-dev
export COMPOSE_FILE=$(dirname $0)/../docker-compose.dev.yml

# Stop services
docker-compose down
