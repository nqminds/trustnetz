#!/bin/bash

# Disconnect from brski-secure if connected
nmcli device disconnect wlan0

# Connect to brski-open
nmcli device wifi connect 'brski-open' ifname wlan1
