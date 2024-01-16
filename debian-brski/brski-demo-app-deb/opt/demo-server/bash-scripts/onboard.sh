#!/bin/bash

CERTS_PATH="/opt/demo-server/certs"

echo "Starting onboarding process."

# Disconnect from WIFI if connected
echo "Disconnecting from WIFI newtork (if connected)..."
nmcli device disconnect wlan0
echo "Disconnected from WIFI network."

# Connect to brski-open
echo "Connecting to brski-open..."
nmcli device wifi connect 'brski-open' ifname wlan0

if [ $? -ne 0 ]; then
    exit 1
fi

echo "Connected to brski-open."

sleep 2

echo "Running brski sign command..."
brski -c /etc/brski/config.ini sign -o "$CERTS_PATH/peer-client"  -d

if [ $? -ne 0 ]; then
    exit 1
fi

file $CERTS_PATH/peer-client.crt

echo "Got BRSKI signed certificates"
EAP_NAME=`openssl x509 -noout -issuer -in "$CERTS_PATH/peer-client.crt" | sed -e 's/.*CN = \(.*\).*/\1/'`
[[ -z "$EAP_NAME" ]] && { echo "Error: No EAP name found"; exit 1; }
sleep 2

echo "Got EAP-TLS name $EAP_NAME."

nmcli device disconnect wlan0
echo "Disconnected from brski-open."

sleep 2
  
echo "Connecting to $EAP_NAME ..."
nmcli device wifi connect $EAP_NAME password '1234554321' ifname wlan0

if [ $? -ne 0 ]; then
  exit 1
fi

echo "Connected to $EAP_NAME."
echo "Onboarding process completed."

