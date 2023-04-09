#!/bin/sh

set -euf

docker compose -f ./docker-compose.dev.yaml up -d

# Wait for PostgreSQL to load all data
sleep 5

npx nx serve backend
