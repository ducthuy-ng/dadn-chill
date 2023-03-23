#!/bin/sh
set -euf

docker build -f apps/frontend/Dockerfile . -t frontend
docker build -f apps/backend/Dockerfile . -t backend
