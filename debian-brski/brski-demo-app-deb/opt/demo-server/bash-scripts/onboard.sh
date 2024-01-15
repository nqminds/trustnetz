#!/bin/bash

CERTS_PATH="/opt/demo-server/certs"

echo "Starting onboarding process."

# Disconnect from brski-secure if connected
echo "Disconnecting from brski-secure (if connected)..."
nmcli device disconnect wlan0
echo "Disconnected from brski-secure."

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

echo "Got BRSKI signed certificates"
EAP_NAME=`openssl x509 -noout -issuer -in "$CERTS_PATH/peer-client.crt" | sed -e 's/.*CN = \(.*\).*/\1/'`
sleep 2

echo "brski preq command successfuli, got EAP-TLS $EAP_NAME."
nmcli device disconnect wlan0
echo "Disconnected from brski-open."

sleep 2
  
echo "Connecting to brski-secure..."
nmcli device wifi connect 'brski-secure' password '1234554321' ifname wlan0

if [ $? -ne 0 ]; then
  exit 1
fi

echo "Connected to brski-secure."
echo "Onboarding process completed."

