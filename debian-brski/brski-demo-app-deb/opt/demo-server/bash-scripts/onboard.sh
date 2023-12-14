#!/bin/bash

echo "Starting onboarding process.\n"

# Disconnect from brski-secure if connected
echo "Disconnecting from brski-secure (if connected)...\n"
sudo nmcli device disconnect wlan0
echo "Disconnected from brski-secure.\n"

# Connect to brski-open
echo "Connecting to brski-open...\n"
sudo nmcli device wifi connect 'brski-open' ifname wlan0
echo "Connected to brski-open.\n"

sleep 2

echo "Running brski preq command...\n"
sudo brski -c /etc/brski/config.ini -qqqq preq

echo "Waiting for the pledge voucher"
sleep 2

if [ $? -eq 0 ]; then
  echo "brski preq command successful.\n"
  sudo nmcli device disconnect wlan0
  echo "Disconnected from brski-open.\n"

  sleep 2
  
  echo "Connecting to brski-secure...\n"
  sudo nmcli device wifi connect 'brski-secure' password '1234554321' ifname wlan0
  echo "Connected to brski-secure.\n"
else
  echo "Error: brski preq command failed.\n"
fi

echo "Onboarding process completed.\n"