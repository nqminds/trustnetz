#!/bin/bash

# Read port number from configuration file
source /opt/demo-server/html/server.conf

# Check for the existence of the x86_64 or ARM64 version of the server
if [ -f "/opt/demo-server/server_x86_64" ]; then
    server_binary="/opt/demo-server/server_x86_64"
elif [ -f "/opt/demo-server/server_arm64" ]; then
    server_binary="/opt/demo-server/server_arm64"
else
    echo "Server binary not found!"
    exit 1
fi

# Start the server
$server_binary -p $PORT
