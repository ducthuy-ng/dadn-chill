#!/bin/sh

set -eufx

BACKEND_PID=1

__cleanup() {
  docker compose -f ./docker-compose.dev.yaml down --volumes
  kill $BACKEND_PID

  # Wait for backend to exit cleanly
  sleep 2

  exit $E2E_EXITCODE
}
trap __cleanup EXIT

docker compose -f ./docker-compose.dev.yaml up -d

# Waiting for container to stablize
sleep 5

npx nx serve backend &
BACKEND_PID=$!
sleep 3

npx nx e2e backend-e2e
E2E_EXITCODE=$?
