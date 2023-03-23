#!/bin/sh

set -euf

npm run stop:backend
npm run stop:frontend
rm -rf node_modules dist
sh -c bin/clean-env-files.sh
