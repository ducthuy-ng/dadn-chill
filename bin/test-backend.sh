#!/bin/sh

set -eufx

TEST_EXITCODE=1

__cleanup() {
  docker compose -f ./docker-compose.dev.yaml down --volumes
  exit $TEST_EXITCODE
}
trap __cleanup EXIT

docker compose -f ./docker-compose.dev.yaml up -d

# Waiting for container to stablize
sleep 5

npx nx run backend:test:ci
TEST_EXITCODE=$?
