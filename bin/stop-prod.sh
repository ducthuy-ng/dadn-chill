#!/bin/sh

set -euf

docker compose -f ./docker-compose.prod.yaml down
