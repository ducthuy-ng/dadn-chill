#!/bin/sh

set -euf

docker compose -f ./docker-compose.dev.yaml down --volumes
