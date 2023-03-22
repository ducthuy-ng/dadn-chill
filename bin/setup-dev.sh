#!/bin/sh

set -euf

cp .env.example .env
cp .env.example ./apps/backend/.env
npm i
