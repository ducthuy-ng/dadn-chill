#!/bin/sh

set -euf

npm run stop:backend; npm run stop:frontend;
rm -rf .env node_modules dist ./apps/backend/.env
