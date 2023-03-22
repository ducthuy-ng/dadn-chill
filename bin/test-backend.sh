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
# Waiting for container to stablize
sleep 2

docker compose -f ./docker-compose.dev.yaml down --volumes

# # Waiting for container to stablize
# sleep 5

# sh -c bin/start-dev-backend.sh &
# RUNNING_PID=$!
# echo "Listening on $RUNNING_PID"
# sleep 10

# npx nx e2e backend-e2e --verbose

# kill -TERM ${RUNNING_PID}
# sh -c bin/stop-dev-backend.sh
