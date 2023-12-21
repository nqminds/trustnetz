#!/bin/bash

echo "Starting onboarding process."

# Disconnect from brski-secure if connected
echo "Disconnecting from brski-secure (if connected)..."
sudo nmcli device disconnect wlan0
echo "Disconnected from brski-secure."

# Connect to brski-open
echo "Connecting to brski-open..."
sudo nmcli device wifi connect 'brski-open' ifname wlan0
echo "Connected to brski-open."

sleep 2

echo "Running brski preq command..."
sudo brski -c /etc/brski/config.ini -qqqq preq

echo "Waiting for the pledge voucher"
sleep 2

if [ $? -eq 0 ]; then
  echo "brski preq command successful."
  sudo nmcli device disconnect wlan0
  echo "Disconnected from brski-open."

  sleep 2
  
  echo "Connecting to brski-secure..."
  sudo nmcli device wifi connect 'brski-secure' password '1234554321' ifname wlan0
  echo "Connected to brski-secure."
else
  echo "Error: brski preq command failed."
fi

echo "Onboarding process completed."