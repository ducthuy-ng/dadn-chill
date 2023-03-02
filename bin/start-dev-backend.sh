#!/bin/sh

set -euf

docker compose -f ./docker-compose.dev.yaml up -d
npx nx serve backend
