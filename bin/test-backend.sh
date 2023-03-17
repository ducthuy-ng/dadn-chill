#!/bin/sh

set -eufx

__cleanup() {
  docker compose -f ./docker-compose.dev.yaml down --volumes
}
trap __cleanup EXIT

docker compose -f ./docker-compose.dev.yaml up -d

# Waiting for container to stablize
sleep 10
npx nx test backend --verbose
