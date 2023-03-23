#!/usr/bin/env sh

set -euf

print_hello() {
  echo "Install mkcert if not exists"
  echo "Usage: install-mkcert [-f]"
  echo "    Options:"
  echo "        -f: force reinstall"
}

install_mkcert() {
  echo $(pwd)
  if [ -e bin/mkcert ] && [ "$1" ]; then
    echo "File exists, skipping"
    exit 1
  fi

  MKCERT_VERSION=${MKCERT_VERSION:-'v1.4.4'}

  echo "Fetch system info"

  PLATFORM_NAME=$(uname -s | tr '[:upper:]' '[:lower:]')
  HARDWARE_TYPE=$(uname -m | tr '[:upper:]' '[:lower:]')

  echo "Download mkcert"
  FILE_NAME="mkcert-$MKCERT_VERSION-$PLATFORM_NAME-$HARDWARE_TYPE"

  curl -fsSL "https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/$FILE_NAME" -o bin/mkcert
  chmod +x bin/mkcert
  echo "mkcert downloaded"
}

arg1="${1-""}"
case $arg1 in
"help") print_hello ;;
"-f") install_mkcert true ;;
*) install_mkcert false ;;

esac
