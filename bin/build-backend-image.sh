#!/bin/sh

set -euf

PROJECT_NAME=$(npm run env | grep "npm_package_name" | cut -d "=" -f 2)

docker build -t "${PROJECT_NAME}-backend" -f ./apps/backend/Dockerfile .
