#!/bin/sh

set -euf

npm ci
sh -c bin/setup-env-files.sh
