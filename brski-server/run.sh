#!/bin/bash


systemctl start hostapd@wlan0.service
systemctl start hostapd@wlan1.service

sudo systemctl restart dnsmasq@wlan0.service
sudo systemctl restart dnsmasq@wlan1.service


