#!/bin/bash

# Disconnect from brski-secure if connected
nmcli device disconnect wlan0

# Connect to brski-open
nmcli device wifi connect 'brski-open' ifname wlan0

brski -c /etc/brski/config.ini -qqqq preq

if [ $? -eq 0 ]; then
  nmcli device disconnect wlan0
  nmcli device wifi connect 'brski-secure' password '1234554321' ifname wlan0
fi

