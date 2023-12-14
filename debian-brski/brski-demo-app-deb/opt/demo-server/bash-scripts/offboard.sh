#!/bin/bash

echo "Starting offboarding process."

# Disconnect from brski-open if connected
echo "Disconnecting from brski-open (if connected)..."
nmcli device disconnect wlan0
echo "Disconnected from brski-open."

echo "Offboarding process completed."
