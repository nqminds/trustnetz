#!/bin/bash

ARCH=$(uname -m)

# Read port number from configuration file
source /opt/demo-server/html/server.conf

case "$ARCH" in
    "x86_64")
        echo "used x86"
        /opt/demo-server/server_x86 -p $PORT
        ;;
    "aarch64")
        echo "used arm64"
        /opt/demo-server/server_arm64 -p $PORT
        ;;
    *)
        echo "Unsupported architecture: $ARCH"
        exit 1
        ;;
esac


