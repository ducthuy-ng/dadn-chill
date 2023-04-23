#!/bin/sh

set -euf

cp .env.example ./apps/backend/.env
cp .env.example ./apps/frontend/.env
cp .env.example ./hardware/.env
cp .env.example ./apps/ML-server/.env
