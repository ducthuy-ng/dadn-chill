#!/bin/sh

set -eufx

E2E_EXITCODE=1

__cleanup() {
  kill $BACKEND_PID
  # Wait for backend to exit cleanly
  sleep 2
  
  docker compose -f ./docker-compose.dev.yaml down --volumes


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
