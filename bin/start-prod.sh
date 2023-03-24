#!/bin/sh

set -euf

docker compose -f docker-compose.prod.yaml --env-file .env up -d
