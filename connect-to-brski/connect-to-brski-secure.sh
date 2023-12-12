#!/bin/bash

# Disconnect from brski-open if connected
nmcli device disconnect wlan1

# Connect to brski-secure
nmcli device wifi connect 'brski-secure' password '1234554321' ifname wlan0
